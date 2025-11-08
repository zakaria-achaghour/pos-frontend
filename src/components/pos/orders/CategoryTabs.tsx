import React, { memo } from 'react';

interface CategoryTab {
  id: number;
  name: string;
}

interface CategoryTabsProps {
  categories: CategoryTab[];
  selectedCategory: number | null;
  loading: boolean;
  onCategoryChange: (categoryId: number | null) => void;
}

const CategoryTabsComponent: React.FC<CategoryTabsProps> = ({
  categories,
  selectedCategory,
  loading,
  onCategoryChange,
}) => {
  return (
    <div className="flex gap-2 overflow-x-auto scroll-px-4 snap-x snap-mandatory scrollbar-hide pb-1 px-4 pt-3">
      <button
        onClick={() => onCategoryChange(null)}
        disabled={loading}
        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors snap-start ${
          selectedCategory === null
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        All
      </button>
      {categories.map(category => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          disabled={loading}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors snap-start ${
            selectedCategory === category.id
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};

export const CategoryTabs = memo(CategoryTabsComponent);
