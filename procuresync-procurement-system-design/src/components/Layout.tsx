import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileText, CheckSquare, ShoppingCart, Scale, Package, DollarSign,
  Warehouse, Users, Bell, Shield, Settings, ChevronLeft, ChevronRight, Search,
  Menu, LogOut, X
} from 'lucide-react';
import { cn } from '../utils/cn';
import { users, currentUserId, roleLabels } from '../mockData';
import type { UserRole } from '../types';

const navItems: Record<UserRole, { icon: React.ReactNode; label: string; path: string }[]> = {
  requester: [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', path: '/dashboard' },
    { icon: <FileText className="w-5 h-5" />, label: 'My Requisitions', path: '/requisitions' },
    { icon: <Bell className="w-5 h-5" />, label: 'Notifications', path: '/notifications' },
    { icon: <Settings className="w-5 h-5" />, label: 'Settings', path: '/settings' },
  ],
  budget_holder: [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', path: '/dashboard' },
    { icon: <FileText className="w-5 h-5" />, label: 'Requisitions', path: '/requisitions' },
    { icon: <CheckSquare className="w-5 h-5" />, label: 'Approvals', path: '/approvals' },
    { icon: <ShoppingCart className="w-5 h-5" />, label: 'Purchase Orders', path: '/purchase-orders' },
    { icon: <Bell className="w-5 h-5" />, label: 'Notifications', path: '/notifications' },
    { icon: <Settings className="w-5 h-5" />, label: 'Settings', path: '/settings' },
  ],
  procurement: [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', path: '/dashboard' },
    { icon: <FileText className="w-5 h-5" />, label: 'Requisitions', path: '/requisitions' },
    { icon: <ShoppingCart className="w-5 h-5" />, label: 'RFQ Management', path: '/rfqs' },
    { icon: <Scale className="w-5 h-5" />, label: 'Bids Comparison', path: '/bids' },
    { icon: <Package className="w-5 h-5" />, label: 'Purchase Orders', path: '/purchase-orders' },
    { icon: <Users className="w-5 h-5" />, label: 'Suppliers', path: '/suppliers' },
    { icon: <Bell className="w-5 h-5" />, label: 'Notifications', path: '/notifications' },
    { icon: <Settings className="w-5 h-5" />, label: 'Settings', path: '/settings' },
  ],
  financial: [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', path: '/dashboard' },
    { icon: <ShoppingCart className="w-5 h-5" />, label: 'Purchase Orders', path: '/purchase-orders' },
    { icon: <DollarSign className="w-5 h-5" />, label: 'Financial Review', path: '/financial-review' },
    { icon: <Bell className="w-5 h-5" />, label: 'Notifications', path: '/notifications' },
    { icon: <Settings className="w-5 h-5" />, label: 'Settings', path: '/settings' },
  ],
  warehouse: [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', path: '/dashboard' },
    { icon: <Warehouse className="w-5 h-5" />, label: 'Goods Receipts', path: '/goods-receipts' },
    { icon: <Bell className="w-5 h-5" />, label: 'Notifications', path: '/notifications' },
    { icon: <Settings className="w-5 h-5" />, label: 'Settings', path: '/settings' },
  ],
  admin: [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', path: '/dashboard' },
    { icon: <FileText className="w-5 h-5" />, label: 'Requisitions', path: '/requisitions' },
    { icon: <CheckSquare className="w-5 h-5" />, label: 'Approvals', path: '/approvals' },
    { icon: <ShoppingCart className="w-5 h-5" />, label: 'RFQ Management', path: '/rfqs' },
    { icon: <Scale className="w-5 h-5" />, label: 'Bids Comparison', path: '/bids' },
    { icon: <Package className="w-5 h-5" />, label: 'Purchase Orders', path: '/purchase-orders' },
    { icon: <DollarSign className="w-5 h-5" />, label: 'Financial Review', path: '/financial-review' },
    { icon: <Warehouse className="w-5 h-5" />, label: 'Goods Receipts', path: '/goods-receipts' },
    { icon: <Users className="w-5 h-5" />, label: 'Suppliers', path: '/suppliers' },
    { icon: <Shield className="w-5 h-5" />, label: 'Audit Log', path: '/audit' },
    { icon: <Bell className="w-5 h-5" />, label: 'Notifications', path: '/notifications' },
    { icon: <Settings className="w-5 h-5" />, label: 'Settings', path: '/settings' },
  ],
};

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/requisitions': 'Requisitions',
  '/requisitions/new': 'Create Requisition',
  '/approvals': 'Pending Approvals',
  '/approvals/:id': 'Approval Detail',
  '/rfqs': 'RFQ Management',
  '/rfqs/new': 'Create RFQ',
  '/bids': 'Bids Comparison',
  '/purchase-orders': 'Purchase Orders',
  '/financial-review': 'Financial Review',
  '/goods-receipts': 'Goods Receipts',
  '/goods-receipts/new': 'Create Goods Receipt',
  '/suppliers': 'Supplier Directory',
  '/notifications': 'Notifications',
  '/audit': 'Audit Log',
  '/settings': 'Settings',
};

