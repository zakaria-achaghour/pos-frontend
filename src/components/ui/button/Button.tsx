import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import KitButton from '@/components/kit/Button';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  size?: 'sm' | 'md';
  variant?: 'primary' | 'outline' | 'secondary' | 'danger';
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}

/** Keep legacy callers on the same touch targets and variants as POS controls. */
export default function Button({ children, size = 'md', variant = 'primary', startIcon, endIcon, className, ...props }: ButtonProps) {
  return (
    <KitButton {...props} size={size === 'sm' ? 'md' : 'lg'} variant={variant === 'outline' ? 'secondary' : variant} className={twMerge('text-sm font-medium', className)}>
      {startIcon && <span aria-hidden="true" className="flex shrink-0 items-center">{startIcon}</span>}
      {children}
      {endIcon && <span aria-hidden="true" className="flex shrink-0 items-center">{endIcon}</span>}
    </KitButton>
  );
}
