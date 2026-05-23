
import { spawn } from 'child_process';

// Use credentials provided by user (Simulated env vars)
const env = {
  ...process.env,
  DB_HOST: 'localhost',
  DB_USER: 'root',
  DB_PASSWORD: 'root',
  DB_DATABASE: 'db_nkmd'
};

const server = spawn('node', ['server.js'], {
  stdio: ['pipe', 'pipe', 'inherit'],
  env: env
});

let buffer = '';

server.stdout.on('data', (data) => {
  const chunk = data.toString();
  buffer += chunk;
  
  const lines = buffer.split('\n');
  buffer = lines.pop(); 

  for (const line of lines) {
    if (!line.trim()) continue;
    
    try {
      const msg = JSON.parse(line);
      console.log('Received:', msg);

      if (msg.result && msg.result.capabilities) {
        console.log('--- Initialized. Listing tools... ---');
        send({
          jsonrpc: '2.0',
          id: 2,
          method: 'tools/list'
        });
      } else if (msg.result && msg.result.tools) {
        console.log('--- Tools listed. Calling execute_sql... ---');
        // Try to show tables to verify connection
        send({
          jsonrpc: '2.0',
          id: 3,
          method: 'tools/call',
          params: {
            name: 'execute_sql',
            arguments: {
              sql: "SHOW TABLES"
            }
          }
        });
      } else if (msg.result && msg.result.content) {
        console.log('--- Query Result ---');
        console.log(msg.result.content[0].text);
        process.exit(0);
      } else if (msg.error) {
          console.error('Server returned error:', msg.error);
          process.exit(1);
      }
    } catch (e) {
    }
  }
});

function send(msg) {
  const str = JSON.stringify(msg) + '\n';
  server.stdin.write(str);
}

console.log('--- Sending Initialize ---');
send({
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'test-client', version: '1.0' }
  }
});

setTimeout(() => {
  console.error("Timeout waiting for response");
  server.kill();
  process.exit(1);
}, 5000);
