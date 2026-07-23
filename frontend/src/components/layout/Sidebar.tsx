import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  FileBox, 
  Gavel, 
  ShoppingCart, 
  PackageCheck, 
  ClipboardList, 
  Settings 
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { type RootState } from '../../store/store';
import { toggleSidebar } from '../../store/slices/uiSlice';
import { useAuth } from '../../hooks/useAuth';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { name: 'Requisitions', icon: FileText, path: '/requisitions' },
  { name: 'Suppliers', icon: Users, path: '/suppliers' },
  { name: 'RFQs', icon: FileBox, path: '/rfqs' },
  { name: 'Bids', icon: Gavel, path: '/bids' },
  { name: 'Purchase Orders', icon: ShoppingCart, path: '/purchase-orders' },
  { name: 'Goods Receipts', icon: PackageCheck, path: '/goods-receipts' },
  { name: 'Audit Log', icon: ClipboardList, path: '/audit-log' },
  { name: 'Settings', icon: Settings, path: '/settings' },
];

export const Sidebar: React.FC = () => {
  const collapsed = useSelector((state: RootState) => state.ui.sidebarCollapsed);
  const dispatch = useDispatch();
  const { user } = useAuth();

  return (
    <aside
      className={cn(
        "bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col transition-all duration-300 relative glass",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="h-16 flex items-center justify-center border-b border-slate-800">
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">
          {collapsed ? 'PMP' : 'ProcureSync'}
        </span>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto space-y-1 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                isActive 
                  ? "bg-indigo-600/20 text-indigo-400" 
                  : "hover:bg-slate-800/50 hover:text-slate-100"
              )
            }
          >
            <item.icon className={cn("shrink-0", collapsed ? "mx-auto" : "mr-3", "w-5 h-5")} />
            {!collapsed && <span className="font-medium text-sm">{item.name}</span>}
            {collapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none z-50 whitespace-nowrap border border-slate-700">
                {item.name}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 flex items-center cursor-pointer hover:bg-slate-800/50 transition-colors" onClick={() => dispatch(toggleSidebar())}>
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold shrink-0">
          {user?.name?.charAt(0) || 'U'}
        </div>
        {!collapsed && (
          <div className="ml-3 overflow-hidden">
            <p className="text-sm font-medium text-slate-200 truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-slate-500 truncate">{user?.role || 'Role'}</p>
          </div>
        )}
      </div>
    </aside>
  );
};
