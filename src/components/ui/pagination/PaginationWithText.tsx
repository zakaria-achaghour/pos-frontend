import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/kit';
interface PaginationProps { totalPages: number; initialPage?: number; onPageChange?: (page: number) => void; }
export default function PaginationWithText({ totalPages, initialPage = 1, onPageChange }: PaginationProps) {
  const { t } = useTranslation();
  const pages = Math.max(1, totalPages);
  const [currentPage, setCurrentPage] = useState(initialPage);
  useEffect(() => { setCurrentPage(Math.min(pages, Math.max(1, initialPage))); }, [initialPage, pages]);
  const go = (page: number) => { if (page < 1 || page > pages || page === currentPage) return; setCurrentPage(page); onPageChange?.(page); };
  const visible = Array.from({ length: pages }, (_, i) => i + 1).filter(p => p === 1 || p === pages || Math.abs(p - currentPage) <= 1);
  return (
    <nav aria-label={t('ux.pagination')} className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-4">
      <Button size="md" variant="secondary" disabled={currentPage <= 1} onClick={() => go(currentPage - 1)} aria-label={t('ux.previous')}><span aria-hidden="true" className="rtl:rotate-180">←</span><span className="hidden sm:inline">{t('ux.previous')}</span></Button>
      <span className="text-xs text-fg-muted sm:hidden">{currentPage} / {pages}</span>
      <div className="hidden items-center gap-1 sm:flex">{visible.map((page, index) => <span key={page} className="flex items-center gap-1">{index > 0 && page - visible[index - 1]! > 1 && <span className="px-2 text-fg-muted">…</span>}<button type="button" aria-current={currentPage === page ? 'page' : undefined} onClick={() => go(page)} className={`h-11 min-w-11 rounded-lg px-3 text-sm font-medium ${currentPage === page ? 'bg-primary text-primary-fg' : 'text-fg-muted hover:bg-surface-2'}`}>{page}</button></span>)}</div>
      <Button size="md" variant="secondary" disabled={currentPage >= pages} onClick={() => go(currentPage + 1)} aria-label={t('ux.next')}><span className="hidden sm:inline">{t('ux.next')}</span><span aria-hidden="true" className="rtl:rotate-180">→</span></Button>
    </nav>
  );
}
