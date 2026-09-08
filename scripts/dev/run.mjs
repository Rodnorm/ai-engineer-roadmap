#!/usr/bin/env node

/**
 * Cross-platform Local Development Orchestrator for ai-engineer-roadmap.
 * Spawns frontends and backends defined in scripts/dev/apps.json.
 * Handles port availability checks, prefixed logging, and clean child process termination.
 */

import fs from "node:fs";
import path from "node:path";
import net from "node:net";
import readline from "node:readline";
import { spawn, execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "../..");
const MANIFEST_PATH = path.join(__dirname, "apps.json");

// ANSI color codes
const COLORS = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

const SERVICE_COLORS = [
  COLORS.cyan,
  COLORS.green,
  COLORS.yellow,
  COLORS.magenta,
  COLORS.blue,
];

// Active child processes to clean up on exit
const runningProcesses = new Set();
let isShuttingDown = false;

/**
 * Checks if a TCP port is currently available on host.
 */
export function checkPortAvailable(port, host = "127.0.0.1") {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", (err) => {
      if (err.code === "EADDRINUSE") {
        resolve(false);
      } else {
        resolve(false);
      }
    });
    server.once("listening", () => {
      server.close(() => resolve(true));
    });
    server.listen(port, host);
  });
}

/**
 * Resolves binary executable for cross-platform support (e.g. npm.cmd on Windows).
 */
export function resolveCommand(commandString, cwd) {
  const parts = commandString.split(/\s+/);
  let [cmd, ...args] = parts;
  const isWin = process.platform === "win32";

  // Check for local venv in directory for Python / uvicorn
  if (cmd === "uvicorn") {
    const venvUvicornWin = path.join(cwd, ".venv", "Scripts", "uvicorn.exe");
    const venvUvicornUnix = path.join(cwd, ".venv", "bin", "uvicorn");
    if (isWin && fs.existsSync(venvUvicornWin)) {
      cmd = venvUvicornWin;
    } else if (!isWin && fs.existsSync(venvUvicornUnix)) {
      cmd = venvUvicornUnix;
    } else if (isWin) {
      // Use python -m uvicorn on Windows if uvicorn standalone is not in PATH
      cmd = "python";
      args = ["-m", "uvicorn", ...args];
    }
  } else if (cmd === "npm" && isWin) {
    cmd = "npm.cmd";
  } else if (cmd === "npx" && isWin) {
    cmd = "npx.cmd";
  }

  return { cmd, args };
}

/**
 * Safely terminates a process tree.
 */
function terminateProcess(child) {
  if (!child || child.killed || child.exitCode !== null) return;
  try {
    if (process.platform === "win32" && child.pid) {
      try {
        execSync(`taskkill /pid ${child.pid} /T /F`, { stdio: "ignore" });
      } catch {
        child.kill("SIGKILL");
      }
    } else if (child.pid) {
      child.kill("SIGTERM");
    }
  } catch {
    // Process already terminated
  }
}

/**
 * Graceful shutdown of all spawned processes.
 */
function shutdown(exitCode = 0) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`\n${COLORS.yellow}[orchestrator] Shutting down all services...${COLORS.reset}`);
  for (const child of runningProcesses) {
    terminateProcess(child);
  }
  runningProcesses.clear();

  setTimeout(() => {
    process.exit(exitCode);
  }, 300);
}

// Register shutdown listeners
process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
process.on("exit", () => {
  for (const child of runningProcesses) {
    terminateProcess(child);
  }
});

/**
 * Reads and parses the apps manifest.
 */
export function loadManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    throw new Error(`Manifest not found at ${MANIFEST_PATH}`);
  }
  const content = fs.readFileSync(MANIFEST_PATH, "utf-8");
  return JSON.parse(content);
}

/**
 * Spawns a single service and streams logs.
 */
function startService(serviceConfig, label, color) {
  const fullCwd = path.join(ROOT_DIR, serviceConfig.dir);
  if (!fs.existsSync(fullCwd)) {
    console.error(
      `${COLORS.red}[${label}] Error: Directory does not exist: ${fullCwd}${COLORS.reset}`
    );
    return null;
  }

  const { cmd, args } = resolveCommand(serviceConfig.command, fullCwd);
  const prefix = `${color}[${label}]${COLORS.reset}`;

  const env = {
    ...process.env,
    ...(serviceConfig.env || {}),
  };

  const child = spawn(cmd, args, {
    cwd: fullCwd,
    env,
    stdio: ["ignore", "pipe", "pipe"],
  });

  runningProcesses.add(child);

  const prefixLine = (line) => {
    // Filter out internal credential noise if any
    console.log(`${prefix} ${line}`);
  };

  readline.createInterface({ input: child.stdout }).on("line", prefixLine);
  readline.createInterface({ input: child.stderr }).on("line", prefixLine);

  child.on("error", (err) => {
    console.error(`${prefix} ${COLORS.red}Failed to start: ${err.message}${COLORS.reset}`);
    shutdown(1);
  });

  child.on("exit", (code, signal) => {
    runningProcesses.delete(child);
    if (!isShuttingDown && code !== 0 && code !== null) {
      console.error(
        `${prefix} ${COLORS.red}Exited with code ${code}${signal ? ` (signal: ${signal})` : ""}${COLORS.reset}`
      );
      shutdown(code);
    }
  });

  return child;
}

