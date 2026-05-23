# How to Build a MySQL-Connected MCP Server with Node.js

The Model Context Protocol (MCP) allows AI models to safely interact with your data. In this tutorial, we will build a powerful MCP server using **Node.js** and **MySQL**.

We will implement a generic `execute_sql` tool that gives an AI agent (like Claude Desktop or VS Code Entelligence) the ability to query your database extensively.

> [!WARNING]
> **Security Implication**: The `execute_sql` tool we are building allows raw SQL execution. In a production environment, you should strictly limit the database user's privileges (e.g., read-only access) to prevent accidental data modification or deletion by the AI.

## Prerequisites

- Node.js v18+ installed
- A MySQL server (local or remote)
- A database user with appropriate permissions

## Step 1: Project Initialization

First, let's create a new directory for our project and initialize it.

```bash
mkdir mysql-mcp-server
cd mysql-mcp-server
npm init -y
```

Install the required packages. We use `mysql2` for asynchronous database connections and `zod` for validation.

```bash
npm install @modelcontextprotocol/sdk zod mysql2
```

## Step 2: The Server Implementation

Create a file named `server.js`.

### 1. Setup and Connection Pool

We use a connection pool to manage database connections efficiently. **Crucially, we use environment variables for credentials** to avoid hardcoding sensitive information.

```javascript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import mysql from "mysql2/promise";

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_DATABASE || "my_database",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Create the MCP Server instance
const server = new Server(
  {
    name: "mysql-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);
```

### 2. Defining the `execute_sql` Tool

We expose a single, powerful tool: `execute_sql`. This allows the AI to form its own queries, making it highly adaptable to any schema.

```javascript
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "execute_sql",
        description:
          "Execute a raw SQL query against the MySQL database. Use this to list tables, query data, or even modify records if permitted.",
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
```

### 3. Handling the Request

When the tool is called, we execute the SQL using our pool and return the results as a JSON string.

```javascript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "execute_sql") {
    const schema = z.object({ sql: z.string() });
    const { sql } = schema.parse(args);

    try {
      // Execute the query
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
```

### 4. Running the Server

```javascript
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MySQL MCP Server running on STDIO");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
```

## Step 3: Integrating with AI Agents

Now that your server is built, how do you use it?

### Claude Desktop

To use this with Claude Desktop, you need to configure the `claude_desktop_config.json` file (typically found in `~/Library/Application\ Support/Claude/` on macOS).

Add your server configuration, making sure to pass the environment variables:

```json
{
  "mcpServers": {
    "mysql": {
      "command": "node",
      "args": ["/absolute/path/to/mysql-mcp-server/server.js"],
      "env": {
        "DB_HOST": "localhost",
        "DB_USER": "your_user",
        "DB_PASSWORD": "your_password",
        "DB_DATABASE": "your_database"
      }
    }
  }
}
```

Once saved, restart Claude Desktop. You can now ask Claude questions like:

- "Show me all tables in the database."
- "Count the number of users who signed up last week."
- "Find the user with email test@example.com."

### VS Code & Other Agents

For tools like **Cline** or **OpenCode** (if they support MCP), the configuration is often similar: you point the agent to your `server.js` file and ensure the environment variables are set for the process.

## Conclusion

By exposing a generic SQL interface via MCP, you empower AI agents to become capable database analysts. Just remember: with great power comes great responsibility—protect your credentials and restrict database permissions appropriately!
