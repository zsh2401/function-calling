<img src="./maple.png" style="display:block; margin: 0 auto"/>

<br/>

<h1 style="text-align: center">
function-calling
</h1>

The best Node.JS library to help you performing a OpenAI SDK function calling.

```sh
npm i function-calling
```

## 🤩 Key Features

- 🔧 Automatically invoke tools if necessary.
- 🔧→✉️→🔧→✉️ Continuously invoke tools in a loop until all tool call is satisfied.
- 🧐 Dynamically build tools so we can adjust tools for each call. (Such as modify parameters)
- 💰💰 Automatically summarize usages of internal chat completions.
- 💦 Streaming callbacks.

## 😎 Getting Started

There's a example presents a situation that involves continuous function callings.

The user requested LLM to automatically adjust AC temperature🧊🔥 based on recently weather info.

```typescript
import {
    BetterTool,
    buildTool,
    functionalChatCompletion,
} from '@/index'
import OpenAI from 'openai'
import { z } from 'zod'
async function chatWithGPT(user: User) {
    const openai = new OpenAI({
        baseURL: 'xxx',
        apiKey: 'xxx',
    })

    const tools: BetterTool<any>[] = [
        buildTool({
            name: 'GetWeather',
            description:
                'Get the weather info of where the user is',
            schema: z.object({
                futureDays: z.number().positive(),
            }),
            func: async (args) => {
                // we can dynamically adjust function's implementation or
                // involves parameters from other way except LLM.
                if (user.isVIP === false) {
                    return 'Only VIP users can query weather info!'
                }
                const futureDays = args.futureDays
                return `The weather info of ${futureDays}`
            },
        }),
        buildTool({
            name: 'AdjustAirConditioner',
            description:"Adjust user's Air conditioner"
            schema: z.object({
                temperature: z.number().positive().min(18).max(27),
            }),
            func: async (args) => {
                await externalLibrary.adjustACTemp(args.temperature)
            },
        }),
    ]
    const { usage, messages } =
        await functionalChatCompletion(openai, {
            temperature: 1.2,
            top_p: 1,
            tools,
            stream: true,
            model: 'gpt-4.1',
            onTextDelta: (text) => pushToUser(user, text),
            messages: [
                {
                    role: 'user',
                    content: 'Hello, please query weather and adjust my AC!',
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
