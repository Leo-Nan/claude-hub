import React, { useState, useEffect, useRef } from 'react';
import { Project } from '@shared/types';
import Modal from './Modal';
import FileTree from './FileTree';
import { Button, Input, EmptyState, Badge } from './ui';

// 文件节点类型
interface FileNode {
  name: string;
  path: string;
  isDirectory: boolean;
}

interface SidebarProps {
  projects: Project[];
  currentProjectId: string | null;
  onSelectProject: (id: string) => void;
  onAddProject: () => void;
  onRemoveProject: (id: string) => void;
  isAddingProject?: boolean;
}

// 项目菜单选项
const MenuItem: React.FC<{
  icon: string;
  label: string;
  onClick: () => void;
  danger?: boolean;
}> = ({ icon, label, onClick, danger }) => (
  <div
    onClick={onClick}
    style={{
      padding: '8px 12px',
      cursor: 'pointer',
      fontSize: '13px',
      color: danger ? 'var(--danger-color)' : 'var(--text-primary)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'background-color 0.1s',
    }}
    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
  >
    <span>{icon}</span>
    <span>{label}</span>
  </div>
);

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
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; project: Project } | null>(null);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const listRef = useRef<HTMLDivElement>(null);

  // 当前选中的项目
  const currentProject = projects.find(p => p.id === currentProjectId);

  // Filter projects by search query
  const filteredProjects = searchQuery
    ? projects.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.path.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : projects;

  // Sync selected index with current project
  useEffect(() => {
    if (currentProjectId && filteredProjects.length > 0) {
      const index = filteredProjects.findIndex(p => p.id === currentProjectId);
      if (index !== -1) {
        setSelectedIndex(index);
      }
    }
  }, [currentProjectId, filteredProjects]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (modalOpen || contextMenu) return;

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
  }, [selectedIndex, projects, modalOpen, contextMenu, onSelectProject, onAddProject]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current && selectedIndex >= 0) {
      const items = listRef.current.querySelectorAll('[data-project-item]');
      if (items[selectedIndex]) {
        items[selectedIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [contextMenu]);

  // 右键菜单处理
  const handleContextMenu = (e: React.MouseEvent, project: Project) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, project });
  };

  // 菜单操作
  const handleOpenInExplorer = () => {
    if (contextMenu?.project) {
      window.electronAPI.openInExplorer(contextMenu.project.path);
    }
    setContextMenu(null);
  };

  const handleOpenInVSCode = () => {
    if (contextMenu?.project) {
      window.electronAPI.openInVSCode(contextMenu.project.path);
    }
    setContextMenu(null);
  };

  const handleCopyPath = () => {
    if (contextMenu?.project) {
      window.electronAPI.copyPath(contextMenu.project.path);
    }
    setContextMenu(null);
  };

  const handleDelete = () => {
    if (contextMenu?.project) {
      setProjectToDelete(contextMenu.project.id);
      setModalOpen(true);
    }
    setContextMenu(null);
  };

  // 切换项目文件树展开
  const toggleProjectFiles = (projectId: string) => {
    setExpandedProjects(prev => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      return next;
    });
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

      {/* 右键菜单 */}
      {contextMenu && (
        <div
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 1000,
            minWidth: '160px',
            padding: '4px 0',
          }}
        >
          <MenuItem icon="📂" label="在文件夹中显示" onClick={handleOpenInExplorer} />
          <MenuItem icon="💻" label="在 VSCode 中打开" onClick={handleOpenInVSCode} />
          <MenuItem icon="📋" label="复制路径" onClick={handleCopyPath} />
          <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '4px 0' }} />
          <MenuItem icon="🗑️" label="删除项目" onClick={handleDelete} danger />
        </div>
      )}

      <div
        style={{
          width: 280,
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span>项目</span>
            <span style={{ fontWeight: 400, opacity: 0.7 }}>{projects.length}</span>
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
              <div key={project.id}>
                <div
                  data-project-item
                  onClick={() => onSelectProject(project.id)}
                  onContextMenu={(e) => handleContextMenu(e, project)}
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
                </div>

                {/* 当前项目的文件树 */}
                {project.id === currentProjectId && expandedProjects.has(project.id) && (
                  <div style={{
                    padding: '4px 0',
                    backgroundColor: 'var(--bg-tertiary)',
                    borderTop: '1px solid var(--border-light)',
                    maxHeight: '250px',
                    overflow: 'auto',
                  }}>
                    <FileTree
                      projectPath={project.path}
                      onContextMenu={(node) => {
                        if (node.isDirectory) {
                          window.electronAPI.openInExplorer(node.path);
                        } else {
                          window.electronAPI.openInVSCode(node.path);
                        }
                      }}
                    />
                  </div>
                )}
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
    </>
  );
};

export default Sidebar;
