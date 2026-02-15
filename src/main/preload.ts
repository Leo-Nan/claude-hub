import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getProjects: () => ipcRenderer.invoke('get-projects'),
  addProject: () => ipcRenderer.invoke('add-project'),
  removeProject: (id: string) => ipcRenderer.invoke('remove-project', id),
  setCurrentProject: (id: string) => ipcRenderer.invoke('set-current-project', id),
  getCurrentProject: () => ipcRenderer.invoke('get-current-project'),
  updateAgentStatus: (projectId: string, agentId: string, status: string) =>
    ipcRenderer.invoke('update-agent-status', projectId, agentId, status),

  // Claude session management
  startClaudeSession: (projectPath: string) => ipcRenderer.invoke('start-claude-session', projectPath),
  sendClaudeInput: (input: string) => ipcRenderer.invoke('send-claude-input', input),
  killClaudeSession: () => ipcRenderer.invoke('kill-claude-session'),
  onClaudeOutput: (callback: (data: string) => void) => {
    ipcRenderer.on('claude-output', (_event, data) => callback(data));
  },
  onClaudeError: (callback: (error: string) => void) => {
    ipcRenderer.on('claude-error', (_event, error) => callback(error));
  },
  onClaudeClose: (callback: (code: number) => void) => {
    ipcRenderer.on('claude-close', (_event, code) => callback(code));
  },
});
