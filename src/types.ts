import OpenAI from 'openai'
import {
    ChatCompletionMessageToolCall,
    ChatCompletionStreamOptions,
    ChatCompletionToolChoiceOption,
    CompletionUsage,
} from 'openai/resources'
import { Stream } from 'openai/streaming'
import { z } from 'zod'
import { BetterTool } from './create'
import { ToolCallResult } from './fulfill'

export type ZodBase = z.ZodObject<any, any, any, any>
export type OpenAITool =
    OpenAI.Chat.Completions.ChatCompletionTool

export type OpenAIToolCall =
    OpenAI.Chat.Completions.ChatCompletionChunk.Choice.Delta.ToolCall

export type OpenAIAssistantMessage =
    OpenAI.Chat.Completions.ChatCompletionAssistantMessageParam

export type OpenAIToolMessage =
    OpenAI.Chat.Completions.ChatCompletionToolMessageParam

export type FunctionalCompletionMessage =
    | OpenAIAssistantMessage
    | OpenAIToolMessage

export interface ToolFunction<S extends ZodBase> {
    (args: z.output<S>): Promise<any>
}

export interface ToolDefinition<S extends ZodBase> {
    name: string
    description: string
    schema?: S
    shouldPersistent?: boolean
    func: ToolFunction<S>
}

/**
 * The argument for {@link streaming} function.
 */
export interface StreamingArgs {
    completion: Stream<OpenAI.Chat.Completions.ChatCompletionChunk> & {
        _request_id?: string | null
    }
    onTextDelta?: (text: string) => (void | Promise<void>)
    onReasonDelta?: (text: string) => (void | Promise<void>)
}

export interface StreamingResult {
    usage?: OpenAI.Completions.CompletionUsage
    completionText: string
    reasonText: string
    toolCalls: ChatCompletionMessageToolCall[]
}
export interface Result {
    usage?: CompletionUsage
    messages: FunctionalCompletionMessage[]
}
export type RequestBody = Omit<
    OpenAI.Chat.Completions.ChatCompletionCreateParamsStreaming,
    'tools' | "stream" | "stream_options"
> & {

    tools?: BetterTool<any>[]
    stream: true
    tool_choice: ChatCompletionToolChoiceOption
    stream_options: {
        include_usage: true;
    }
}
export interface FunctionalChatCompletionParamsStreaming {
    client: OpenAI
    body: RequestBody
    callbacks?: {
        onStaringOneChatCompletion?: () => (void | Promise<void>)
        onOneChatCompletionFinished?: (args: OneChatCompletionCompletedArgs) => (void | Promise<void>)
        onTextDelta?: (text: string) => (void | Promise<void>)
        onReasonDelta?: (text: string) => (void | Promise<void>)
    }
}
export interface OneChatCompletionCompletedArgs {
    assistantMessage: OpenAIAssistantMessage
    toolsResult?: ToolCallResult[]
    usage?: CompletionUsage
}
