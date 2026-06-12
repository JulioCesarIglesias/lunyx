import { LayoutDashboard, ReceiptText, Tags, Wallet } from 'lucide-react';

export const navigationItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/transactions',
    label: 'Transações',
    icon: ReceiptText,
  },
  {
    href: '/wallets',
    label: 'Carteiras',
    icon: Wallet,
  },
  {
    href: '/categories',
    label: 'Categorias',
    icon: Tags,
  },
];
