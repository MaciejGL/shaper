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
 * Creates a new OpenAI assistant thread and runs it with streaming for faster responses
 * Recommended for time-sensitive operations (targets <30s response time)
 */
export async function createAssistantThreadWithStreaming(
  messages: AssistantMessage[],
  assistantId: string = ASSISTANT_ID,
): Promise<string> {
  const thread = await openai.beta.threads.create()

  const stream = openai.beta.threads.runs.stream(thread.id, {
    assistant_id: assistantId,
    additional_messages: messages,
  })

  let content = ''

  for await (const event of stream) {
    if (event.event === 'thread.message.delta') {
      const delta = event.data.delta.content?.[0]
      if (delta?.type === 'text' && delta.text?.value) {
        content += delta.text.value
      }
    }
  }

  return content.trim()
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
  if (!response || response.trim().length === 0) {
    throw new Error('Assistant returned empty response')
  }

  try {
    return JSON.parse(response)
  } catch (err) {
    // Clean the response by removing markdown code blocks
    let cleanedResponse = response.trim()

    // Remove markdown code block markers (```json ... ``` or ``` ... ```)
    const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/
    const codeBlockMatch = cleanedResponse.match(codeBlockRegex)
    if (codeBlockMatch) {
      cleanedResponse = codeBlockMatch[1].trim()
    }

    // Try to find JSON object or array markers
    if (!codeBlockMatch) {
      const objectStart = response.indexOf('{')
      const objectEnd = response.lastIndexOf('}')
      const arrayStart = response.indexOf('[')
      const arrayEnd = response.lastIndexOf(']')

      if (
        objectStart !== -1 &&
        objectEnd !== -1 &&
        (arrayStart === -1 || objectStart < arrayStart)
      ) {
        cleanedResponse = response.slice(objectStart, objectEnd + 1)
      } else if (arrayStart !== -1 && arrayEnd !== -1) {
        cleanedResponse = response.slice(arrayStart, arrayEnd + 1)
      }
    }

    try {
      return JSON.parse(cleanedResponse)
    } catch (err) {
      console.error(
        'Failed to parse AI response. Preview:',
        response.substring(0, 500),
      )
      throw new Error('Assistant response was not valid JSON')
    }
  }
}
