import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Terminal from './components/Terminal';
import AgentTree from './components/AgentTree';
import StatusBar from './components/StatusBar';
import ErrorBoundary from './components/ErrorBoundary';
import { useAppStore } from './stores/appStore';
import { Agent } from '@shared/types';

function App() {
  const {
    projects,
    currentProject,
    setProjects,
    setCurrentProject,
    addProject,
    removeProject,
    theme,
  } = useAppStore();
  const [error, setError] = useState<string | null>(null);
  const [isAddingProject, setIsAddingProject] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setError(null);
        const data = await window.electronAPI.getProjects();
        setProjects(data);

        const current = await window.electronAPI.getCurrentProject();
        if (current) {
          setCurrentProject(current);
        }
      } catch (err) {
        console.error('加载数据失败:', err);
        setError(err instanceof Error ? err.message : '加载数据失败');
      }
    };

    loadInitialData();
  }, []);

  const handleSelectProject = async (id: string) => {
    try {
      const project = await window.electronAPI.setCurrentProject(id);
      if (project && 'error' in project) {
        setError(project.error);
        return;
      }
      setCurrentProject(project);
    } catch (err) {
      console.error('选择项目失败:', err);
      setError(err instanceof Error ? err.message : '选择项目失败');
    }
  };

  const handleAddProject = async () => {
    setIsAddingProject(true);
    try {
      const result = await window.electronAPI.addProject();
      if (result) {
        if ('error' in result) {
          setError(result.error);
          return;
        }
        addProject(result);
      }
    } catch (err) {
      console.error('添加项目失败:', err);
      setError(err instanceof Error ? err.message : '添加项目失败');
    } finally {
      setIsAddingProject(false);
    }
  };

  const handleRemoveProject = async (id: string) => {
    try {
      const updatedProjects = await window.electronAPI.removeProject(id);
      if (updatedProjects && 'error' in updatedProjects) {
        setError(updatedProjects.error);
        return;
      }
      setProjects(updatedProjects);
    } catch (err) {
      console.error('删除项目失败:', err);
      setError(err instanceof Error ? err.message : '删除项目失败');
    }
  };

  const handleAgentStatusChange = async (agentId: string, status: Agent['status']) => {
    if (!currentProject) return;
    try {
      const result = await window.electronAPI.updateAgentStatus(
        currentProject.id,
        agentId,
        status
      );
      if (result && 'error' in result) {
        setError(result.error);
        return;
      }
      setCurrentProject(result);
    } catch (err) {
      console.error('更新 Agent 状态失败:', err);
      setError(err instanceof Error ? err.message : '更新失败');
    }
  };

  return (
    <ErrorBoundary>
      <div
        style={{
          display: 'flex',
          height: '100vh',
          flexDirection: 'row',
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)',
        }}
        data-theme={theme}
      >
        {error && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              backgroundColor: 'var(--danger-color)',
              color: 'white',
              padding: '8px 16px',
              fontSize: '14px',
              zIndex: 1000,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>错误: {error}</span>
            <button
              onClick={() => setError(null)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '16px',
              }}
            >
              ×
            </button>
          </div>
        )}
        <Sidebar
          projects={projects}
          currentProjectId={currentProject?.id || null}
          onSelectProject={handleSelectProject}
          onAddProject={handleAddProject}
          onRemoveProject={handleRemoveProject}
          isAddingProject={isAddingProject}
        />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Terminal projectPath={currentProject?.path || null} />
          {currentProject && (
            <AgentTree
              agents={currentProject.agents}
              onStatusChange={handleAgentStatusChange}
            />
          )}
          <StatusBar currentProject={currentProject} />
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
