import { twMerge } from 'tailwind-merge';

/** Placeholder block for loading states: size it with className (h-*, w-*). */
export default function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={twMerge('animate-pulse rounded-lg bg-surface-2', className)}
    />
  );
}
