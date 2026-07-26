import React from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '../../lib/cn';
import { type RootState } from '../../store/store';
import { toggleSidebar } from '../../store/slices/uiSlice';
import { useAuth } from '../../hooks/useAuth';
import { displayName, formatRole, initials, roleNames } from '../../lib/user';
import { isNavItemVisible, navItems } from './navigation';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const dispatch = useDispatch();
  const collapsed = useSelector((state: RootState) => state.ui.sidebarCollapsed);
  const { user } = useAuth();
  const userRoles = roleNames(user);
  const visibleItems = navItems.filter((item) => isNavItemVisible(item, userRoles));

  return (
    <aside
      className={cn(
        'fixed z-50 flex h-full flex-col border-r border-border-default bg-bg-surface',
        'transition-all duration-300 md:relative',
        collapsed ? 'w-20' : 'w-64',
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      )}
    >
      <div className="flex h-16 shrink-0 items-center border-b border-border-default px-4">
        <div className={cn('flex items-center gap-3', collapsed && 'mx-auto')}>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-indigo text-sm font-bold text-white">
            PS
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-text-primary">ProcureSync</span>
          )}
        </div>
        <button
          type="button"
          aria-label="Close navigation"
          className="ml-auto text-text-muted hover:text-text-primary md:hidden"
          onClick={onCloseMobile}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav aria-label="Main" className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onCloseMobile}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              cn(
                'group flex w-full items-center gap-3 rounded-lg transition-all duration-200',
                collapsed ? 'justify-center px-2 py-3' : 'px-3 py-2.5',
                isActive
                  ? 'bg-accent-indigo/10 text-accent-indigo'
                  : 'text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary',
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'shrink-0',
                    isActive
                      ? 'text-accent-indigo'
                      : 'text-text-muted group-hover:text-text-secondary',
                  )}
                >
                  {item.icon}
                </span>
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div
        className={cn(
          'shrink-0 border-t border-border-default p-3',
          collapsed ? 'flex justify-center' : 'flex items-center gap-3',
        )}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-violet/20 text-xs font-bold text-accent-violet">
          {initials(user)}
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-text-primary">{displayName(user)}</p>
            <p className="truncate text-xs text-text-muted">{formatRole(userRoles[0])}</p>
          </div>
        )}
      </div>

      <button
        type="button"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="hidden items-center justify-center border-t border-border-default py-3 text-text-muted transition-colors hover:text-text-primary md:flex"
        onClick={() => dispatch(toggleSidebar())}
      >
        {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        {!collapsed && <span className="ml-2 text-xs">Collapse</span>}
      </button>
    </aside>
  );
};
