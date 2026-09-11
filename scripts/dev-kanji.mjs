import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const portIndex = process.argv.indexOf('--port');
const port = portIndex >= 0 ? process.argv[portIndex + 1] : '3100';
const storeProcess = spawn(process.execPath, [resolve(projectRoot, 'scripts', 'shadowing-project-store.mjs')], {
  cwd: projectRoot,
  stdio: 'inherit',
});
const nextProcess = spawn(process.execPath, [resolve(projectRoot, 'node_modules', 'next', 'dist', 'bin', 'next'), 'dev', '--port', port], {
  cwd: projectRoot,
  stdio: 'inherit',
});

let stopping = false;
const stop = (exitCode = 0) => {
  if (stopping) return;
  stopping = true;
  if (!storeProcess.killed) storeProcess.kill();
  if (!nextProcess.killed) nextProcess.kill();
  process.exitCode = exitCode;
};

nextProcess.on('exit', (code) => stop(code ?? 0));
nextProcess.on('error', () => stop(1));
process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));
