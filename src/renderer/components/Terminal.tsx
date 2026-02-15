import React, { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { useAppStore } from '../stores/appStore';

interface TerminalProps {
  projectPath: string | null;
}

const Terminal: React.FC<TerminalProps> = ({ projectPath }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const isActiveRef = useRef(false);
  const listenersSetupRef = useRef(false);
  const { isSessionActive, setSessionActive } = useAppStore();

  // 保持 ref 与 store 同步
  useEffect(() => {
    isActiveRef.current = isSessionActive;
  }, [isSessionActive]);

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Consolas, Monaco, monospace',
      theme: {
        background: 'var(--terminal-bg, #1e1e1e)',
        foreground: 'var(--terminal-fg, #d4d4d4)',
        selectionBackground: 'rgba(255, 255, 255, 0.3)',
      },
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;

    term.writeln('\x1b[36mClaude Hub Terminal\x1b[0m');
    term.writeln('');

    if (projectPath) {
      term.writeln(`\x1b[32m项目路径:\x1b[0m ${projectPath}`);
      term.writeln('\x1b[33m点击下方按钮启动 Claude 会话\x1b[0m');
    } else {
      term.writeln('\x1b[31m请先选择项目\x1b[0m');
    }

    // Only setup listeners once
    if (!listenersSetupRef.current) {
      listenersSetupRef.current = true;

      // Listen for Claude output
      window.electronAPI.onClaudeOutput((data: string) => {
        if (xtermRef.current) {
          xtermRef.current.write(data);
        }
      });

      // Listen for errors
      window.electronAPI.onClaudeError((error: string) => {
        if (xtermRef.current) {
          xtermRef.current.writeln(`\x1b[31m错误: ${error}\x1b[0m`);
        }
        setSessionActive(false);
      });

      // Listen for close
      window.electronAPI.onClaudeClose((code: number) => {
        if (xtermRef.current) {
          xtermRef.current.writeln(`\x1b[33m会话已结束 (退出码: ${code})\x1b[0m`);
        }
        setSessionActive(false);
      });
    }

    // Enable mouse events for selection
    term.options.mouseEnabled = true;
    term.options.cursorBlink = true;

    // Handle Ctrl+C to copy, Ctrl+V to paste, Ctrl+L to clear
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

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
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
