import React from 'react';
import { Search, X, Flame, Sparkles, Package, Layers, Utensils } from 'lucide-react';
import { ProductCategory } from '../types';

export type CategoryFilterType = 'all' | ProductCategory;

interface CategoryFilterProps {
  selectedCategory: CategoryFilterType;
  onSelectCategory: (category: CategoryFilterType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalProductsCount: number;
  dealsCount: number;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  totalProductsCount,
  dealsCount,
}) => {
  const categories: {
    id: CategoryFilterType;
    label: string;
    icon: React.ReactNode;
    badge?: number | string;
    isHighlight?: boolean;
  }[] = [
    {
      id: 'all',
      label: 'الكل',
      icon: <Layers className="w-4 h-4" />,
      badge: totalProductsCount,
    },
    {
      id: 'weekly-deals',
      label: 'عروض التوفير الأسبوعية 🔥',
      icon: <Flame className="w-4 h-4 text-orange-500" />,
      badge: dealsCount > 0 ? `${dealsCount} عروض` : undefined,
      isHighlight: true,
    },
    {
      id: 'restaurant-bulk',
      label: 'عبوات المطاعم والكريب (جرادل وجراكن)',
      icon: <Utensils className="w-4 h-4" />,
    },
    {
      id: 'sauces',
      label: 'الصوصات والكاتشب والمايونيز',
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      id: 'pickles',
      label: 'الزيتون والمخللات',
      icon: <Package className="w-4 h-4" />,
    },
  ];

  return (
    <div className="sticky top-[73px] sm:top-[85px] z-30 bg-slate-50/95 backdrop-blur-md py-3 -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-slate-200/80 mb-5">
      {/* Search Input Bar */}
      <div className="relative mb-3">
        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="ابحث بالاسم أو العبوة (مثال: مايونيز، زيتون، شيدر، جردل، كرتونة)..."
          className="w-full bg-white text-slate-800 placeholder-slate-400 text-xs sm:text-sm rounded-xl pr-10 pl-9 py-2.5 sm:py-3 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 shadow-sm transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
            title="مسح البحث"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Horizontal Sticky Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs sm:text-sm font-semibold select-none">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all duration-150 flex-shrink-0 active:scale-95 ${
                isActive
                  ? cat.isHighlight
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-orange-500/25 ring-2 ring-orange-400'
                    : 'bg-brand-700 text-white shadow-md shadow-brand-700/20 ring-2 ring-brand-600'
                  : cat.isHighlight
                  ? 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100/80'
                  : 'bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className={isActive ? 'text-white' : ''}>{cat.icon}</span>
              <span>{cat.label}</span>
              {cat.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : cat.isHighlight
                      ? 'bg-amber-200/80 text-amber-900'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {cat.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

