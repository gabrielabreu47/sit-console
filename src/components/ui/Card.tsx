import React, { CSSProperties } from 'react';
import { clsx } from 'clsx';

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
};

export const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = 'md',
  hover = false,
  style,
  ...rest
}) => {
  const paddingStyles = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const cardStyle: CSSProperties = {
    background: 'var(--card-bg)',
    borderColor: 'var(--card-border)',
    color: 'var(--card-text)'
  };

  return (
    <div
      className={clsx(
        'rounded-3xl border backdrop-blur-sm transition-all duration-300 relative',
        hover && 'hover:-translate-y-1 hover:border-white/20',
        paddingStyles[padding],
        className
      )}
      style={{ ...cardStyle, ...style }}
      {...rest}
    >
      <div className="relative z-10">{children}</div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-60 pointer-events-none" />
    </div>
  );
};
