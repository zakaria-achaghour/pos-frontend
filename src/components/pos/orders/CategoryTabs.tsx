import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { twMerge } from 'tailwind-merge';

interface CategoryTab {
  id: number;
  name: string;
}

interface CategoryTabsProps {
  categories: CategoryTab[];
  selectedCategory: number | null;
  loading: boolean;
  onCategoryChange: (categoryId: number | null) => void;
  /** vertical = side rail for wide screens, horizontal = scrolling chips */
  orientation?: 'horizontal' | 'vertical';
}

const CategoryTabsComponent = ({
  categories,
  selectedCategory,
  loading,
  onCategoryChange,
  orientation = 'horizontal',
}: CategoryTabsProps) => {
  const { t } = useTranslation();
  const vertical = orientation === 'vertical';

  const button = (id: number | null, label: string) => {
    const selected = selectedCategory === id;
    return (
      <button
        key={id ?? 'all'}
        type="button"
        aria-pressed={selected}
        disabled={loading}
        onClick={() => onCategoryChange(id)}
        className={twMerge(
          'min-h-12 shrink-0 rounded-xl px-4 text-base font-semibold transition-colors disabled:opacity-60',
          vertical ? 'w-full text-start' : 'whitespace-nowrap',
          selected ? 'bg-primary text-primary-fg' : 'bg-surface text-fg ring-1 ring-line hover:bg-surface-2'
        )}
      >
        {label}
      </button>
    );
  };

  return (
    <nav
      aria-label={t('menu.categories')}
      className={twMerge(vertical ? 'flex flex-col gap-2' : 'flex gap-2 overflow-x-auto pb-1')}
    >
      {button(null, t('menu.allCategories'))}
      {categories.map((c) => button(c.id, c.name))}
    </nav>
  );
};

export const CategoryTabs = memo(CategoryTabsComponent);
