import React from 'react';
import { useSelector } from 'react-redux';
import { Bell, Search, Menu, LogOut, User as UserIcon } from 'lucide-react';
import { RootState } from '../../store/store';
import { useAuth } from '../../hooks/useAuth';

export const Header: React.FC = () => {
  const currentPage = useSelector((state: RootState) => state.ui.currentPage);
  const { logout } = useAuth();

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-10 glass">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-slate-100">{currentPage}</h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="pl-9 pr-4 py-1.5 bg-slate-800/50 border border-slate-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-slate-200 placeholder-slate-500 w-64"
          />
        </div>

        <button className="relative text-slate-400 hover:text-slate-200 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
        </button>

        <div className="flex items-center gap-2 group relative">
          <button className="flex items-center gap-2 text-slate-300 hover:text-slate-100 transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right scale-95 group-hover:scale-100 py-1">
            <button className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700/50 flex items-center gap-2">
              <UserIcon className="w-4 h-4" /> Profile
            </button>
            <div className="h-px bg-slate-700 my-1"></div>
            <button 
              onClick={logout}
              className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-slate-700/50 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
