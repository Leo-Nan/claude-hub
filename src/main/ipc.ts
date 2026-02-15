import { ipcMain, dialog } from 'electron';
import * as store from './store';
import { setupClaudeIPC } from './claude';

export function setupIPC() {
  // Get all projects
  ipcMain.handle('get-projects', () => {
    return store.getProjects();
  });

  // Add new project
  ipcMain.handle('add-project', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    });
    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }
    const projectPath = result.filePaths[0];
    const projectName = projectPath.split(/[\\/]/).pop() || 'Untitled';
    return store.addProject(projectName, projectPath);
  });

  // Remove project
  ipcMain.handle('remove-project', (_event, id: string) => {
    store.removeProject(id);
    return store.getProjects();
  });

  // Set current project
  ipcMain.handle('set-current-project', (_event, id: string) => {
    store.setCurrentProject(id);
    return store.getCurrentProject();
  });

  // Get current project
  ipcMain.handle('get-current-project', () => {
    return store.getCurrentProject();
  });

  // Update agent status
  ipcMain.handle('update-agent-status', (_event, projectId: string, agentId: string, status: string) => {
    store.updateAgentStatus(projectId, agentId, status as any);
    return store.getCurrentProject();
  });

  // Setup Claude process IPC
  setupClaudeIPC();
}
