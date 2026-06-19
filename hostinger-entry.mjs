import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDir = path.join(__dirname, "dist", "client");
const serverModule = await import("./dist/server/server.js");
const app = serverModule.default;
process.on("uncaughtException", (error) => {
  console.error("uncaughtException");
  console.error(error);
});
process.on("unhandledRejection", (reason) => {
  console.error("unhandledRejection");
  console.error(reason);
});

const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".gif", "image/gif"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".webp", "image/webp"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
]);

function getContentType(filePath) {
  return mimeTypes.get(path.extname(filePath).toLowerCase()) ?? "application/octet-stream";
}

function toWebRequest(req) {
  const protocol = (req.headers["x-forwarded-proto"] ?? "http").split(",")[0].trim();
  const host = req.headers.host ?? "localhost";
  const url = new URL(req.url ?? "/", `${protocol}://${host}`);
  const method = req.method ?? "GET";

  const body =
    method === "GET" || method === "HEAD"
      ? undefined
      : ReadableStream.from(
          (async function* readBody() {
            for await (const chunk of req) {
              yield chunk;
            }
          })(),
        );

  return new Request(url, {
    method,
    headers: req.headers,
    body,
    duplex: body ? "half" : undefined,
  });
}

async function tryServeStatic(req, res) {
  const requestPath = decodeURIComponent(new URL(req.url ?? "/", "http://localhost").pathname);
  const normalized = path.normalize(requestPath).replace(/^(\.\.[/\\])+/, "");
  const safePath = normalized.startsWith(path.sep) ? normalized.slice(1) : normalized;
  const filePath = path.join(clientDir, safePath);

  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) return false;

    const content = await readFile(filePath);
    res.writeHead(200, {
      "content-type": getContentType(filePath),
      "content-length": content.byteLength,
      "cache-control": requestPath.startsWith("/assets/") ? "public, max-age=31536000, immutable" : "public, max-age=3600",
    });

    if (req.method === "HEAD") {
      res.end();
      return true;
    }

    res.end(content);
    return true;
  } catch {
    return false;
  }
}

async function sendWebResponse(nodeRes, webRes) {
  const headers = Object.fromEntries(webRes.headers.entries());
  nodeRes.writeHead(webRes.status, headers);

  if (!webRes.body) {
    nodeRes.end();
    return;
  }

  for await (const chunk of webRes.body) {
    nodeRes.write(chunk);
  }
  nodeRes.end();
}

const port = Number(process.env.PORT || 3000);

createServer(async (req, res) => {
  const startedAt = Date.now();
  const url = req.url ?? "/";
  try {
    if (await tryServeStatic(req, res)) {
      console.log(`[static] ${req.method} ${url} -> 200 (${Date.now() - startedAt}ms)`);
      return;
    }

    const request = toWebRequest(req);
    const response = await app.fetch(request, {}, {});
    await sendWebResponse(res, response);
    console.log(`[ssr] ${req.method} ${url} -> ${response.status} (${Date.now() - startedAt}ms)`);
  } catch (error) {
    console.error(`[entry] ${req.method} ${url} failed after ${Date.now() - startedAt}ms`);
    console.error(error);
    res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    res.end("Internal Server Error");
  }
}).listen(port, "0.0.0.0", () => {
  console.log(`Hostinger server listening on port ${port}`);
});
