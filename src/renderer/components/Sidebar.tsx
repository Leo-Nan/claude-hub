import React from 'react';
import { Project } from '@shared/types';

interface SidebarProps {
  projects: Project[];
  currentProjectId: string | null;
  onSelectProject: (id: string) => void;
  onAddProject: () => void;
  onRemoveProject: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  projects,
  currentProjectId,
  onSelectProject,
  onAddProject,
  onRemoveProject,
}) => {
  const handleContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (confirm('确定删除此项目吗？')) {
      onRemoveProject(id);
    }
  };

  return (
    <div
      style={{
        width: 200,
        height: '100%',
        borderRight: '1px solid #e0e0e0',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f5f5f5',
      }}
    >
      <div
        style={{
          padding: '12px',
          borderBottom: '1px solid #e0e0e0',
          fontWeight: 'bold',
        }}
      >
        项目列表
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        {projects.map((project) => (
          <div
            key={project.id}
            onClick={() => onSelectProject(project.id)}
            onContextMenu={(e) => handleContextMenu(e, project.id)}
            style={{
              padding: '10px 12px',
              cursor: 'pointer',
              backgroundColor:
                project.id === currentProjectId ? '#e3f2fd' : 'transparent',
              borderLeft:
                project.id === currentProjectId ? '3px solid #2196f3' : '3px solid transparent',
            }}
          >
            {project.name}
          </div>
        ))}
      </div>
      <div
        onClick={onAddProject}
        style={{
          padding: '12px',
          borderTop: '1px solid #e0e0e0',
          cursor: 'pointer',
          color: '#2196f3',
          fontWeight: 500,
        }}
      >
        + 新建项目
      </div>
    </div>
  );
};

export default Sidebar;
