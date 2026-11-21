# Nutrition and GLP-1 MCP servers

Two small, stateless MCP servers (Streamable HTTP), also running hosted at https://snowbelly.app/mcp and https://bluedoseapp.com/mcp.

- **snowbelly-nutrition-mcp**: food calories (USDA FoodData Central), daily calorie needs (Mifflin-St Jeor), protein/fiber targets, macro calories. By [Snowbelly](https://snowbelly.app/).
- **bluedose-glp1-mcp**: injection-site rotation, shot-day countdown, GLP-1 search interest by country. Logging and data only, no dosing advice. By [Bluedose](https://bluedoseapp.com/).

```bash
docker run -p 8080:8080 snowbelltt/snowbelly-nutrition-mcp
docker run -p 8080:8080 snowbelltt/bluedose-glp1-mcp
```

MIT License.
