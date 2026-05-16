import { clsx } from 'clsx';
import { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-blue-500 hover:bg-blue-400 text-white shadow-blue-500/25 shadow-md',
  secondary: 'bg-white/10 hover:bg-white/20 text-white border border-white/20',
  ghost: 'text-slate-300 hover:text-white hover:bg-white/10',
  danger: 'bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/30',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
};

export function Button({
  variant = 'secondary',
  size = 'md',
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={clsx(
        'inline-flex items-center gap-2 font-medium transition-all duration-150 cursor-pointer select-none',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </button>
  );
}
