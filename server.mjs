// Runs one of the MCP servers (Streamable HTTP) on plain Node: APP=snowbelly|bluedose, PORT (default 8080).
import http from "node:http";
const app = process.env.APP || "snowbelly";
const { default: worker } = await import(`./${app}/worker.js`);
const port = Number(process.env.PORT || 8080);
http.createServer(async (req, res) => {
  const chunks = []; for await (const c of req) chunks.push(c);
  const body = chunks.length ? Buffer.concat(chunks) : undefined;
  const request = new Request(`http://localhost${req.url}`, { method: req.method, headers: req.headers, body: ["GET", "HEAD"].includes(req.method) ? undefined : body });
  const r = await worker.fetch(request);
  res.writeHead(r.status, Object.fromEntries(r.headers)); res.end(Buffer.from(await r.arrayBuffer()));
}).listen(port, () => console.log(`${app} MCP server on :${port} (POST JSON-RPC to /mcp or /)`));
