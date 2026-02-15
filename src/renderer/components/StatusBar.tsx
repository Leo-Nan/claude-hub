import React, { useState, useEffect } from 'react';
import { Project } from '@shared/types';
import { useAppStore } from '../stores/appStore';

interface StatusBarProps {
  currentProject: Project | null;
}

const StatusBar: React.FC<StatusBarProps> = ({ currentProject }) => {
  const [localTime, setLocalTime] = useState(0);
  const [copied, setCopied] = useState(false);
  const { theme, toggleTheme, isSessionActive, sessionStartTime } = useAppStore();

  // 监听会话状态变化，开始计时
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSessionActive && sessionStartTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
        setLocalTime(elapsed);
      }, 1000);
    } else {
      setLocalTime(0);
    }
    return () => clearInterval(interval);
  }, [isSessionActive, sessionStartTime]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const activeAgents = currentProject?.agents.filter(
    (a) => a.status === 'active'
  ).length || 0;

  const handleCopyPath = async () => {
    if (currentProject?.path) {
      await navigator.clipboard.writeText(currentProject.path);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      style={{
        height: '24px',
        borderTop: '1px solid var(--border-color)',
        padding: '0 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '12px',
        color: 'var(--text-secondary)',
        backgroundColor: 'var(--bg-secondary)',
      }}
    >
      <div style={{ display: 'flex', gap: '16px' }}>
        <span
          onClick={handleCopyPath}
          style={{
            cursor: currentProject?.path ? 'pointer' : 'default',
          }}
          title={currentProject?.path ? '点击复制路径' : undefined}
        >
          项目: {currentProject?.name || '未选择'}
          {copied && <span style={{ marginLeft: '4px', color: 'var(--success-color)' }}>✓</span>}
        </span>
        <span>
          活跃Agent: {activeAgents}
        </span>
        {currentProject && (
          <span
            style={{
              cursor: 'default',
              color: isSessionActive ? 'var(--success-color)' : 'var(--text-secondary)',
            }}
            title={isSessionActive ? '会话进行中' : '会话未启动'}
          >
            会话: {formatTime(localTime)} {isSessionActive ? '●' : '○'}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={toggleTheme}
          style={{
            padding: '4px 8px',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        <span>Claude Hub v1.0.0</span>
      </div>
    </div>
  );
};

export default StatusBar;
