import React from 'react';
import { Activity, Database, ExternalLink } from 'lucide-react';
import type { HealthResponse } from '../../types/api';

interface NavbarProps {
  health: HealthResponse | null;
  loading: boolean;
  onRefresh: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ health, loading, onRefresh }) => {
  const isDbConnected = health?.database_connected ?? false;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm">
            <span className="text-white font-black text-base tracking-tighter">CX</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-slate-900">CAREERX</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-medium">
                Enterprise AI
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Evidence-Grounded Job Readiness Intelligence</p>
          </div>
        </div>

        {/* System Status & Quick Links */}
        <div className="flex items-center gap-3">
          <a
            href="http://127.0.0.1:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-xs font-medium text-slate-700 transition-all"
          >
            <span>API Docs</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          {/* Health Status Pill */}
          <button
            onClick={onRefresh}
            disabled={loading}
            title="Click to re-ping API health"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-600 transition-all cursor-pointer disabled:opacity-50"
          >
            <Activity className={`w-3.5 h-3.5 text-indigo-600 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-slate-500">API:</span>
            <span className="flex items-center gap-1.5 font-semibold text-slate-800">
              <span
                className={`w-2 h-2 rounded-full ${
                  health ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-amber-400'
                }`}
              />
              {health ? 'Operational' : 'Connecting...'}
            </span>
          </button>

          {/* Database Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500">
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span>MongoDB:</span>
            <span
              className={`font-semibold ${
                isDbConnected ? 'text-emerald-700' : 'text-amber-600'
              }`}
            >
              {isDbConnected ? 'Connected' : 'Offline'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