interface LayoutProps {
  children: React.ReactNode;
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export function Layout({ children, userRole, onRoleChange }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const currentUser = users.find(u => u.id === currentUserId) || users[0];
  const nav = navItems[userRole];
  const unreadCount = 4; // mock

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('');

  const handleNavClick = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-bg-deep">
      {/* Mobile overlay */}
      {mobileOpen && <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Sidebar */}
      <aside className={cn(
        'fixed md:relative z-50 h-full flex flex-col bg-bg-surface border-r border-border-default transition-all duration-300',
        collapsed ? 'w-20' : 'w-64',
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-border-default shrink-0">
          {collapsed ? (
            <div className="w-10 h-10 rounded-lg bg-accent-indigo flex items-center justify-center text-white font-bold text-sm mx-auto">PS</div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent-indigo flex items-center justify-center text-white font-bold text-sm">PS</div>
              <span className="text-lg font-bold text-text-primary">ProcureSync</span>
            </div>
          )}
          {/* Mobile close button */}
          <button className="md:hidden ml-auto text-text-muted hover:text-text-primary" onClick={() => setMobileOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role switcher (demo) */}
        {!collapsed && (
          <div className="px-4 pt-4 pb-2">
            <div className="bg-bg-surface-hover rounded-lg border border-border-default p-3">
              <p className="text-xs text-text-muted mb-2">Demo Role</p>
              <div className="flex flex-wrap gap-1.5">
                {(['requester', 'budget_holder', 'procurement', 'financial', 'warehouse', 'admin'] as UserRole[]).map(role => (
                  <button key={role} className={cn(
                    'px-2 py-1 rounded text-xs font-medium transition-all',
                    userRole === role ? 'bg-accent-indigo text-white' : 'bg-bg-deep text-text-muted hover:text-text-secondary'
                  )} onClick={() => { onRoleChange(role); navigate('/dashboard'); }}>
                    {roleLabels[role]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Nav links */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto space-y-1">
          {nav.map(item => (
            <button
              key={item.path}
              className={cn(
                'w-full flex items-center gap-3 rounded-lg transition-all duration-200 group',
                collapsed ? 'justify-center px-2 py-3' : 'px-3 py-2.5',
                location.pathname === item.path || location.pathname.startsWith(item.path + '/')
                  ? 'bg-accent-indigo/10 text-accent-indigo'
                  : 'text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary'
              )}
              onClick={() => handleNavClick(item.path)}
              title={collapsed ? item.label : undefined}
            >
              <span className={cn('shrink-0', location.pathname === item.path ? 'text-accent-indigo' : 'text-text-muted group-hover:text-text-secondary')}>{item.icon}</span>
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* User info */}
        <div className={cn('border-t border-border-default p-3 shrink-0', collapsed ? 'flex justify-center' : 'flex items-center gap-3')}>
          <div className="w-8 h-8 rounded-full bg-accent-violet/20 text-accent-violet flex items-center justify-center text-xs font-bold shrink-0">
            {getInitials(currentUser.name)}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{currentUser.name}</p>
              <p className="text-xs text-text-muted truncate">{roleLabels[currentUser.role]}</p>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button className={cn('hidden md:flex items-center justify-center py-3 border-t border-border-default text-text-muted hover:text-text-primary transition-colors', collapsed ? 'px-0' : 'px-4')} onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          {!collapsed && <span className="text-xs ml-2">Collapse</span>}
        </button>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 flex items-center gap-4 px-4 md:px-6 border-b border-border-default bg-bg-surface shrink-0">
          {/* Mobile menu toggle */}
          <button className="md:hidden text-text-secondary hover:text-text-primary" onClick={() => setMobileOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>

          {/* Page title */}
          <h2 className="text-base font-semibold text-text-primary hidden md:block">
            {pageTitles[location.pathname] || 'ProcureSync'}
          </h2>

          {/* Search */}
          <div className="flex-1 max-w-md ml-auto md:ml-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-bg-input border border-border-default text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo/30 transition-all"
              />
            </div>
          </div>

          {/* Notification bell */}
          <button className="relative p-2 text-text-secondary hover:text-text-primary transition-colors" onClick={() => navigate('/notifications')}>
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-accent-indigo text-white text-xs font-bold flex items-center justify-center">{unreadCount}</span>
            )}
          </button>

          {/* User menu */}
          <div className="relative">
            <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-bg-surface-hover transition-colors" onClick={() => setUserMenuOpen(!userMenuOpen)}>
              <div className="w-8 h-8 rounded-full bg-accent-violet/20 text-accent-violet flex items-center justify-center text-xs font-bold">
                {getInitials(currentUser.name)}
              </div>
              <span className="text-sm text-text-primary hidden md:block">{currentUser.name}</span>
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-bg-surface rounded-xl border border-border-default shadow-xl py-2 animate-fadeIn z-50">
                <div className="px-4 py-2 border-b border-border-default">
                  <p className="text-sm font-medium text-text-primary">{currentUser.name}</p>
                  <p className="text-xs text-text-muted">{currentUser.email}</p>
                </div>
                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary transition-colors" onClick={() => { navigate('/settings'); setUserMenuOpen(false); }}>
                  <Settings className="w-4 h-4" /> Settings
                </button>
                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary transition-colors" onClick={() => { navigate('/'); setUserMenuOpen(false); }}>
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
