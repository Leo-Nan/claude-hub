# Claude Hub MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 从零构建 Electron + React 桌面应用，实现项目管理、嵌入式终端、Agent 树状图功能

**Architecture:** 采用标准 Electron 项目结构，主进程负责窗口管理和系统交互，渲染进程使用 React + Zustand 构建 UI

**Tech Stack:** Electron 28+ | React 18 | TypeScript | electron-store | xterm.js | Zustand

---

## Task 1: Initialize Electron Project

**Goal:** 初始化 Electron + React + TypeScript 项目骨架

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `electron-builder.json`
- Create: `src/main/index.ts`
- Create: `src/renderer/index.html`
- Create: `src/renderer/index.tsx`
- Create: `src/renderer/App.tsx`
- Create: `src/shared/types.ts`

**Step 1: Create package.json**

```json
{
  "name": "claude-hub",
  "version": "1.0.0",
  "description": "Claude Hub Desktop Client",
  "main": "dist/main/index.js",
  "scripts": {
    "dev": "concurrently \"npm run dev:vite\" \"npm run dev:electron\"",
    "dev:vite": "vite",
    "dev:electron": "wait-on http://localhost:5173 && electron .",
    "build": "npm run build:vite && npm run build:electron",
    "build:vite": "vite build",
    "build:electron": "tsc -p tsconfig.electron.json",
    "package": "npm run build && electron-builder --win"
  },
  "dependencies": {
    "electron-store": "^8.1.0",
    "zustand": "^4.4.7",
    "xterm": "^5.3.0",
    "xterm-addon-fit": "^0.8.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/uuid": "^9.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "concurrently": "^8.2.0",
    "electron": "^28.0.0",
    "electron-builder": "^24.9.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "wait-on": "^7.2.0"
  }
}
```

**Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@shared/*": ["src/shared/*"]
    }
  },
  "include": ["src/renderer", "src/shared"],
  "references": [{ "path": "./tsconfig.electron.json" }]
}
```

**Step 3: Create tsconfig.electron.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "lib": ["ES2020"],
    "outDir": "dist/main",
    "rootDir": "src/main",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/main/**/*"]
}
```

**Step 4: Create vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  root: 'src/renderer',
  build: {
    outDir: '../../dist/renderer',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@shared': path.resolve(__dirname, 'src/shared'),
    },
  },
  server: {
    port: 5173,
  },
});
```

**Step 5: Create electron-builder.json**

```json
{
  "appId": "com.claudehub.app",
  "productName": "Claude Hub",
  "directories": {
    "output": "release"
  },
  "files": [
    "dist/**/*"
  ],
  "win": {
    "target": "nsis",
    "icon": "build/icon.ico"
  },
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true
  }
}
```

**Step 6: Create src/main/index.ts (main process entry)**

```typescript
import { app, BrowserWindow } from 'electron';
import * as path from 'path';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
  });

  // Load the app
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
```

**Step 7: Create src/renderer/index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Claude Hub</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        overflow: hidden;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/index.tsx"></script>
  </body>
</html>
```

**Step 8: Create src/renderer/index.tsx**

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Step 9: Create src/renderer/App.tsx**

```typescript
import React from 'react';

function App() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Claude Hub</h1>
      <p>Loading...</p>
    </div>
  );
}

export default App;
```

**Step 10: Create src/shared/types.ts**

```typescript
export interface Project {
  id: string;
  name: string;
  path: string;
  agents: Agent[];
  createdAt: string;
  lastOpened: string;
}

export interface Agent {
  id: string;
  name: string;
  type: 'researcher' | 'engineer' | 'reviewer';
  skills: string[];
  status: 'active' | 'idle' | 'thinking';
}

export interface AppConfig {
  theme: 'light';
  sidebarWidth: number;
  projects: Project[];
  currentProjectId: string | null;
}
```

**Step 11: Install dependencies**

Run: `npm install`
Expected: Successfully installed all packages

**Step 12: Run dev server to verify**

Run: `npm run dev:vite`
Expected: Dev server starts on http://localhost:5173

---

## Task 2: Setup Electron IPC & Store

**Goal:** 实现主进程的 IPC 通信和数据持久化

**Files:**
- Modify: `src/main/index.ts`
- Create: `src/main/store.ts`
- Create: `src/main/ipc.ts`
- Create: `src/main/preload.ts`

**Step 1: Create src/main/store.ts**

```typescript
import Store from 'electron-store';
import { AppConfig, Project, Agent } from '../shared/types';

