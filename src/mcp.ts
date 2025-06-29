import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { jsonSchemaToZod } from "json-schema-to-zod"
import { BetterTool, buildTool } from "./create";
export async function getToolsOfMCPClient(client: Client): Promise<BetterTool<any>[]> {
    const r = (await client.listTools()).tools
    return r.map((mcpTool: any) => {
        const zodCode = jsonSchemaToZod(mcpTool.inputSchema, { module: "cjs" })
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const schema = eval(zodCode)
        return buildTool({
            name: mcpTool.name,
            schema,
            description: mcpTool.description ?? "",
            func: async (data) => {
                return await client.callTool({
                    name: mcpTool.name,
                    arguments: data
                })
            }
        })
    })
}