import { create } from 'zustand';
import { Project, Agent } from '@shared/types';

interface AppState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  theme: 'light' | 'dark';
  isSessionActive: boolean;
  sessionStartTime: number | null;
  activeSessionId: string | null;
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  removeProject: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  setSessionActive: (active: boolean, startTime?: number | null) => void;
  setActiveSessionId: (sessionId: string | null) => void;
  initTheme: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  theme: 'light',
  isSessionActive: false,
  sessionStartTime: null,
  activeSessionId: null,
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
  setTheme: (theme) => {
    set({ theme });
    // Persist to electron-store
    window.electronAPI?.setTheme(theme);
  },
  toggleTheme: () => {
    const newTheme = get().theme === 'light' ? 'dark' : 'light';
    set({ theme: newTheme });
    // Persist to electron-store
    window.electronAPI?.setTheme(newTheme);
  },
  setSessionActive: (active, startTime = null) =>
    set({
      isSessionActive: active,
      sessionStartTime: active ? (startTime ?? Date.now()) : null,
    }),
  setActiveSessionId: (sessionId) => set({ activeSessionId: sessionId }),
  initTheme: async () => {
    try {
      const savedTheme = await window.electronAPI?.getTheme();
      if (savedTheme === 'light' || savedTheme === 'dark') {
        set({ theme: savedTheme });
      }
    } catch (e) {
      console.error('Failed to load theme:', e);
    }
  },
}));
