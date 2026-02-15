import React, { useEffect, useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Terminal from './components/Terminal';
import AgentTree from './components/AgentTree';
import StatusBar from './components/StatusBar';
import ErrorBoundary from './components/ErrorBoundary';
import { useAppStore } from './stores/appStore';
import { Agent } from '@shared/types';

// 错误消息转换为友好提示
const getFriendlyError = (error: string | Error): string => {
  const message = error instanceof Error ? error.message : error;

  // 常见错误映射
  const errorMap: Record<string, string> = {
    'ENOENT': '文件或文件夹不存在',
    'EACCES': '没有访问权限，请检查文件夹权限',
    'EPERM': '操作被拒绝，需要管理员权限',
    'ENOTDIR': '路径不是有效的文件夹',
    'ECONNREFUSED': '无法连接到服务，请稍后重试',
    'ETIMEDOUT': '连接超时，请检查网络',
    'NETWORK_ERROR': '网络连接失败',
    'timeout': '操作超时，请重试',
    'not found': '未找到相关内容',
    'permission denied': '权限不足',
    'access denied': '访问被拒绝',
  };

  const lowerMessage = message.toLowerCase();
  for (const [key, friendly] of Object.entries(errorMap)) {
    if (lowerMessage.includes(key.toLowerCase())) {
      return friendly;
    }
  }

  // 默认保留原始错误，但去除技术细节
  if (message.includes('Error:')) {
    return message.replace('Error:', '').trim();
  }

  return message;
};

function App() {
  const {
    projects,
    currentProject,
    setProjects,
    setCurrentProject,
    addProject,
    removeProject,
    theme,
    initTheme,
  } = useAppStore();
  const [error, setError] = useState<string | null>(null);
  const [isAddingProject, setIsAddingProject] = useState(false);

  // 初始化主题
  useEffect(() => {
    initTheme();
  }, [initTheme]);

  // 自动关闭错误提示（10秒后）
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 10000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // 统一错误处理函数
  const handleError = useCallback((err: unknown, fallback: string) => {
    const message = err instanceof Error ? err.message : fallback;
    return getFriendlyError(message);
  }, []);

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
        setError(handleError(err, '加载数据失败'));
      }
    };

    loadInitialData();
  }, [setProjects, setCurrentProject, handleError]);

  const handleSelectProject = async (id: string) => {
    try {
      const project = await window.electronAPI.setCurrentProject(id);
      if (project && 'error' in project) {
        setError(getFriendlyError(project.error));
        return;
      }
      setCurrentProject(project);
    } catch (err) {
      console.error('选择项目失败:', err);
      setError(handleError(err, '选择项目失败'));
    }
  };

  const handleAddProject = async () => {
    setIsAddingProject(true);
    try {
      const result = await window.electronAPI.addProject();
      if (result) {
        if ('error' in result) {
          setError(getFriendlyError(result.error));
          return;
        }
        addProject(result);
      }
    } catch (err) {
      console.error('添加项目失败:', err);
      setError(handleError(err, '添加项目失败'));
    } finally {
      setIsAddingProject(false);
    }
  };

  const handleRemoveProject = async (id: string) => {
    try {
      const updatedProjects = await window.electronAPI.removeProject(id);
      if (updatedProjects && 'error' in updatedProjects) {
        setError(getFriendlyError(updatedProjects.error));
        return;
      }
      setProjects(updatedProjects);
    } catch (err) {
      console.error('删除项目失败:', err);
      setError(handleError(err, '删除项目失败'));
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
        setError(getFriendlyError(result.error));
        return;
      }
      setCurrentProject(result);
    } catch (err) {
      console.error('更新 Agent 状态失败:', err);
      setError(handleError(err, '更新 Agent 状态失败'));
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
              padding: '10px 16px',
              fontSize: '14px',
              zIndex: 1000,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>⚠️</span>
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                padding: '4px 8px',
                borderRadius: '4px',
                transition: 'background 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            >
              关闭
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
