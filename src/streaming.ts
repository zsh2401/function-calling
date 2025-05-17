import {
    ChatCompletionMessageToolCall,
    CompletionUsage,
} from 'openai/resources'
import { StreamingArgs, StreamingResult } from './types'

/**
 * This function will automatically build a compact result of
 * LLM's response including normal response and function calling.
 * @param args
 * @returns the compact result.
 */
export async function streaming(
    args: StreamingArgs
): Promise<StreamingResult> {
    let usage: CompletionUsage | undefined
    let completionText: string = ''
    let reasonText: string = ''
    const toolCalls: ChatCompletionMessageToolCall[] = []
    for await (const chunk of args.completion) {
        if (chunk.choices.length > 0) {
            const choice = chunk.choices[0]
            const delta = choice.delta
            if (delta.tool_calls?.[0]) {
                const deltaToolCall = delta.tool_calls[0]
                if (
                    deltaToolCall.index + 1 >
                    toolCalls.length
                ) {
                    toolCalls.push({
                        id: '',
                        type: '' as any,
                        function: {
                            arguments: '',
                            name: '',
                        },
                    })
                }
                const buildingToolCall = toolCalls.at(-1)!
                if (deltaToolCall.function?.name) {
                    buildingToolCall.function.name +=
                        deltaToolCall.function.name
                }
                if (deltaToolCall.function?.arguments) {
                    buildingToolCall.function.arguments +=
                        deltaToolCall.function.arguments
                }
                if (deltaToolCall.id) {
                    buildingToolCall.id += deltaToolCall.id
                }
                if (deltaToolCall.type) {
                    buildingToolCall.type +=
                        deltaToolCall.type
                }
            } else if (delta.content) {
                completionText += delta.content
                args.onTextDelta?.(delta.content)
            } else if ((delta as any).reasoning_content) {
                const reasonDelta = (delta as any)
                    .reasoning_content as string
                reasonText += reasonDelta
                args.onReasonDelta?.(reasonDelta)
            }
        }
        if (chunk.usage) {
            usage = chunk.usage
        }
    }
    return {
        toolCalls,
        reasonText,
        completionText,
        usage,
    }
}
