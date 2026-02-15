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
      // Try to find claude CLI
      const claudePath = 'claude';

      currentProcess = spawn(claudePath, [], {
        cwd: projectPath,
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true,
      });

      currentProcess.stdout?.on('data', (data) => {
        win.webContents.send('claude-output', data.toString());
      });

      currentProcess.stderr?.on('data', (data) => {
        win.webContents.send('claude-output', data.toString());
      });

      currentProcess.on('error', (err) => {
        win.webContents.send('claude-error', err.message);
      });

      currentProcess.on('close', (code) => {
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
