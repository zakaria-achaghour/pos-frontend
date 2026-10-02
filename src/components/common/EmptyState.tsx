import type { ReactNode } from 'react';
import { Icon } from '@/components/kit';
import type { IconName } from '@/design/status';

export default function EmptyState({ title, description, icon = 'clipboard', action }: { title: string; description?: string; icon?: IconName; action?: ReactNode }) {
  return <div className="empty-state"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-2 text-fg-muted"><Icon name={icon} className="h-6 w-6"/></span><h3 className="text-base font-semibold text-fg">{title}</h3>{description && <p className="max-w-sm text-sm leading-6 text-fg-muted">{description}</p>}{action && <div className="mt-2">{action}</div>}</div>;
}