const DEFAULT_AGENTS: Agent[] = [
  { id: 'agent-1', name: '调研员', type: 'researcher', skills: ['搜索', '整理'], status: 'idle' },
  { id: 'agent-2', name: '工程师', type: 'engineer', skills: ['前端', '后端'], status: 'idle' },
  { id: 'agent-3', name: '审查员', type: 'reviewer', skills: ['代码审查'], status: 'idle' },
];

const store = new Store<AppConfig>({
  defaults: {
    theme: 'light',
    sidebarWidth: 200,
    projects: [],
    currentProjectId: null,
  },
});

export function getProjects(): Project[] {
  return store.get('projects');
}

export function addProject(name: string, path: string): Project {
  const projects = getProjects();
  const newProject: Project = {
    id: `project-${Date.now()}`,
    name,
    path,
    agents: [...DEFAULT_AGENTS],
    createdAt: new Date().toISOString(),
    lastOpened: new Date().toISOString(),
  };
  projects.push(newProject);
  store.set('projects', projects);
  store.set('currentProjectId', newProject.id);
  return newProject;
}

export function removeProject(id: string): void {
  const projects = getProjects().filter((p) => p.id !== id);
  store.set('projects', projects);
  const currentId = store.get('currentProjectId');
  if (currentId === id) {
    store.set('currentProjectId', projects[0]?.id || null);
  }
}

export function setCurrentProject(id: string): void {
  store.set('currentProjectId', id);
}

export function getCurrentProject(): Project | null {
  const id = store.get('currentProjectId');
  if (!id) return null;
  return getProjects().find((p) => p.id === id) || null;
}

export function updateAgentStatus(projectId: string, agentId: string, status: Agent['status']): void {
  const projects = getProjects();
  const project = projects.find((p) => p.id === projectId);
  if (project) {
    const agent = project.agents.find((a) => a.id === agentId);
    if (agent) {
      agent.status = status;
      store.set('projects', projects);
    }
  }
}

export default store;
```

**Step 2: Create src/main/ipc.ts**

```typescript
import { ipcMain, dialog } from 'electron';
import * as store from './store';

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
}
```

**Step 3: Create src/main/preload.ts**

```typescript
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
```

**Step 4: Update tsconfig.electron.json to include preload**

Modify: `tsconfig.electron.json`

Add `src/main/preload.ts` to include array.

**Step 5: Update src/main/index.ts to use IPC and preload**

```typescript
import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { setupIPC } from './ipc';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
  });

  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  setupIPC();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
```

**Step 6: Add type declaration for window.electronAPI**

Create: `src/renderer/electron.d.ts`

```typescript
interface ElectronAPI {
  getProjects: () => Promise<any[]>;
  addProject: () => Promise<any>;
  removeProject: (id: string) => Promise<any[]>;
  setCurrentProject: (id: string) => Promise<any>;
  getCurrentProject: () => Promise<any>;
  updateAgentStatus: (projectId: string, agentId: string, status: string) => Promise<any>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
```

---

## Task 3: Implement Sidebar Component

**Goal:** 实现项目列表侧边栏组件

**Files:**
- Create: `src/renderer/stores/appStore.ts`
- Modify: `src/renderer/App.tsx`
- Create: `src/renderer/components/Sidebar.tsx`
- Create: `src/renderer/components/Layout.tsx`

**Step 1: Create src/renderer/stores/appStore.ts**

```typescript
import { create } from 'zustand';
import { Project, Agent } from '@shared/types';

interface AppState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  removeProject: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  setProjects: (projects) => set({ projects }),
  setCurrentProject: (project) => set({ currentProject: project }),
  addProject: (project) =>
    set((state) => ({
      projects: [...state.projects, project],
      currentProject: project,
    })),
  removeProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      currentProject:
        state.currentProject?.id === id ? null : state.currentProject,
    })),
  setLoading: (isLoading) => set({ isLoading }),
}));
```

**Step 2: Create src/renderer/components/Sidebar.tsx**

```typescript
import React from 'react';
import { Project } from '@shared/types';