/**
 * Main entrypoint.
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
${COLORS.bold}AI Engineer Roadmap — Local Development Orchestrator${COLORS.reset}

Usage:
  node scripts/dev/run.mjs [options]

Options:
  --all            Start all applications (00, 01, 02, 03) [Default]
  --app <id>       Start a specific application by ID (e.g. --app 01)
  --help, -h       Display this help message

Examples:
  npm run dev          # Start all services
  npm run dev:01       # Start only Smart Inspector (frontend & backend)
  npm run dev:00       # Start only Portfolio catalog
`);
    process.exit(0);
  }

  const manifest = loadManifest();
  let targetApps = manifest.apps;

  const appArgIdx = args.indexOf("--app");
  if (appArgIdx !== -1 && args[appArgIdx + 1]) {
    const targetId = args[appArgIdx + 1].padStart(2, "0");
    targetApps = manifest.apps.filter((a) => a.id === targetId);
    if (targetApps.length === 0) {
      console.error(
        `${COLORS.red}Error: Application with ID "${targetId}" not found in scripts/dev/apps.json${COLORS.reset}`
      );
      process.exit(1);
    }
  }

  console.log(`\n${COLORS.bold}${COLORS.cyan}====================================================${COLORS.reset}`);
  console.log(`${COLORS.bold}  AI Engineer Roadmap — Local Dev Orchestrator${COLORS.reset}`);
  console.log(`${COLORS.dim}  Spawning ${targetApps.length} application(s)...${COLORS.reset}`);
  console.log(`${COLORS.bold}${COLORS.cyan}====================================================${COLORS.reset}\n`);

  // Step 1: Pre-flight Port Conflict Check
  const servicesToStart = [];
  let colorIdx = 0;

  for (const app of targetApps) {
    if (app.frontend) {
      const color = SERVICE_COLORS[colorIdx % SERVICE_COLORS.length];
      colorIdx++;
      servicesToStart.push({
        config: app.frontend,
        label: `${app.id}:frontend`,
        port: app.frontend.port,
        appName: app.name,
        color,
      });
    }

    if (app.backend) {
      const color = SERVICE_COLORS[colorIdx % SERVICE_COLORS.length];
      colorIdx++;
      servicesToStart.push({
        config: app.backend,
        label: `${app.id}:backend`,
        port: app.backend.port,
        appName: app.name,
        color,
      });
    }
  }

  const portConflicts = [];
  for (const svc of servicesToStart) {
    if (svc.port) {
      const available = await checkPortAvailable(svc.port);
      if (!available) {
        portConflicts.push({ port: svc.port, label: svc.label, appName: svc.appName });
      }
    }
  }

  if (portConflicts.length > 0) {
    console.error(`${COLORS.red}${COLORS.bold}[ERROR] Port conflict detected!${COLORS.reset}`);
    for (const conflict of portConflicts) {
      console.error(
        `${COLORS.red}  • Port ${conflict.port} is already in use by another process (${conflict.label} - ${conflict.appName})${COLORS.reset}`
      );
    }
    console.error(
      `\n${COLORS.yellow}Please terminate the conflicting process or change the port configuration in scripts/dev/apps.json before running.${COLORS.reset}\n`
    );
    process.exit(1);
  }

  // Step 2: Spawn all validated services
  for (const svc of servicesToStart) {
    console.log(
      `${svc.color}[orchestrator] Starting ${svc.label} on port ${svc.port || "N/A"} (${svc.config.dir})...${COLORS.reset}`
    );
    startService(svc.config, svc.label, svc.color);
  }

  console.log(`\n${COLORS.green}[orchestrator] All services spawned successfully. Press Ctrl+C to stop all.${COLORS.reset}\n`);
}

// Run if called directly
const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);
if (isDirectRun) {
  main().catch((err) => {
    console.error(`${COLORS.red}[orchestrator] Fatal error: ${err.message}${COLORS.reset}`);
    shutdown(1);
  });
}
