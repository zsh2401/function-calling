import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'
import {
    ZodBase,
    OpenAITool,
    ToolDefinition,
    ToolFunction,
} from './types'

export interface BetterTool<S extends ZodBase> {
    openAIFormat: OpenAITool
    shouldPersistent: boolean
    invoke: (input: string) => Promise<any>
    impl: ToolFunction<S>
}
export function buildTool<S extends ZodBase>(
    tool: ToolDefinition<S>
): BetterTool<S> {
    const jsonSchema = zodToJsonSchema(
        tool.schema ?? z.object({}),
        { errorMessages: true }
    )
    return {
        invoke: async (input: string) => {
            if (tool.schema) {
                const json = JSON.parse(input)
                await tool.schema.parseAsync(json)
                return tool.func(json as z.output<S>)
            } else {
                return tool.func({})
            }
        },
        shouldPersistent: tool.shouldPersistent ?? false,
        openAIFormat: {
            type: 'function',
            function: {
                name: tool.name,
                description: tool.description,
                parameters: jsonSchema,
            },
        },
        impl: tool.func,
    }
}
