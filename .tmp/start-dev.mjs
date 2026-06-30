import { spawn } from 'node:child_process';
const child = spawn('npm run dev', { cwd: process.cwd(), detached: true, stdio: 'ignore', shell: true });
child.unref();
console.log('STARTED ' + child.pid);
