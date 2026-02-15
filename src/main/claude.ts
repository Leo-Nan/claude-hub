import * as pty from 'node-pty';
import { BrowserWindow, ipcMain } from 'electron';

let currentPty: pty.IPty | null = null;
let mainWindow: BrowserWindow | null = null;

export function setupClaudeIPC() {
  // Start Claude session with PTY
  ipcMain.handle('start-claude-session', async (event, projectPath: string) => {
    mainWindow = BrowserWindow.fromWebContents(event.sender);
    if (!mainWindow) return { success: false, error: 'Window not found' };

    // Kill existing process if any
    if (currentPty) {
      currentPty.kill();
      currentPty = null;
    }

    try {
      // Get environment
      const env = { ...process.env };
      delete env.CLAUDECODE;

      // Start PTY with claude command
      // Use --dangerously-skip-permissions for nested sessions
      // Try common installation paths
      const claudePaths = [
        'claude',
        'C:\\Users\\Windows11\\.local\\bin\\claude.exe',
        process.env.LOCALAPPDATA + '\\npm\\claude.exe',
        process.env.APPDATA + '\\npm\\claude.exe',
      ];

      let claudeCmd = 'claude';
      for (const p of claudePaths) {
        if (p && require('fs').existsSync(p)) {
          claudeCmd = p;
          break;
        }
      }

      currentPty = pty.spawn(claudeCmd, ['--dangerously-skip-permissions'], {
        cwd: projectPath,
        env: env,
        name: 'xterm-color',
        cols: 120,
        rows: 30,
      });

      // Send output to renderer
      currentPty.onData((data) => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('claude-output', data);
        }
      });

      currentPty.onExit(({ exitCode }) => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('claude-close', exitCode);
        }
        currentPty = null;
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Send input to Claude
  ipcMain.handle('send-claude-input', async (_event, input: string) => {
    if (currentPty) {
      currentPty.write(input);
      return { success: true };
    }
    return { success: false, error: 'No active session' };
  });

  // Kill Claude session
  ipcMain.handle('kill-claude-session', async () => {
    if (currentPty) {
      currentPty.kill();
      currentPty = null;
      return { success: true };
    }
    return { success: false, error: 'No active session' };
  });

  // Resize PTY
  ipcMain.handle('resize-pty', async (_event, cols: number, rows: number) => {
    if (currentPty) {
      currentPty.resize(cols, rows);
      return { success: true };
    }
    return { success: false, error: 'No active session' };
  });
}
