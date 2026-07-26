import React from 'react';
import {
  Bell,
  CheckSquare,
  DollarSign,
  FileText,
  LayoutDashboard,
  Package,
  Scale,
  Settings,
  Shield,
  ShoppingCart,
  Users,
  Warehouse,
} from 'lucide-react';
import { type Role } from '../../types';

export interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  /** Roles permitted to see the link and reach the route. Empty means everyone. */
  roles: Role[];
}

const ALL_ADMINS: Role[] = ['ADMIN', 'SYSTEM_ADMINISTRATOR'];

export const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
    roles: [],
  },
  {
    label: 'Requisitions',
    path: '/requisitions',
    icon: <FileText className="h-5 w-5" />,
    roles: ['REQUESTER', 'BUDGET_HOLDER', 'PROCUREMENT_OFFICER', ...ALL_ADMINS],
  },
  {
    label: 'Approvals',
    path: '/approvals',
    icon: <CheckSquare className="h-5 w-5" />,
    roles: ['BUDGET_HOLDER', ...ALL_ADMINS],
  },
  {
    label: 'RFQs',
    path: '/rfqs',
    icon: <ShoppingCart className="h-5 w-5" />,
    roles: ['PROCUREMENT_OFFICER', ...ALL_ADMINS],
  },
  {
    label: 'Bids',
    path: '/bids',
    icon: <Scale className="h-5 w-5" />,
    roles: ['PROCUREMENT_OFFICER', ...ALL_ADMINS],
  },
  {
    label: 'Purchase Orders',
    path: '/purchase-orders',
    icon: <Package className="h-5 w-5" />,
    roles: ['PROCUREMENT_OFFICER', 'BUDGET_HOLDER', 'FINANCIAL_REVIEWER', ...ALL_ADMINS],
  },
  {
    label: 'Financial Review',
    path: '/financial-review',
    icon: <DollarSign className="h-5 w-5" />,
    roles: ['FINANCIAL_REVIEWER', ...ALL_ADMINS],
  },
  {
    label: 'Goods Receipts',
    path: '/goods-receipts',
    icon: <Warehouse className="h-5 w-5" />,
    roles: ['WAREHOUSE_OFFICER', ...ALL_ADMINS],
  },
  {
    label: 'Suppliers',
    path: '/suppliers',
    icon: <Users className="h-5 w-5" />,
    roles: ['PROCUREMENT_OFFICER', ...ALL_ADMINS],
  },
  {
    label: 'Audit Log',
    path: '/audit-log',
    icon: <Shield className="h-5 w-5" />,
    roles: ALL_ADMINS,
  },
  {
    label: 'Notifications',
    path: '/notifications',
    icon: <Bell className="h-5 w-5" />,
    roles: [],
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: <Settings className="h-5 w-5" />,
    roles: [],
  },
];

export const isNavItemVisible = (item: NavItem, userRoles: Role[]): boolean =>
  item.roles.length === 0 || item.roles.some((role) => userRoles.includes(role));

/** Longest-prefix match so detail routes inherit their section's title. */
export const pageTitleFor = (pathname: string): string =>
  navItems
    .filter((item) => pathname === item.path || pathname.startsWith(`${item.path}/`))
    .sort((a, b) => b.path.length - a.path.length)[0]?.label ?? 'ProcureSync';
