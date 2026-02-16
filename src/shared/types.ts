// 标签颜色
export type TagColor = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple';

export interface Project {
  id: string;
  name: string;
  path: string;
  agents: Agent[];
  createdAt: string;
  lastOpened: string;
  isFavorite?: boolean;
  tags?: TagColor[];
}

export interface Agent {
  id: string;
  name: string;
  type: 'researcher' | 'engineer' | 'reviewer';
  skills: string[];
  status: 'active' | 'idle' | 'thinking';
  rules?: string;
  systemPrompt?: string;
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
