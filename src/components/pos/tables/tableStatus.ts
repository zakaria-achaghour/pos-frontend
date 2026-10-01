import { dynamicT } from '@/i18n/dynamic';
import type { TFunction } from 'i18next';
import { tableStateStyle, type StatusStyle } from '@/design/status';

/** Legacy 'out-of-order' has no style of its own: it looks like "Out of service". */
export const tableStatusStyle = (status: string | undefined): StatusStyle =>
  tableStateStyle(status === 'out-of-order' ? 'maintenance' : status);

/** Translated table state label (tableState.* plus the admin-only "out of order"). */
export const tableStatusLabel = (t: TFunction, status: string | undefined): string => {
  if (status === 'out-of-order') return t('tableAdmin.outOfOrder');
  if (!status) return '';
  return dynamicT(`tableState.${status}`, { defaultValue: status });
};
