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
