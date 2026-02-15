import React, { useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Terminal from './components/Terminal';
import AgentTree from './components/AgentTree';
import StatusBar from './components/StatusBar';
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
  } = useAppStore();

  useEffect(() => {
    // Load initial data
    window.electronAPI.getProjects().then((data) => {
      setProjects(data);
      window.electronAPI.getCurrentProject().then((current) => {
        if (current) {
          setCurrentProject(current);
        }
      });
    });
  }, []);

  const handleSelectProject = async (id: string) => {
    const project = await window.electronAPI.setCurrentProject(id);
    setCurrentProject(project);
  };

  const handleAddProject = async () => {
    const project = await window.electronAPI.addProject();
    if (project) {
      addProject(project);
    }
  };

  const handleRemoveProject = async (id: string) => {
    const updatedProjects = await window.electronAPI.removeProject(id);
    setProjects(updatedProjects);
  };

  const handleAgentStatusChange = async (agentId: string, status: Agent['status']) => {
    if (!currentProject) return;
    const updated = await window.electronAPI.updateAgentStatus(
      currentProject.id,
      agentId,
      status
    );
    setCurrentProject(updated);
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        flexDirection: 'row',
      }}
    >
      <Sidebar
        projects={projects}
        currentProjectId={currentProject?.id || null}
        onSelectProject={handleSelectProject}
        onAddProject={handleAddProject}
        onRemoveProject={handleRemoveProject}
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
  );
}

export default App;
