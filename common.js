// Minimal MCP server (Streamable HTTP, JSON responses) for Cloudflare Workers.
export function mcpHandler({ name, version, title, website, instructions, tools }) {
  const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json", "access-control-allow-origin": "*", "access-control-allow-headers": "content-type, mcp-session-id, mcp-protocol-version", "access-control-allow-methods": "POST, GET, OPTIONS" } });
  const handle = (msg) => {
    const { id, method, params } = msg;
    if (method === "initialize") return { jsonrpc: "2.0", id, result: { protocolVersion: params?.protocolVersion || "2025-06-18", capabilities: { tools: { listChanged: false } }, serverInfo: { name, version, title, websiteUrl: website }, instructions } };
    if (method === "ping") return { jsonrpc: "2.0", id, result: {} };
    if (method === "tools/list") return { jsonrpc: "2.0", id, result: { tools: tools.map(({ run, ...t }) => t) } };
    if (method === "tools/call") {
      const t = tools.find((x) => x.name === params?.name);
      if (!t) return { jsonrpc: "2.0", id, error: { code: -32602, message: "Unknown tool" } };
      try { const out = t.run(params.arguments || {}); return { jsonrpc: "2.0", id, result: { content: [{ type: "text", text: JSON.stringify(out, null, 1) }], structuredContent: out } }; }
      catch (e) { return { jsonrpc: "2.0", id, result: { isError: true, content: [{ type: "text", text: String(e.message || e) }] } }; }
    }
    if (id === undefined) return null; // notification
    return { jsonrpc: "2.0", id, error: { code: -32601, message: "Method not found" } };
  };
  return async (req) => {
    if (req.method === "OPTIONS") return json({}, 204);
    if (req.method === "GET") return new Response(`${title} MCP server. POST JSON-RPC to this URL (Streamable HTTP). Docs: ${website}`, { status: 200, headers: { "content-type": "text/plain" } });
    if (req.method !== "POST") return json({ error: "method not allowed" }, 405);
    let body; try { body = await req.json(); } catch { return json({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }, 400); }
    if (Array.isArray(body)) { const out = body.map(handle).filter(Boolean); return out.length ? json(out) : new Response(null, { status: 202 }); }
    const out = handle(body); return out ? json(out) : new Response(null, { status: 202 });
  };
}
