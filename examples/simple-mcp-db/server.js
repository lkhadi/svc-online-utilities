
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import mysql from "mysql2/promise";

// 1. Initialize Database Connection Pool
// We use a pool to manage connections efficiently
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root", // Defaulting for dev, but env usage is key
  database: process.env.DB_DATABASE || "db_nkmd",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// 2. Create MCP Server
const server = new Server(
  {
    name: "mysql-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 3. Define Tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "execute_sql",
        description: "Execute a raw SQL query against the MySQL database. Use this to list tables, query data, or modify records.",
        inputSchema: {
          type: "object",
          properties: {
            sql: { type: "string", description: "The SQL query to execute" },
          },
          required: ["sql"],
        },
      },
    ],
  };
});

// 4. Handle Tool Calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "execute_sql") {
    const schema = z.object({ sql: z.string() });
    const { sql } = schema.parse(args);

    try {
      // Execute the query
      // result is [rows, fields]
      const [rows] = await pool.execute(sql);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(rows, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Database Error: ${error.message}`,
          },
        ],
      };
    }
  }

  throw new Error(`Tool not found: ${name}`);
});

// 5. Connect Transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MySQL MCP Server running on STDIO");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
