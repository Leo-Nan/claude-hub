import React, { useState } from 'react';
import { Project } from '@shared/types';
import Modal from './Modal';

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
  const [modalOpen, setModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const handleContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setProjectToDelete(id);
    setModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (projectToDelete) {
      onRemoveProject(projectToDelete);
    }
    setModalOpen(false);
    setProjectToDelete(null);
  };

  const handleCancelDelete = () => {
    setModalOpen(false);
    setProjectToDelete(null);
  };

  return (
    <>
      <Modal
        isOpen={modalOpen}
        title="删除项目"
        message="确定要删除此项目吗？此操作无法撤销。"
        confirmText="删除"
        cancelText="取消"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        danger
      />
      <div
        style={{
          width: 200,
          height: '100%',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
        }}
      >
        <div
          style={{
            padding: '12px',
            borderBottom: '1px solid var(--border-color)',
            fontWeight: 'bold',
          }}
        >
          项目列表
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {projects.length === 0 ? (
            <div style={{ padding: '20px 12px', color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'center' }}>
              暂无项目<br />点击下方添加项目
            </div>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                onClick={() => onSelectProject(project.id)}
                onContextMenu={(e) => handleContextMenu(e, project.id)}
                style={{
                  padding: '10px 12px',
                  cursor: 'pointer',
                  backgroundColor:
                    project.id === currentProjectId ? 'var(--hover-bg)' : 'transparent',
                  borderLeft:
                    project.id === currentProjectId ? '3px solid var(--accent-color)' : '3px solid transparent',
                }}
              >
                {project.name}
              </div>
            ))
          )}
        </div>
      <div
        onClick={onAddProject}
        style={{
          padding: '12px',
          borderTop: '1px solid var(--border-color)',
          cursor: 'pointer',
          color: 'var(--accent-color)',
          fontWeight: 500,
        }}
      >
        + 新建项目
      </div>
      </div>
    </>
  );
};

export default Sidebar;
