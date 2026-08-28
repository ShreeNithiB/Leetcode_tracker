import React, { useState, useRef, useEffect } from 'react';
import { 
  GraduationCap, 
  RefreshCw, 
  ShieldCheck, 
  Download, 
  Activity,
  Layers,
  LogOut,
  User,
  KeyRound,
  ChevronDown
} from 'lucide-react';
import { BatchFetchProgress, AuthUser } from '../types';

interface HeaderProps {
  onOpenBatchSync: () => void;
  onOpenPrivacy: () => void;
  batchProgress?: BatchFetchProgress;
  onRefreshCurrentView?: () => void;
  isRefreshing?: boolean;
  user?: AuthUser;
  onLogout?: () => void;
  onOpenChangePassword?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenBatchSync,
  onOpenPrivacy,
  batchProgress,
  onRefreshCurrentView,
  isRefreshing,
  user,
  onLogout,
  onOpenChangePassword,
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <header className="h-14 bg-white border-b border-slate-200 text-slate-800 sticky top-0 z-30 flex items-center px-4 sm:px-6 shadow-2xs">
      <div className="w-full mx-auto flex items-center justify-between">
        
        {/* Institution & Dept branding */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-xs">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div className="flex items-center space-x-2">
            <h1 className="text-sm font-bold text-slate-800 tracking-tight leading-tight">
              {user?.role === 'student' ? 'Student Dashboard' : 'Faculty Dashboard'}
            </h1>
            <div className="hidden sm:flex items-center space-x-1.5">
              <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-semibold text-slate-600 border border-slate-200">
                CSBS • AY 2024-25
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                KGiSL Institute of Technology
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {batchProgress?.is_running && (
            <button
              onClick={onOpenBatchSync}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse hover:bg-amber-100 transition-colors"
            >
              <Activity className="w-3.5 h-3.5 animate-spin" />
              <span>Syncing ({batchProgress.processed}/{batchProgress.total})</span>
            </button>
          )}

          {onRefreshCurrentView && (
            <button
              onClick={onRefreshCurrentView}
              disabled={isRefreshing}
              className="p-1.5 text-slate-500 hover:text-slate-700 rounded-md hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              title="Refresh Dashboard Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          )}

          <button
            onClick={onOpenBatchSync}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all cursor-pointer"
            title="Synchronize public LeetCode profiles"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${batchProgress?.is_running ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Fetch All Data</span>
            <span className="sm:hidden">Fetch</span>
          </button>

          <a
            href="/api/reports/excel"
            download="CSBS_LeetCode_Master_Report.xlsx"
            className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 shadow-2xs transition-all"
            title="Download 9-Sheet Excel Master Report"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export XLS</span>
          </a>

          <button
            onClick={onOpenPrivacy}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
            title="Data Privacy & Compliance Notice"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>

          {user && onLogout && (
            <div className="relative flex items-center pl-2 ml-2 border-l border-slate-200" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold uppercase shrink-0">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-bold text-slate-700 leading-tight">{user.name}</span>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{user.role}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileOpen && (
                <div className="absolute top-full mt-2 right-0 w-64 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  <div className="p-4 border-b border-slate-100 bg-slate-50">
                    <p className="font-bold text-slate-800">{user.name}</p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{user.username}</span>
                    </p>
                    <span className="inline-block mt-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded uppercase tracking-wider">
                      {user.role}
                    </span>
                  </div>
                  
                  <div className="p-2">
                    {onOpenChangePassword && (
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          onOpenChangePassword();
                        }}
                        className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <KeyRound className="w-4 h-4" />
                        <span>Change Password</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
