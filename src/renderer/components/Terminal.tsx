import React, { useEffect, useRef, useState } from 'react';
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
      // Handle user input - for MVP, just echo
      term.write(data);
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

  const handleStartSession = () => {
    if (!projectPath || !xtermRef.current) return;

    setIsActive(true);
    const term = xtermRef.current;
    term.writeln('');
    term.writeln('\x1b[32m启动 Claude 会话...\x1b[0m');
    // Note: Actual Claude spawn would require IPC to main process
    // For MVP, this is a placeholder
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
        <button
          onClick={handleStartSession}
          disabled={!projectPath || isActive}
          style={{
            padding: '4px 12px',
            backgroundColor: projectPath && !isActive ? '#4caf50' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: projectPath && !isActive ? 'pointer' : 'not-allowed',
            fontSize: '12px',
          }}
        >
          {isActive ? '会话进行中' : '启动 Claude'}
        </button>
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
