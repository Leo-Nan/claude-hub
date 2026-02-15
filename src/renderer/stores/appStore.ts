import { create } from 'zustand';
import { Project, Agent } from '@shared/types';

interface AppState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  theme: 'light' | 'dark';
  isSessionActive: boolean;
  sessionStartTime: number | null;
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  removeProject: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  setSessionActive: (active: boolean, startTime?: number | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  theme: 'light',
  isSessionActive: false,
  sessionStartTime: null,
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
  setTheme: (theme) => set({ theme }),
  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === 'light' ? 'dark' : 'light',
    })),
  setSessionActive: (active, startTime = null) =>
    set({
      isSessionActive: active,
      sessionStartTime: active ? (startTime ?? Date.now()) : null,
    }),
}));
