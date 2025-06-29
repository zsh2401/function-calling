<div style="display:flex;flex-direction:row;justify-content:center">
    <div>
        <br/>
        <h1>
             <img src="./maple.png" style="height:40px"/> function-calling
             <img src="./maple.png" style="height:40px"/> 
        </h1>
    </div>
</div>
The best Node.JS library to help you performing a OpenAI SDK function calling. MCP Nicely supported.

```sh
npm i function-calling
```

## 🤩 Key Features

- 🔧 Automatically invoke tools.
- 🎨 Nicely MCP Support.
- 🔧→✉️→🔧→✉️ Continuously invoke tools in a loop until all tool call is satisfied.
- 🧐 Dynamically build tools so we can adjust tools for each call. (Such as modify parameters)
- 💰💰 Automatically summarize usages of internal chat completions.
- 💦 Streaming callbacks.

## 😎 Getting Started

There's a example presents a situation that involves continuous function callings.

The user requested LLM to automatically adjust AC temperature🧊🔥 based on recently weather info.

### Quick Look

```typescript
import {
    functionalChatCompletion,
} from 'function-calling'
import OpenAI from 'openai'
async function chatWithGPT() {
    const openai = new OpenAI({
        baseURL: 'xxx',
        apiKey: 'xxx',
    })
    const { usage, messages } =
        await functionalChatCompletion(openai, {
            mcpClients: [yourMCPClientA,yourMCPClientB],// optional, all tools inside it will be automatically executed.
            tools: [ // optional, your custom javascript tools.
                getWeather, adjustAirConditioner
            ]
            stream: true,
            model: 'gpt-4.1',
            onTextDelta: (text) => console.log(text),
            messages: [
                {
                    role: 'user',
                    content:
                        'Hello, please query weather and adjust my AC!',
                },
            ],
        })
}
```

The returning message will presents its internal calling procedure.

```typescript
const messages = [
    {
        role: 'assistant',
        content: "I'll try my best to query weather info! ",
        tool_call: [
            {
                id: 'abc',
                type: 'function',
                function: {
                    name: 'GetWeather',
                    arguments: "{ 'futureDays':7 }",
                },
            },
        ],
    },
    {
        role: 'tool',
        content: 'The weather info of 7 is XXXXX',
        tool_call_id: 'abc',
    },
    {
        role: 'assistant',
        content:
            "The temperature will drop in future 7 days, I'm increasing your AC temperature.",
        tool_call: [
            {
                id: 'def',
                type: 'function',
                function: {
                    name: 'AdjustAirConditioner',
                    arguments: '{ temperature: 25 }',
                },
            },
        ],
    },
    {
        role: 'tool',
        content: 'Adjusted',
        tool_call_id: 'def',
    },
    {
        role: 'assistant',
        content:
            'All done, please feel free to enjoy all my services. What can I do for you next?',
    },
]
```

#### Custom Script Tools

```typescript
import {
    buildTool,
} from '@/index'
const getWeather = buildTool({
    name: 'GetWeather',
    description:
        'Get the weather info of where the user is',
    schema: z.object({
        futureDays: z.number().positive(),
    }),
    func: async ({ futureDays }) => {
        return `The weather info of ${futureDays}`
    },
})
const adjustAirConditioner = buildTool({
    name: 'AdjustAirConditioner',
    description:"Adjust user's Air conditioner"
    schema: z.object({
        temperature: z.number().positive().min(18).max(27),
    }),
    func: async (args) => {
        await externalLibrary.adjustACTemp(args.temperature)
    },
})
```

#### MCP Tools

```typescript
import { getToolsOfMCPClient } from 'function-calling'
// Convert all mcp sdk format tools to
// function-calling's format. It will eventually
// convert to OpenAI format during executing.
const yourMCPTools = await getToolsOfMCPClient(yourClient)

// But you don't have to care about any further operation.
// Just passing it.
await functionalChatCompletion(openai, {
    tools: [
        getWeather, adjustAirConditioner, ...yourMCPTools
    ]
    stream: true,
    model: 'gpt-4.1',
    onTextDelta: (text) => console.log(text),
    messages: [
        {
            role: 'user',
            content:
                'Hello, please query weather and adjust my AC!',
        },
    ],
})
```

#### Which Way?

Q: which way should I choose to pass mcp tools to LLM?

A: It depends on your requirements.

##### First Way

```typescript
const yourMCPTools = await getToolsOfMCPClient(yourClient)
```

then pass it

```typescript
{
    //...
    tools: [
        getWeather,
        adjustAirConditioner,
        ...yourMCPTools,
    ]
    //...
}
```

#### Second Way

Our library will call `getToolsOfMCPClient` inside function.

```typescript
{
    //...
    clients: [yourClient]
    tools: [
        getWeather,
        adjustAirConditioner,
        ...yourMCPTools,
    ]
    //...
}
```

## Contribution

### Build

We recommend to use `pnpm` as your package manager.

```sh
pnpm build
```

### Test

We are using vitest for unit tests.

```sh
pnpm test
```

### Contribution

Once you have developed codes, please raise PR to **dev** branch.

All pull requests are welcomed.
