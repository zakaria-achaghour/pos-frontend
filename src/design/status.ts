/**
 * Single source of truth for how order status, priority and table state look.
 * Class names are written out in full so Tailwind can see them.
 * Colors come from the tokens in src/styles/pos-tokens.css.
 */

export type IconName = 'bell' | 'clock' | 'flame' | 'check' | 'clipboard' | 'x' | 'alert' | 'user' | 'sparkles';

// 24x24 outline icon paths (stroke, no fill)
export const ICON_PATHS: Record<IconName, string> = {
  bell: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  clock: 'M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z',
  flame: 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.657 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z',
  check: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  clipboard: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  x: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
  alert: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  sparkles: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
};

export interface StatusStyle {
  /** English label; translated labels come from i18n keys `status.<key>` */
  label: string;
  /** soft pill: tinted background + colored text */
  pill: string;
  /** solid block: used for ticket headers and big buttons */
  solid: string;
  /** colored text only */
  text: string;
  /** left/top accent border */
  border: string;
  icon: IconName;
}

const NEW: Omit<StatusStyle, 'label' | 'icon'> = {
  pill: 'bg-status-new/15 text-status-new',
  solid: 'bg-status-new text-white',
  text: 'text-status-new',
  border: 'border-status-new',
};
const COOKING: Omit<StatusStyle, 'label' | 'icon'> = {
  pill: 'bg-status-cooking/15 text-status-cooking',
  solid: 'bg-status-cooking text-white',
  text: 'text-status-cooking',
  border: 'border-status-cooking',
};
const READY: Omit<StatusStyle, 'label' | 'icon'> = {
  pill: 'bg-status-ready/15 text-status-ready',
  solid: 'bg-status-ready text-white',
  text: 'text-status-ready',
  border: 'border-status-ready',
};
const SERVED: Omit<StatusStyle, 'label' | 'icon'> = {
  pill: 'bg-status-served/15 text-status-served',
  solid: 'bg-status-served text-white',
  text: 'text-status-served',
  border: 'border-status-served',
};
const VOID: Omit<StatusStyle, 'label' | 'icon'> = {
  pill: 'bg-status-void/15 text-status-void',
  solid: 'bg-status-void text-white',
  text: 'text-status-void',
  border: 'border-status-void',
};

export const ORDER_STATUS = {
  pending: { ...NEW, label: 'Pending', icon: 'bell' },
  accepted: { ...NEW, label: 'Accepted', icon: 'clipboard' },
  preparing: { ...COOKING, label: 'Preparing', icon: 'flame' },
  ready: { ...READY, label: 'Ready', icon: 'check' },
  served: { ...SERVED, label: 'Served', icon: 'sparkles' },
  completed: { ...SERVED, label: 'Completed', icon: 'check' },
  cancelled: { ...VOID, label: 'Cancelled', icon: 'x' },
} as const satisfies Record<string, StatusStyle>;

export type OrderStatusKey = keyof typeof ORDER_STATUS;

export const PRIORITY = {
  normal: {
    label: 'Normal',
    pill: 'bg-surface-2 text-fg-muted',
    solid: 'bg-fg-muted text-white',
    text: 'text-fg-muted',
    border: 'border-line',
    icon: 'clock',
  },
  rush: {
    label: 'Rush',
    pill: 'bg-prio-rush/15 text-prio-rush',
    solid: 'bg-prio-rush text-white',
    text: 'text-prio-rush',
    border: 'border-prio-rush',
    icon: 'alert',
  },
  urgent: {
    label: 'Urgent',
    pill: 'bg-prio-urgent/15 text-prio-urgent',
    solid: 'bg-prio-urgent text-white',
    text: 'text-prio-urgent',
    border: 'border-prio-urgent',
    icon: 'alert',
  },
} as const satisfies Record<string, StatusStyle>;

export type PriorityKey = keyof typeof PRIORITY;

export const TABLE_STATE = {
  available: {
    label: 'Free',
    pill: 'bg-table-free/15 text-table-free',
    solid: 'bg-table-free text-white',
    text: 'text-table-free',
    border: 'border-table-free',
    icon: 'check',
  },
  occupied: {
    label: 'Busy',
    pill: 'bg-table-busy/15 text-table-busy',
    solid: 'bg-table-busy text-white',
    text: 'text-table-busy',
    border: 'border-table-busy',
    icon: 'user',
  },
  reserved: {
    label: 'Reserved',
    pill: 'bg-table-reserved/15 text-table-reserved',
    solid: 'bg-table-reserved text-white',
    text: 'text-table-reserved',
    border: 'border-table-reserved',
    icon: 'clock',
  },
  maintenance: {
    label: 'Out of service',
    pill: 'bg-fg-muted/15 text-fg-muted',
    solid: 'bg-fg-muted text-white',
    text: 'text-fg-muted',
    border: 'border-line',
    icon: 'x',
  },
  cleaning: {
    label: 'Cleaning',
    pill: 'bg-table-cleaning/15 text-table-cleaning',
    solid: 'bg-table-cleaning text-white',
    text: 'text-table-cleaning',
    border: 'border-table-cleaning',
    icon: 'sparkles',
  },
} as const satisfies Record<string, StatusStyle>;

export type TableStateKey = keyof typeof TABLE_STATE;

const FALLBACK: StatusStyle = ORDER_STATUS.pending;

export const orderStatusStyle = (status: string | undefined): StatusStyle =>
  (ORDER_STATUS as Record<string, StatusStyle>)[status ?? ''] ?? FALLBACK;

export const priorityStyle = (priority: string | undefined): StatusStyle =>
  (PRIORITY as Record<string, StatusStyle>)[priority ?? ''] ?? PRIORITY.normal;

export const tableStateStyle = (state: string | undefined): StatusStyle =>
  (TABLE_STATE as Record<string, StatusStyle>)[state ?? ''] ?? TABLE_STATE.available;

/**
 * Kitchen ticket age -> urgency. Thresholds in minutes; used by the live timer.
 */
export type AgeLevel = 'fresh' | 'warn' | 'late';

export const ageLevel = (minutes: number): AgeLevel =>
  minutes >= 10 ? 'late' : minutes >= 5 ? 'warn' : 'fresh';

export const AGE_STYLE: Record<AgeLevel, { header: string; text: string }> = {
  fresh: { header: 'bg-surface-2 text-fg', text: 'text-fg' },
  warn: { header: 'bg-warning text-white', text: 'text-warning' },
  late: { header: 'bg-danger text-danger-fg animate-pulse', text: 'text-danger' },
};
