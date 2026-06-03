'use client';

import { useMemo, useState } from 'react';

import { CategoryWithSummary } from '../types/category-with-summary';
import CategoryCard from './category-card';
import CategorySearch from './category-search';

interface CategoriesListProps {
  categories: CategoryWithSummary[];
}

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export default function CategoriesList({ categories }: CategoriesListProps) {
  const [search, setSearch] = useState('');

  const filteredCategories = useMemo(() => {
    return [...categories].filter((category) =>
      normalize(category.name).includes(normalize(search)),
    );
  }, [categories, search]);

  return (
    <div className="space-y-6">
      <CategorySearch value={search} onChange={setSearch} />

      {filteredCategories.length === 0 ? (
        <div className="flex justify-center py-16">
          <p className="text-muted-foreground">Nenhuma categoria encontrada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredCategories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      )}
    </div>
  );
}
