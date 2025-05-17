import {
    ChatCompletionToolMessageParam,
    ChatCompletionMessageToolCall,
} from 'openai/resources'
import { BetterTool } from './create'

export interface ToolCallResult {
    openaiToolResult: ChatCompletionToolMessageParam
    shouldPersist: boolean
}
export async function fulfill(
    toolCalls: ChatCompletionMessageToolCall[],
    tools: BetterTool<any>[]
): Promise<ToolCallResult[]> {
    const result: ToolCallResult[] = []
    // console.log('fulfilling', toolCalls)
    const name2func = new Map(
        tools.map((tool) => [
            tool.openAIFormat.function.name,
            tool,
        ])
    )
    for (const toolCall of toolCalls) {
        if (toolCall.type !== 'function') {
            continue
        }
        const func = name2func.get(toolCall.function.name)
        if (!func) {
            continue
        }
        const toolResult = await func.invoke(
            toolCall.function.arguments
        )
        result.push({
            openaiToolResult: {
                role: 'tool',
                tool_call_id: toolCall.id,
                content: JSON.stringify(toolResult),
            },
            shouldPersist: func.shouldPersistent,
        })
    }
    // console.log('fulfilled tool calls', result)
    return result
}
