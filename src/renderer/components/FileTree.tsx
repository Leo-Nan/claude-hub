import React, { useState, useEffect } from 'react';

// 文件节点类型
interface FileNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileNode[];
}

// 文件图标映射
const getFileIcon = (name: string, isDirectory: boolean): string => {
  if (isDirectory) return '📁';

  const ext = name.split('.').pop()?.toLowerCase();

  const iconMap: Record<string, string> = {
    // 代码文件
    'ts': '🔷',
    'tsx': '⚛️',
    'js': '🟨',
    'jsx': '⚛️',
    'py': '🐍',
    'rb': '💎',
    'go': '🐹',
    'rs': '🦀',
    'java': '☕',
    'kt': '🎯',
    'swift': '🍎',
    'c': '🔵',
    'cpp': '🔵',
    'h': '🔵',
    'cs': '🟣',
    'php': '🐘',
    'scala': '🟠',
    'vue': '💚',
    'svelte': '🔥',

    // 配置/数据文件
    'json': '📋',
    'yaml': '📋',
    'yml': '📋',
    'toml': '📋',
    'xml': '📋',
    'ini': '📋',
    'env': '🔐',
    'gitignore': '🔐',

    // 样式文件
    'css': '🎨',
    'scss': '🎨',
    'less': '🎨',
    'styl': '🎨',

    // 文档
    'md': '📝',
    'txt': '📝',
    'doc': '📄',
    'docx': '📄',
    'pdf': '📕',

    // 图片/媒体
    'png': '🖼️',
    'jpg': '🖼️',
    'jpeg': '🖼️',
    'gif': '🖼️',
    'svg': '🖼️',
    'ico': '🖼️',
    'webp': '🖼️',
    'mp4': '🎬',
    'mp3': '🎵',
    'wav': '🎵',

    // 构建/包管理
    'html': '🌐',
    'htm': '🌐',
    'sql': '🗃️',
    'sh': '⚡',
    'bat': '⚡',
    'ps1': '⚡',
    'dockerfile': '🐳',
    'makefile': '🔧',

    // 其他
    'lock': '🔒',
    'log': '📜',
  };

  return iconMap[ext || ''] || '📄';
};

// TreeNode 组件
interface TreeNodeProps {
  node: FileNode;
  depth: number;
  onToggle: (path: string) => void;
  expandedPaths: Set<string>;
  onContextMenu: (e: React.MouseEvent, node: FileNode) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  depth,
  onToggle,
  expandedPaths,
  onContextMenu,
}) => {
  const isExpanded = expandedPaths.has(node.path);
  const hasChildren = node.isDirectory && node.children && node.children.length > 0;

  return (
    <div>
      <div
        onClick={() => node.isDirectory && onToggle(node.path)}
        onContextMenu={(e) => onContextMenu(e, node)}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '4px 8px',
          paddingLeft: `${depth * 16 + 8}px`,
          cursor: node.isDirectory ? 'pointer' : 'default',
          fontSize: '12px',
          color: 'var(--text-secondary)',
          transition: 'background-color 0.1s',
          borderRadius: 'var(--radius-sm)',
          margin: '1px 4px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        {/* 展开/收起图标 */}
        <span style={{ marginRight: '4px', fontSize: '10px', opacity: 0.7 }}>
          {node.isDirectory ? (isExpanded ? '▼' : '▶') : ' '}
        </span>

        {/* 文件/目录图标 */}
        <span style={{ marginRight: '6px', fontSize: '14px' }}>
          {getFileIcon(node.name, node.isDirectory)}
        </span>

        {/* 文件名 */}
        <span style={{
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {node.name}
        </span>

        {/* 子项数量 */}
        {node.isDirectory && node.children && (
          <span style={{
            fontSize: '10px',
            color: 'var(--text-muted)',
            marginLeft: '8px',
          }}>
            {node.children.length}
          </span>
        )}
      </div>

      {/* 递归渲染子节点 */}
      {isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              onToggle={onToggle}
              expandedPaths={expandedPaths}
              onContextMenu={onContextMenu}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// 文件树组件
interface FileTreeProps {
  projectPath: string | null;
  onContextMenu?: (node: FileNode) => void;
}

const FileTree: React.FC<FileTreeProps> = ({ projectPath, onContextMenu }) => {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 加载文件结构
  useEffect(() => {
    if (!projectPath) {
      setFiles([]);
      return;
    }

    const loadFiles = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await window.electronAPI.getProjectFiles(projectPath);
        if (Array.isArray(result)) {
          setFiles(result);
        } else if (result.error) {
          setError(result.error);
        }
      } catch (err) {
        setError('加载文件失败');
        console.error('Error loading files:', err);
      } finally {
        setLoading(false);
      }
    };

    loadFiles();
  }, [projectPath]);

  // 切换展开/收起
  const handleToggle = (path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  // 右键菜单
  const handleContextMenu = (e: React.MouseEvent, node: FileNode) => {
    e.preventDefault();
    onContextMenu?.(node);
  };

  if (!projectPath) {
    return null;
  }

  if (loading) {
    return (
      <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
        加载中...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '16px', textAlign: 'center', color: 'var(--danger-color)', fontSize: '12px' }}>
        {error}
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
        空项目
      </div>
    );
  }

  return (
    <div style={{ padding: '4px 0', overflow: 'auto', maxHeight: '300px' }}>
      {files.map((node) => (
        <TreeNode
          key={node.path}
          node={node}
          depth={0}
          onToggle={handleToggle}
          expandedPaths={expandedPaths}
          onContextMenu={handleContextMenu}
        />
      ))}
    </div>
  );
};

export default FileTree;
