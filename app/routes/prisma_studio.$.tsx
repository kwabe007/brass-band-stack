import type { DataFunctionArgs } from "@remix-run/node";
import { requireAdmin } from "~/session.server";

export async function loader({ request }: DataFunctionArgs) {
  await requireAdmin(request);
  const { pathname } = new URL(request.url);
  const requestedResource = pathname.split("/").pop();
  const url = `http://localhost:5555${pathname.replace("/prisma-studio", "")}`;
  const res = await fetch(url, {
    headers: request.headers
  });
  // index.js and databrowser.js contain code that makes the client fetch route /api without prepending the
  // /prisma-client prefix, so we need to intercept these files and correct it before returning the response.
  if (requestedResource === "index.js" || requestedResource === "databrowser.js") {
    const content = await res.text();
    // eslint-disable-next-line no-template-curly-in-string -- We want the literal template string here
    const replacedContent = content.replace(/`\${window.location.origin}\/api`/, "`${window.location.origin}/prisma-studio/api`");
    return new Response(replacedContent, {
      headers: {
        'Content-Type': 'application/javascript',
        'Content-Length': String(Buffer.byteLength(replacedContent)),
      },
    })
  } else {
    return res;
  }
}

export async function action({ request }: DataFunctionArgs) {
  await requireAdmin(request);
  const { pathname } = new URL(request.url);
  const url = `http://localhost:5555${pathname.replace("/prisma-studio", "")}`;
  return fetch(url, {
    method: request.method,
    body: request.body,
    headers: request.headers
  });
}
