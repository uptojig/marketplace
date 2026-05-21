#!/usr/bin/env node
// free-port.mjs <port> — kill whatever is LISTENING on <port> so the dev/start
// server always binds the exact port. Without this, Next.js silently falls back
// to the next free port (3001, 4001, …) when the intended one is occupied by a
// previous, still-running server. Cross-platform: netstat on Windows, lsof on
// macOS/Linux.

import { execSync } from 'node:child_process';

const port = process.argv[2];
if (!port || !/^\d+$/.test(port)) {
  console.error('usage: node scripts/free-port.mjs <port>');
  process.exit(1);
}

const isWin = process.platform === 'win32';

function pidsOnPort(wanted) {
  const pids = new Set();
  if (isWin) {
    let out = '';
    try {
      out = execSync('netstat -ano -p tcp', { encoding: 'utf8' });
    } catch {
      return [];
    }
    for (const line of out.split(/\r?\n/)) {
      const cols = line.trim().split(/\s+/);
      // cols: [Proto, LocalAddress, ForeignAddress, State, PID]
      if (cols.length < 5 || cols[0] !== 'TCP' || cols[3] !== 'LISTENING') continue;
      const localPort = cols[1].slice(cols[1].lastIndexOf(':') + 1);
      if (localPort === wanted) pids.add(cols[4]);
    }
  } else {
    try {
      const out = execSync(`lsof -ti tcp:${wanted} -sTCP:LISTEN`, { encoding: 'utf8' });
      out.split(/\s+/).filter(Boolean).forEach((p) => pids.add(p));
    } catch {
      /* nothing listening */
    }
  }
  // never kill ourselves
  return [...pids].filter((p) => p !== String(process.pid));
}

const pids = pidsOnPort(port);
if (pids.length === 0) {
  console.log(`✓ port ${port} is free`);
  process.exit(0);
}

for (const pid of pids) {
  try {
    if (isWin) execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
    else process.kill(Number(pid), 'SIGKILL');
    console.log(`✓ freed port ${port} (killed pid ${pid})`);
  } catch (err) {
    console.warn(`! could not kill pid ${pid} on port ${port}: ${err.message}`);
  }
}
