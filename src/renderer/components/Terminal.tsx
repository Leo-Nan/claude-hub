import React, { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { useAppStore } from '../stores/appStore';

// 会话终端信息
interface SessionTerminal {
  sessionId: string;
  projectPath: string;
  term: XTerm;
  fitAddon: FitAddon;
}

// 获取主题对应的终端颜色
const getTerminalTheme = (theme: 'light' | 'dark') => ({
  background: theme === 'dark' ? '#0d1117' : '#1e1e1e',
  foreground: theme === 'dark' ? '#c9d1d9' : '#d4d4d4',
  selectionBackground: 'rgba(255, 255, 255, 0.3)',
  cursor: theme === 'dark' ? '#58a6ff' : '#aeafad',
  black: theme === 'dark' ? '#484f58' : '#000000',
  red: theme === 'dark' ? '#ff7b72' : '#cd3131',
  green: theme === 'dark' ? '#3fb950' : '#0dbc79',
  yellow: theme === 'dark' ? '#d29922' : '#e5e510',
  blue: theme === 'dark' ? '#58a6ff' : '#2472c8',
  magenta: theme === 'dark' ? '#bc8cff' : '#bc4f00',
  cyan: theme === 'dark' ? '#39c5cf' : '#11a8cd',
  white: theme === 'dark' ? '#b1bac4' : '#e5e5e5',
  brightBlack: theme === 'dark' ? '#6e7681' : '#666666',
  brightRed: theme === 'dark' ? '#ffa198' : '#f14c4c',
  brightGreen: theme === 'dark' ? '#56d364' : '#23d18b',
  brightYellow: theme === 'dark' ? '#e3b341' : '#f5f543',
  brightBlue: theme === 'dark' ? '#79c0ff' : '#3b8eea',
  brightMagenta: theme === 'dark' ? '#d2a8ff' : '#d670d6',
  brightCyan: theme === 'dark' ? '#56d4dd' : '#29b8db',
  brightWhite: theme === 'dark' ? '#f0f6fc' : '#ffffff',
});

// 创建终端实例
const createTerminal = (
  container: HTMLElement,
  theme: 'light' | 'dark',
  projectPath: string
): { term: XTerm; fitAddon: FitAddon } => {
  const term = new XTerm({
    cursorBlink: true,
    fontSize: 14,
    fontFamily: 'Consolas, Monaco, monospace',
    theme: getTerminalTheme(theme),
  });

  const fitAddon = new FitAddon();
  term.loadAddon(fitAddon);
  term.open(container);
  fitAddon.fit();

  // 显示欢迎信息
  term.writeln('\x1b[36mClaude Hub Terminal\x1b[0m');
  term.writeln('');
  term.writeln(`\x1b[32m项目路径:\x1b[0m ${projectPath}`);
  term.writeln('\x1b[33m点击下方按钮启动 Claude 会话\x1b[0m');

  return { term, fitAddon };
};

interface TerminalTabsProps {
  sessions: SessionTerminal[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onCloseSession: (sessionId: string) => void;
  theme: 'light' | 'dark';
}

const TerminalTabs: React.FC<TerminalTabsProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onCloseSession,
  theme,
}) => {
  if (sessions.length === 0) return null;

  return (
    <div
      style={{
        display: 'flex',
        gap: '2px',
        padding: '4px 8px',
        backgroundColor: 'var(--bg-tertiary)',
        borderBottom: '1px solid var(--border-color)',
        overflowX: 'auto',
      }}
    >
      {sessions.map((session) => (
        <div
          key={session.sessionId}
          onClick={() => onSelectSession(session.sessionId)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            backgroundColor:
              activeSessionId === session.sessionId
                ? 'var(--bg-primary)'
                : 'var(--bg-secondary)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            fontSize: '12px',
            color:
              activeSessionId === session.sessionId
                ? 'var(--text-primary)'
                : 'var(--text-secondary)',
            border:
              activeSessionId === session.sessionId
                ? '1px solid var(--border-color)'
                : '1px solid transparent',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--success-color)',
            }}
          />
          <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {session.projectPath.split(/[/\\]/).pop()}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCloseSession(session.sessionId);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0 2px',
              fontSize: '14px',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      ))}
      {sessions.length < 3 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            color: 'var(--text-muted)',
            fontSize: '12px',
          }}
        >
          + 添加
        </div>
      )}
    </div>
  );
};

