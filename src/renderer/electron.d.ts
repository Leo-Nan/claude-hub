interface ElectronAPI {
  getProjects: () => Promise<any[]>;
  addProject: () => Promise<any>;
  removeProject: (id: string) => Promise<any[]>;
  setCurrentProject: (id: string) => Promise<any>;
  getCurrentProject: () => Promise<any>;
  updateAgentStatus: (projectId: string, agentId: string, status: string) => Promise<any>;

  // Claude session management
  startClaudeSession: (projectPath: string) => Promise<{ success: boolean; error?: string }>;
  sendClaudeInput: (input: string) => Promise<{ success: boolean; error?: string }>;
  killClaudeSession: () => Promise<{ success: boolean; error?: string }>;
  onClaudeOutput: (callback: (data: string) => void) => void;
  onClaudeError: (callback: (error: string) => void) => void;
  onClaudeClose: (callback: (code: number) => void) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
