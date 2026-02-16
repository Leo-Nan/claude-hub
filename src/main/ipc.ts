import { ipcMain, dialog, shell } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import * as store from './store';
import { setupClaudeIPC } from './claude';
import { Agent } from '../shared/types';

const VALID_STATUSES: Agent['status'][] = ['active', 'idle', 'thinking'];

function isValidStatus(status: string): status is Agent['status'] {
  return VALID_STATUSES.includes(status as Agent['status']);
}

// 文件/目录节点类型
interface FileNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileNode[];
}

// 递归读取目录结构
function readDirectory(dirPath: string, depth: number, maxDepth: number = 3): FileNode[] {
  if (depth > maxDepth) return [];

  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const nodes: FileNode[] = [];

    for (const entry of entries) {
      // 跳过 node_modules（可选）
      if (entry.name === 'node_modules') continue;

      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        const children = depth < maxDepth ? readDirectory(fullPath, depth + 1, maxDepth) : [];
        nodes.push({
          name: entry.name,
          path: fullPath,
          isDirectory: true,
          children: children.length > 0 ? children : undefined,
        });
      } else {
        nodes.push({
          name: entry.name,
          path: fullPath,
          isDirectory: false,
        });
      }
    }

    // 目录优先排序
    return nodes.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });
  } catch (error) {
    console.error('Error reading directory:', error);
    return [];
  }
}

// Validate string is not empty
function isValidId(id: unknown): id is string {
  return typeof id === 'string' && id.length > 0;
}

// Validate theme
function isValidTheme(theme: unknown): theme is 'light' | 'dark' {
  return theme === 'light' || theme === 'dark';
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
    if (!isValidId(id)) {
      return { error: '无效的项目ID' };
    }
    store.removeProject(id);
    return store.getProjects();
  });

  // Update project
  ipcMain.handle('update-project', (_event, id: string, updates: Record<string, unknown>) => {
    if (!isValidId(id)) {
      return { error: '无效的项目ID' };
    }
    return store.updateProject(id, updates);
  });

  // Set current project
  ipcMain.handle('set-current-project', (_event, id: string) => {
    if (!isValidId(id)) {
      return { error: '无效的项目ID' };
    }
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

  ipcMain.handle('get-version', () => {
    const pkg = require('../package.json');
    return pkg.version;
  });

  ipcMain.handle('set-theme', (_event, theme: unknown) => {
    if (!isValidTheme(theme)) {
      return { error: '无效的主题' };
    }
    store.setTheme(theme);
    return theme;
  });

  // 获取项目文件结构
  ipcMain.handle('get-project-files', (_event, projectPath: string) => {
    if (!projectPath || !fs.existsSync(projectPath)) {
      return { error: '项目路径不存在' };
    }
    return readDirectory(projectPath, 0, 3);
  });

  // 在资源管理器中打开
  ipcMain.handle('open-in-explorer', (_event, filePath: string) => {
    shell.showItemInFolder(filePath);
    return { success: true };
  });

  // 在 VSCode 中打开
  ipcMain.handle('open-in-vscode', (_event, filePath: string) => {
    const { exec } = require('child_process');
    exec(`code "${filePath}"`, (error: Error | null) => {
      if (error) {
        console.error('Failed to open in VSCode:', error);
      }
    });
    return { success: true };
  });

  // 复制路径到剪贴板
  ipcMain.handle('copy-path', (_event, filePath: string) => {
    const { clipboard } = require('electron');
    clipboard.writeText(filePath);
    return { success: true };
  });

  // Setup Claude process IPC
  setupClaudeIPC();
}
