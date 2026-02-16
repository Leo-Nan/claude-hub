import React, { useState, useEffect, useRef } from 'react';
import { Project } from '@shared/types';
import Modal from './Modal';

interface SidebarProps {
  projects: Project[];
  currentProjectId: string | null;
  onSelectProject: (id: string) => void;
  onAddProject: () => void;
  onRemoveProject: (id: string) => void;
  isAddingProject?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  projects,
  currentProjectId,
  onSelectProject,
  onAddProject,
  onRemoveProject,
  isAddingProject = false,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [searchQuery, setSearchQuery] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  // Filter projects by search query
  const filteredProjects = searchQuery
    ? projects.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.path.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : projects;

  // Sync selected index with current project (using filtered list)
  useEffect(() => {
    if (currentProjectId && filteredProjects.length > 0) {
      const index = filteredProjects.findIndex(p => p.id === currentProjectId);
      if (index !== -1) {
        setSelectedIndex(index);
      }
    }
  }, [currentProjectId, filteredProjects]);

  // Handle keyboard navigation (using filtered projects)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (modalOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => {
          const newIndex = prev < filteredProjects.length - 1 ? prev + 1 : 0;
          return newIndex;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => {
          const newIndex = prev > 0 ? prev - 1 : filteredProjects.length - 1;
          return newIndex;
        });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredProjects.length) {
          onSelectProject(filteredProjects[selectedIndex].id);
        } else if (filteredProjects.length === 0) {
          onAddProject();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, projects, modalOpen, onSelectProject, onAddProject]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current && selectedIndex >= 0) {
      const items = listRef.current.querySelectorAll('[data-project-item]');
      if (items[selectedIndex]) {
        items[selectedIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

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
          width: 220,
          height: '100%',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
        }}
      >
        {/* 头部 */}
        <div
          style={{
            padding: '16px 12px 12px',
            borderBottom: '1px solid var(--border-light)',
          }}
        >
          <div style={{
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: 'var(--text-muted)',
            marginBottom: '8px',
          }}>
            项目
          </div>
        </div>
        {/* Search input */}
        <div style={{ padding: '0 12px 12px' }}>
          <input
            type="text"
            placeholder="搜索项目..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 10px',
              fontSize: '12px',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
        <div ref={listRef} style={{ flex: 1, overflow: 'auto' }}>
          {filteredProjects.length === 0 ? (
            <div style={{
              padding: '20px 12px',
              color: 'var(--text-secondary)',
              fontSize: '13px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              alignItems: 'center',
            }}>
              <span style={{ fontSize: '24px', lineHeight: 1 }}>
                {searchQuery ? '🔍' : '📁'}
              </span>
              <span>{searchQuery ? '无匹配项目' : '暂无项目'}</span>
              {!searchQuery && (
                <span style={{ fontSize: '12px', opacity: 0.8 }}>
                  点击下方「新建项目」添加
                </span>
              )}
            </div>
          ) : (
            filteredProjects.map((project, index) => (
              <div
                key={project.id}
                data-project-item
                onClick={() => onSelectProject(project.id)}
                onContextMenu={(e) => handleContextMenu(e, project.id)}
                style={{
                  padding: '10px 12px',
                  cursor: 'pointer',
                  backgroundColor:
                    project.id === currentProjectId
                      ? 'var(--hover-bg)'
                      : selectedIndex === index
                        ? 'var(--bg-primary)'
                        : 'transparent',
                  borderLeft:
                    project.id === currentProjectId
                      ? '3px solid var(--accent-color)'
                      : selectedIndex === index
                        ? '3px solid var(--success-color)'
                        : '3px solid transparent',
                  transition: 'background-color 0.1s',
                  position: 'relative',
                }}
              >
                <div style={{
                  fontSize: '13px',
                  fontWeight: project.id === currentProjectId ? 500 : 400,
                  color: 'var(--text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  paddingRight: '24px',
                }}>
                  {project.name}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  marginTop: '2px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {project.agents?.length || 0} 个 Agent
                </div>
                {/* 删除按钮 - 悬停时显示 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleContextMenu(e, project.id);
                  }}
                  title="删除项目"
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: 'var(--radius-sm)',
                    opacity: 0,
                    transition: 'opacity 0.15s, color 0.15s',
                    fontSize: '14px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.color = 'var(--danger-color)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '0';
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }}
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      <div
        onClick={isAddingProject ? undefined : onAddProject}
        style={{
          padding: '12px',
          borderTop: '1px solid var(--border-color)',
          cursor: isAddingProject ? 'wait' : 'pointer',
          color: isAddingProject ? 'var(--text-secondary)' : 'var(--accent-color)',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          opacity: isAddingProject ? 0.7 : 1,
        }}
      >
        {isAddingProject ? (
          <>
            <span style={{ animation: 'spin 1s linear infinite' }}>⟳</span>
            正在添加...
          </>
        ) : (
          <>
            <span style={{ fontSize: '14px' }}>+</span>
            新建项目
          </>
        )}
      </div>
      </div>
    </>
  );
};

export default Sidebar;
