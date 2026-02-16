interface SessionInfo {
  id: string;
  projectPath: string;
}

interface ElectronAPI {
  getProjects: () => Promise<any[]>;
  addProject: () => Promise<any>;
  removeProject: (id: string) => Promise<any[]>;
  setCurrentProject: (id: string) => Promise<any>;
  getCurrentProject: () => Promise<any>;
  updateAgentStatus: (projectId: string, agentId: string, status: string) => Promise<any>;

  // Theme management
  getTheme: () => Promise<string>;
  setTheme: (theme: 'light' | 'dark') => Promise<void>;
  getVersion: () => Promise<string>;

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
