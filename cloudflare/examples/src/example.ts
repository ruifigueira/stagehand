import z from "zod";
import { Stagehand } from "@cloudflare/stagehand";
import { acquire, endpointURLString } from "@cloudflare/playwright";
import { createWorkersAI } from "workers-ai-provider";
import { AISdkClient } from "@/lib/llm/aisdk";

export default {
  async fetch(req: Request, env: Env) {
    const url = new URL(req.url);
    if (url.pathname !== "/api/last-commit")
      return new Response("Not Found", { status: 404 });
    const repo = url.searchParams.get("url");
    if (!repo) return new Response("Missing repo", { status: 400 });

    const { sessionId } = await acquire(env.BROWSER);
    const connectionUrl = endpointURLString(env.BROWSER, { sessionId });

    const workersai = createWorkersAI({
      binding: env.AI,
      gateway: {
        id: "playwright",
      },
    });

    const stagehand = new Stagehand({
      env: "LOCAL",
      localBrowserLaunchOptions: {
        cdpUrl: connectionUrl,
      },
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      llmClient: new AISdkClient({
        model: workersai("@cf/meta/llama-3.3-70b-instruct-fp8-fast"),
      }),
    });
    await stagehand.init();

    const { page } = stagehand;

    // Use Playwright functions on the page object
    await page.goto(repo);

    // Use extract() to read data from the page
    const { author, title } = await page.extract({
      instruction: "extract the author and title of the last commit",
      schema: z.object({
        author: z.string().describe("The username of the last commit author"),
        title: z.string().describe("The title of the last commit"),
      }),
    });

    await stagehand.close();

    return Response.json({ author, title });
  },
};
