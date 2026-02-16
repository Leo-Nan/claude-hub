// File tree types
import { Project, Agent, TagColor } from '@shared/types';

interface FileNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileNode[];
}

interface SessionInfo {
  id: string;
  projectPath: string;
}

interface ElectronAPI {
  getProjects: () => Promise<Project[]>;
  addProject: () => Promise<Project | null>;
  removeProject: (id: string) => Promise<Project[]>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<Project | null>;
  setCurrentProject: (id: string) => Promise<Project | null>;
  getCurrentProject: () => Promise<Project | null>;
  updateAgentStatus: (projectId: string, agentId: string, status: string) => Promise<Project | null>;

  // Theme management
  getTheme: () => Promise<string>;
  setTheme: (theme: 'light' | 'dark') => Promise<void>;
  getVersion: () => Promise<string>;

  // File tree management
  getProjectFiles: (projectPath: string) => Promise<FileNode[]>;
  openInExplorer: (filePath: string) => Promise<{ success: boolean }>;
  openInVSCode: (filePath: string) => Promise<{ success: boolean }>;
  copyPath: (filePath: string) => Promise<{ success: boolean }>;

  // Claude session management (multi-session support)
  startClaudeSession: (projectPath: string) => Promise<{ success: boolean; sessionId?: string; error?: string }>;
  sendClaudeInput: (sessionId: string, input: string) => Promise<{ success: boolean; error?: string }>;
  killClaudeSession: (sessionId?: string) => Promise<{ success: boolean; error?: string }>;
  getActiveSessions: () => Promise<SessionInfo[]>;
  resizePty: (sessionId: string, cols: number, rows: number) => Promise<{ success: boolean; error?: string }>;

  // Event listeners (now with sessionId)
  onClaudeOutput: (callback: (data: { sessionId: string; data: string }) => void) => void;
  onClaudeError: (callback: (error: string) => void) => void;
  onClaudeClose: (callback: (data: { sessionId: string; exitCode: number }) => void) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
