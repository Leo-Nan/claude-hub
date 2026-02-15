import React from 'react';
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

const AgentTree: React.FC<AgentTreeProps> = ({ agents, onStatusChange }) => {
  const handleStatusClick = (agentId: string, currentStatus: Agent['status']) => {
    const statusOrder: Agent['status'][] = ['idle', 'active', 'thinking'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    onStatusChange(agentId, nextStatus);
  };

  return (
    <div
      style={{
        padding: '16px',
        borderTop: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
      }}
    >
      <div style={{ marginBottom: '12px', fontWeight: 500 }}>Agent 树状图</div>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {/* Root Agent */}
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'var(--bg-primary)',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-color)',
              }}
            />
            <span style={{ fontWeight: 500 }}>私人秘书</span>
          </div>
        </div>

        {/* Child Agents */}
        {agents.map((agent) => (
          <div
            key={agent.id}
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--bg-primary)',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              marginLeft: '24px',
              position: 'relative',
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
                onClick={() => handleStatusClick(agent.id, agent.status)}
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: STATUS_COLORS[agent.status],
                  cursor: 'pointer',
                }}
                title="点击切换状态"
              />
              <span style={{ fontWeight: 500 }}>{agent.name}</span>
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
