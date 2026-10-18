import React from 'react';

/**
 * BigButton
 * Unified button component with consistent visual hierarchy and senior-friendly touch targets.
 *
 * @param {'primary' | 'secondary' | 'gentle' | 'danger' | 'ghost'} variant
 * @param {'sm' | 'md' | 'lg'} size
 */
export function BigButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon = null,
  disabled = false,
  className = '',
  ariaLabel,
  type = 'button',
  style = {}
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)'
        };
      case 'gentle':
        return {
          backgroundColor: 'var(--accent-soft)',
          color: 'var(--accent-color)',
          border: '1px solid var(--accent-border)'
        };
      case 'danger':
        return {
          backgroundColor: 'var(--danger-soft)',
          color: 'var(--danger-color)',
          border: '1px solid var(--danger-border)'
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: 'var(--text-secondary)',
          border: '1px solid transparent'
        };
      case 'primary':
      default:
        return {
          backgroundColor: 'var(--accent-color)',
          color: '#0F172A',
          border: '1px solid var(--accent-color)',
          fontWeight: '700',
          boxShadow: '0 4px 14px rgba(56, 189, 248, 0.35)'
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          minHeight: '40px',
          padding: '8px 14px',
          fontSize: 'var(--font-sm)',
          gap: '8px'
        };
      case 'lg':
        return {
          minHeight: '54px',
          padding: '12px 24px',
          fontSize: 'var(--font-h3)',
          gap: '12px'
        };
      case 'md':
      default:
        return {
          minHeight: 'var(--touch-min-height)',
          padding: '10px 18px',
          fontSize: 'var(--font-base)',
          gap: '10px'
        };
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`app-button ${className}`}
      style={{
        ...getVariantStyles(),
        ...getSizeStyles(),
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-md)',
        fontWeight: '600',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        transition: 'all var(--transition-speed) ease',
        ...style
      }}
    >
      {icon && <span aria-hidden="true" style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
