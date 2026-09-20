import React, { useState } from 'react';
import { Sparkles, Zap, User, X, Check } from 'lucide-react';

interface NavbarProps {
  activeTab: 'hub' | 'jrs' | 'rag' | 'edupath' | 'architecture' | 'interview';
  setActiveTab: (tab: 'hub' | 'jrs' | 'rag' | 'edupath' | 'architecture' | 'interview') => void;
  onLaunchDiagnostic?: () => void;
  isStarted?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onLaunchDiagnostic, isStarted = false }) => {
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [email, setEmail] = useState('');

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSignedIn(true);
      setShowSignInModal(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#FAF8F5]/90 border-b border-amber-900/10 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo - Click to go to Feature Hub */}
          <div
            onClick={() => setActiveTab('hub')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-sm group-hover:bg-amber-500/20 transition-all">
              <span className="text-amber-700 font-black text-xs tracking-tighter">CX</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-slate-900">CAREERX</span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-100/80 text-amber-800 border border-amber-300/60 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                EduPath AI Agent
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 text-xs font-semibold text-slate-600">
            <button
              onClick={() => setActiveTab('hub')}
              className={`px-3 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'hub' ? 'text-amber-700 bg-amber-50 border border-amber-200/80 font-bold' : 'hover:text-slate-900'
              }`}
            >
              Feature Hub
            </button>
            <button
              onClick={() => setActiveTab('jrs')}
              className={`px-3 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'jrs' ? 'text-amber-700 bg-amber-50 border border-amber-200/80 font-bold' : 'hover:text-slate-900'
              }`}
            >
              Skill Gap Studio
            </button>
            <button
              onClick={() => setActiveTab('rag')}
              className={`px-3 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'rag' ? 'text-amber-700 bg-amber-50 border border-amber-200/80 font-bold' : 'hover:text-slate-900'
              }`}
            >
              Proof Search
            </button>
            <button
              onClick={() => setActiveTab('edupath')}
              className={`px-3 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'edupath' ? 'text-amber-700 bg-amber-50 border border-amber-200/80 font-bold' : 'hover:text-slate-900'
              }`}
            >
              AI Roadmap
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-3 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'architecture' ? 'text-amber-700 bg-amber-50 border border-amber-200/80 font-bold' : 'hover:text-slate-900'
              }`}
            >
              Enterprise Mesh
            </button>
            <button
              onClick={() => setActiveTab('interview')}
              className={`px-3 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'interview' ? 'text-amber-700 bg-amber-50 border border-amber-200/80 font-bold' : 'hover:text-slate-900'
              }`}
            >
              AI Interview Agent
            </button>
          </nav>

          {/* Actions & CTA */}
          <div className="flex items-center gap-3">
            {signedIn ? (
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-600" /> Signed In
              </span>
            ) : (
              <button
                onClick={() => setShowSignInModal(true)}
                className="hidden sm:block text-xs font-bold text-slate-700 hover:text-slate-900 px-2 py-1 cursor-pointer"
              >
                Sign In
              </button>
            )}

            {/* Launch AI Diagnostic Button - Rendered ONLY on Hero page (!isStarted) */}
            {!isStarted && (
              <button
                onClick={onLaunchDiagnostic}
                className="btn-gold px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span>Launch AI Diagnostic</span>
                <Zap className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Interactive Sign In Modal */}
      {showSignInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-sm w-full space-y-4 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowSignInModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-900 font-extrabold flex items-center justify-center text-xs">
                CX
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Sign In to CAREERX</h3>
              <p className="text-xs text-slate-500">Access your saved EduPath learning roadmaps and candidate evidence memory.</p>
            </div>

            <form onSubmit={handleSignInSubmit} className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.chen@example.com"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50"
                />
              </div>

              <button
                type="submit"
                className="btn-gold w-full py-2.5 rounded-xl text-xs font-bold cursor-pointer shadow-sm"
              >
                Continue with Email
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