const Terminal: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sessions, setSessions] = useState<SessionTerminal[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const { theme, setSessionActive } = useAppStore();

  // 获取当前活动的项目路径
  const { currentProject } = useAppStore();

  // 监听主题变化
  useEffect(() => {
    sessions.forEach((session) => {
      session.term.options.theme = getTerminalTheme(theme);
    });
  }, [theme, sessions]);

  // 设置事件监听
  useEffect(() => {
    // 监听输出
    window.electronAPI.onClaudeOutput(({ sessionId, data }) => {
      setSessions((prev) => {
        const session = prev.find((s) => s.sessionId === sessionId);
        if (session) {
          session.term.write(data);
        }
        return [...prev];
      });
    });

    // 监听关闭
    window.electronAPI.onClaudeClose(({ sessionId, exitCode }) => {
      setSessions((prev) => {
        const session = prev.find((s) => s.sessionId === sessionId);
        if (session) {
          session.term.writeln(`\x1b[33m会话已结束 (退出码: ${exitCode})\x1b[0m`);
        }
        // 不自动删除，让用户看到结束信息
        return [...prev];
      });

      // 如果是活动会话，更新状态
      if (sessionId === activeSessionId) {
        setSessionActive(false);
      }
    });

    // 监听错误
    window.electronAPI.onClaudeError((error: string) => {
      setSessions((prev) => {
        if (prev.length > 0) {
          const activeSession = prev.find((s) => s.sessionId === activeSessionId) || prev[0];
          activeSession.term.writeln(`\x1b[31m错误: ${error}\x1b[0m`);
        }
        return [...prev];
      });
      setSessionActive(false);
    });
  }, [activeSessionId, setSessionActive]);

  // 渲染活动会话的终端
  useEffect(() => {
    if (!containerRef.current) return;

    const activeSession = sessions.find((s) => s.sessionId === activeSessionId);
    if (activeSession) {
      // 终端已经创建，只需要 fit
      activeSession.fitAddon.fit();
    }
  }, [activeSessionId, sessions]);

  // 处理窗口大小调整
  useEffect(() => {
    const handleResize = () => {
      const activeSession = sessions.find((s) => s.sessionId === activeSessionId);
      if (activeSession) {
        activeSession.fitAddon.fit();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeSessionId, sessions]);

  const handleStartSession = async () => {
    if (!currentProject?.path) return;

    // 检查是否已存在该项目的会话
    const existingSession = sessions.find(
      (s) => s.projectPath === currentProject.path
    );
    if (existingSession) {
      // 切换到现有会话
      setActiveSessionId(existingSession.sessionId);
      return;
    }

    // 限制最大会话数
    if (sessions.length >= 3) {
      alert('最多支持 3 个并发会话');
      return;
    }

    // 创建新的终端容器
    const terminalContainer = document.createElement('div');
    terminalContainer.style.display = 'none';
    containerRef.current?.appendChild(terminalContainer);

    const { term, fitAddon } = createTerminal(
      terminalContainer,
      theme,
      currentProject.path
    );

    // 启动 Claude 会话
    term.writeln('');
    term.writeln('\x1b[33m正在启动 Claude 会话...\x1b[0m');

    const result = await window.electronAPI.startClaudeSession(currentProject.path);

    if (result.success && result.sessionId) {
      const sessionId = result.sessionId;

      // 设置终端输入处理
      term.onData((data) => {
        window.electronAPI.sendClaudeInput(sessionId, data);
      });

      // 处理快捷键
      term.attachCustomKeyEventHandler((e) => {
        if (e.ctrlKey && e.key === 'c') {
          const selection = term.getSelection();
          if (selection) {
            navigator.clipboard.writeText(selection);
            return false;
          }
        }
        if (e.ctrlKey && e.key === 'v') {
          navigator.clipboard.readText().then((text) => {
            if (text) {
              term.paste(text);
            }
          });
          return false;
        }
        if (e.ctrlKey && e.key === 'l') {
          term.clear();
          return false;
        }
        return true;
      });

      // 添加到会话列表
      const newSession: SessionTerminal = {
        sessionId,
        projectPath: currentProject.path,
        term,
        fitAddon,
      };

      setSessions((prev) => [...prev, newSession]);
      setActiveSessionId(sessionId);
      setSessionActive(true, Date.now());

      term.writeln('\x1b[32mClaude 会话已启动！\x1b[0m');
      term.writeln('');
    } else {
      term.writeln(`\x1b[31m启动失败: ${result.error}\x1b[0m`);
      term.writeln('\x1b[33m请确保已安装 Claude CLI\x1b[0m');
      // 清理失败的终端
      term.dispose();
      terminalContainer.remove();
    }
  };

  const handleKillSession = async (sessionId?: string) => {
    const targetSessionId = sessionId || activeSessionId;
    if (!targetSessionId) return;

    await window.electronAPI.killClaudeSession(targetSessionId);

    // 更新本地状态
    setSessions((prev) => {
      const session = prev.find((s) => s.sessionId === targetSessionId);
      if (session) {
        session.term.writeln('\x1b[33m会话已终止\x1b[0m');
      }
      return prev.filter((s) => s.sessionId !== targetSessionId);
    });

    if (targetSessionId === activeSessionId) {
      setSessionActive(false);
      // 切换到其他会话
      const remainingSessions = sessions.filter((s) => s.sessionId !== targetSessionId);
      setActiveSessionId(remainingSessions.length > 0 ? remainingSessions[0].sessionId : null);
    }
  };

  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    // 隐藏其他终端，显示选中的终端
    sessions.forEach((session) => {
      const container = session.term.element?.parentElement;
      if (container) {
        container.style.display = session.sessionId === sessionId ? 'block' : 'none';
      }
    });
    // Fit 当前终端
    setTimeout(() => {
      const session = sessions.find((s) => s.sessionId === sessionId);
      if (session) {
        session.fitAddon.fit();
      }
    }, 10);
  };

  const handleCloseSession = async (sessionId: string) => {
    await handleKillSession(sessionId);
  };

  // 获取当前活动会话
  const activeSession = sessions.find((s) => s.sessionId === activeSessionId);
  const hasActiveSession = sessions.length > 0 && activeSessionId !== null;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* 标签栏 */}
      <TerminalTabs
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onCloseSession={handleCloseSession}
        theme={theme}
      />

      {/* 终端头部 */}
      <div
        style={{
          padding: '10px 16px',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: hasActiveSession
                  ? 'var(--success-color)'
                  : 'var(--text-muted)',
              }}
            />
            终端 {activeSession ? `(${sessions.length})` : ''}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Ctrl+C 复制 | Ctrl+V 粘贴 | Ctrl+L 清屏
          </span>
        </div>
        {!hasActiveSession ? (
          <button
            onClick={handleStartSession}
            disabled={!currentProject?.path}
            style={{
              padding: '5px 14px',
              backgroundColor: currentProject?.path
                ? 'var(--accent-color)'
                : 'var(--bg-tertiary)',
              color: currentProject?.path ? 'white' : 'var(--text-muted)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: currentProject?.path ? 'pointer' : 'not-allowed',
              fontSize: '12px',
              fontWeight: 500,
              transition: 'all 0.15s ease',
            }}
          >
            启动 Claude
          </button>
        ) : (
          <button
            onClick={() => handleKillSession()}
            style={{
              padding: '5px 14px',
              backgroundColor: 'var(--danger-color)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            停止会话
          </button>
        )}
      </div>

      {/* 终端容器 */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          backgroundColor: 'var(--terminal-bg, #1e1e1e)',
          padding: '8px',
          position: 'relative',
        }}
      >
        {!hasActiveSession && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'var(--text-muted)',
              textAlign: 'center',
              fontSize: '14px',
            }}
          >
            <div style={{ marginBottom: '8px' }}>暂无活动的 Claude 会话</div>
            {currentProject?.path ? (
              <div>
                <button
                  onClick={handleStartSession}
                  style={{
                    padding: '8px 20px',
                    backgroundColor: 'var(--accent-color)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  启动 Claude 会话
                </button>
              </div>
            ) : (
              <div style={{ fontSize: '12px' }}>请先选择一个项目</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Terminal;
