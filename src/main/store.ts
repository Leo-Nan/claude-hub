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
