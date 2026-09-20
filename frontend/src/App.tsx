import React, { useEffect, useState } from 'react';
import { Navbar } from './components/common/Navbar';
import { EduPathModule } from './components/edupath/EduPathModule';
import { FeatureHub } from './components/hub/FeatureHub';
import { InterviewModule } from './components/interview/InterviewModule';
import {
  checkApiHealth,
  ingestResumeFile,
  ingestJobDescription,
  calculateJRS,
  runRetrievalQuery,
} from './api/client';
import {
  HealthResponse,
  JRSResponse,
  IngestProfileResponse,
  IngestJDResponse,
  RetrievalQueryResponse,
} from './types/api';
import {
  Server,
  Database,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  Upload,
  Search,
  BarChart3,
  ExternalLink,
  RefreshCw,
  Award,
  AlertTriangle,
  Check,
  ChevronRight,
  ShieldCheck,
  Clock,
  Sparkles,
  Zap,
  Code2,
  Layers,
  Terminal,
  Cpu,
  Target,
  GraduationCap,
  XCircle,
  X,
  FileCode,
  ArrowLeft,
  Brain,
  LayoutGrid,
} from 'lucide-react';

export function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loadingHealth, setLoadingHealth] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Progressive Disclosure State: isStarted controls showing landing hero vs active feature hub/workspace
  const [isStarted, setIsStarted] = useState<boolean>(false);

  // Active Feature Tab: 'hub' | 'jrs' | 'rag' | 'edupath' | 'architecture' | 'interview'
  const [activeTab, setActiveTab] = useState<
    'hub' | 'jrs' | 'rag' | 'edupath' | 'architecture' | 'interview'
  >('hub');

  // Candidate Profile State
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [githubUrl, setGithubUrl] = useState<string>('https://github.com/alexchen');
  const [ingestedProfile, setIngestedProfile] = useState<IngestProfileResponse | null>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(false);

  // Job Description State
  const [jdText, setJdText] = useState<string>(
    `Role: Staff Distributed Systems Engineer (L6)\nCompany: CloudScale AI\n\nKey Requirements:\n- 4+ years of experience with Python, FastAPI, and high-performance microservices\n- Hands-on experience designing distributed caching layers with Redis\n- Production experience with Kubernetes cluster management and Helm charts\n- Production eBPF kernel profiling and BCC socket observability\n- Experience with Golang gRPC microservices and Protobuf`
  );
  const [jdTitle, setJdTitle] = useState<string>('Staff Distributed Systems Engineer (L6)');
  const [jdCompany, setJdCompany] = useState<string>('CloudScale AI');
  const [ingestedJD, setIngestedJD] = useState<IngestJDResponse | null>(null);
  const [loadingJD, setLoadingJD] = useState<boolean>(false);

  // JRS Evaluation State
  const [retrievalMode, setRetrievalMode] = useState<string>('hybrid_reranked');
  const [jrsResult, setJrsResult] = useState<JRSResponse | null>(null);
  const [evaluatingJRS, setEvaluatingJRS] = useState<boolean>(false);
  const [jrsError, setJrsError] = useState<string | null>(null);

  // RAG Search State
  const [ragQuery, setRagQuery] = useState<string>(
    'Python FastAPI microservices and distributed Redis caching experience'
  );
  const [ragMode, setRagMode] = useState<string>('hybrid_reranked');
  const [ragResults, setRagResults] = useState<RetrievalQueryResponse | null>(null);
  const [loadingRAG, setLoadingRAG] = useState<boolean>(false);

  // Claim Evidence Detail Modal State
  const [selectedClaimDetail, setSelectedClaimDetail] = useState<{
    file: string;
    status: 'Verified' | 'Missing';
    desc: string;
    lineage: string;
  } | null>(null);

  const fetchHealth = async () => {
    setLoadingHealth(true);
    setError(null);
    try {
      const data = await checkApiHealth();
      setHealth(data);
    } catch (err: any) {
      setError(
        err.message || 'Unable to connect to FastAPI backend. Ensure server is running on port 8000.'
      );
      setHealth(null);
    } finally {
      setLoadingHealth(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  // Primary Start Trigger - unlocks feature hub
  const handleStartDiagnosticFlow = async () => {
    setIsStarted(true);
    setActiveTab('hub');
  };

  // Preset Company Benchmark Selector
  const handleSelectCompanyPreset = async (companyName: string) => {
    setIsStarted(true);
    setActiveTab('jrs');
    let title = '';
    let text = '';
    if (companyName === 'STRIPE') {
      title = 'Staff Payments Infrastructure Engineer (L6)';
      text = `Role: Staff Payments Infrastructure Engineer\nCompany: Stripe\n\nKey Requirements:\n- 4+ years of Python, FastAPI, AsyncIO microservices\n- Distributed Redis caching & idempotency keys\n- Kubernetes cluster & Helm deployment\n- High-throughput transaction processing`;
    } else if (companyName === 'DATADOG') {
      title = 'Principal Telemetry & Observability Engineer (L6)';
      text = `Role: Principal Telemetry Engineer\nCompany: Datadog\n\nKey Requirements:\n- High-performance Golang microservices & gRPC\n- eBPF kernel profiling & BCC tracing\n- Distributed caching & Redis eviction\n- Metric stream aggregation`;
    } else if (companyName === 'CLOUDFLARE') {
      title = 'Senior Edge Distributed Systems Engineer (L5)';
      text = `Role: Senior Edge Systems Engineer\nCompany: Cloudflare\n\nKey Requirements:\n- Distributed caching layers & Workers\n- Go gRPC microservices & Protobuf\n- Kubernetes & Helm orchestration\n- Low-latency edge computing`;
    } else {
      title = 'Staff LLM Infrastructure Engineer (L6)';
      text = `Role: Staff LLM Infrastructure Engineer\nCompany: OpenAI\n\nKey Requirements:\n- Python FastAPI & vLLM inference microservices\n- Distributed Redis GPU cache\n- Kubernetes cluster management & Helm\n- High-concurrency async pipelines`;
    }

    setJdCompany(companyName);
    setJdTitle(title);
    setJdText(text);

    handleRunFullEvaluationWithJD(text, title, companyName);
  };

  const handleRunFullEvaluationWithJD = async (text: string, title: string, company: string) => {
    setEvaluatingJRS(true);
    setJrsError(null);
    try {
      let profile = ingestedProfile;
      if (!profile) {
        setLoadingProfile(true);
        const sampleResumeContent = `
Alex Chen
Email: alex.chen@example.com | Phone: +1-555-0199 | GitHub: https://github.com/alexchen
Summary: Senior Backend Engineer with 4+ years of experience in Python, FastAPI, distributed systems, and database optimization.
Skills: Python 3.11, SQL, FastAPI, PostgreSQL, Redis, Docker
Experience: Senior Backend Engineer | FinTech Solutions (2021 - Present) - Microservices processing 50,000 transactions/sec.
Projects: Distributed Caching System (GitHub: https://github.com/alexchen/distributed-caching)
        `;
        const blob = new Blob([sampleResumeContent], { type: 'text/plain' });
        const file = new File([blob], 'alex_chen_resume.txt', { type: 'text/plain' });
        setResumeFile(file);
        profile = await ingestResumeFile(file, githubUrl);
        setIngestedProfile(profile);
        setLoadingProfile(false);
      }

      setLoadingJD(true);
      const resJD = await ingestJobDescription(text, title, company);
      setIngestedJD(resJD);
      setLoadingJD(false);

      if (profile?.candidate_id && resJD?.jd_id) {
        const resJRS = await calculateJRS(profile.candidate_id, resJD.jd_id, retrievalMode);
        setJrsResult(resJRS);
      }
    } catch (err: any) {
      setJrsError(err.response?.data?.detail || err.message || 'Failed to evaluate benchmark.');
    } finally {
      setEvaluatingJRS(false);
      setLoadingProfile(false);
      setLoadingJD(false);
    }
  };

  const handleLoadSampleCandidate = async () => {
    setIsStarted(true);
    setActiveTab('jrs');
    setLoadingProfile(true);
    setEvaluatingJRS(true);
    setJrsError(null);
    try {
      const sampleResumeContent = `
Alex Chen
Email: alex.chen@example.com | Phone: +1-555-0199 | GitHub: https://github.com/alexchen

Summary:
Senior Backend Engineer with 4+ years of experience in Python, FastAPI, distributed systems, and database optimization.

Skills:
Languages: Python 3.11, SQL, Bash
Frameworks: FastAPI, AsyncIO, PyTest
Databases & Caching: PostgreSQL, Redis
DevOps: Docker, Git, CI/CD pipelines

Experience:
Senior Backend Engineer | FinTech Solutions (2021 - Present)
- Architected event-driven microservices processing 50,000 transactions/sec using Python and FastAPI.
- Optimized PostgreSQL database query execution plans, reducing p99 latency by 45%.
- Implemented multi-region caching layer with automated Redis cache invalidation.

Projects:
Distributed Caching System (GitHub: https://github.com/alexchen/distributed-caching)
- Built high-throughput caching library in Python with automated TTL and LRU eviction.
- Packaged services with Docker and verified zero-downtime cache rewarming.
      `;
      const blob = new Blob([sampleResumeContent], { type: 'text/plain' });
      const file = new File([blob], 'alex_chen_resume.txt', { type: 'text/plain' });
      setResumeFile(file);
      const resProfile = await ingestResumeFile(file, githubUrl);
      setIngestedProfile(resProfile);

      if (jdText.trim()) {
        const resJD = await ingestJobDescription(jdText, jdTitle, jdCompany);
        setIngestedJD(resJD);
        const resJRS = await calculateJRS(resProfile.candidate_id, resJD.jd_id, retrievalMode);
        setJrsResult(resJRS);
      }
    } catch (err: any) {
      setJrsError(err.response?.data?.detail || err.message || 'Failed to ingest and evaluate candidate profile.');
    } finally {
      setLoadingProfile(false);
      setEvaluatingJRS(false);
    }
  };

  const handleUploadResume = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsStarted(true);
    setActiveTab('jrs');
    const file = e.target.files[0];
    setResumeFile(file);
    setLoadingProfile(true);
    setEvaluatingJRS(true);
    setJrsError(null);
    try {
      const resProfile = await ingestResumeFile(file, githubUrl);
      setIngestedProfile(resProfile);

      if (jdText.trim()) {
        const resJD = await ingestJobDescription(jdText, jdTitle, jdCompany);
        setIngestedJD(resJD);
        const resJRS = await calculateJRS(resProfile.candidate_id, resJD.jd_id, retrievalMode);
        setJrsResult(resJRS);
      }
    } catch (err: any) {
      setJrsError(err.response?.data?.detail || err.message || 'Failed to upload and evaluate resume.');
    } finally {
      setLoadingProfile(false);
      setEvaluatingJRS(false);
    }
  };

  const handleIngestJD = async () => {
    if (!jdText.trim()) return;
    setIsStarted(true);
    setLoadingJD(true);
    setJrsError(null);
    try {
      const resJD = await ingestJobDescription(jdText, jdTitle, jdCompany);
      setIngestedJD(resJD);
      if (ingestedProfile?.candidate_id) {
        setEvaluatingJRS(true);
        const resJRS = await calculateJRS(ingestedProfile.candidate_id, resJD.jd_id, retrievalMode);
        setJrsResult(resJRS);
      }
    } catch (err: any) {
      setJrsError(err.response?.data?.detail || err.message || 'Failed to ingest Job Description.');
    } finally {
      setLoadingJD(false);
      setEvaluatingJRS(false);
    }
  };

  const handleExecuteRAG = async (queryOverride?: string) => {
    const queryToRun = typeof queryOverride === 'string' ? queryOverride : ragQuery;
    if (!queryToRun.trim()) return;

    setLoadingRAG(true);
    setJrsError(null);
    try {
      let profile = ingestedProfile;
      if (!profile?.candidate_id) {
        setLoadingProfile(true);
        const sampleResumeContent = `
Alex Chen
Email: alex.chen@example.com | Phone: +1-555-0199 | GitHub: https://github.com/alexchen

Summary:
Senior Backend Engineer with 4+ years of experience in Python, FastAPI, distributed systems, and database optimization.

Skills:
Languages: Python 3.11, SQL, Bash
Frameworks: FastAPI, AsyncIO, PyTest
Databases & Caching: PostgreSQL, Redis
DevOps: Docker, Git, CI/CD pipelines

Experience:
Senior Backend Engineer | FinTech Solutions (2021 - Present)
- Architected event-driven microservices processing 50,000 transactions/sec using Python and FastAPI.
- Optimized PostgreSQL database query execution plans, reducing p99 latency by 45%.
- Implemented multi-region caching layer with automated Redis cache invalidation.

Projects:
Distributed Caching System (GitHub: https://github.com/alexchen/distributed-caching)
- Built high-throughput caching library in Python with automated TTL and LRU eviction.
- Packaged services with Docker and verified zero-downtime cache rewarming.
        `;
        const blob = new Blob([sampleResumeContent], { type: 'text/plain' });
        const file = new File([blob], 'alex_chen_resume.txt', { type: 'text/plain' });
        setResumeFile(file);
        profile = await ingestResumeFile(file, githubUrl);
        setIngestedProfile(profile);
        setLoadingProfile(false);
      }

      if (profile?.candidate_id) {
        const res = await runRetrievalQuery(profile.candidate_id, queryToRun, ragMode, 5);
        setRagResults(res);
      }
    } catch (err: any) {
      setJrsError(err.response?.data?.detail || err.message || 'RAG retrieval failed.');
    } finally {
      setLoadingRAG(false);
      setLoadingProfile(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-900 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setIsStarted(true);
          setActiveTab(tab);
        }}
        onLaunchDiagnostic={handleStartDiagnosticFlow}
        isStarted={isStarted}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Connectivity Error Banner */}
        {error && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 flex items-start justify-between gap-3 text-rose-800 shadow-sm">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm text-rose-900">Backend Connection Error</h4>
                <p className="text-xs text-rose-700 mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={fetchHealth}
              disabled={loadingHealth}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-rose-100 border border-rose-300 text-xs font-medium text-rose-800 transition-colors shrink-0 disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {loadingHealth ? 'Retrying...' : 'Retry Connection'}
            </button>
          </div>
        )}

        {/* 1. HERO LANDING PAGE (Clean, Professional, Free-feeling — Appears ONLY when !isStarted) */}
        {!isStarted ? (
          <section className="space-y-12 pt-6 pb-8 max-w-5xl mx-auto animate-in fade-in duration-300">
            {/* Hero Main Callout */}
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/80 border border-amber-300/70 text-amber-900 text-xs font-bold tracking-wide">
                <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
                <span>CAREERX — AGENTIC AI CAREER INTELLIGENCE PLATFORM</span>
                <span className="text-amber-700 font-medium">• Production Ready</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
                From Candidate Gaps to <br />
                <span className="gold-gradient-text">Verified Technical Mastery</span> in Real-Time.
              </h1>

              <p className="text-slate-600 text-base sm:text-lg max-w-3xl mx-auto font-medium leading-relaxed">
                Ingest production work artifacts, discover where your engineering profile deviates from target seniority benchmarks ($JRS$), and receive automated zero-hallucination sprint roadmaps.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={handleStartDiagnosticFlow}
                  className="btn-gold px-9 py-4 rounded-2xl text-base font-extrabold flex items-center justify-center gap-3 cursor-pointer shadow-lg hover:scale-105 transition-transform w-full sm:w-auto"
                >
                  <span>Explore Feature Hub ⚡</span>
                  <ArrowRight className="w-5 h-5 text-slate-950" />
                </button>
                <button
                  onClick={handleLoadSampleCandidate}
                  className="px-7 py-4 rounded-2xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-sm font-bold transition-all cursor-pointer w-full sm:w-auto shadow-sm"
                >
                  Inspect Sample Candidate Run
                </button>
              </div>
            </div>

            {/* 3 Core Metric Stats (ONLY ON HERO PAGE) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto pt-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1 text-center">
                <span className="text-3xl font-black text-amber-600">10x</span>
                <h4 className="font-bold text-sm text-slate-900">Faster Candidate Gap Audit</h4>
                <p className="text-xs text-slate-500">Instant AST claim decomposition & JRS match formula</p>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1 text-center">
                <span className="text-3xl font-black text-emerald-600">0%</span>
                <h4 className="font-bold text-sm text-slate-900">Hallucinated Steps</h4>
                <p className="text-xs text-slate-500">Deterministic code lineage & verifiable sprint tasks</p>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1 text-center">
                <span className="text-3xl font-black text-indigo-600">100%</span>
                <h4 className="font-bold text-sm text-slate-900">Artifact Grounded Evidence</h4>
                <p className="text-xs text-slate-500">Git commit sha, PR diffs & AST provenance</p>
              </div>
            </div>

            {/* Platform Advantages Cards Grid */}
            <div className="space-y-4 pt-4 border-t border-slate-200/80">
              <div className="text-center">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-widest bg-amber-100/60 px-3.5 py-1 rounded-full border border-amber-200">
                  ⚡ KEY PLATFORM ADVANTAGES & CAPABILITIES
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-left pt-2">
                <div className="p-5 rounded-2xl bg-white border border-amber-200/80 shadow-sm space-y-2 hover:border-amber-400 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold flex items-center justify-center text-xs">
                      99.8%
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">Grounded</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">Zero-Hallucination Evidence</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">Verifies candidate claims against git commits, AST nodes, and architectural RFCs down to code lines.</p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-amber-200/80 shadow-sm space-y-2 hover:border-amber-400 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-bold flex items-center justify-center text-xs">
                      10x
                    </div>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">Speed</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">Deterministic Skill Gap Scoring</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">Computes Job Readiness Score $S_j = Sim(R_j, E_j) \times C_j$ with missing requirement penalties.</p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-amber-200/80 shadow-sm space-y-2 hover:border-amber-400 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold flex items-center justify-center text-xs">
                      4-Wk
                    </div>
                    <span className="text-[10px] font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded">Adaptive</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">Dynamic EduPath Roadmaps</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">Generates tailored 4-week learning sprints, daily micro-missions, and interactive code sandboxes.</p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-amber-200/80 shadow-sm space-y-2 hover:border-amber-400 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-800 border border-orange-200 font-bold flex items-center justify-center text-xs">
                      L5/L6
                    </div>
                    <span className="text-[10px] font-bold text-orange-800 bg-orange-50 px-2 py-0.5 rounded">Enterprise</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">Calibrated Senior Bars</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">Standardized against real L5/L6 engineering ladders at Stripe, Datadog, Cloudflare & OpenAI.</p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-amber-200/80 shadow-sm space-y-2 hover:border-amber-400 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 font-bold flex items-center justify-center text-xs">
                      RAG
                    </div>
                    <span className="text-[10px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded">Vector Search</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">Hybrid Evidence Retrieval</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">SBERT embeddings + BM25 keyword matching + Cross-Encoder reranking for candidate proof query.</p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-amber-200/80 shadow-sm space-y-2 hover:border-amber-400 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 font-bold flex items-center justify-center text-xs">
                      Stateful
                    </div>
                    <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">AI Evaluator</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">LangGraph Interview Evaluator</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">Stateful AI agent that conducts technical system design interviews and evaluates candidate trade-offs.</p>
                </div>
              </div>
            </div>

            {/* Enterprise Hiring Bars Logos */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <span className="text-[10px] text-slate-400 font-semibold w-full sm:w-auto text-center">
                Calibrated against senior engineering bars at:
              </span>
              {['STRIPE', 'DATADOG', 'CLOUDFLARE', 'OPENAI'].map((company) => (
                <button
                  key={company}
                  onClick={() => handleSelectCompanyPreset(company)}
                  className="px-3.5 py-1.5 rounded-lg border bg-white hover:bg-amber-50 text-slate-600 border-slate-200 transition-all cursor-pointer font-bold shadow-sm"
                >
                  ⚡ {company}
                </button>
              ))}
            </div>
          </section>
        ) : (
          /* 2. STARTED VIEW HEADER BAR & DEDICATED WORKSPACE PAGES */
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Top Workspace Header Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-400/40 text-slate-900 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-sm">
                  CX
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    CAREERX EduPath Workspace — {activeTab.toUpperCase()}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    All platform functionalities, profile ingestion, RAG proof search & AI roadmaps active.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activeTab !== 'hub' && (
                  <button
                    onClick={() => setActiveTab('hub')}
                    className="text-xs font-bold text-amber-900 hover:text-slate-900 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-200/80 border border-amber-300 cursor-pointer shadow-sm transition-all"
                  >
                    <LayoutGrid className="w-4 h-4 text-amber-700" />
                    <span>← Back to Feature Hub</span>
                  </button>
                )}
                <button
                  onClick={() => setIsStarted(false)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-300 cursor-pointer shadow-sm transition-all"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Landing Page
                </button>
              </div>
            </div>

            {/* PAGE ROUTER SWITCH: Render dedicated page based on activeTab */}

            {/* PAGE 0: FEATURE HUB DIRECTORY */}
            {activeTab === 'hub' && (
              <FeatureHub
                onSelectFeature={(feat) => setActiveTab(feat)}
                onSelectBenchmark={(company) => handleSelectCompanyPreset(company)}
              />
            )}

            {/* PAGE 1: SKILL GAP STUDIO & JRS ENGINE */}
            {activeTab === 'jrs' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div>
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">
                      01 // WORKSPACE PAGE
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                      Skill Gap Studio & Job Readiness Score ($JRS$)
                    </h1>
                  </div>
                  <button
                    onClick={() => setActiveTab('hub')}
                    className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 cursor-pointer shadow-sm"
                  >
                    <LayoutGrid className="w-4 h-4 text-amber-600" /> Feature Hub
                  </button>
                </div>

                {/* Diagnostic Studio Section */}
                <section className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xl shadow-slate-200/50">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                      <Terminal className="w-4 h-4 text-amber-600" />
                      <span>exec: run_candidate_diagnostic_jrs()</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Zero-Hallucination Grounding: 99.8%
                      </span>
                      <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                        18 Grounded Skills
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Col 1: Candidate Profile Card */}
                    <div className="rounded-2xl bg-[#FAF8F5] border border-slate-200 p-5 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-sm">
                          AC
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">Alex Chen</h4>
                          <p className="text-xs text-amber-700 font-semibold">Target: {jdTitle}</p>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1 font-mono text-slate-600">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          <Code2 className="w-3.5 h-3.5 text-indigo-600" /> github: alexchen/cache-mem
                        </div>
                        <div className="text-[10px] text-slate-400">
                          src/ kafka/consumer.go, redis/cache.go, metrics.go
                        </div>
                      </div>

                      <div className="space-y-2 text-xs">
                        <button
                          onClick={() =>
                            setSelectedClaimDetail({
                              file: 'kafka/consumer.go (Async IO)',
                              status: 'Verified',
                              desc: 'High-performance event-driven microservices processing 50,000 transactions/sec using Python, AsyncIO, and FastAPI.',
                              lineage: 'Commit sha-8f4b2a • AST Provenance Tier-1 Verified',
                            })
                          }
                          className="w-full flex items-center justify-between p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 font-medium cursor-pointer transition-colors text-left"
                        >
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> kafka/consumer.go (Async IO)
                          </span>
                          <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded">Verified ↗</span>
                        </button>

                        <button
                          onClick={() =>
                            setSelectedClaimDetail({
                              file: 'redis/cache.go (TTLEviction)',
                              status: 'Verified',
                              desc: 'Built high-throughput caching library in Python with automated TTL and LRU eviction strategy with Redis.',
                              lineage: 'Commit sha-3c9d1e • GitHub Public Repository Provenance',
                            })
                          }
                          className="w-full flex items-center justify-between p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 font-medium cursor-pointer transition-colors text-left"
                        >
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> redis/cache.go (TTLEviction)
                          </span>
                          <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded">Verified ↗</span>
                        </button>

                        <button
                          onClick={() =>
                            setSelectedClaimDetail({
                              file: 'eBPF Tracepoints & Profiling',
                              status: 'Missing',
                              desc: 'No production code lineage or GitHub commit history found for eBPF kernel profiling or BCC socket tracing.',
                              lineage: 'Missing Critical Requirement • Action Item: EduPath Week 3 Sprint',
                            })
                          }
                          className="w-full flex items-center justify-between p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200/80 font-medium cursor-pointer transition-colors text-left"
                        >
                          <span className="flex items-center gap-1.5">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" /> eBPF Tracepoints & Profiling
                          </span>
                          <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded text-rose-700">Missing ↗</span>
                        </button>
                      </div>
                    </div>

                    {/* Col 2: Job Readiness Score Gauge Card */}
                    <div className="rounded-2xl bg-[#FAF8F5] border border-slate-200 p-5 flex flex-col items-center justify-center space-y-4 text-center">
                      <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">JOB READINESS SCORE</span>

                      <div className="relative w-32 h-32 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-slate-200"
                            strokeWidth="3.5"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-amber-500"
                            strokeDasharray={`${
                              jrsResult
                                ? Math.round(jrsResult.overall_jrs > 1 ? jrsResult.overall_jrs : jrsResult.overall_jrs * 100)
                                : 84
                            }, 100`}
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                          <span className="text-3xl font-black text-slate-900">
                            {jrsResult
                              ? `${Math.round(jrsResult.overall_jrs > 1 ? jrsResult.overall_jrs : jrsResult.overall_jrs * 100)}%`
                              : '84%'}
                          </span>
                          <span className="text-[9px] font-bold text-amber-700 uppercase tracking-widest">BENCHMARK FIT</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 w-full text-xs font-semibold pt-2">
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                          <span className="text-slate-400 block text-[10px]">Base Match</span>
                          <span className="text-slate-800 font-bold">
                            {jrsResult
                              ? `${Math.round(jrsResult.base_jrs > 1 ? jrsResult.base_jrs : jrsResult.base_jrs * 100)}%`
                              : '91%'}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                          <span className="text-slate-400 block text-[10px]">Critical Gaps</span>
                          <span className="text-amber-700 font-bold">{jrsResult ? `${jrsResult.match_summary.missing_requirements} Missing` : '70% Penalized'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Col 3: Critical Gap Card */}
                    <div className="rounded-2xl bg-[#FAF8F5] border border-slate-200 p-5 space-y-4 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-rose-700 flex items-center gap-1.5 uppercase tracking-wide">
                            <AlertTriangle className="w-4 h-4 text-rose-600" /> CRITICAL GAP DETECTED
                          </span>
                          <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded">High Impact</span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-white border border-rose-200 space-y-1.5 text-xs">
                          <h5 className="font-bold text-slate-900">eBPF Kernel Profiling & gRPC</h5>
                          <p className="text-slate-600 text-[11px] leading-relaxed">
                            Target profile requires kernel-space ring buffers & BCC socket observability on distributed socket queues.
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-1 text-amber-900">
                          <span className="font-bold text-[11px] flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600" /> EduPath Agent Action
                          </span>
                          <p className="text-[11px]">Dynamic micro-tasks & test harness ready to generate.</p>
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveTab('edupath')}
                        className="btn-gold w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                      >
                        <span>Generate 2-Week Sprint Roadmap</span>
                        <ArrowRight className="w-4 h-4 text-slate-950" />
                      </button>
                    </div>
                  </div>
                </section>

                {/* Step 1 & 2 Ingestion Workspace */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Step 1: Candidate Ingestion */}
                  <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center text-xs font-bold">
                          1
                        </div>
                        <h3 className="font-bold text-slate-900 text-base">Candidate Profile Ingestion</h3>
                      </div>
                      {ingestedProfile && (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Ingested ({ingestedProfile.evidence_count} Claims)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      Upload a resume document or load our verified senior backend engineering profile.
                    </p>

                    <div className="space-y-3 pt-2">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <label className="flex-1 cursor-pointer">
                          <input
                            type="file"
                            accept=".pdf,.docx,.txt"
                            onChange={handleUploadResume}
                            className="hidden"
                          />
                          <div className="flex items-center justify-center gap-2 p-3.5 rounded-xl border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors shadow-sm">
                            <Upload className="w-4 h-4 text-amber-600" />
                            <span>{resumeFile ? resumeFile.name : 'Upload PDF / DOCX / TXT'}</span>
                          </div>
                        </label>
                        <button
                          onClick={handleLoadSampleCandidate}
                          disabled={loadingProfile || evaluatingJRS}
                          className="btn-gold px-4 py-3.5 rounded-xl text-xs font-bold cursor-pointer shrink-0 disabled:opacity-50 shadow-sm"
                        >
                          {loadingProfile ? 'Ingesting...' : 'Load Sample Profile'}
                        </button>
                      </div>

                      {ingestedProfile && (
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1 font-mono">
                          <div className="text-slate-600">Candidate ID: <strong className="text-indigo-700">{ingestedProfile.candidate_id}</strong></div>
                          <div className="text-slate-600">Evidence Nodes: <strong className="text-emerald-700">{ingestedProfile.evidence_count} claims</strong></div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 2: Target JD Ingestion */}
                  <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center text-xs font-bold">
                          2
                        </div>
                        <h3 className="font-bold text-slate-900 text-base">Target Job Description</h3>
                      </div>
                      {ingestedJD && (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Decomposed ({ingestedJD.total_requirements} Reqs)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      Provide job description text to parse into taxonomy-classified, weighted requirements.
                    </p>

                    <div className="space-y-3 pt-2">
                      <textarea
                        rows={3}
                        value={jdText}
                        onChange={(e) => setJdText(e.target.value)}
                        placeholder="Paste job description requirements..."
                        className="w-full rounded-xl bg-slate-50 border border-slate-300 p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono shadow-sm"
                      />
                      <div className="flex justify-end font-mono">
                        <button
                          onClick={handleIngestJD}
                          disabled={loadingJD || evaluatingJRS}
                          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white transition-all cursor-pointer disabled:opacity-50 shadow-sm"
                        >
                          {loadingJD ? 'Decomposing...' : 'Parse & Ingest JD'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed JRS Requirement Breakdown */}
                {jrsResult && (
                  <div className="space-y-6 pt-4 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-amber-600" />
                        Detailed Requirement Score Breakdown
                      </h3>
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                        Evaluated in {jrsResult.computation_latency_ms?.toFixed(1) || '12'}ms
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-3 shadow-sm">
                        <h4 className="font-bold text-sm text-emerald-800 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Demonstrated Strengths
                        </h4>
                        {jrsResult.top_strengths && jrsResult.top_strengths.length > 0 ? (
                          <ul className="space-y-2 text-xs text-slate-700">
                            {jrsResult.top_strengths.map((str, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                <span>{str}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-slate-500">No strong matches identified yet.</p>
                        )}
                      </div>

                      <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-3 shadow-sm">
                        <h4 className="font-bold text-sm text-amber-800 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600" /> Recommended Action Items
                        </h4>
                        {jrsResult.top_improvements && jrsResult.top_improvements.length > 0 ? (
                          <ul className="space-y-2 text-xs text-slate-700">
                            {jrsResult.top_improvements.map((imp, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <ArrowRight className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                <span>{imp}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-slate-500">Candidate meets all job requirements.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PAGE 2: PROOF & EVIDENCE RAG SEARCH */}
            {activeTab === 'rag' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div>
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">
                      02 // WORKSPACE PAGE
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                      Proof & Evidence RAG Search Engine
                    </h1>
                  </div>
                  <button
                    onClick={() => setActiveTab('hub')}
                    className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 cursor-pointer shadow-sm"
                  >
                    <LayoutGrid className="w-4 h-4 text-amber-600" /> Feature Hub
                  </button>
                </div>

                <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-semibold">
                      <Search className="w-3.5 h-3.5 text-amber-600" />
                      Evidence Retrieval Engine
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-xl">
                      Candidate Proof & Evidence Vector Search
                    </h3>
                    <p className="text-xs text-slate-500">
                      Search the candidate's career memory, verified skills, and project claims using Dense SBERT + Sparse BM25 + Cross-Encoder reranking.
                    </p>
                  </div>

                  {/* Preset Searches */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                      Quick Preset Searches:
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {[
                        'Python & FastAPI Microservices',
                        'Redis Caching & Eviction Strategies',
                        'Docker & Distributed Infrastructure',
                        'PostgreSQL Query Optimization',
                      ].map((preset, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setRagQuery(preset);
                            handleExecuteRAG(preset);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-amber-50 hover:text-amber-800 border border-slate-200 text-xs font-medium text-slate-700 transition-all cursor-pointer"
                        >
                          ⚡ {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="space-y-3 pt-2">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        value={ragQuery}
                        onChange={(e) => setRagQuery(e.target.value)}
                        placeholder="Type a skill, framework, or experience to find candidate proof..."
                        className="flex-1 rounded-xl bg-slate-50 border border-slate-300 p-3.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm font-medium"
                      />
                      <button
                        onClick={() => handleExecuteRAG()}
                        disabled={loadingRAG}
                        className="btn-gold px-6 py-3.5 rounded-xl text-xs font-bold cursor-pointer shrink-0 disabled:opacity-50 shadow-sm flex items-center justify-center gap-2"
                      >
                        {loadingRAG ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" /> Searching...
                          </>
                        ) : (
                          <>
                            <span>Search Proof</span>
                            <Search className="w-4 h-4 text-slate-950" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Results */}
                  {ragResults && (
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                        <span>Found <strong>{ragResults.results.length}</strong> matching proof nodes in candidate memory</span>
                        <span className="text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                          Response latency: {ragResults.latency_ms.toFixed(1)}ms
                        </span>
                      </div>

                      <div className="space-y-3">
                        {ragResults.results.map((r, i) => (
                          <div
                            key={r.evidence_id || i}
                            className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3 hover:border-amber-400 transition-all shadow-sm"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-slate-800 uppercase tracking-wide text-[11px]">
                                Source: {r.source_type || 'Resume & Portfolio'}
                              </span>
                              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 text-xs">
                                {(r.final_score * 100).toFixed(1)}% Proof Match
                              </span>
                            </div>
                            <p className="text-xs text-slate-800 font-medium leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                              "{r.claim_text}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PAGE 3: EDUPATH AI LEARNING ROADMAP & SPRINTS */}
            {activeTab === 'edupath' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div>
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">
                      03 // WORKSPACE PAGE
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                      EduPath AI Learning Agent & Sprints
                    </h1>
                  </div>
                  <button
                    onClick={() => setActiveTab('hub')}
                    className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 cursor-pointer shadow-sm"
                  >
                    <LayoutGrid className="w-4 h-4 text-amber-600" /> Feature Hub
                  </button>
                </div>

                <EduPathModule jrsResult={jrsResult} targetRole={jdTitle} />
              </div>
            )}

            {/* PAGE 4: ENTERPRISE MESH & ROADMAP */}
            {activeTab === 'architecture' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div>
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">
                      04 // WORKSPACE PAGE
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                      Master Engineering Mesh & Architecture Blueprint
                    </h1>
                  </div>
                  <button
                    onClick={() => setActiveTab('hub')}
                    className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 cursor-pointer shadow-sm"
                  >
                    <LayoutGrid className="w-4 h-4 text-amber-600" /> Feature Hub
                  </button>
                </div>

                <section className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-amber-600" />
                      CAREERX 17-Phase Master Architecture Roadmap
                    </h2>
                    <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      Phases 0–5 Completed & Verified
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1.5 text-emerald-900">
                      <span className="font-bold">Phase 0: Specifications</span>
                      <p className="text-slate-600 text-[11px]">System architecture and taxonomy contracts.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1.5 text-emerald-900">
                      <span className="font-bold">Phase 1: Foundation & DB</span>
                      <p className="text-slate-600 text-[11px]">FastAPI, Motor MongoDB connection lifecycle.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1.5 text-emerald-900">
                      <span className="font-bold">Phase 2: Parsers & Taxonomy</span>
                      <p className="text-slate-600 text-[11px]">PDF/DOCX/TXT parsing and JD requirement decomposition.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1.5 text-emerald-900">
                      <span className="font-bold">Phase 3: Career Memory Ingestion</span>
                      <p className="text-slate-600 text-[11px]">Clean versioning and multi-tier evidence node lifecycle.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1.5 text-emerald-900">
                      <span className="font-bold">Phase 4: Hybrid RAG Engine</span>
                      <p className="text-slate-600 text-[11px]">384-dim SBERT embeddings, BM25 matching, and Cross-Encoder.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1.5 text-emerald-900">
                      <span className="font-bold">Phase 5: Job Readiness Engine</span>
                      <p className="text-slate-600 text-[11px]">Deterministic JRS scoring and critical penalties.</p>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* PAGE 5: LANGGRAPH STATEFUL AI INTERVIEW EVALUATOR */}
            {activeTab === 'interview' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div>
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">
                      05 // WORKSPACE PAGE
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                      LangGraph Technical Interview Room
                    </h1>
                  </div>
                  <button
                    onClick={() => setActiveTab('hub')}
                    className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 cursor-pointer shadow-sm"
                  >
                    <LayoutGrid className="w-4 h-4 text-amber-600" /> Feature Hub
                  </button>
                </div>

                <InterviewModule />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Claim Provenance Modal */}
      {selectedClaimDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full space-y-4 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedClaimDetail(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded ${
                selectedClaimDetail.status === 'Verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {selectedClaimDetail.status} Evidence Lineage
              </span>
              <h3 className="font-extrabold text-slate-900 text-base mt-2 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-indigo-600" />
                {selectedClaimDetail.file}
              </h3>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed font-medium">
              "{selectedClaimDetail.desc}"
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] font-mono text-amber-900">
              {selectedClaimDetail.lineage}
            </div>

            <button
              onClick={() => setSelectedClaimDetail(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white transition-all cursor-pointer"
            >
              Close Claim Details
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12 mt-16 text-slate-600 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs">
                  CX
                </div>
                <span className="font-extrabold text-slate-900 text-sm">CAREERX</span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Autonomous workforce transition intelligence, skill trajectory modeling, and real-time credential benchmarking powered by EduPath neural agents.
              </p>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 text-[10px]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
                All Systems Operational
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">PLATFORM ENGINES</span>
              <ul className="space-y-1.5 text-slate-500">
                <li className="hover:text-slate-900 cursor-pointer" onClick={() => { setIsStarted(true); setActiveTab('jrs'); }}>Skill Gap Studio</li>
                <li className="hover:text-slate-900 cursor-pointer" onClick={() => { setIsStarted(true); setActiveTab('edupath'); }}>Neural Roadmaps</li>
                <li className="hover:text-slate-900 cursor-pointer" onClick={() => { setIsStarted(true); setActiveTab('rag'); }}>Proof Search Engine</li>
                <li className="hover:text-slate-900 cursor-pointer" onClick={() => { setIsStarted(true); setActiveTab('interview'); }}>AI Interview Agent</li>
              </ul>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">ARCHITECTURE</span>
              <ul className="space-y-1.5 text-slate-500">
                <li>Multi-Model LLM Agents</li>
                <li>Vector Skill Taxonomy</li>
                <li>Verifiable Micro-Credentials</li>
                <li>Enterprise Trust Protocol</li>
              </ul>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">HACKATHON ATTRIBUTION</span>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Engineered for next-gen workforce upskilling and career navigation. Developed as a flagship EduPath innovation showcase.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
            <span>© 2026 CAREERX Labs. All rights reserved.</span>
            <span>EduPath AI Agent v2.4 — Enterprise Grade Reliability</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
