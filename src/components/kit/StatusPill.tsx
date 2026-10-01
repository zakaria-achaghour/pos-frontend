import { twMerge } from 'tailwind-merge';
import type { StatusStyle } from '@/design/status';
import Icon from './Icon';

interface StatusPillProps {
  style: StatusStyle;
  /** override the label (e.g. a translated one) */
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE = {
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-3 py-1 text-sm gap-1.5',
  lg: 'px-4 py-1.5 text-base gap-2',
} as const;

/** Status is always icon + text, never color alone. */
export default function StatusPill({ style, label, size = 'md', className }: StatusPillProps) {
  return (
    <span
      className={twMerge(
        'inline-flex items-center rounded-full font-semibold whitespace-nowrap',
        SIZE[size],
        style.pill,
        className
      )}
    >
      <Icon name={style.icon} className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      {label ?? style.label}
    </span>
  );
}
