import React, { useState, useRef, useEffect } from 'react';
import { Agent } from '@shared/types';

interface AgentTreeProps {
  agents: Agent[];
  onStatusChange: (agentId: string, status: Agent['status']) => void;
}

const STATUS_COLORS = {
  active: 'var(--success-color)',
  idle: 'var(--text-secondary)',
  thinking: '#ffc107',
};

const STATUS_LABELS = {
  active: '活跃',
  idle: '空闲',
  thinking: '思考中',
};

interface AgentMenuProps {
  agent: Agent;
  onClose: () => void;
  onStatusChange: (agentId: string, status: Agent['status']) => void;
}

const AgentMenu: React.FC<AgentMenuProps> = ({ agent, onClose, onStatusChange }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleAction = (action: string) => {
    switch (action) {
      case 'start':
        onStatusChange(agent.id, 'active');
        break;
      case 'stop':
        onStatusChange(agent.id, 'idle');
        break;
      case 'think':
        onStatusChange(agent.id, 'thinking');
        break;
    }
    onClose();
  };

  return (
    <div
      ref={menuRef}
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        zIndex: 100,
        backgroundColor: 'var(--bg-primary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-md)',
        minWidth: '140px',
        padding: '4px 0',
      }}
    >
      <div
        style={{
          padding: '8px 12px',
          fontSize: '12px',
          color: 'var(--text-secondary)',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        {agent.name}
      </div>
      {agent.status !== 'active' && (
        <div
          onClick={() => handleAction('start')}
          style={{
            padding: '8px 12px',
            cursor: 'pointer',
            fontSize: '13px',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          启动
        </div>
      )}
      {agent.status === 'active' && (
        <div
          onClick={() => handleAction('stop')}
          style={{
            padding: '8px 12px',
            cursor: 'pointer',
            fontSize: '13px',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          停止
        </div>
      )}
      <div
        onClick={() => handleAction('think')}
        style={{
          padding: '8px 12px',
          cursor: 'pointer',
          fontSize: '13px',
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        思考模式
      </div>
      <div
        style={{
          padding: '8px 12px',
          cursor: 'pointer',
          fontSize: '13px',
          borderTop: '1px solid var(--border-color)',
          color: 'var(--text-secondary)',
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        配置
      </div>
    </div>
  );
};

const AgentTree: React.FC<AgentTreeProps> = ({ agents, onStatusChange }) => {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const handleAgentClick = (agentId: string) => {
    setSelectedAgent(selectedAgent === agentId ? null : agentId);
  };

  // 空状态
  if (!agents || agents.length === 0) {
    return (
      <div
        style={{
          padding: '16px',
          borderTop: '1px solid var(--border-light)',
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-secondary)',
          textAlign: 'center',
          fontSize: '13px',
        }}
      >
        <div style={{
          marginBottom: '8px',
          fontSize: '11px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          color: 'var(--text-muted)',
        }}>Agent 团队</div>
        <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
          <span>暂无 Agent</span>
          <span style={{ marginLeft: '8px', opacity: 0.7 }}>可通过对话创建</span>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--border-light)',
        backgroundColor: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
      }}
    >
      <div style={{
        marginBottom: '12px',
        fontSize: '11px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        color: 'var(--text-muted)',
      }}>Agent 团队</div>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {/* Root Agent */}
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'var(--bg-primary)',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-color)',
                boxShadow: '0 0 8px var(--accent-color)',
              }}
            />
            <span style={{ fontWeight: 600, fontSize: '13px' }}>私人秘书</span>
          </div>
        </div>

        {/* Child Agents */}
        {agents.map((agent) => (
          <div
            key={agent.id}
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--bg-primary)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)',
              marginLeft: '24px',
              position: 'relative',
              transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
          >
            {/* Connector line */}
            <div
              style={{
                position: 'absolute',
                left: '-24px',
                top: '50%',
                width: '24px',
                height: '1px',
                backgroundColor: 'var(--border-color)',
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                onClick={() => handleAgentClick(agent.id)}
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: STATUS_COLORS[agent.status],
                  cursor: 'pointer',
                }}
                title="点击打开操作菜单"
              />
              <span
                onClick={() => handleAgentClick(agent.id)}
                style={{ fontWeight: 500, cursor: 'pointer' }}
              >
                {agent.name}
              </span>
              {selectedAgent === agent.id && (
                <AgentMenu
                  agent={agent}
                  onClose={() => setSelectedAgent(null)}
                  onStatusChange={onStatusChange}
                />
              )}
            </div>
            <div
              style={{
                marginTop: '8px',
                fontSize: '12px',
                color: 'var(--text-secondary)',
              }}
            >
              能力: {agent.skills.join(', ')}
            </div>
            <div
              style={{
                marginTop: '4px',
                fontSize: '11px',
                color: STATUS_COLORS[agent.status],
              }}
            >
              {STATUS_LABELS[agent.status]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentTree;
