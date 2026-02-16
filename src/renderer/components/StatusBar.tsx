import React, { useState, useEffect } from 'react';
import { Project } from '@shared/types';
import { useAppStore } from '../stores/appStore';

interface StatusBarProps {
  currentProject: Project | null;
}

const StatusBar: React.FC<StatusBarProps> = ({ currentProject }) => {
  const [localTime, setLocalTime] = useState(0);
  const [currentTime, setCurrentTime] = useState('');
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

  // 更新时间显示
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

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
        height: '28px',
        borderTop: '1px solid var(--border-color)',
        padding: '0 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '12px',
        backgroundColor: 'var(--bg-secondary)',
        color: 'var(--text-secondary)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* 项目信息 */}
        <div
          onClick={handleCopyPath}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: currentProject?.path ? 'pointer' : 'default',
            padding: '2px 6px',
            borderRadius: 'var(--radius-sm)',
            transition: 'background-color 0.15s',
          }}
          title={currentProject?.path ? '点击复制路径' : undefined}
          onMouseEnter={(e) => {
            if (currentProject?.path) e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <span style={{ color: 'var(--accent-color)', fontWeight: 500 }}>
            {currentProject?.name || '未选择项目'}
          </span>
          {copied && (
            <span style={{ color: 'var(--success-color)', fontSize: '11px' }}>
              ✓ 已复制
            </span>
          )}
        </div>

        {/* 分隔线 */}
        <div style={{ width: '1px', height: '14px', backgroundColor: 'var(--border-color)' }} />

        {/* 活跃 Agent */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: activeAgents > 0 ? 'var(--success-color)' : 'var(--text-muted)'
          }} />
          <span>{activeAgents} 活跃</span>
        </div>

        {/* 分隔线 */}
        <div style={{ width: '1px', height: '14px', backgroundColor: 'var(--border-color)' }} />

        {/* 会话状态 */}
        {currentProject && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: isSessionActive ? 'var(--success-color)' : 'var(--text-muted)',
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'currentColor',
              animation: isSessionActive ? 'pulse 2s ease-in-out infinite' : 'none',
            }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
              {isSessionActive ? formatTime(localTime) : '会话未启动'}
            </span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* 主题切换 */}
        <button
          onClick={toggleTheme}
          style={{
            padding: '2px 8px',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'transparent',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
          title={theme === 'light' ? '切换到深色模式' : '切换到浅色模式'}
        >
          {theme === 'light' ? '🌙' : '☀️'}
          <span style={{ fontSize: '11px' }}>{theme === 'light' ? '深色' : '浅色'}</span>
        </button>

        {/* 分隔线 */}
        <div style={{ width: '1px', height: '14px', backgroundColor: 'var(--border-color)' }} />

        {/* 当前时间 */}
        <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
          {currentTime}
        </span>

        {/* 分隔线 */}
        <div style={{ width: '1px', height: '14px', backgroundColor: 'var(--border-color)' }} />

        {/* 版本信息 */}
        <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
          Claude Hub v1.0.0
        </span>
      </div>
    </div>
  );
};

export default StatusBar;
