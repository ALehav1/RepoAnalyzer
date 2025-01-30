import { Repository, ChatMessage, BestPractice, AnalysisResponse } from './types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api'
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second
const CONNECTION_TIMEOUT = 30000 // 30 seconds

let isServerAvailable = false

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function checkServerStatus(): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), CONNECTION_TIMEOUT)

    const response = await fetch(`${API_BASE_URL}/health`, {
      signal: controller.signal,
      mode: 'cors',
      headers: {
        'Accept': 'application/json'
      }
    })
    clearTimeout(timeoutId)
    
    if (response.ok) {
      const data = await response.json()
      isServerAvailable = data.status === 'healthy'
      return isServerAvailable
    }
    
    isServerAvailable = false
    return false
  } catch (error) {
    console.error('Server health check failed:', error)
    isServerAvailable = false
    return false
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}, retries = MAX_RETRIES): Promise<T> {
  if (!isServerAvailable && endpoint !== '/health') {
    console.log('Server status unknown, checking health...')
    const serverUp = await checkServerStatus()
    if (!serverUp) {
      throw new Error('Server is not available. Please try again later.')
    }
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), CONNECTION_TIMEOUT)

    const requestOptions: RequestInit = {
      ...options,
      signal: controller.signal,
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions)
    clearTimeout(timeoutId)

    const contentType = response.headers.get('content-type')

    if (!response.ok) {
      let errorMessage = 'API request failed'
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await response.json()
          errorMessage = errorData.detail || errorData.message || errorMessage
        } catch (parseError) {
          console.error('Error parsing error response:', parseError)
          errorMessage = response.statusText || errorMessage
        }
      } else {
        errorMessage = response.statusText || errorMessage
      }
      throw new Error(errorMessage)
    }

    if (contentType && contentType.includes('application/json')) {
      return await response.json()
    }

    throw new Error('Invalid response format: expected application/json')
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.')
    }

    if (retries > 0 && (error instanceof TypeError || error.message.includes('failed to fetch'))) {
      console.log(`Retrying request to ${endpoint}. ${retries} retries left.`)
      await sleep(RETRY_DELAY)
      return request<T>(endpoint, options, retries - 1)
    }

    throw error
  }
}

// Repository endpoints
export async function processRepo(url: string): Promise<Repository> {
  console.log('Processing repository:', url)
  return request<Repository>('/api/repositories/process-repo', {
    method: 'POST',
    body: JSON.stringify({ url }),
  })
}

export async function getRepo(id: string): Promise<Repository> {
  console.log('Getting repository:', id)
  return request<Repository>(`/api/repositories/${id}`)
}

export async function listRepos(): Promise<Repository[]> {
  console.log('Listing repositories...')
  return request<Repository[]>('/api/repositories')
}

export async function refreshRepo(id: string): Promise<Repository> {
  console.log('Refreshing repository:', id)
  return request<Repository>(`/api/repositories/${id}/refresh`, {
    method: 'POST',
  })
}

export async function deleteRepo(id: string): Promise<void> {
  console.log('Deleting repository:', id)
  return request<void>(`/api/repositories/${id}`, {
    method: 'DELETE',
  })
}

export async function analyzeRepo(id: string): Promise<AnalysisResponse> {
  console.log('Analyzing repository:', id)
  return request<AnalysisResponse>(`/api/repositories/${id}/analyze`, {
    method: 'POST',
  })
}

// Chat endpoints
export async function createChatMessage(repoId: string, content: string): Promise<ChatMessage> {
  console.log('Creating chat message in repository:', repoId)
  return request<ChatMessage>(`/api/repositories/${repoId}/chat`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  })
}

export async function getChatHistory(repoId: string): Promise<ChatMessage[]> {
  console.log('Getting chat history for repository:', repoId)
  return request<ChatMessage[]>(`/api/repositories/${repoId}/chat`)
}

export async function createGlobalChatMessage(content: string, repoIds: string[]): Promise<ChatMessage> {
  console.log('Creating global chat message...')
  return request<ChatMessage>('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ content, repository_ids: repoIds }),
  })
}

export async function getGlobalChatHistory(): Promise<ChatMessage[]> {
  console.log('Getting global chat history...')
  return request<ChatMessage[]>('/api/chat')
}

// Best Practices endpoints
export async function getRepoPractices(repoId: string): Promise<BestPractice[]> {
  console.log('Getting best practices for repository:', repoId)
  return request<BestPractice[]>(`/api/repositories/${repoId}/practices`)
}

export async function getGlobalPractices(category?: string): Promise<BestPractice[]> {
  console.log('Getting global best practices...')
  return request<BestPractice[]>(category ? `/api/practices?category=${category}` : '/api/practices')
}

export async function markPracticeGeneralizable(practiceId: string): Promise<BestPractice> {
  console.log('Marking practice as generalizable:', practiceId)
  return request<BestPractice>(`/api/practices/${practiceId}/generalize`, {
    method: 'POST',
  })
}
