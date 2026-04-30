// scripts/free-port.cjs
// Usage: node scripts/free-port.cjs <port>

const { execSync } = require('child_process');
const port = process.argv[2];
if (!port) {
  console.error('Port number required!');
  process.exit(1);
}

const platform = process.platform;

try {
  if (platform === 'win32') {
    // Windows: kill process using port
    const cmd = `powershell -Command \"Get-Process -Id (Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess) -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue\"`;
    execSync(cmd, { stdio: 'ignore' });
  } else {
    // Unix-like: kill process using port
    execSync(`lsof -ti:${port} | xargs kill -15 2>/dev/null || true`, { stdio: 'ignore', shell: '/bin/bash' });
  }
  console.log(`Port ${port} released (if occupied).`);
} catch (e) {
  // Ignore errors (e.g., if port is not in use)
}
