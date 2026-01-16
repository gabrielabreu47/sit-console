import React from 'react';
import { clsx } from 'clsx';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md';
  loading?: boolean;
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  disabled,
  ...rest
}) => {
  const variants = {
    primary: 'bg-workspace-accent text-white hover:brightness-110 border border-workspace-accent/60',
    secondary: 'bg-white/10 text-white hover:bg-white/20 border border-white/15',
    ghost: 'bg-transparent text-white hover:bg-white/10 border border-transparent',
    outline: 'bg-transparent text-white border border-white/20 hover:border-white/40',
    danger: 'bg-red-600 text-white hover:bg-red-700 border border-red-500/80'
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm rounded-xl',
    md: 'px-4 py-3 text-sm rounded-2xl'
  };

  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <span className="h-3 w-3 rounded-full border-2 border-white/60 border-t-transparent animate-spin" />}
      {children}
    </button>
  );
};
