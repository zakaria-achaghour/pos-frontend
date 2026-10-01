import { ICON_PATHS, type IconName } from '@/design/status';

interface IconProps {
  name: IconName;
  className?: string;
}

/** Decorative outline icon; always paired with a text label, so hidden from screen readers. */
export default function Icon({ name, className = 'h-4 w-4' }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}
