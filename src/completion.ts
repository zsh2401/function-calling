import { CompletionUsage } from 'openai/resources'
import {
    FunctionalChatCompletionParamsStreaming,
    FunctionalCompletionMessage,
    OpenAIAssistantMessage,
    Result,
} from './types'
import { streaming } from './streaming'
import { fulfill, ToolCallResult } from './fulfill'
import { objectDelta } from './objectDelta'
import { BetterTool } from './create'
import { getToolsOfMCPClient } from './mcp'

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
    const allTools: BetterTool<any>[] = []
    if (args.body.tools) {
        allTools.push(...args.body.tools)
        args.body.tools = void 0
    }
    if (args.mcpClients) {
        for (const client of args.mcpClients) {
            allTools.push(...await getToolsOfMCPClient(client))
        }
        args.mcpClients = void 0
    }

    while (true) {
        await args.callbacks?.onStaringOneChatCompletion?.()
        const completionStream =
            await args.client.chat.completions.create({
                ...args.body,
                messages: updatingMessages,
                tools: allTools.length > 0
                    ? allTools.map((t) => t.openAIFormat)
                    : void 0,
            })

        const {
            usage,
            toolCalls,
            reasonText,
            completionText,
        } = await streaming({
            completionStream,
            onTextDelta: args.callbacks?.onTextDelta,
            onReasonDelta: args.callbacks?.onReasonDelta,
        })

        const assistantMessage: OpenAIAssistantMessage =
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

        await args.callbacks?.onOneChatCompletionFinished?.({
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
