import React, { useState, useEffect } from 'react';
import { Agent } from '@shared/types';

interface AgentCanvasProps {
  agents: Agent[];
  onStatusChange: (agentId: string, status: Agent['status']) => void;
  onSelectAgent: (agentId: string) => void;
  onUpdateAgent: (agentId: string, updates: Partial<Agent>) => void;
  width?: number;
  onWidthChange?: (width: number) => void;
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

const TYPE_LABELS = {
  researcher: '研究员',
  engineer: '工程师',
  reviewer: '审查员',
};

const AgentCanvas: React.FC<AgentCanvasProps> = ({
  agents,
  onStatusChange,
  onSelectAgent,
  onUpdateAgent,
  width: initialWidth,
  onWidthChange,
}) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [editingRules, setEditingRules] = useState('');
  const [editingSystemPrompt, setEditingSystemPrompt] = useState('');
  const [panelWidth, setPanelWidth] = useState(initialWidth || 360);
  const [isDragging, setIsDragging] = useState(false);

  // Sync panel width when initialWidth changes
  useEffect(() => {
    if (initialWidth) {
      setPanelWidth(initialWidth);
    }
  }, [initialWidth]);

  // Handle drag events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newWidth = Math.max(280, Math.min(600, e.clientX));
        setPanelWidth(newWidth);
        if (onWidthChange) {
          onWidthChange(newWidth);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, onWidthChange]);

  const selectedAgent = agents.find((a) => a.id === selectedAgentId);

  // Sync local state when selectedAgent changes
  useEffect(() => {
    if (selectedAgent) {
      setEditingRules(selectedAgent.rules || '');
      setEditingSystemPrompt(selectedAgent.systemPrompt || '');
    }
  }, [selectedAgentId, selectedAgent]);

  const handleAgentClick = (agentId: string) => {
    setSelectedAgentId(agentId);
    onSelectAgent(agentId);
  };

  const handleSave = () => {
    if (selectedAgentId) {
      onUpdateAgent(selectedAgentId, {
        rules: editingRules,
        systemPrompt: editingSystemPrompt,
      });
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        height: '100%',
        backgroundColor: 'var(--bg-primary)',
      }}
    >
      {/* Drag Handle */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          width: isDragging ? '6px' : '4px',
          cursor: 'ew-resize',
          backgroundColor: isDragging ? 'var(--accent-color)' : 'var(--border-color)',
          transition: 'background-color 0.2s, width 0.2s',
        }}
        title="拖拽调整宽度"
      />

      {/* Main Content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          width: panelWidth,
          borderLeft: '1px solid var(--border-color)',
        }}
      >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-secondary)',
          cursor: 'pointer',
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: 'var(--text-muted)',
            }}
          >
            Agent 画布
          </span>
          <span
            style={{
              fontSize: '10px',
              padding: '2px 6px',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
              borderRadius: '4px',
            }}
          >
            {agents.length}
          </span>
        </div>
        <span
          style={{
            fontSize: '12px',
            color: 'var(--text-secondary)',
            transition: 'transform 0.2s ease',
            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
          }}
        >
          {isExpanded ? '▼' : '▶'}
        </span>
      </div>

      {/* Content */}
      {isExpanded && (
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '16px',
          }}
        >
          {/* Agent List */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            {agents.map((agent) => (
              <div
                key={agent.id}
                onClick={() => handleAgentClick(agent.id)}
                style={{
                  padding: '12px',
                  backgroundColor:
                    selectedAgentId === agent.id
                      ? 'var(--bg-secondary)'
                      : 'var(--bg-primary)',
                  border: `1px solid ${
                    selectedAgentId === agent.id
                      ? 'var(--accent-color)'
                      : 'var(--border-color)'
                  }`,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (selectedAgentId !== agent.id) {
                    e.currentTarget.style.borderColor = 'var(--text-muted)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedAgentId !== agent.id) {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                  }
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px',
                  }}
                >
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: STATUS_COLORS[agent.status],
                      boxShadow:
                        agent.status === 'active'
                          ? `0 0 6px ${STATUS_COLORS[agent.status]}`
                          : 'none',
                      animation:
                        agent.status === 'thinking'
                          ? 'pulse 1s ease-in-out infinite'
                          : 'none',
                    }}
                  />
                  <span style={{ fontWeight: 500, fontSize: '13px', flex: 1 }}>
                    {agent.name}
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor:
                        agent.status === 'active'
                          ? 'var(--success-color)'
                          : agent.status === 'thinking'
                          ? 'var(--warning-color)'
                          : 'var(--bg-tertiary)',
                      color:
                        agent.status === 'active'
                          ? 'white'
                          : agent.status === 'thinking'
                          ? 'black'
                          : 'var(--text-secondary)',
                    }}
                  >
                    {STATUS_LABELS[agent.status]}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                  }}
                >
                  <span
                    style={{
                      padding: '2px 6px',
                      backgroundColor: 'var(--bg-tertiary)',
                      borderRadius: '4px',
                    }}
                  >
                    {TYPE_LABELS[agent.type]}
                  </span>
                  <span>能力: {agent.skills.join(', ')}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Agent Details */}
          {selectedAgent && (
            <div
              style={{
                padding: '16px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '12px',
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
                    backgroundColor: STATUS_COLORS[selectedAgent.status],
                  }}
                />
                {selectedAgent.name} - 详情
              </div>

              <div
                style={{
                  display: 'grid',
                  gap: '12px',
                  fontSize: '12px',
                }}
              >
                <div>
                  <div
                    style={{
                      color: 'var(--text-muted)',
                      marginBottom: '4px',
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    类型
                  </div>
                  <div style={{ color: 'var(--text-primary)' }}>
                    {TYPE_LABELS[selectedAgent.type]}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      color: 'var(--text-muted)',
                      marginBottom: '4px',
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    能力
                  </div>
                  <div style={{ color: 'var(--text-primary)' }}>
                    {selectedAgent.skills.join(', ')}
                  </div>
                </div>

                {selectedAgent.rules && (
                  <div>
                    <div
                      style={{
                        color: 'var(--text-muted)',
                        marginBottom: '4px',
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      规则 (rules)
                    </div>
                    <textarea
                      value={editingRules}
                      onChange={(e) => setEditingRules(e.target.value)}
                      placeholder="输入 Agent 规则..."
                      style={{
                        width: '100%',
                        minHeight: '60px',
                        padding: '8px',
                        fontSize: '11px',
                        lineHeight: 1.5,
                        color: 'var(--text-primary)',
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '4px',
                        resize: 'vertical',
                        fontFamily: 'inherit',
                      }}
                    />
                  </div>
                )}

                {/* System Prompt Editable */}
                <div>
                  <div
                    style={{
                      color: 'var(--text-muted)',
                      marginBottom: '4px',
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    系统提示词 (systemPrompt)
                  </div>
                  <textarea
                    value={editingSystemPrompt}
                    onChange={(e) => setEditingSystemPrompt(e.target.value)}
                    placeholder="输入系统提示词..."
                    style={{
                      width: '100%',
                      minHeight: '80px',
                      padding: '8px',
                      fontSize: '11px',
                      lineHeight: 1.5,
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                  <button
                    onClick={handleSave}
                    style={{
                      padding: '6px 12px',
                      fontSize: '11px',
                      backgroundColor: 'var(--accent-color)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    保存配置
                  </button>
                  {selectedAgent.status !== 'active' ? (
                    <button
                      onClick={() =>
                        onStatusChange(selectedAgent.id, 'active')
                      }
                      style={{
                        padding: '6px 12px',
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
                      onClick={() => onStatusChange(selectedAgent.id, 'idle')}
                      style={{
                        padding: '6px 12px',
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
                    onClick={() =>
                      onStatusChange(
                        selectedAgent.id,
                        selectedAgent.status === 'thinking' ? 'idle' : 'thinking'
                      )
                    }
                    style={{
                      padding: '6px 12px',
                      fontSize: '11px',
                      backgroundColor:
                        selectedAgent.status === 'thinking'
                          ? 'var(--warning-color)'
                          : 'var(--bg-tertiary)',
                      color:
                        selectedAgent.status === 'thinking'
                          ? 'black'
                          : 'var(--text-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    {selectedAgent.status === 'thinking' ? '取消思考' : '思考模式'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {(!agents || agents.length === 0) && (
            <div
              style={{
                padding: '24px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '13px',
              }}
            >
              <div style={{ marginBottom: '8px' }}>暂无 Agent</div>
              <div style={{ fontSize: '11px', opacity: 0.7 }}>
                可通过对话创建 Agent
              </div>
            </div>
          )}
        </div>
      )}
    </div>
    </div>
  );
};

export default AgentCanvas;
