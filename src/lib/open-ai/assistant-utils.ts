import { openai } from '@/lib/open-ai/open-ai'

export const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID!
export const QUICK_WORKOUT_ASSISTANT_ID =
  process.env.OPENAI_ASSISTANT_QUICKWORKOUT_ID!

/**
 * Creates a new OpenAI assistant thread and runs it with the given messages
 */
type AssistantMessage = { role: 'user' | 'assistant'; content: string }

export async function createAssistantThread(
  messages: AssistantMessage[],
  assistantId: string = ASSISTANT_ID,
) {
  const thread = await openai.beta.threads.create()

  await openai.beta.threads.runs.createAndPoll(thread.id, {
    assistant_id: assistantId,
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
 * Parses JSON from assistant response, handling cases where it's wrapped in backticks or markdown code blocks
 */
export function parseAssistantJsonResponse(response: string) {
  try {
    const json = JSON.parse(response)
    return json
  } catch (err) {
    console.error(err)
  }

  // Clean the response by removing markdown code blocks and extra whitespace
  let cleanedResponse = response.trim()

  // Remove markdown code block markers (```json ... ``` or ``` ... ```)
  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/
  const codeBlockMatch = cleanedResponse.match(codeBlockRegex)
  if (codeBlockMatch) {
    cleanedResponse = codeBlockMatch[1].trim()
  }

  // If markdown removal didn't work, try the legacy approach for arrays
  if (!codeBlockMatch) {
    const jsonStart = response.indexOf('[')
    const jsonEnd = response.lastIndexOf(']')
    if (jsonStart !== -1 && jsonEnd !== -1) {
      cleanedResponse = response.slice(jsonStart, jsonEnd + 1)
    }
  }

  try {
    return JSON.parse(cleanedResponse)
  } catch (err) {
    console.error('Failed to parse cleaned response:', cleanedResponse)
    throw new Error('Assistant response was not valid JSON')
  }
}
