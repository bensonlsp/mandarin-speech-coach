import { clsx } from 'clsx';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export function GlassCard({ children, className }: GlassCardProps) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-xl',
        className
      )}
    >
      {children}
    </div>
  );
}
