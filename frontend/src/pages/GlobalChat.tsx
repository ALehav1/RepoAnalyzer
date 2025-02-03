import { useState } from 'react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { useToast } from '../components/ui/use-toast'
import { Loader2, Send } from 'lucide-react'
import { ScrollArea } from '../components/ui/scroll-area'
import { useRepo } from '../context/RepoContext'
import { Checkbox } from '../components/ui/checkbox'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function GlobalChat() {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const { repositories } = useRepo()
  const { toast } = useToast()
  const [selectedRepos, setSelectedRepos] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || selectedRepos.length === 0) {
      toast({
        title: 'Error',
        description: 'Please enter a message and select at least one repository',
        variant: 'destructive',
      })
      return
    }

    try {
      setLoading(true)
      setMessages(prev => [...prev, { role: 'user', content: message }])
      
      // TODO: Implement global chat API
      const response = 'This is a placeholder response. The global chat API needs to be implemented.'
      
      setMessages(prev => [...prev, { role: 'assistant', content: response }])
      setMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Global Chat</h1>
        <p className="text-muted-foreground">
          Ask questions about multiple repositories at once. Select the repositories you want to include in the conversation.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Repositories</CardTitle>
          <CardDescription>
            Choose which repositories to include in the conversation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px] pr-4">
            <div className="space-y-4">
              {repositories.map((repo) => (
                <div key={repo.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={repo.id}
                    checked={selectedRepos.includes(repo.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedRepos(prev => [...prev, repo.id])
                      } else {
                        setSelectedRepos(prev => prev.filter(id => id !== repo.id))
                      }
                    }}
                  />
                  <label
                    htmlFor={repo.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {repo.name}
                  </label>
                </div>
              ))}
              {repositories.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  No repositories available. Load some repositories first.
                </p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        msg.role === 'assistant'
                          ? 'bg-muted'
                          : 'bg-primary text-primary-foreground'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {messages.length === 0 && (
                  <div className="text-center text-muted-foreground">
                    No messages yet. Start the conversation!
                  </div>
                )}
              </div>
            </ScrollArea>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={loading || selectedRepos.length === 0}
              />
              <Button
                type="submit"
                disabled={loading || !message.trim() || selectedRepos.length === 0}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
