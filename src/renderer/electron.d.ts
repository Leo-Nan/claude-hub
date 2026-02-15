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
