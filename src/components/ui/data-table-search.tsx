"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

interface DataTableSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function DataTableSearch({ value, onChange }: DataTableSearchProps) {
  return (
    <div className="relative">
      <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />

      <Input
        placeholder="Pesquisar..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-[250px] pl-8"
      />
    </div>
  );
}