interface SidebarProps {
  projects: Project[];
  currentProjectId: string | null;
  onSelectProject: (id: string) => void;
  onAddProject: () => void;
  onRemoveProject: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  projects,
  currentProjectId,
  onSelectProject,
  onAddProject,
  onRemoveProject,
}) => {
  const handleContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (confirm('确定删除此项目吗？')) {
      onRemoveProject(id);
    }
  };

  return (
    <div
      style={{
        width: 200,
        height: '100%',
        borderRight: '1px solid #e0e0e0',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f5f5f5',
      }}
    >
      <div
        style={{
          padding: '12px',
          borderBottom: '1px solid #e0e0e0',
          fontWeight: 'bold',
        }}
      >
        项目列表
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        {projects.map((project) => (
          <div
            key={project.id}
            onClick={() => onSelectProject(project.id)}
            onContextMenu={(e) => handleContextMenu(e, project.id)}
            style={{
              padding: '10px 12px',
              cursor: 'pointer',
              backgroundColor:
                project.id === currentProjectId ? '#e3f2fd' : 'transparent',
              borderLeft:
                project.id === currentProjectId ? '3px solid #2196f3' : '3px solid transparent',
            }}
          >
            {project.name}
          </div>
        ))}
      </div>
      <div
        onClick={onAddProject}
        style={{
          padding: '12px',
          borderTop: '1px solid #e0e0e0',
          cursor: 'pointer',
          color: '#2196f3',
          fontWeight: 500,
        }}
      >
        + 新建项目
      </div>
    </div>
  );
};

export default Sidebar;
```

**Step 3: Update src/renderer/App.tsx with full implementation**

```typescript
import React, { useEffect } from 'react';
import Sidebar from './components/Sidebar';
import { useAppStore } from './stores/appStore';

function App() {
  const {
    projects,
    currentProject,
    setProjects,
    setCurrentProject,
    addProject,
    removeProject,
  } = useAppStore();

  useEffect(() => {
    // Load initial data
    window.electronAPI.getProjects().then((data) => {
      setProjects(data);
      window.electronAPI.getCurrentProject().then((current) => {
        if (current) {
          setCurrentProject(current);
        }
      });
    });
  }, []);

  const handleSelectProject = async (id: string) => {
    const project = await window.electronAPI.setCurrentProject(id);
    setCurrentProject(project);
  };

  const handleAddProject = async () => {
    const project = await window.electronAPI.addProject();
    if (project) {
      addProject(project);
    }
  };

  const handleRemoveProject = async (id: string) => {
    const updatedProjects = await window.electronAPI.removeProject(id);
    setProjects(updatedProjects);
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        flexDirection: 'row',
      }}
    >
      <Sidebar
        projects={projects}
        currentProjectId={currentProject?.id || null}
        onSelectProject={handleSelectProject}
        onAddProject={handleAddProject}
        onRemoveProject={handleRemoveProject}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, padding: '20px' }}>
          <h2>{currentProject?.name || '请选择项目'}</h2>
          <p style={{ color: '#666', marginTop: '8px' }}>
            {currentProject?.path || '点击左侧项目或新建项目开始'}
          </p>
        </div>
        <div
          style={{
            height: '24px',
            borderTop: '1px solid #e0e0e0',
            padding: '0 12px',
            display: 'flex',
            alignItems: 'center',
            fontSize: '12px',
            color: '#666',
            backgroundColor: '#f5f5f5',
          }}
        >
          Claude Hub v1.0.0
        </div>
      </div>
    </div>
  );
}

