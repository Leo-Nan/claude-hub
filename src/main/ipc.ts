import { ipcMain, dialog } from 'electron';
import * as fs from 'fs';
import * as store from './store';
import { setupClaudeIPC } from './claude';
import { Agent } from '../shared/types';

const VALID_STATUSES: Agent['status'][] = ['active', 'idle', 'thinking'];

function isValidStatus(status: string): status is Agent['status'] {
  return VALID_STATUSES.includes(status as Agent['status']);
}

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

    // 检查路径是否存在
    if (!fs.existsSync(projectPath)) {
      return { error: '路径不存在' };
    }

    const projectName = projectPath.split(/[\\/]/).pop() || 'Untitled';

    // 检查是否已存在相同路径的项目
    const existing = store.getProjects().find(p => p.path === projectPath);
    if (existing) {
      return { error: '该项目已存在' };
    }

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
    if (!isValidStatus(status)) {
      return { error: `Invalid status: ${status}. Must be one of: ${VALID_STATUSES.join(', ')}` };
    }
    store.updateAgentStatus(projectId, agentId, status);
    return store.getCurrentProject();
  });

  // Theme management
  ipcMain.handle('get-theme', () => {
    return store.getTheme();
  });

  ipcMain.handle('set-theme', (_event, theme: 'light' | 'dark') => {
    store.setTheme(theme);
    return theme;
  });

  // Setup Claude process IPC
  setupClaudeIPC();
}
