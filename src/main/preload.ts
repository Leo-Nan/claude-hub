import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getProjects: () => ipcRenderer.invoke('get-projects'),
  addProject: () => ipcRenderer.invoke('add-project'),
  removeProject: (id: string) => ipcRenderer.invoke('remove-project', id),
  updateProject: (id: string, updates: Record<string, unknown>) => ipcRenderer.invoke('update-project', id, updates),
  setCurrentProject: (id: string) => ipcRenderer.invoke('set-current-project', id),
  getCurrentProject: () => ipcRenderer.invoke('get-current-project'),
  updateAgentStatus: (projectId: string, agentId: string, status: string) =>
    ipcRenderer.invoke('update-agent-status', projectId, agentId, status),

  // Theme management
  getTheme: () => ipcRenderer.invoke('get-theme'),
  setTheme: (theme: 'light' | 'dark') => ipcRenderer.invoke('set-theme', theme),
  getVersion: () => ipcRenderer.invoke('get-version'),

  // File tree management
  getProjectFiles: (projectPath: string) => ipcRenderer.invoke('get-project-files', projectPath),
  openInExplorer: (filePath: string) => ipcRenderer.invoke('open-in-explorer', filePath),
  openInVSCode: (filePath: string) => ipcRenderer.invoke('open-in-vscode', filePath),
  copyPath: (filePath: string) => ipcRenderer.invoke('copy-path', filePath),

  // Claude session management (multi-session support)
  startClaudeSession: (projectPath: string) => ipcRenderer.invoke('start-claude-session', projectPath),
  sendClaudeInput: (sessionId: string, input: string) => ipcRenderer.invoke('send-claude-input', sessionId, input),
  killClaudeSession: (sessionId?: string) => ipcRenderer.invoke('kill-claude-session', sessionId),
  getActiveSessions: () => ipcRenderer.invoke('get-active-sessions'),
  resizePty: (sessionId: string, cols: number, rows: number) => ipcRenderer.invoke('resize-pty', sessionId, cols, rows),

  // Listen for Claude output (now with sessionId)
  onClaudeOutput: (callback: (data: { sessionId: string; data: string }) => void) => {
    ipcRenderer.on('claude-output', (_event, data) => callback(data));
  },
  // Listen for errors
  onClaudeError: (callback: (error: string) => void) => {
    ipcRenderer.on('claude-error', (_event, error) => callback(error));
  },
  // Listen for close (now with sessionId)
  onClaudeClose: (callback: (data: { sessionId: string; exitCode: number }) => void) => {
    ipcRenderer.on('claude-close', (_event, data) => callback(data));
  },
});
