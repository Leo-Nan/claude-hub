import React, { useEffect } from 'react';
import Sidebar from './components/Sidebar';
import { useAppStore } from './stores/appStore';

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
        <div style={{ flex: 1, padding: '20px' }}>
          <h2>{currentProject?.name || '请选择项目'}</h2>
          <p style={{ color: '#666', marginTop: '8px' }}>
            {currentProject?.path || '点击左侧项目或新建项目开始'}
          </p>
        </div>
        <div
          style={{
            height: '24px',
            borderTop: '1px solid #e0e0e0',
            padding: '0 12px',
            display: 'flex',
            alignItems: 'center',
            fontSize: '12px',
            color: '#666',
            backgroundColor: '#f5f5f5',
          }}
        >
          Claude Hub v1.0.0
        </div>
      </div>
    </div>
  );
}

export default App;
