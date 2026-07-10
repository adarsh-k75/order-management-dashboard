import React from 'react';
import { authService } from '../services/authService';

export const Navbar = ({ wsConnected = false }) => {
  const username = typeof window !== 'undefined' ? (authService.getUsername() || 'Admin') : 'Admin';

  const handleLogout = () => {
    authService.logout();
  };

  return (
    <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Brand Logo matching Finpay Aesthetics */}
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6 text-teal-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
          </svg>
          <span className="font-bold text-lg text-slate-800 tracking-tight">
            Finpay <span className="text-teal-600 font-medium text-sm">Dashboard</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Live Status indicator */}
        <div className="flex items-center gap-2 text-xs font-medium">
          <span className={`w-2.5 h-2.5 rounded-full ${wsConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`} />
          <span className="text-slate-500">
            {wsConnected ? 'Live Connection Sync' : 'Reconnecting Sync...'}
          </span>
        </div>

        {/* User profile & Action */}
        <div className="flex items-center gap-3 border-l border-slate-100 pl-6">
          <div className="flex flex-col text-right">
            <span className="text-sm font-semibold text-slate-800">{username}</span>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Administrator</span>
          </div>
          
          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all duration-200"
            title="Log Out"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};
