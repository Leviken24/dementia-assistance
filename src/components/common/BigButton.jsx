import React from 'react';

export function BigButton({
  children,
  onClick,
  variant = 'primary',
  icon = null,
  disabled = false,
  className = '',
  ariaLabel,
  type = 'button'
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: 'var(--bg-surface-elevated)',
          color: 'var(--text-primary)',
          border: '2px solid var(--border-color)'
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: 'var(--accent-color)',
          border: '2px solid var(--accent-color)'
        };
      case 'gentle':
        return {
          backgroundColor: 'var(--accent-soft)',
          color: 'var(--accent-color)',
          border: '2px solid transparent'
        };
      case 'primary':
      default:
        return {
          backgroundColor: 'var(--accent-color)',
          color: '#FFFFFF',
          border: '2px solid var(--accent-color)'
        };
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`big-button ${className}`}
      style={{
        ...getVariantStyles(),
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '14px 28px',
        borderRadius: '12px',
        minHeight: 'var(--touch-min-height)',
        minWidth: 'var(--touch-min-width)',
        fontSize: 'var(--font-h3)',
        fontWeight: 'bold',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
        transition: 'background-color var(--transition-speed) ease, transform 0.1s ease'
      }}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
