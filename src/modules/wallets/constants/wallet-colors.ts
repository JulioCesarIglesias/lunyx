export const walletColors = [
  { value: '#6B7280', label: 'Cinza' },
  { value: '#820AD1', label: 'Roxo' },
  { value: '#3B82F6', label: 'Azul' },
  { value: '#22C55E', label: 'Verde' },
  { value: '#F59E0B', label: 'Âmbar' },
  { value: '#EF4444', label: 'Vermelho' },
  { value: '#EC4899', label: 'Rosa' },
  { value: '#06B6D4', label: 'Ciano' },
  { value: '#8B5CF6', label: 'Violeta' },
  { value: '#111827', label: 'Grafite' },
] as const;

export const walletColorValues = walletColors.map((color) => color.value) as [
  (typeof walletColors)[number]['value'],
  ...(typeof walletColors)[number]['value'][],
];
