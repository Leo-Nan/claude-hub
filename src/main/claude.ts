import * as pty from 'node-pty';
import { BrowserWindow, ipcMain } from 'electron';

// 会话信息接口
interface SessionInfo {
  id: string;
  projectPath: string;
  pty: pty.IPty;
}

// 使用 Map 管理多个 PTY 会话
const sessions: Map<string, SessionInfo> = new Map();
let mainWindow: BrowserWindow | null = null;

// 生成唯一会话 ID
const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// 获取 Claude 命令路径
const getClaudeCommand = (): string => {
  const localAppData = process.env.LOCALAPPDATA || '';
  const appData = process.env.APPDATA || '';
  const claudePaths = [
    'claude',
    'C:\\Users\\Windows11\\.local\\bin\\claude.exe',
    localAppData ? localAppData + '\\npm\\claude.exe' : null,
    appData ? appData + '\\npm\\claude.exe' : null,
  ].filter(Boolean) as string[];

  for (const p of claudePaths) {
    if (p && require('fs').existsSync(p)) {
      return p;
    }
  }
  return 'claude';
};

// Cleanup function to clear all sessions
export function cleanupAllSessions() {
  sessions.forEach((session) => {
    try {
      session.pty.kill();
    } catch (e) {
      console.error('Error killing pty:', e);
    }
  });
  sessions.clear();
  mainWindow = null;
}

// Cleanup specific session
export function cleanupSession(sessionId: string) {
  const session = sessions.get(sessionId);
  if (session) {
    try {
      session.pty.kill();
    } catch (e) {
      console.error('Error killing pty:', e);
    }
    sessions.delete(sessionId);
  }
}

// Register cleanup when window closes
export function setupClaudeCleanup(window: BrowserWindow) {
  window.on('closed', () => {
    cleanupAllSessions();
  });
}

export function setupClaudeIPC() {
  // Start Claude session with PTY
  ipcMain.handle('start-claude-session', async (event, projectPath: string) => {
    mainWindow = BrowserWindow.fromWebContents(event.sender);
    if (!mainWindow) return { success: false, error: 'Window not found' };

    try {
      // Validate project path
      if (!projectPath || !require('fs').existsSync(projectPath)) {
        return { success: false, error: '项目路径不存在或无效' };
      }

      // Generate session ID
      const sessionId = generateSessionId();

      // Get environment
      const env = { ...process.env };
      delete env.CLAUDECODE;

      // Start PTY with claude command
      const claudeCmd = getClaudeCommand();

      const ptyProcess = pty.spawn(claudeCmd, ['--dangerously-skip-permissions'], {
        cwd: projectPath,
        env: env,
        name: 'xterm-color',
        cols: 120,
        rows: 30,
      });

      // Create session info
      const sessionInfo: SessionInfo = {
        id: sessionId,
        projectPath,
        pty: ptyProcess,
      };

      // Store session
      sessions.set(sessionId, sessionInfo);

      // Send output to renderer with sessionId
      ptyProcess.onData((data) => {
        if (mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents) {
          mainWindow.webContents.send('claude-output', { sessionId, data });
        }
      });

      ptyProcess.onExit(({ exitCode }) => {
        if (mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents) {
          mainWindow.webContents.send('claude-close', { sessionId, exitCode });
        }
        sessions.delete(sessionId);
      });

      console.log(`[Claude] Session started: ${sessionId} for ${projectPath}`);
      return { success: true, sessionId };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Send input to specific Claude session
  ipcMain.handle('send-claude-input', async (_event, sessionId: string, input: string) => {
    const session = sessions.get(sessionId);
    if (session) {
      session.pty.write(input);
      return { success: true };
    }
    return { success: false, error: 'Session not found' };
  });

  // Get all active sessions
  ipcMain.handle('get-active-sessions', async () => {
    const activeSessions: Array<{ id: string; projectPath: string }> = [];
    sessions.forEach((session) => {
      activeSessions.push({
        id: session.id,
        projectPath: session.projectPath,
      });
    });
    return activeSessions;
  });

  // Kill specific Claude session
  ipcMain.handle('kill-claude-session', async (_event, sessionId?: string) => {
    if (sessionId) {
      // Kill specific session
      const session = sessions.get(sessionId);
      if (session) {
        session.pty.kill();
        sessions.delete(sessionId);
        return { success: true };
      }
      return { success: false, error: 'Session not found' };
    } else {
      // Kill all sessions (legacy behavior)
      cleanupAllSessions();
      return { success: true };
    }
  });

  // Resize specific PTY
  ipcMain.handle('resize-pty', async (_event, sessionId: string, cols: number, rows: number) => {
    const session = sessions.get(sessionId);
    if (session) {
      session.pty.resize(cols, rows);
      return { success: true };
    }
    return { success: false, error: 'Session not found' };
  });
}
