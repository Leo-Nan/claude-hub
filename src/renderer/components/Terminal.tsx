import React, { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { useAppStore } from '../stores/appStore';

interface TerminalProps {
  projectPath: string | null;
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

const Terminal: React.FC<TerminalProps> = ({ projectPath }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const isActiveRef = useRef(false);
  const listenersSetupRef = useRef(false);
  const initializedRef = useRef(false);
  const { isSessionActive, setSessionActive, theme } = useAppStore();

  // 保持 ref 与 store 同步
  useEffect(() => {
    isActiveRef.current = isSessionActive;
  }, [isSessionActive]);

  // 初始化终端
  const initTerminal = () => {
    if (!terminalRef.current || initializedRef.current) return;

    const term = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Consolas, Monaco, monospace',
      theme: getTerminalTheme(theme),
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // 显示欢迎信息
    term.writeln('\x1b[36mClaude Hub Terminal\x1b[0m');
    term.writeln('');

    if (projectPath) {
      term.writeln(`\x1b[32m项目路径:\x1b[0m ${projectPath}`);
      term.writeln('\x1b[33m点击下方按钮启动 Claude 会话\x1b[0m');
    } else {
      term.writeln('\x1b[31m请先选择项目\x1b[0m');
    }

    // 只设置一次监听器
    if (!listenersSetupRef.current) {
      listenersSetupRef.current = true;

      // 监听 Claude 输出
      window.electronAPI.onClaudeOutput((data: string) => {
        if (xtermRef.current) {
          xtermRef.current.write(data);
        }
      });

      // 监听错误
      window.electronAPI.onClaudeError((error: string) => {
        if (xtermRef.current) {
          xtermRef.current.writeln(`\x1b[31m错误: ${error}\x1b[0m`);
        }
        setSessionActive(false);
      });

      // 监听关闭
      window.electronAPI.onClaudeClose((code: number) => {
        if (xtermRef.current) {
          xtermRef.current.writeln(`\x1b[33m会话已结束 (退出码: ${code})\x1b[0m`);
        }
        setSessionActive(false);
      });
    }

    // 启用鼠标事件用于选择
    term.options.mouseEnabled = true;
    term.options.cursorBlink = true;

    // 处理 Ctrl+C 复制, Ctrl+V 粘贴, Ctrl+L 清屏
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
          if (text && isActiveRef.current) {
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

    term.onData((data) => {
      if (isActiveRef.current) {
        window.electronAPI.sendClaudeInput(data);
      }
    });

    const handleResize = () => {
      fitAddon.fit();
    };

    window.addEventListener('resize', handleResize);

    initializedRef.current = true;
  };

  // 首次加载时初始化终端
  useEffect(() => {
    initTerminal();

    return () => {
      window.removeEventListener('resize', () => {});
      if (xtermRef.current) {
        xtermRef.current.dispose();
        xtermRef.current = null;
        initializedRef.current = false;
      }
    };
    // 只在组件挂载时执行一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 监听主题变化，更新终端颜色
  useEffect(() => {
    if (xtermRef.current) {
      xtermRef.current.options.theme = getTerminalTheme(theme);
    }
  }, [theme]);

  // 监听 projectPath 变化，更新欢迎信息（不重新创建终端）
  useEffect(() => {
    if (xtermRef.current && initializedRef.current) {
      const term = xtermRef.current;
      // 添加分隔线和新项目信息
      term.writeln('');
      term.writeln('\x1b[90m─────────────────────────────────\x1b[0m');
      if (projectPath) {
        term.writeln(`\x1b[32m切换项目:\x1b[0m ${projectPath}`);
        term.writeln('\x1b[33m点击下方按钮启动 Claude 会话\x1b[0m');
      } else {
        term.writeln('\x1b[31m请先选择项目\x1b[0m');
      }
    }
  }, [projectPath]);

  const handleStartSession = async () => {
    if (!projectPath || !xtermRef.current) return;

    const term = xtermRef.current;
    term.writeln('');
    term.writeln('\x1b[33m正在启动 Claude 会话...\x1b[0m');

    const result = await window.electronAPI.startClaudeSession(projectPath);

    if (result.success) {
      setSessionActive(true, Date.now());
      term.writeln('\x1b[32mClaude 会话已启动！\x1b[0m');
      term.writeln('');
    } else {
      term.writeln(`\x1b[31m启动失败: ${result.error}\x1b[0m`);
      term.writeln('\x1b[33m请确保已安装 Claude CLI\x1b[0m');
    }
  };

  const handleKillSession = async () => {
    await window.electronAPI.killClaudeSession();
    setSessionActive(false);
    if (xtermRef.current) {
      xtermRef.current.writeln('\x1b[33m会话已终止\x1b[0m');
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
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
          <span style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isSessionActive ? 'var(--success-color)' : 'var(--text-muted)',
            }} />
            终端
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Ctrl+C 复制 | Ctrl+V 粘贴 | Ctrl+L 清屏</span>
        </div>
        {!isSessionActive ? (
          <button
            onClick={handleStartSession}
            disabled={!projectPath}
            style={{
              padding: '5px 14px',
              backgroundColor: projectPath ? 'var(--accent-color)' : 'var(--bg-tertiary)',
              color: projectPath ? 'white' : 'var(--text-muted)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: projectPath ? 'pointer' : 'not-allowed',
              fontSize: '12px',
              fontWeight: 500,
              transition: 'all 0.15s ease',
            }}
          >
            启动 Claude
          </button>
        ) : (
          <button
            onClick={handleKillSession}
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
      <div
        ref={terminalRef}
        style={{
          flex: 1,
          backgroundColor: 'var(--terminal-bg, #1e1e1e)',
          padding: '8px',
        }}
      />
    </div>
  );
};

export default Terminal;
