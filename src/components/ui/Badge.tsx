import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full tracking-tight uppercase';

  const variants = {
    default: 'bg-white/5 text-white/70 border border-white/10',
    secondary: 'bg-white/5 text-white border border-white/20',
    success: 'bg-workspace-accent/15 text-workspace-accent border border-workspace-accent/30',
    warning: 'border border-dashed border-white/30 text-white/70',
    danger: 'bg-white/5 text-white border border-white/25',
    info: 'bg-workspace-accent/10 text-workspace-base border border-workspace-accent/20'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-[11px]'
  };

  return (
    <span
      className={clsx(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
};
