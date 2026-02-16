import React from 'react';

// Button 变体类型
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
}

// 按钮组件
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  disabled,
  style,
  ...props
}) => {
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    fontWeight: 500,
    transition: 'all 0.15s ease',
    opacity: disabled || loading ? 0.6 : 1,
  };

  const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
    sm: { padding: '4px 10px', fontSize: '12px' },
    md: { padding: '6px 14px', fontSize: '13px' },
    lg: { padding: '8px 18px', fontSize: '14px' },
  };

  const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
    primary: {
      backgroundColor: 'var(--accent-color)',
      color: 'white',
    },
    secondary: {
      backgroundColor: 'var(--bg-tertiary)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-color)',
    },
    danger: {
      backgroundColor: 'var(--danger-color)',
      color: 'white',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--text-secondary)',
    },
  };

  return (
    <button
      disabled={disabled || loading}
      style={{
        ...baseStyles,
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...style,
      }}
      {...props}
    >
      {loading ? (
        <span style={{ animation: 'spin 1s linear infinite' }}>⟳</span>
      ) : icon ? (
        icon
      ) : null}
      {children}
    </button>
  );
};

// Input 组件
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  icon,
  error,
  style,
  ...props
}) => {
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: icon ? '8px 12px 8px 32px' : '8px 12px',
    fontSize: '13px',
    border: `1px solid ${error ? 'var(--danger-color)' : 'var(--border-color)'}`,
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    ...style,
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {icon && (
        <span
          style={{
            position: 'absolute',
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
            fontSize: '14px',
            pointerEvents: 'none',
          }}
        >
          {icon}
        </span>
      )}
      <input
        style={inputStyle}
        {...props}
      />
      {error && (
        <span
          style={{
            display: 'block',
            marginTop: '4px',
            fontSize: '11px',
            color: 'var(--danger-color)',
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
};

// IconButton 组件
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  variant?: 'default' | 'primary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  tooltip?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  variant = 'default',
  size = 'md',
  tooltip,
  style,
  ...props
}) => {
  const sizeMap = { sm: '24px', md: '28px', lg: '32px' };

  const variantColors: Record<string, string> = {
    default: 'var(--text-secondary)',
    primary: 'var(--accent-color)',
    danger: 'var(--danger-color)',
  };

  return (
    <button
      title={tooltip}
      style={{
        width: sizeMap[size],
        height: sizeMap[size],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: 'var(--radius-sm)',
        color: variantColors[variant],
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        ...style,
      }}
      {...props}
    >
      {icon}
    </button>
  );
};

// Badge 组件
interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  variant?: 'solid' | 'outline';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  color = 'var(--accent-color)',
  variant = 'solid',
}) => {
  const styles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 8px',
    fontSize: '11px',
    fontWeight: 500,
    borderRadius: '10px',
    backgroundColor: variant === 'solid' ? color : 'transparent',
    color: variant === 'solid' ? 'white' : color,
    border: variant === 'outline' ? `1px solid ${color}` : 'none',
  };

  return <span style={styles}>{children}</span>;
};

// Tooltip 组件
interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = 'top',
}) => {
  const [show, setShow] = React.useState(false);

  const positionStyles: Record<string, React.CSSProperties> = {
    top: { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '6px' },
    bottom: { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '6px' },
    left: { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: '6px' },
    right: { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: '6px' },
  };

  return (
    <div
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div
          style={{
            position: 'absolute',
            ...positionStyles[position],
            padding: '4px 8px',
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            fontSize: '11px',
            borderRadius: 'var(--radius-sm)',
            whiteSpace: 'nowrap',
            boxShadow: 'var(--shadow-md)',
            zIndex: 1000,
            pointerEvents: 'none',
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
};

// EmptyState 组件
interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📭',
  title,
  description,
  action,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '48px', marginBottom: '16px', lineHeight: 1 }}>
        {icon}
      </div>
      <div
        style={{
          fontSize: '16px',
          fontWeight: 500,
          color: 'var(--text-primary)',
          marginBottom: '8px',
        }}
      >
        {title}
      </div>
      {description && (
        <div
          style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            marginBottom: '20px',
            maxWidth: '280px',
          }}
        >
          {description}
        </div>
      )}
      {action}
    </div>
  );
};

// Spinner 组件
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'var(--accent-color)',
}) => {
  const sizeMap = { sm: '16px', md: '24px', lg: '40px' };

  return (
    <div
      style={{
        width: sizeMap[size],
        height: sizeMap[size],
        border: `2px solid var(--border-color)`,
        borderTopColor: color,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }}
    />
  );
};

// Divider 组件
interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  spacing?: number;
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  spacing = 16,
}) => {
  const styles: React.CSSProperties = {
    backgroundColor: 'var(--border-color)',
    ...(orientation === 'horizontal'
      ? { height: '1px', width: '100%', margin: `${spacing}px 0` }
      : { width: '1px', height: '100%', margin: `0 ${spacing}px` }),
  };

  return <div style={styles} />;
};
