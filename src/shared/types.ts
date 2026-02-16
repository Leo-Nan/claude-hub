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

// Agent 类型
export type AgentType = 'researcher' | 'engineer' | 'reviewer' | 'planner' | 'coordinator';

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  skills: string[];
  status: 'active' | 'idle' | 'thinking';
  rules?: string;
  systemPrompt?: string;
}

// Agent 关系类型
export type AgentRelationType = 'command' | 'dependency' | 'collaboration' | 'group';

export interface AgentRelation {
  id: string;
  sourceId: string;
  targetId: string;
  type: AgentRelationType;
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
