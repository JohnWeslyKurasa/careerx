import React, { useEffect, useState } from 'react';
import { Navbar } from './components/common/Navbar';
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
  Layers,
  Cpu,
  CheckCircle2,
  AlertCircle,
  FileCode2,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  Upload,
  FileText,
  Search,
  BarChart3,
  ExternalLink,
  RefreshCw,
  Award,
  AlertTriangle,
  Check,
  ChevronRight,
  Sliders,
  ShieldCheck,
  Clock,
  Sparkles,
  Briefcase,
  User,
} from 'lucide-react';

export function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loadingHealth, setLoadingHealth] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'jrs' | 'rag' | 'architecture'>('jrs');

  // Candidate Profile State
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [githubUrl, setGithubUrl] = useState<string>('https://github.com/alexchen');
  const [ingestedProfile, setIngestedProfile] = useState<IngestProfileResponse | null>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(false);

  // Job Description State
  const [jdText, setJdText] = useState<string>(
    `Role: Senior Distributed Systems Engineer\nCompany: CloudScale AI\n\nKey Requirements:\n- 3+ years of experience with Python, FastAPI, and high-performance microservices\n- Hands-on experience designing distributed caching layers with Redis\n- Production experience with Kubernetes cluster management and Helm charts\n- Experience with Golang gRPC microservices and Protobuf`
  );
  const [jdTitle, setJdTitle] = useState<string>('Senior Distributed Systems Engineer');
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
    'Experience with asynchronous programming, Redis caching, and microservices'
  );
  const [ragMode, setRagMode] = useState<string>('hybrid_reranked');
  const [ragResults, setRagResults] = useState<RetrievalQueryResponse | null>(null);
  const [loadingRAG, setLoadingRAG] = useState<boolean>(false);

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

  // Quick Ingest Candidate using Pre-Validated Candidate Profile
  const handleLoadSampleCandidate = async () => {
    setLoadingProfile(true);
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
      const res = await ingestResumeFile(file, githubUrl);
      setIngestedProfile(res);
    } catch (err: any) {
      setJrsError(err.response?.data?.detail || err.message || 'Failed to ingest candidate resume.');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleUploadResume = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setResumeFile(file);
    setLoadingProfile(true);
    setJrsError(null);
    try {
      const res = await ingestResumeFile(file, githubUrl);
      setIngestedProfile(res);
    } catch (err: any) {
      setJrsError(err.response?.data?.detail || err.message || 'Failed to upload resume.');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleIngestJD = async () => {
    if (!jdText.trim()) return;
    setLoadingJD(true);
    setJrsError(null);
    try {
      const res = await ingestJobDescription(jdText, jdTitle, jdCompany);
      setIngestedJD(res);
    } catch (err: any) {
      setJrsError(err.response?.data?.detail || err.message || 'Failed to ingest Job Description.');
    } finally {
      setLoadingJD(false);
    }
  };

  const handleCalculateJRS = async () => {
    if (!ingestedProfile?.candidate_id || !ingestedJD?.jd_id) {
      setJrsError('Please ingest both a Candidate Profile (Step 1) and a Target Job Description (Step 2) first.');
      return;
    }
    setEvaluatingJRS(true);
    setJrsError(null);
    try {
      const res = await calculateJRS(ingestedProfile.candidate_id, ingestedJD.jd_id, retrievalMode);
      setJrsResult(res);
    } catch (err: any) {
      setJrsError(err.response?.data?.detail || err.message || 'Failed to evaluate JRS score.');
    } finally {
      setEvaluatingJRS(false);
    }
  };

  const handleExecuteRAG = async () => {
    if (!ingestedProfile?.candidate_id) {
      setJrsError('Please ingest or load a Candidate Profile first to search Career Memory.');
      return;
    }
    setLoadingRAG(true);
    try {
      const res = await runRetrievalQuery(ingestedProfile.candidate_id, ragQuery, ragMode, 5);
      setRagResults(res);
    } catch (err: any) {
      setJrsError(err.response?.data?.detail || err.message || 'RAG retrieval failed.');
    } finally {
      setLoadingRAG(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'STRONG_MATCH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Check className="w-3.5 h-3.5" /> Demonstrated Match
          </span>
        );
      case 'PARTIAL_MATCH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Contextual Match
          </span>
        );
      case 'WEAK_EVIDENCE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Unverified Claim
          </span>
        );
      case 'MISSING':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5" /> Missing Requirement
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      <Navbar health={health} loading={loadingHealth} onRefresh={fetchHealth} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
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

        {/* Hero Header */}
        <section className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/90 p-8 sm:p-10 shadow-sm">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold tracking-wide">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Institutional-Grade Job Readiness Engine • Phases 1–5 Live
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Evidence-Grounded <br />
              <span className="text-indigo-600">Candidate Readiness Intelligence</span>
            </h1>
            <p className="text-slate-600 text-base leading-relaxed">
              Moving beyond keyword-matching ATS filters to an auditable, deterministic assessment grounded in multi-tier verification and semantic retrieval.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600">
              <span className="bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
                Deterministic JRS
              </span>
              <span className="bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
                Hybrid RAG ($\alpha=0.65$)
              </span>
              <span className="bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
                Cross-Encoder Reranker
              </span>
              <span className="bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
                MongoDB Vector Store
              </span>
              <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-md border border-emerald-200 font-semibold">
                40/40 Tests Verified
              </span>
            </div>
          </div>
        </section>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 space-x-2">
          <button
            onClick={() => setActiveTab('jrs')}
            className={`pb-3 px-5 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'jrs'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Live Readiness Evaluation Studio
          </button>
          <button
            onClick={() => setActiveTab('rag')}
            className={`pb-3 px-5 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'rag'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Search className="w-4 h-4" />
            Hybrid RAG Search Playground
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`pb-3 px-5 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'architecture'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            17-Phase Master Roadmap
          </button>
        </div>

        {/* Tab 1: Live JRS Studio */}
        {activeTab === 'jrs' && (
          <div className="space-y-8">
            {/* Step 1 & 2 Ingestion Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Step 1: Candidate Ingestion */}
              <div className="rounded-2xl bg-white border border-slate-200/90 p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center text-xs font-bold">
                      1
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">Candidate Profile (Phase 2 & 3)</h3>
                  </div>
                  {ingestedProfile && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Ingested ({ingestedProfile.evidence_count} Nodes)
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
                        <Upload className="w-4 h-4 text-indigo-600" />
                        <span>{resumeFile ? resumeFile.name : 'Upload PDF / DOCX / TXT'}</span>
                      </div>
                    </label>
                    <button
                      onClick={handleLoadSampleCandidate}
                      disabled={loadingProfile}
                      className="px-4 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white transition-all cursor-pointer shrink-0 disabled:opacity-50 shadow-sm"
                    >
                      {loadingProfile ? 'Ingesting...' : 'Load Sample Profile'}
                    </button>
                  </div>

                  {ingestedProfile && (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1 font-mono">
                      <div className="text-slate-600">Candidate ID: <strong className="text-indigo-700">{ingestedProfile.candidate_id}</strong></div>
                      <div className="text-slate-600">Version: <strong className="text-slate-800">{ingestedProfile.version}</strong> | Evidence Nodes: <strong className="text-emerald-700">{ingestedProfile.evidence_count} claims</strong></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2: Target JD Ingestion */}
              <div className="rounded-2xl bg-white border border-slate-200/90 p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center text-xs font-bold">
                      2
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">Target Job Description (Phase 2 & 3)</h3>
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
                    className="w-full rounded-xl bg-slate-50 border border-slate-300 p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono shadow-sm"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleIngestJD}
                      disabled={loadingJD}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white transition-all cursor-pointer disabled:opacity-50 shadow-sm"
                    >
                      {loadingJD ? 'Decomposing...' : 'Parse & Ingest JD'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Calculation Trigger Bar */}
            <div className="rounded-2xl bg-white border border-slate-200 p-6 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Execute Deterministic JRS Scoring Engine (Phase 5)
                  </h3>
                </div>
                <p className="text-xs text-slate-500">
                  Computes requirement satisfaction $S_j = Sim(R_j, E_j) \times C_j$, importance aggregation, and critical penalties.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Sliders className="w-4 h-4 text-slate-400 shrink-0" />
                  <select
                    value={retrievalMode}
                    onChange={(e) => setRetrievalMode(e.target.value)}
                    className="w-full sm:w-auto bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-700 focus:outline-none font-medium shadow-sm"
                  >
                    <option value="hybrid_reranked">Two-Stage Hybrid + Cross-Encoder Reranked</option>
                    <option value="hybrid">Single-Stage Hybrid (alpha=0.65)</option>
                    <option value="dense_only">SBERT Dense Embeddings Only</option>
                    <option value="bm25_only">BM25 Sparse Lexical Only</option>
                  </select>
                </div>

                <button
                  onClick={handleCalculateJRS}
                  disabled={evaluatingJRS}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white transition-all shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50 shrink-0 flex items-center justify-center gap-2"
                >
                  {evaluatingJRS ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Evaluating...
                    </>
                  ) : (
                    <>
                      <span>Evaluate Readiness</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {jrsError && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{jrsError}</span>
              </div>
            )}

            {/* JRS Evaluation Report */}
            {jrsResult && (() => {
              const summary = jrsResult.match_summary || jrsResult.summary || {
                total_requirements: jrsResult.breakdown?.length || 0,
                strong_matches: 0,
                partial_matches: 0,
                weak_evidence: 0,
                weak_matches: 0,
                missing_requirements: 0,
                critical_gaps_count: 0,
                critical_gaps: 0,
              };

              const strongCount = summary.strong_matches || 0;
              const partialCount = summary.partial_matches || 0;
              const weakCount = summary.weak_evidence ?? summary.weak_matches ?? 0;
              const missingCount = summary.missing_requirements || 0;
              const criticalGapsCount = summary.critical_gaps_count ?? summary.critical_gaps ?? (jrsResult.critical_gaps?.length || 0);
              const totalReqs = summary.total_requirements || jrsResult.breakdown?.length || 0;
              const modeUsed = jrsResult.retrieval_mode || jrsResult.retrieval_mode_used || retrievalMode;

              return (
                <div className="space-y-6 pt-2">
                  {/* Score Summary Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
                      <span className="text-xs text-slate-500 font-semibold tracking-wide uppercase">Overall JRS Index</span>
                      <div className="text-4xl font-black text-indigo-600">
                        {jrsResult.overall_jrs.toFixed(1)}%
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        Base: {jrsResult.base_jrs.toFixed(1)}% | Penalty: -{jrsResult.critical_penalty.toFixed(1)}
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
                      <span className="text-xs text-slate-500 font-semibold tracking-wide uppercase">Demonstrated & Partial</span>
                      <div className="text-3xl font-bold text-emerald-600">
                        {strongCount + partialCount} / {totalReqs}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        Demonstrated: {strongCount} | Contextual: {partialCount}
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
                      <span className="text-xs text-slate-500 font-semibold tracking-wide uppercase">Unverified / Missing</span>
                      <div className="text-3xl font-bold text-amber-600">
                        {weakCount + missingCount}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        Unverified: {weakCount} | Missing: {missingCount}
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
                      <span className="text-xs text-slate-500 font-semibold tracking-wide uppercase">Critical Mandatory Gaps</span>
                      <div className="text-3xl font-bold text-rose-600">
                        {criticalGapsCount}
                      </div>
                      <div className="text-[11px] text-rose-700 font-medium">
                        Penalty: -{(criticalGapsCount * 8.0).toFixed(1)} pts
                      </div>
                    </div>
                  </div>

                  {/* Granular Requirement Breakdown Table */}
                  <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-indigo-600" />
                        Auditable Requirement Breakdown & Evidence Trace
                      </h3>
                      <span className="text-xs font-mono text-slate-500">
                        Mode: {modeUsed}
                      </span>
                    </div>

                    <div className="space-y-4">
                      {jrsResult.breakdown?.map((item, idx) => {
                        const evidence = item.grounded_evidence || item.matched_evidence;
                        const similarity = item.retrieval_similarity ?? item.similarity_score ?? 0;
                        const confidenceTier = item.confidence_tier || item.evidence_tier || evidence?.confidence_tier || evidence?.tier || 'UNVERIFIED';
                        const artifactUrl = evidence?.verifiable_url || evidence?.verification_url;

                        return (
                          <div
                            key={item.req_id || item.requirement_id || idx}
                            className="rounded-xl bg-slate-50/80 border border-slate-200 p-4 space-y-3"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                                    {item.category || 'Core Skill'}
                                  </span>
                                  {item.is_mandatory && (
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                                      Mandatory (Weight: {item.importance_weight})
                                    </span>
                                  )}
                                  {!item.is_mandatory && (
                                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                                      Weight: {item.importance_weight}
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-sm font-semibold text-slate-900">
                                  {item.requirement_text}
                                </h4>
                              </div>
                              <div>{getStatusBadge(item.match_status)}</div>
                            </div>

                            {evidence ? (
                              <div className="p-3.5 rounded-lg bg-white border border-slate-200 text-xs space-y-2 shadow-xs">
                                <div className="flex items-center justify-between text-slate-500 font-mono text-[11px]">
                                  <span>Grounded Node: <strong className="text-indigo-700">{evidence.evidence_id}</strong> ({evidence.source_type})</span>
                                  <span className="text-emerald-700 font-semibold">{confidenceTier}</span>
                                </div>
                                <p className="text-slate-700 italic">
                                  "{evidence.claim_text}"
                                </p>
                                <div className="flex flex-wrap items-center justify-between pt-1.5 text-[11px] font-mono text-slate-600 border-t border-slate-100">
                                  <span>
                                    Similarity: <strong className="text-slate-900">{(similarity * 100).toFixed(1)}%</strong> × Multiplier: <strong className="text-slate-900">{item.confidence_multiplier}</strong> = Score: <strong className="text-indigo-700">{(item.requirement_score * 100).toFixed(1)}%</strong>
                                  </span>
                                  {artifactUrl && (
                                    <a
                                      href={artifactUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 font-sans font-medium"
                                    >
                                      Verification Artifact <ExternalLink className="w-3 h-3" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 italic">
                                {item.diagnostic_note}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Synthesis Strengths & Improvement Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-3 shadow-sm">
                      <h4 className="font-bold text-sm text-emerald-800 flex items-center gap-2">
                        <Award className="w-4 h-4 text-emerald-600" /> Verified Candidate Strengths
                      </h4>
                      {jrsResult.top_strengths && jrsResult.top_strengths.length > 0 ? (
                        <ul className="space-y-2.5 text-xs text-slate-700">
                          {jrsResult.top_strengths.map((str, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
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
                        <ul className="space-y-2.5 text-xs text-slate-700">
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
              );
            })()}
          </div>
        )}

        {/* Tab 2: RAG Search Playground */}
        {activeTab === 'rag' && (
          <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-6 shadow-sm">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Search className="w-5 h-5 text-indigo-600" />
                Phase 4 Hybrid RAG Search Engine
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Evaluate dual-model semantic retrieval (SBERT 384-dim + BM25) and Cross-Encoder reranking over candidate evidence nodes.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={ragQuery}
                  onChange={(e) => setRagQuery(e.target.value)}
                  placeholder="Enter technical query or JD clause..."
                  className="flex-1 rounded-xl bg-slate-50 border border-slate-300 p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
                <select
                  value={ragMode}
                  onChange={(e) => setRagMode(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none font-medium"
                >
                  <option value="hybrid_reranked">Two-Stage Hybrid + Cross-Encoder Reranked</option>
                  <option value="hybrid">Single-Stage Hybrid (alpha=0.65)</option>
                  <option value="dense_only">SBERT Dense Only</option>
                  <option value="bm25_only">BM25 Sparse Lexical Only</option>
                </select>
                <button
                  onClick={handleExecuteRAG}
                  disabled={loadingRAG}
                  className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white transition-colors cursor-pointer shrink-0 disabled:opacity-50 shadow-sm"
                >
                  {loadingRAG ? 'Searching...' : 'Run RAG Search'}
                </button>
              </div>
            </div>

            {ragResults && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between text-xs text-slate-600 font-mono border-b border-slate-200 pb-2">
                  <span>Evaluated: {ragResults.total_evaluated} nodes | Mode: <strong className="text-indigo-700">{ragResults.mode_used}</strong></span>
                  <span>Latency: <strong className="text-emerald-700">{ragResults.latency_ms.toFixed(1)}ms</strong></span>
                </div>

                <div className="space-y-3">
                  {ragResults.results.map((r, i) => (
                    <div key={r.evidence_id || i} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-indigo-700 font-bold">#{i + 1} [{r.evidence_id}]</span>
                        <span className="px-2.5 py-0.5 rounded bg-white border border-slate-200 text-emerald-700 font-bold">
                          Score: {(r.final_score * 100).toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-800 font-medium">"{r.claim_text}"</p>
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-200">
                        <span>Tier: {r.tier} | Source: {r.source_type}</span>
                        {r.verification_url && (
                          <a href={r.verification_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                            Verification Link ↗
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Master Architecture Roadmap */}
        {activeTab === 'architecture' && (
          <section className="rounded-2xl bg-white border border-slate-200 p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                CAREERX 17-Phase Master Roadmap
              </h2>
              <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Phases 0–5 Completed & Verified
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1.5 text-emerald-900">
                <div className="flex items-center justify-between">
                  <span className="font-bold">Phase 0: Specifications</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-slate-600 text-[11px]">System architecture, taxonomy, and design contracts.</p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1.5 text-emerald-900">
                <div className="flex items-center justify-between">
                  <span className="font-bold">Phase 1: Foundation & DB</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-slate-600 text-[11px]">FastAPI, Motor MongoDB connection lifecycle, and React client.</p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1.5 text-emerald-900">
                <div className="flex items-center justify-between">
                  <span className="font-bold">Phase 2: Parsers & Taxonomy</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-slate-600 text-[11px]">PDF/DOCX/TXT resume parsing and JD requirement decomposition.</p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1.5 text-emerald-900">
                <div className="flex items-center justify-between">
                  <span className="font-bold">Phase 3: Career Memory Ingestion</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-slate-600 text-[11px]">Clean versioning, multi-tier evidence node lifecycle, and B-Tree indexing.</p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1.5 text-emerald-900">
                <div className="flex items-center justify-between">
                  <span className="font-bold">Phase 4: Hybrid RAG Engine</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-slate-600 text-[11px]">384-dim SBERT embeddings, BM25 matching, and Cross-Encoder reranker.</p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1.5 text-emerald-900">
                <div className="flex items-center justify-between">
                  <span className="font-bold">Phase 5: Job Readiness Engine</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-slate-600 text-[11px]">Deterministic JRS scoring, critical penalties, and grounded explanations.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Phase 6: Multi-Agent Orchestration</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">UPCOMING</span>
                </div>
                <p className="text-slate-500 text-[11px]">LangGraph state machines for autonomous career upskilling.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Phases 7–16: Adaptive Learning & Evaluator</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-600 font-semibold">ROADMAP</span>
                </div>
                <p className="text-slate-500 text-[11px]">Dynamic curriculum generator, AST code analysis, and mock interviews.</p>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 font-medium">
          CAREERX Enterprise AI • Evidence-Grounded Career Intelligence Platform
        </div>
      </footer>
    </div>
  );
}

export default App;
