import { useId, type InputHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  success?: boolean;
  error?: boolean;
  hint?: string;
}
export default function Input({ success = false, error = false, hint, className, id, ...props }: InputProps) {
  const generatedId = useId();
  const hintId = `${id || generatedId}-hint`;
  return (
    <div className="relative">
      <input {...props} id={id} aria-invalid={error || undefined} aria-describedby={[props['aria-describedby'], hint ? hintId : undefined].filter(Boolean).join(' ') || undefined} className={twMerge(
        'min-h-11 w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-fg placeholder:text-fg-muted focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-surface-2 disabled:opacity-60',
        error && 'border-danger focus:border-danger focus:ring-danger/15',
        success && !error && 'border-success focus:border-success focus:ring-success/15', className
      )}/>
      {hint && <p id={hintId} className={`mt-2 text-xs ${error ? 'text-danger' : success ? 'text-success' : 'text-fg-muted'}`}>{hint}</p>}
    </div>
  );
}
