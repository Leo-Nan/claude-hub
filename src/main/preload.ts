import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getProjects: () => ipcRenderer.invoke('get-projects'),
  addProject: () => ipcRenderer.invoke('add-project'),
  removeProject: (id: string) => ipcRenderer.invoke('remove-project', id),
  setCurrentProject: (id: string) => ipcRenderer.invoke('set-current-project', id),
  getCurrentProject: () => ipcRenderer.invoke('get-current-project'),
  updateAgentStatus: (projectId: string, agentId: string, status: string) =>
    ipcRenderer.invoke('update-agent-status', projectId, agentId, status),
});
