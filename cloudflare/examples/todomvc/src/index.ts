import z from "zod";
import { Stagehand } from "@cloudflare/stagehand";
import { endpointURLString } from "@cloudflare/playwright";
import { createWorkersAI } from "workers-ai-provider";
import { AISdkClient } from "@cloudflare/stagehand/llm/aisdk";

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    if (url.pathname !== "/")
      return new Response("Not found", { status: 404 });

    const endpointUrl = endpointURLString("MYBROWSER");
    const workersai = createWorkersAI({
      binding: env.AI,
    });
  
    const stagehand = new Stagehand({
      env: "LOCAL",
      verbose: 2,
      localBrowserLaunchOptions: {
        cdpUrl: endpointUrl,
      },
      llmClient: new AISdkClient({
        // @ts-ignore
        model: workersai("@cf/meta/llama-4-scout-17b-16e-instruct"),
      }),

      logger: ({ category, message }) => console.log(`\x1b[36m${(category || 'unknown').padStart(11)}\x1b[0m ${message}`),
    });
    await stagehand.init();

    await stagehand.page.goto("https://demo.playwright.dev/todomvc");
    const TODO_ITEMS = [
      'buy some cheese',
      'feed the cat',
      'book a doctors appointment'
    ];

    for (const item of TODO_ITEMS) {
      await stagehand.page.act(`Type a new todo: ${item}`);
      await stagehand.page.act("Press enter");
    }

    await stagehand.page.act("Mark the second todo as completed");

    const todos = await stagehand.page.extract({
      instruction: "Extract the todos list",
      schema: z.object({
        todos: z.array(z.object({
          text: z.string().describe("The text of the todo"),
          completed: z.boolean().describe("Whether the todo is marked as completed"),
        })),
      }),
    });
    console.log("Extraction result: ", todos);

    const img = await stagehand.page.screenshot({
      fullPage: true,
    });

    await stagehand.close();

    return new Response(img, {
      headers: {
        "Content-Type": "image/png",
      },
    });
  },
};
