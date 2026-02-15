import React, { useState, useEffect } from 'react';
import { Project } from '@shared/types';

interface StatusBarProps {
  currentProject: Project | null;
}

const StatusBar: React.FC<StatusBarProps> = ({ currentProject }) => {
  const [sessionTime, setSessionTime] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSessionActive) {
      interval = setInterval(() => {
        setSessionTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionActive]);

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

  return (
    <div
      style={{
        height: '24px',
        borderTop: '1px solid #e0e0e0',
        padding: '0 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '12px',
        color: '#666',
        backgroundColor: '#f5f5f5',
      }}
    >
      <div style={{ display: 'flex', gap: '16px' }}>
        <span>
          项目: {currentProject?.name || '未选择'}
        </span>
        <span>
          活跃Agent: {activeAgents}
        </span>
        {currentProject && (
          <span
            style={{ cursor: 'pointer' }}
            onClick={() => setIsSessionActive(!isSessionActive)}
            title="点击开始/暂停计时"
          >
            会话: {formatTime(sessionTime)}
          </span>
        )}
      </div>
      <div>Claude Hub v1.0.0</div>
    </div>
  );
};

export default StatusBar;
