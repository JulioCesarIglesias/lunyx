'use client';

import { Search } from 'lucide-react';

import { Input } from '@/components/ui/input';

interface CategorySearchProps {
  value: string;
  onChange: (value: string) => void;
}

const CategorySearch = ({ value, onChange }: CategorySearchProps) => {
  return (
    <div className="w-full md:max-w-sm lg:max-w-md">
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />

        <Input
          placeholder="Pesquisar categoria..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
};

export default CategorySearch;
