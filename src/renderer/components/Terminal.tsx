import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { useAppStore } from '../stores/appStore';

// 单个会话终端
interface SessionTerminal {
  sessionId: string;
  projectPath: string;
  projectName: string;
  term: XTerm;
  fitAddon: FitAddon;
  container: HTMLDivElement;
}

// 主题颜色配置
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

const Terminal: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sessions, setSessions] = useState<SessionTerminal[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const { theme, setSessionActive, currentProject } = useAppStore();

  // 显示指定的会话终端
  const showSession = useCallback((sessionId: string) => {
    sessions.forEach((session) => {
      session.container.style.display = session.sessionId === sessionId ? 'block' : 'none';
    });
    // 延迟 fit 以等待 DOM 更新
    setTimeout(() => {
      const session = sessions.find((s) => s.sessionId === sessionId);
      if (session) {
        session.fitAddon.fit();
      }
    }, 50);
  }, [sessions]);

  // 创建终端并显示
  const createAndShowTerminal = useCallback((
    sessionId: string,
    projectPath: string,
    projectName: string
  ) => {
    if (!containerRef.current) return null;

    // 创建容器
    const terminalContainer = document.createElement('div');
    terminalContainer.style.width = '100%';
    terminalContainer.style.height = '100%';
    containerRef.current.appendChild(terminalContainer);

    // 创建终端
    const term = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Consolas, Monaco, monospace',
      theme: getTerminalTheme(theme),
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalContainer);
    fitAddon.fit();

    // 显示欢迎信息
    term.writeln('\x1b[36mClaude Hub Terminal\x1b[0m');
    term.writeln('');
    term.writeln(`\x1b[32m项目: ${projectName}\x1b[0m`);
    term.writeln(`\x1b[90m路径: ${projectPath}\x1b[0m`);
    term.writeln('');

    return { term, fitAddon, container: terminalContainer };
  }, [theme]);

  // 启动新会话
  const handleStartSession = async () => {
    if (!currentProject?.path) return;

    // 检查是否已存在该项目的会话
    const existingSession = sessions.find(
      (s) => s.projectPath === currentProject.path
    );
    if (existingSession) {
      setActiveSessionId(existingSession.sessionId);
      showSession(existingSession.sessionId);
      return;
    }

    // 限制最大会话数
    if (sessions.length >= 3) {
      alert('最多支持 3 个并发会话');
      return;
    }

    // 创建终端
    const result = createAndShowTerminal(
      '', // sessionId 稍后更新
      currentProject.path,
      currentProject.name
    );

    if (!result) return;

    const { term, fitAddon, container } = result;

    // 显示启动中
    term.writeln('\x1b[33m正在启动 Claude 会话...\x1b[0m');

    // 启动 Claude
    const startResult = await window.electronAPI.startClaudeSession(currentProject.path);

    if (startResult.success && startResult.sessionId) {
      const sessionId = startResult.sessionId;

      // 设置输入处理
      term.onData((data) => {
        window.electronAPI.sendClaudeInput(sessionId, data);
      });

      // 快捷键处理
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
            if (text) term.paste(text);
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
        projectName: currentProject.name,
        term,
        fitAddon,
        container,
      };

      setSessions((prev) => [...prev, newSession]);
      setActiveSessionId(sessionId);
      setSessionActive(true, Date.now());

      // 显示新会话
      container.style.display = 'block';

      term.writeln('\x1b[32m✓ Claude 会话已启动\x1b[0m');
      term.writeln('');
    } else {
      term.writeln(`\x1b[31m✗ 启动失败: ${startResult.error}\x1b[0m`);
      term.writeln('\x1b[33m请确保已安装 Claude CLI\x1b[0m');
    }
  };

  // 关闭会话
  const handleCloseSession = async (sessionId: string) => {
    const session = sessions.find((s) => s.sessionId === sessionId);
    if (!session) return;

    // 杀掉进程
    await window.electronAPI.killClaudeSession(sessionId);

    // 清理终端
    session.term.dispose();
    session.container.remove();

    // 更新状态
    const remaining = sessions.filter((s) => s.sessionId !== sessionId);
    setSessions(remaining);

    if (activeSessionId === sessionId) {
      if (remaining.length > 0) {
        const nextSession = remaining[remaining.length - 1];
        setActiveSessionId(nextSession.sessionId);
        showSession(nextSession.sessionId);
      } else {
        setActiveSessionId(null);
        setSessionActive(false);
      }
    }
  };

  // 切换会话
  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    showSession(sessionId);
  };

  // 监听输出事件
  useEffect(() => {
    window.electronAPI.onClaudeOutput(({ sessionId, data }) => {
      const session = sessions.find((s) => s.sessionId === sessionId);
      if (session) {
        session.term.write(data);
      }
    });

    window.electronAPI.onClaudeClose(({ sessionId, exitCode }) => {
      const session = sessions.find((s) => s.sessionId === sessionId);
      if (session) {
        session.term.writeln(`\x1b[33m会话已结束 (退出码: ${exitCode})\x1b[0m`);
        // 标记为已关闭
        session.term.options.cursorBlink = false;
      }
      if (sessionId === activeSessionId) {
        setSessionActive(false);
      }
    });

    window.electronAPI.onClaudeError((error) => {
      if (sessions.length > 0) {
        const session = sessions.find((s) => s.sessionId === activeSessionId) || sessions[0];
        session.term.writeln(`\x1b[31m错误: ${error}\x1b[0m`);
      }
      setSessionActive(false);
    });
  }, [sessions, activeSessionId, setSessionActive]);

  // 主题变化
  useEffect(() => {
    sessions.forEach((session) => {
      session.term.options.theme = getTerminalTheme(theme);
    });
  }, [theme, sessions]);

  // 窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      if (activeSessionId) {
        const session = sessions.find((s) => s.sessionId === activeSessionId);
        session?.fitAddon.fit();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeSessionId, sessions]);

  // 初始显示活动会话
  useEffect(() => {
    if (activeSessionId) {
      showSession(activeSessionId);
    }
  }, [activeSessionId, showSession]);

  const hasActiveSession = sessions.length > 0;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* 标签栏 */}
      {sessions.length > 0 && (
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
              onClick={() => handleSelectSession(session.sessionId)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
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
                    ? '1px solid var(--accent-color)'
                    : '1px solid transparent',
                transition: 'all 0.15s',
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
              <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {session.projectName}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCloseSession(session.sessionId);
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
                title="关闭会话"
              >
                ×
              </button>
            </div>
          ))}
          {sessions.length < 3 && currentProject && (
            <div
              onClick={handleStartSession}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                color: 'var(--accent-color)',
                fontSize: '12px',
                cursor: 'pointer',
                borderRadius: 'var(--radius-sm)',
              }}
              title="为当前项目启动新会话"
            >
              + 新建
            </div>
          )}
        </div>
      )}

      {/* 头部 */}
      <div
        style={{
          padding: '10px 16px',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-secondary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
            终端 {sessions.length > 0 && `(${sessions.length})`}
          </span>
          {currentProject && (
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              当前: {currentProject.name}
            </span>
          )}
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Ctrl+C 复制 | Ctrl+V 粘贴 | Ctrl+L 清屏
          </span>
        </div>
        {!hasActiveSession ? (
          <button
            onClick={handleStartSession}
            disabled={!currentProject?.path}
            style={{
              padding: '6px 16px',
              backgroundColor: currentProject?.path ? 'var(--accent-color)' : 'var(--bg-tertiary)',
              color: currentProject?.path ? 'white' : 'var(--text-muted)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: currentProject?.path ? 'pointer' : 'not-allowed',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            启动 Claude
          </button>
        ) : (
          <button
            onClick={() => activeSessionId && handleCloseSession(activeSessionId)}
            style={{
              padding: '6px 16px',
              backgroundColor: 'var(--danger-color)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            停止
          </button>
        )}
      </div>

      {/* 终端容器 */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          backgroundColor: 'var(--terminal-bg)',
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
            }}
          >
            <div style={{ marginBottom: '16px', fontSize: '14px' }}>
              {currentProject
                ? '点击「启动 Claude」开始对话'
                : '请先选择一个项目'}
            </div>
            {currentProject?.path && (
              <button
                onClick={handleStartSession}
                style={{
                  padding: '10px 24px',
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
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Terminal;
