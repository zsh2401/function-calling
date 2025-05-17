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

/**
 * Perform OpenAI chat completion with strong type definition support.
 * @author zsh2401
 * @param openai
 * @param body
 * @returns
 */
export async function functionalChatCompletion(
    openai: OpenAI,
    body: FunctionalChatCompletionParamsStreaming
): Promise<Result> {
    const {
        tools,
        onTextDelta,
        messages,
        onReasonDelta,
        onNextChatCompletion,
        ...rest
    } = body

    let totalUsage: CompletionUsage | undefined = void 0
    const updatingMessages = [...messages]
    const newlyAddedMessages: FunctionalCompletionMessage[] =
        []

    while (true) {
        onNextChatCompletion?.()
        const completion =
            await openai.chat.completions.create({
                ...rest,
                messages: updatingMessages,
                tools: tools
                    ? tools.map((t) => t.openAIFormat)
                    : void 0,
            })
        const {
            usage,
            toolCalls,
            reasonText,
            completionText,
        } = await streaming({
            completion,
            onTextDelta,
            onReasonDelta,
        })

        const responseMessage: FunctionalCompletionMessage =
            {
                role: 'assistant',
                content: completionText,
            }

        updatingMessages.push(responseMessage)
        newlyAddedMessages.push(responseMessage)

        if (tools && toolCalls.length > 0) {
            responseMessage.tool_calls = toolCalls
            const toolResult = await fulfill(
                toolCalls,
                tools
            )
            for (const tr of toolResult) {
                updatingMessages.push(tr.openaiToolResult)
                newlyAddedMessages.push(tr.openaiToolResult)
            }
        }

        if (usage) {
            totalUsage = objectDelta(totalUsage, usage)
        }

        if (toolCalls.length === 0) {
            break
        }
    }
    return {
        usage: totalUsage,
        messages: newlyAddedMessages,
    }
}
