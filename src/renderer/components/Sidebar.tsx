import React, { useState, useEffect, useRef } from 'react';
import { Project } from '@shared/types';
import Modal from './Modal';
import { Button, Input, EmptyState, Badge } from './ui';

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
          width: 240,
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
            padding: '16px 16px 12px',
            borderBottom: '1px solid var(--border-light)',
          }}
        >
          <div style={{
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: 'var(--text-muted)',
            marginBottom: '12px',
          }}>
            项目
          </div>
          <Input
            placeholder="搜索项目..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon="🔍"
          />
        </div>

        {/* 项目列表 */}
        <div ref={listRef} style={{ flex: 1, overflow: 'auto', padding: '8px 0' }}>
          {filteredProjects.length === 0 ? (
            <EmptyState
              icon={searchQuery ? '🔍' : '📁'}
              title={searchQuery ? '无匹配项目' : '暂无项目'}
              description={searchQuery ? '尝试其他关键词' : '点击下方添加项目'}
            />
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
                  marginBottom: '2px',
                }}
              >
                <div style={{
                  fontSize: '13px',
                  fontWeight: project.id === currentProjectId ? 500 : 400,
                  color: 'var(--text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {project.name}
                  </span>
                  {project.agents && project.agents.length > 0 && (
                    <Badge color="var(--accent-color)" variant="outline">
                      {project.agents.length}
                    </Badge>
                  )}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  marginTop: '4px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {project.path}
                </div>
                {/* 删除按钮 - 悬停时显示 */}
                <div
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleContextMenu(e, project.id);
                  }}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    opacity: 0,
                    transition: 'opacity 0.15s',
                    background: 'var(--danger-color)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    padding: '4px 8px',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  删除
                </div>
              </div>
            ))
          )}
        </div>

        {/* 新建项目按钮 */}
        <div
          onClick={isAddingProject ? undefined : onAddProject}
          style={{
            padding: '14px 16px',
            borderTop: '1px solid var(--border-color)',
            cursor: isAddingProject ? 'wait' : 'pointer',
            color: isAddingProject ? 'var(--text-secondary)' : 'var(--accent-color)',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            opacity: isAddingProject ? 0.7 : 1,
            transition: 'all 0.15s',
            backgroundColor: 'var(--bg-tertiary)',
          }}
        >
          {isAddingProject ? (
            <>
              <span style={{ animation: 'spin 1s linear infinite' }}>⟳</span>
              正在添加...
            </>
          ) : (
            <>
              <span style={{ fontSize: '16px' }}>+</span>
              新建项目
            </>
          )}
        </div>
      </div>

      <style>{`
        [data-project-item]:hover .delete-btn {
          opacity: 1 !important;
        }
      `}</style>
    </>
  );
};

export default Sidebar;
