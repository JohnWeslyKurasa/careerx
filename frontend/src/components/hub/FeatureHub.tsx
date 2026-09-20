import React from 'react';
import {
  BarChart3,
  Search,
  GraduationCap,
  Award,
  Brain,
  Zap,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Code2,
  Cpu,
  Layers,
  ShieldCheck,
  Target,
} from 'lucide-react';

interface FeatureHubProps {
  onSelectFeature: (feature: 'jrs' | 'rag' | 'edupath' | 'architecture' | 'interview') => void;
  onSelectBenchmark: (company: string) => void;
}

export const FeatureHub: React.FC<FeatureHubProps> = ({
  onSelectFeature,
  onSelectBenchmark,
}) => {
  const FEATURES = [
    {
      id: 'jrs' as const,
      number: '01',
      badge: 'STUDIO & SCORING',
      title: 'Skill Gap Studio & JRS Engine',
      icon: BarChart3,
      tagline: 'Deterministic mathematical Job Readiness Score ($JRS$) & critical gap audit',
      description:
        'Upload candidate resumes or GitHub profiles, decompose job descriptions into weighted requirement vectors, and compute zero-hallucination readiness scores.',
      agenticHighlights: [
        'Multi-Tier Claim-to-Evidence Ingestion',
        'Mathematical Readiness Formula: S_j = Sim(R_j, E_j) x C_j',
        'Automated Missing Requirement Penalties',
      ],
      color: 'border-amber-500 hover:border-amber-600 bg-gradient-to-b from-white to-amber-50/30',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    },
    {
      id: 'rag' as const,
      number: '02',
      badge: 'SEARCH & LINEAGE',
      title: 'Proof & Evidence RAG Search Engine',
      icon: Search,
      tagline: 'Hybrid vector search engine (Dense SBERT + BM25 + Cross-Encoder Rerank)',
      description:
        'Semantic vector engine capable of surfacing verbatim code lineages, AST node proofs, and repository commits that satisfy enterprise hiring bars.',
      agenticHighlights: [
        '384-dim Dense SBERT + Sparse BM25 Fusion',
        'Cross-Encoder Reranker (ms-marco-MiniLM-L-6-v2)',
        'AST & Git Commit Lineage Provenance',
      ],
      color: 'border-indigo-500 hover:border-indigo-600 bg-gradient-to-b from-white to-indigo-50/30',
      badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    },
    {
      id: 'edupath' as const,
      number: '03',
      badge: 'AUTONOMOUS ROADMAP',
      title: 'EduPath AI Learning Agent & Sprints',
      icon: GraduationCap,
      tagline: 'Dynamic 4-week adaptive learning sprints, code sandboxes & AI tutor',
      description:
        'Autonomous technical coach that structures actionable learning sprints tailored to your specific gap profile, complete with interactive AI Q&A assistant.',
      agenticHighlights: [
        'Adaptive 4-Week Sprint Generation',
        'Interactive AI Q&A Tutor Chatbot',
        'Periodic Progress & Skill Acquisition Reports',
      ],
      color: 'border-emerald-500 hover:border-emerald-600 bg-gradient-to-b from-white to-emerald-50/30',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    },
    {
      id: 'architecture' as const,
      number: '04',
      badge: 'ENTERPRISE MESH',
      title: 'Master Engineering Mesh & Architecture',
      icon: Award,
      tagline: 'Calibrated L5 Senior / L6 Staff engineering ladders & 17-Phase spec',
      description:
        'Continuous calibration with public and enterprise engineering rubrics mapping distributed consensus, reliability, and microservice governance.',
      agenticHighlights: [
        'Calibrated against Stripe, Datadog & Cloudflare Bars',
        '17-Phase Clean Architecture Blueprint Specs',
        'Zero-Trust Security & Privacy Defense Protocol',
      ],
      color: 'border-orange-500 hover:border-orange-600 bg-gradient-to-b from-white to-orange-50/30',
      badgeColor: 'bg-orange-100 text-orange-900 border-orange-300',
    },
    {
      id: 'interview' as const,
      number: '05',
      badge: 'STATEFUL AI AGENT',
      title: 'LangGraph Technical Interview Evaluator',
      icon: Brain,
      tagline: 'Stateful LangGraph agent conducting system design & coding interviews',
      description:
        'Simulates rigorous L5/L6 staff engineering interviews with real-time thought trace streams, trade-off matrix evaluation, and probing follow-up questions.',
      agenticHighlights: [
        'Stateful LangGraph Evaluation Nodes',
        'Real-time Agent Thought Trace Stream',
        'Automated Architecture Rubric Scoring',
      ],
      color: 'border-purple-500 hover:border-purple-600 bg-gradient-to-b from-white to-purple-50/30',
      badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Header Overview Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-500/15 via-amber-100/40 to-orange-500/10 border border-amber-300/80 p-8 sm:p-10 space-y-4 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-amber-300 text-amber-900 text-xs font-bold shadow-sm">
              <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
              <span>CAREERX FEATURE DIRECTORY</span>
              <span className="text-amber-700 font-normal">• Select a Workspace Page to Launch</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Explore Available Platform Features & AI Agents
            </h1>
            <p className="text-slate-600 text-sm font-medium leading-relaxed">
              Every feature operates on hard evidence provenance, vector RAG retrieval, and deterministic scoring. Select any workspace tile below to navigate directly to its dedicated agentic page.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-amber-200/80 shadow-md shrink-0">
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-base shadow-sm">
              5
            </div>
            <div>
              <span className="text-xs font-extrabold text-slate-900 block">Agentic Workspaces</span>
              <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> All Workspaces Unlocked
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Tiles Grid (2-3 Cols) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-600" />
            Dedicated Feature Pages & Agentic Modules
          </h2>
          <span className="text-xs font-bold text-slate-500">
            Click any tile to enter the full page
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                onClick={() => onSelectFeature(feat.id)}
                className={`group rounded-3xl border-2 p-6 sm:p-7 space-y-5 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between ${feat.color}`}
              >
                <div className="space-y-4">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${feat.badgeColor}`}>
                      {feat.number} // {feat.badge}
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-900 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-slate-950 group-hover:border-amber-500 transition-all shadow-sm">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Title & Tagline */}
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-slate-900 group-hover:text-amber-800 transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-xs font-bold text-amber-700">
                      {feat.tagline}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {feat.description}
                  </p>

                  {/* Agentic Capability Bullet Points */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                      Agentic Capabilities:
                    </span>
                    <ul className="space-y-1 text-xs text-slate-700 font-medium">
                      {feat.agenticHighlights.map((hl, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{hl}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Bottom CTA Button */}
                <div className="pt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectFeature(feat.id);
                    }}
                    className="w-full btn-gold py-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm group-hover:scale-102 transition-transform cursor-pointer"
                  >
                    <span>Open {feat.title.split(' ')[0]} Page</span>
                    <ArrowRight className="w-4 h-4 text-slate-950" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Enterprise Company Benchmark Preset Launcher Bar */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              Instant Enterprise Benchmark Preset Launcher
            </h3>
            <p className="text-xs text-slate-500">
              Run real-time diagnostics calibrated against senior engineering benchmarks at top tech companies.
            </p>
          </div>
          <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            L5/L6 Senior Bars
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { company: 'STRIPE', role: 'Staff Payments Infra (L6)', icon: '💳' },
            { company: 'DATADOG', role: 'Telemetry Engineer (L6)', icon: '📊' },
            { company: 'CLOUDFLARE', role: 'Edge Systems Engineer (L5)', icon: '🌐' },
            { company: 'OPENAI', role: 'LLM Infra Engineer (L6)', icon: '🧠' },
          ].map((item) => (
            <button
              key={item.company}
              onClick={() => onSelectBenchmark(item.company)}
              className="p-3.5 rounded-xl border border-slate-200 bg-[#FAF8F5] hover:bg-amber-50 hover:border-amber-300 text-left transition-all cursor-pointer group shadow-sm"
            >
              <div className="flex items-center justify-between text-xs font-black text-slate-900 group-hover:text-amber-800">
                <span>{item.icon} {item.company}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium truncate">
                {item.role}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
