import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, LogOut, Menu, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { displayName, initials } from '../../lib/user';
import { useGetUnreadCountQuery } from '../../store/api/notificationsApi';
import { pageTitleFor } from './navigation';

interface HeaderProps {
  onOpenMobileNav: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileNav }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { data: unreadCount = 0 } = useGetUnreadCountQuery();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [menuOpen]);

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border-default bg-bg-surface px-4 md:px-6">
      <button
        type="button"
        aria-label="Open navigation"
        className="text-text-secondary hover:text-text-primary md:hidden"
        onClick={onOpenMobileNav}
      >
        <Menu className="h-6 w-6" />
      </button>

      <h2 className="text-base font-semibold text-text-primary">
        {pageTitleFor(location.pathname)}
      </h2>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate('/notifications')}
          aria-label={
            unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'
          }
          className="relative p-2 text-text-secondary transition-colors hover:text-text-primary"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-indigo px-1 text-[10px] font-bold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-bg-surface-hover"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-violet/20 text-xs font-bold text-accent-violet">
              {initials(user)}
            </span>
            <span className="hidden text-sm text-text-primary md:block">{displayName(user)}</span>
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="animate-fadeIn absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-border-default bg-bg-surface py-2 shadow-xl"
            >
              <div className="border-b border-border-default px-4 py-2">
                <p className="text-sm font-medium text-text-primary">{displayName(user)}</p>
                <p className="truncate text-xs text-text-muted">{user?.email}</p>
              </div>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  navigate('/settings');
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-surface-hover hover:text-text-primary"
              >
                <Settings className="h-4 w-4" /> Settings
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={logout}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-danger transition-colors hover:bg-bg-surface-hover"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
