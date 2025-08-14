import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  // Ensure we're using the latest API version for GPT-5 support
  defaultHeaders: {
    'OpenAI-Beta': 'structured-outputs',
  },
})
