import { spawn, ChildProcess } from 'child_process';
import { BrowserWindow, ipcMain } from 'electron';

let currentProcess: ChildProcess | null = null;

export function setupClaudeIPC() {
  // Start Claude session
  ipcMain.handle('start-claude-session', async (event, projectPath: string) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return { success: false, error: 'Window not found' };

    // Kill existing process if any
    if (currentProcess) {
      currentProcess.kill();
      currentProcess = null;
    }

    try {
      // Clone env and remove CLAUDECODE to allow nested sessions
      const env = { ...process.env };
      delete env.CLAUDECODE;

      // Use --dangerously-skip-permissions for smoother experience
      const args = ['--dangerously-skip-permissions'];

      currentProcess = spawn('claude', args, {
        cwd: projectPath,
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true,
        env: env
      });

      let buffer = '';

      currentProcess.stdout?.on('data', (data) => {
        const str = data.toString();
        buffer += str;
        // Flush buffer when we see a prompt or complete output
        if (str.includes('> ') || str.includes('\n')) {
          win.webContents.send('claude-output', buffer);
          buffer = '';
        }
      });

      currentProcess.stderr?.on('data', (data) => {
        const str = data.toString();
        // Only show non-empty stderr that's not about --print
        if (str.trim() && !str.includes('--print')) {
          win.webContents.send('claude-output', str);
        }
      });

      currentProcess.on('error', (err) => {
        win.webContents.send('claude-error', err.message);
      });

      currentProcess.on('close', (code) => {
        if (buffer) {
          win.webContents.send('claude-output', buffer);
        }
        win.webContents.send('claude-close', code);
        currentProcess = null;
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Send input to Claude
  ipcMain.handle('send-claude-input', async (_event, input: string) => {
    if (currentProcess && currentProcess.stdin) {
      currentProcess.stdin.write(input + '\n');
      return { success: true };
    }
    return { success: false, error: 'No active session' };
  });

  // Kill Claude session
  ipcMain.handle('kill-claude-session', async () => {
    if (currentProcess) {
      currentProcess.kill();
      currentProcess = null;
      return { success: true };
    }
    return { success: false, error: 'No active session' };
  });
}
