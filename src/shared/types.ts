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
  theme: 'light' | 'dark';
  sidebarWidth: number;
  projects: Project[];
  currentProjectId: string | null;
}

// IPC response types
export interface IPCError {
  error: string;
}

export interface IPCSuccess<T> {
  success: true;
  data?: T;
}

export type IPCResponse<T> = T | IPCError;
