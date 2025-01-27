import OpenAI from 'openai';

export const handleOpenAIError = (error: any): string => {
  console.error('OpenAI API Error:', error);

  if (error?.status === 401 || error?.message?.includes('api_key')) {
    return 'Invalid API key. Please check your configuration.';
  }
  
  if (error?.status === 429) {
    return 'Rate limit exceeded. Please try again later.';
  }
  
  if (error?.status === 500) {
    return 'OpenAI service error. Please try again later.';
  }

  if (error?.message?.includes('rate_limit')) {
    return 'Rate limit exceeded. Please try again in a few moments.';
  }

  if (error?.message) {
    return `OpenAI API error: ${error.message}`;
  }

  return 'An error occurred while communicating with OpenAI. Please try again.';
};

export const getOpenAIClient = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY || localStorage.getItem('openai_api_key');
  
  if (!apiKey) {
    throw new Error('OpenAI API key not found. Please add it to your .env file or enter it in the application.');
  }

  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true
  });
};

export const hasApiKey = (): boolean => {
  return Boolean(import.meta.env.VITE_OPENAI_API_KEY || localStorage.getItem('openai_api_key'));
};

export const clearApiKey = (): void => {
  localStorage.removeItem('openai_api_key');
};