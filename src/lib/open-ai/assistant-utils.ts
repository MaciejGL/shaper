import { openai } from '@/lib/open-ai/open-ai'

export const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID!

/**
 * Creates a new OpenAI assistant thread and runs it with the given messages
 */
type AssistantMessage = { role: 'user' | 'assistant'; content: string }

export async function createAssistantThread(messages: AssistantMessage[]) {
  const thread = await openai.beta.threads.create()

  await openai.beta.threads.runs.createAndPoll(thread.id, {
    assistant_id: ASSISTANT_ID,
    additional_messages: messages,
  })

  return thread
}

/**
 * Extracts the last message from an assistant thread
 */
export async function getLastAssistantMessage(threadId: string) {
  const { data: threadMessages } = await openai.beta.threads.messages.list(
    threadId,
    { limit: 1 },
  )

  return threadMessages[0]?.content?.[0]?.type === 'text'
    ? threadMessages[0].content[0].text.value.trim()
    : ''
}

/**
 * Parses JSON from assistant response, handling cases where it's wrapped in backticks
 */
export function parseAssistantJsonResponse(response: string) {
  try {
    const json = JSON.parse(response)
    return json
  } catch (err) {
    console.error(err)
  }
  // In case the Assistant wrapped the JSON in back-ticks, strip them:
  const jsonStart = response.indexOf('[')
  const jsonEnd = response.lastIndexOf(']')
  const rawJson =
    jsonStart !== -1 && jsonEnd !== -1
      ? response.slice(jsonStart, jsonEnd + 1)
      : response

  try {
    return JSON.parse(rawJson)
  } catch (err) {
    throw new Error('Assistant response was not valid JSON')
  }
}
