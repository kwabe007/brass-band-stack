import { spawn } from "child_process";
import type { WaitOnOptions } from "wait-on";
import waitOn from "wait-on";
import type { DataFunctionArgs } from "@remix-run/node";
import { requireAdmin } from "~/session.server";

declare global {
  // Avoid issues with the purgeCache
  // eslint-disable-next-line
  var __prismaSubprocess: ReturnType<typeof spawn> | null;
}

global.__prismaSubprocess = global.__prismaSubprocess ?? null;

async function ensurePrismaStudioIsRunning() {
  if (global.__prismaSubprocess) return;
  global.__prismaSubprocess = spawn(
    "npx",
    ["prisma", "studio", "--browser", "none", "--port", "5555"],
    {
      stdio: "inherit",
      shell: true,
      detached: true
    }
  );

  // Kill prisma process when main process dies
  process.on("exit", () => __prismaSubprocess?.kill());
  process.on("SIGINT", () => __prismaSubprocess?.kill());
  process.on("SIGTERM", () => __prismaSubprocess?.kill());

  // Wait for prisma server to get ready
  const opts: WaitOnOptions = {
    resources: [
      "http://localhost:5555"
    ],
    timeout: 20000
  };
  await waitOn(opts);
}

export async function loader({ request }: DataFunctionArgs) {
  await requireAdmin(request);
  if (new URL(request.url).searchParams.has("close")) {
    if (global.__prismaSubprocess) {
      global.__prismaSubprocess.kill();
      global.__prismaSubprocess = null;
      return new Response("Prisma Studio closed");
    } else {
      return new Response("Prisma Studio was not running");
    }
  }

  await ensurePrismaStudioIsRunning();
  const response = await fetch("http://localhost:5555", request);
  const studioHtml = await response.text();
  const relativeStudioHtml = studioHtml.replace(
    /<head>/,
    "<head><base href=\"/prisma-studio/\" />"
  );
  return new Response(relativeStudioHtml, {
    headers: {
      "Content-Type": "text/html",
      "Content-Length": String(Buffer.byteLength(relativeStudioHtml))
    }
  });
}