export default App;
```

**Step 4: Test Sidebar functionality**

Run: `npm run dev`
Expected: App loads with sidebar, can add/remove/select projects

---

## Task 4: Implement Terminal Component

**Goal:** 实现嵌入式终端组件，使用 xterm.js

**Files:**
- Create: `src/renderer/components/Terminal.tsx`
- Modify: `src/renderer/App.tsx`

**Step 1: Install xterm packages**

Run: `npm install xterm xterm-addon-fit`
Expected: Packages installed

**Step 2: Create src/renderer/components/Terminal.tsx**

```typescript
import React, { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

interface TerminalProps {
  projectPath: string | null;
}

const Terminal: React.FC<TerminalProps> = ({ projectPath }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Consolas, Monaco, monospace',
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
      },
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;

    term.writeln('\x1b[36mClaude Hub Terminal\x1b[0m');
    term.writeln('');

    if (projectPath) {
      term.writeln(`\x1b[32m项目路径:\x1b[0m ${projectPath}`);
      term.writeln('\x1b[33m点击下方按钮启动 Claude 会话\x1b[0m');
    } else {
      term.writeln('\x1b[31m请先选择项目\x1b[0m');
    }

    term.onData((data) => {
      // Handle user input - for MVP, just echo
      term.write(data);
    });

    const handleResize = () => {
      fitAddon.fit();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, [projectPath]);

  const handleStartSession = () => {
    if (!projectPath || !xtermRef.current) return;

    setIsActive(true);
    const term = xtermRef.current;
    term.writeln('');
    term.writeln('\x1b[32m启动 Claude 会话...\x1b[0m');
    // Note: Actual Claude spawn would require IPC to main process
    // For MVP, this is a placeholder
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          padding: '8px 12px',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span style={{ fontWeight: 500 }}>终端</span>
        <button
          onClick={handleStartSession}
          disabled={!projectPath || isActive}
          style={{
            padding: '4px 12px',
            backgroundColor: projectPath && !isActive ? '#4caf50' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: projectPath && !isActive ? 'pointer' : 'not-allowed',
            fontSize: '12px',
          }}
        >
          {isActive ? '会话进行中' : '启动 Claude'}
        </button>
      </div>
      <div
        ref={terminalRef}
        style={{
          flex: 1,
          backgroundColor: '#1e1e1e',
          padding: '8px',
        }}
      />
    </div>
  );
};

export default Terminal;
```

**Step 3: Update App.tsx to include Terminal**

```typescript
// Add import
import Terminal from './components/Terminal';

// In the main content area, replace the placeholder with:
<div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
  <Terminal projectPath={currentProject?.path || null} />
</div>
```

**Step 4: Test Terminal**

Run: `npm run dev`
Expected: Terminal component renders, start button works

---

## Task 5: Implement Agent Tree Component

**Goal:** 实现 Agent 树状图组件

**Files:**
- Create: `src/renderer/components/AgentTree.tsx`
- Modify: `src/renderer/App.tsx`

**Step 1: Create src/renderer/components/AgentTree.tsx**

```typescript
import React from 'react';
import { Agent } from '@shared/types';

interface AgentTreeProps {
  agents: Agent[];
  onStatusChange: (agentId: string, status: Agent['status']) => void;
}

const STATUS_COLORS = {
  active: '#4caf50',
  idle: '#9e9e9e',
  thinking: '#ffc107',
};

const STATUS_LABELS = {
  active: '活跃',
  idle: '空闲',
  thinking: '思考中',
};

