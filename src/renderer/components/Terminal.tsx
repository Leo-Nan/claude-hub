import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

interface TerminalProps {
  projectPath: string | null;
}

const Terminal: React.FC<TerminalProps> = ({ projectPath }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const [isActive, setIsActive] = useState(false);

  const setupListeners = useCallback(() => {
    if (!xtermRef.current) return;

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
      setIsActive(false);
    });

    // Listen for close
    window.electronAPI.onClaudeClose((code: number) => {
      if (xtermRef.current) {
        xtermRef.current.writeln(`\x1b[33m会话已结束 (退出码: ${code})\x1b[0m`);
      }
      setIsActive(false);
    });
  }, []);

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Consolas, Monaco, monospace',
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
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

    term.onData((data) => {
      // Send input to Claude via IPC
      if (isActive) {
        window.electronAPI.sendClaudeInput(data);
      }
    });

    setupListeners();

    const handleResize = () => {
      fitAddon.fit();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, [projectPath, setupListeners]);

  const handleStartSession = async () => {
    if (!projectPath || !xtermRef.current) return;

    const term = xtermRef.current;
    term.writeln('');
    term.writeln('\x1b[33m正在启动 Claude 会话...\x1b[0m');

    const result = await window.electronAPI.startClaudeSession(projectPath);

    if (result.success) {
      setIsActive(true);
      term.writeln('\x1b[32mClaude 会话已启动！\x1b[0m');
      term.writeln('');
    } else {
      term.writeln(`\x1b[31m启动失败: ${result.error}\x1b[0m`);
      term.writeln('\x1b[33m请确保已安装 Claude CLI: npm install -g @anthropic-ai/claude-code\x1b[0m');
    }
  };

  const handleKillSession = async () => {
    await window.electronAPI.killClaudeSession();
    setIsActive(false);
    if (xtermRef.current) {
      xtermRef.current.writeln('\x1b[33m会话已终止\x1b[0m');
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          padding: '8px 12px',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span style={{ fontWeight: 500 }}>终端</span>
        {!isActive ? (
          <button
            onClick={handleStartSession}
            disabled={!projectPath}
            style={{
              padding: '4px 12px',
              backgroundColor: projectPath ? '#4caf50' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: projectPath ? 'pointer' : 'not-allowed',
              fontSize: '12px',
            }}
          >
            启动 Claude
          </button>
        ) : (
          <button
            onClick={handleKillSession}
            style={{
              padding: '4px 12px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
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
          backgroundColor: '#1e1e1e',
          padding: '8px',
        }}
      />
    </div>
  );
};

export default Terminal;
