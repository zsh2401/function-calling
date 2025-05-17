import OpenAI from 'openai'
import { CompletionUsage } from 'openai/resources'
import {
    FunctionalChatCompletionParamsStreaming,
    FunctionalCompletionMessage,
    Result,
} from './types'
import { streaming } from './streaming'
import { fulfill } from './fulfill'
import { objectDelta } from './objectDelta'
import { OpenAIAssistantMessage, ToolCallResult } from 'es'

/**
 * Perform OpenAI chat completion with strong type definition support.
 * @author zsh2401
 * @param openai
 * @param body
 * @returns
 */
export async function functionalChatCompletion(
    args: FunctionalChatCompletionParamsStreaming
): Promise<Result> {

    let totalUsage: CompletionUsage | undefined = void 0
    const updatingMessages = [...args.body.messages]
    const newlyAddedMessages: FunctionalCompletionMessage[] = []
    while (true) {
        args.callbacks?.onStaringOneChatCompletion?.()
        const completion =
            await args.client.chat.completions.create({
                ...args.body,
                messages: updatingMessages,
                tools: args.body.tools
                    ? args.body.tools.map((t) => t.openAIFormat)
                    : void 0,
            })
        const {
            usage,
            toolCalls,
            reasonText,
            completionText,
        } = await streaming({
            completion,
            onTextDelta: args.callbacks?.onTextDelta,
            onReasonDelta: args.callbacks?.onReasonDelta,
        })

        const assistantMessage: FunctionalCompletionMessage =
        {
            role: 'assistant',
            content: completionText,
        }

        updatingMessages.push(assistantMessage)
        newlyAddedMessages.push(assistantMessage)

        let toolsResult: ToolCallResult[] | undefined = void 0
        if (args.body.tools && toolCalls.length > 0) {
            assistantMessage.tool_calls = toolCalls
            const toolResult = await fulfill(
                toolCalls,
                args.body.tools
            )
            for (const tr of toolResult) {
                toolsResult ??= []
                toolsResult.push(tr)
                updatingMessages.push(tr.openaiToolResult)
                newlyAddedMessages.push(tr.openaiToolResult)
            }
        }

        if (usage) {
            totalUsage = objectDelta(totalUsage, usage)
        }

        args.callbacks?.onOneChatCompletionFinished?.({
            assistantMessage,
            usage,
            toolsResult
        })
        if (toolCalls.length === 0) {
            break
        }
    }
    return {
        usage: totalUsage,
        messages: newlyAddedMessages,
    }
}
