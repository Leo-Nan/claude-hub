import React, { useState, useRef, useEffect } from 'react';
import { Agent } from '@shared/types';

interface AgentTreeProps {
  agents: Agent[];
  onStatusChange: (agentId: string, status: Agent['status']) => void;
}

const STATUS_COLORS = {
  active: 'var(--success-color)',
  idle: 'var(--text-secondary)',
  thinking: 'var(--warning-color)',
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span>Agent 团队</span>
        <span style={{ fontWeight: 400, fontSize: '10px', opacity: 0.6 }}>
          {agents.length} 个 Agent
        </span>
      </div>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {/* Root Agent */}
        <div
          style={{
            padding: '10px 14px',
            backgroundColor: 'var(--bg-primary)',
            borderRadius: '8px',
            border: '1px solid var(--accent-color)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-color)',
              boxShadow: '0 0 8px var(--accent-color)',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />
          <span style={{ fontWeight: 600, fontSize: '13px' }}>私人秘书</span>
          <span style={{
            fontSize: '10px',
            padding: '2px 6px',
            backgroundColor: 'var(--accent-color)',
            color: 'white',
            borderRadius: '10px',
          }}>主</span>
        </div>

        {/* Child Agents */}
        {agents.map((agent) => (
          <div
            key={agent.id}
            onClick={() => handleAgentClick(agent.id)}
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--bg-primary)',
              borderRadius: '8px',
              border: `1px solid ${selectedAgent === agent.id ? 'var(--accent-color)' : 'var(--border-color)'}`,
              boxShadow: selectedAgent === agent.id ? '0 4px 12px rgba(0,0,0,0.15)' : 'var(--shadow-sm)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minWidth: '140px',
            }}
            onMouseEnter={(e) => {
              if (selectedAgent !== agent.id) {
                e.currentTarget.style.borderColor = 'var(--text-muted)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedAgent !== agent.id) {
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }
            }}
          >
            {/* Agent Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: STATUS_COLORS[agent.status],
                  boxShadow: agent.status === 'active' ? `0 0 6px ${STATUS_COLORS[agent.status]}` : 'none',
                  animation: agent.status === 'thinking' ? 'pulse 1s ease-in-out infinite' : 'none',
                }}
              />
              <span style={{ fontWeight: 500, fontSize: '13px', flex: 1 }}>
                {agent.name}
              </span>
              <span style={{
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: agent.status === 'active' ? 'var(--success-color)' : agent.status === 'thinking' ? 'var(--warning-color)' : 'var(--bg-tertiary)',
                color: agent.status === 'active' ? 'white' : agent.status === 'thinking' ? 'black' : 'var(--text-secondary)',
              }}>
                {STATUS_LABELS[agent.status]}
              </span>
            </div>

            {/* Skills */}
            <div style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              能力: {agent.skills.join(', ')}
            </div>

            {/* Quick Actions */}
            {selectedAgent === agent.id && (
              <div style={{
                marginTop: '8px',
                paddingTop: '8px',
                borderTop: '1px solid var(--border-light)',
                display: 'flex',
                gap: '8px',
              }}>
                {agent.status !== 'active' ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatusChange(agent.id, 'active');
                    }}
                    style={{
                      padding: '4px 8px',
                      fontSize: '11px',
                      backgroundColor: 'var(--success-color)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    启动
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatusChange(agent.id, 'idle');
                    }}
                    style={{
                      padding: '4px 8px',
                      fontSize: '11px',
                      backgroundColor: 'var(--bg-tertiary)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    停止
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange(agent.id, agent.status === 'thinking' ? 'idle' : 'thinking');
                  }}
                  style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                    backgroundColor: agent.status === 'thinking' ? 'var(--warning-color)' : 'var(--bg-tertiary)',
                    color: agent.status === 'thinking' ? 'black' : 'var(--text-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  {agent.status === 'thinking' ? '取消思考' : '思考'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentTree;