const AgentTree: React.FC<AgentTreeProps> = ({ agents, onStatusChange }) => {
  const handleStatusClick = (agentId: string, currentStatus: Agent['status']) => {
    const statusOrder: Agent['status'][] = ['idle', 'active', 'thinking'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    onStatusChange(agentId, nextStatus);
  };

  return (
    <div
      style={{
        padding: '16px',
        borderTop: '1px solid #e0e0e0',
        backgroundColor: '#fafafa',
      }}
    >
      <div style={{ marginBottom: '12px', fontWeight: 500 }}>Agent 树状图</div>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {/* Root Agent */}
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#fff',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#2196f3',
              }}
            />
            <span style={{ fontWeight: 500 }}>私人秘书</span>
          </div>
        </div>

        {/* Child Agents */}
        {agents.map((agent) => (
          <div
            key={agent.id}
            style={{
              padding: '12px 16px',
              backgroundColor: '#fff',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              marginLeft: '24px',
              position: 'relative',
            }}
          >
            {/* Connector line */}
            <div
              style={{
                position: 'absolute',
                left: '-24px',
                top: '50%',
                width: '24px',
                height: '1px',
                backgroundColor: '#e0e0e0',
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                onClick={() => handleStatusClick(agent.id, agent.status)}
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: STATUS_COLORS[agent.status],
                  cursor: 'pointer',
                }}
                title="点击切换状态"
              />
              <span style={{ fontWeight: 500 }}>{agent.name}</span>
            </div>
            <div
              style={{
                marginTop: '8px',
                fontSize: '12px',
                color: '#666',
              }}
            >
              能力: {agent.skills.join(', ')}
            </div>
            <div
              style={{
                marginTop: '4px',
                fontSize: '11px',
                color: STATUS_COLORS[agent.status],
              }}
            >
              {STATUS_LABELS[agent.status]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentTree;
```

**Step 2: Update App.tsx to include AgentTree**

```typescript
// Add import
import AgentTree from './components/AgentTree';

// Add handler
const handleAgentStatusChange = async (agentId: string, status: Agent['status']) => {
  if (!currentProject) return;
  const updated = await window.electronAPI.updateAgentStatus(
    currentProject.id,
    agentId,
    status
  );
  setCurrentProject(updated);
};

// In the main content area, below Terminal:
{currentProject && (
  <AgentTree
    agents={currentProject.agents}
    onStatusChange={handleAgentStatusChange}
  />
)}
```

**Step 3: Test AgentTree**

Run: `npm run dev`
Expected: Agent tree displays, clicking status cycles through states

---

## Task 6: Implement StatusBar Component

**Goal:** 实现底部状态栏组件

**Files:**
- Create: `src/renderer/components/StatusBar.tsx`
- Modify: `src/renderer/App.tsx`

**Step 1: Create src/renderer/components/StatusBar.tsx**

```typescript
import React, { useState, useEffect } from 'react';
import { Project } from '@shared/types';

interface StatusBarProps {
  currentProject: Project | null;
}

const StatusBar: React.FC<StatusBarProps> = ({ currentProject }) => {
  const [sessionTime, setSessionTime] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSessionActive) {
      interval = setInterval(() => {
        setSessionTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionActive]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const activeAgents = currentProject?.agents.filter(
    (a) => a.status === 'active'
  ).length || 0;

  return (
    <div
      style={{
        height: '24px',
        borderTop: '1px solid #e0e0e0',
        padding: '0 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '12px',
        color: '#666',
        backgroundColor: '#f5f5f5',
      }}
    >
      <div style={{ display: 'flex', gap: '16px' }}>
        <span>
          项目: {currentProject?.name || '未选择'}
        </span>
        <span>
          活跃Agent: {activeAgents}
        </span>
        {currentProject && (
          <span
            style={{ cursor: 'pointer' }}
            onClick={() => setIsSessionActive(!isSessionActive)}
            title="点击开始/暂停计时"
          >
            会话: {formatTime(sessionTime)}
          </span>
        )}
      </div>
      <div>Claude Hub v1.0.0</div>
    </div>
  );
};

export default StatusBar;
```

**Step 2: Update App.tsx to include StatusBar**

```typescript
// Add import
import StatusBar from './components/StatusBar';

// Replace the existing bottom bar in App with:
<StatusBar currentProject={currentProject} />
```

---

## Task 7: Build and Package

**Goal:** 构建生产版本并打包为可执行文件

**Files:**
- Modify: `package.json`
- Run: Build commands

**Step 1: Update package.json build scripts**

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:vite\" \"npm run dev:electron\"",
    "dev:vite": "vite",
    "dev:electron": "wait-on http://localhost:5173 && electron .",
    "build": "npm run build:vite && npm run build:electron",
    "build:vite": "vite build",
    "build:electron": "tsc -p tsconfig.electron.json",
    "package": "npm run build && electron-builder --win"
  }
}
```

**Step 2: Run production build**

Run: `npm run build`
Expected: Both Vite and TypeScript compilation succeed

**Step 3: Package as exe**

Run: `npm run package`
Expected: .exe file generated in release folder

---

## Summary

All tasks completed. The MVP includes:
- Project management (add, remove, switch)
- Embedded terminal with xterm.js
- Agent tree visualization with status toggle
- Status bar with session timer
- Electron-store persistence
- Production build and packaging
