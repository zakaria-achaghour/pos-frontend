import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

type Variant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
type Size = 'md' | 'lg' | 'xl';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  /** md = 44px, lg = 48px, xl = 56px (cart / payment / kitchen actions) */
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

const VARIANT: Record<Variant, string> = {
  primary: 'bg-primary text-primary-fg hover:bg-primary-hover',
  secondary: 'bg-surface text-fg border border-line hover:bg-surface-2',
  danger: 'bg-danger text-danger-fg hover:opacity-90',
  success: 'bg-success text-white hover:opacity-90',
  ghost: 'bg-transparent text-fg hover:bg-surface-2',
};

const SIZE: Record<Size, string> = {
  md: 'min-h-11 px-4 text-sm',
  lg: 'min-h-touch px-5 text-base',
  xl: 'min-h-14 px-6 text-lg',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'lg', loading = false, fullWidth = false, disabled, className, children, type = 'button', ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={twMerge(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-50',
        VARIANT[variant],
        SIZE[size],
        fullWidth && 'w-full',
        className
      )}
      {...rest}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
});

export default Button;
