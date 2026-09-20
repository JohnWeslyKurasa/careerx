import React, { useState } from 'react';
import {
  GraduationCap,
  CheckSquare,
  Compass,
  MessageSquare,
  PlayCircle,
  Code2,
  Calendar,
  TrendingUp,
  Send,
  BookOpen,
  Award,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Target,
  FileText,
  RefreshCw,
  Check,
} from 'lucide-react';
import type { JRSResponse } from '../../types/api';

interface EduPathModuleProps {
  jrsResult: JRSResponse | null;
  candidateName?: string;
  targetRole?: string;
}

interface Task {
  id: string;
  title: string;
  category: 'docs' | 'video' | 'practice' | 'project';
  duration: string;
  resourceName: string;
  resourceUrl: string;
  completed: boolean;
  gapName: string;
}

interface WeekPlan {
  weekNumber: number;
  title: string;
  focus: string;
  tasks: Task[];
}

export const EduPathModule: React.FC<EduPathModuleProps> = ({
  jrsResult,
  candidateName = 'Alex Chen',
  targetRole = 'Senior Distributed Systems Engineer',
}) => {
  // Dynamic list of skill gaps derived from JRS or fallback defaults
  const missingGaps: string[] =
    jrsResult?.critical_gaps && jrsResult.critical_gaps.length > 0
      ? jrsResult.critical_gaps
      : [
          'Kubernetes Cluster Management & Helm Charts',
          'Golang gRPC Microservices & Protobuf',
          'Distributed Caching & Redis Eviction Strategies',
        ];

  // Learning Tasks State
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 'task-1',
      gapName: 'Kubernetes Cluster Management & Helm Charts',
      title: 'Kubernetes Architecture & Core Primitives (Pods, Deployments, Services)',
      category: 'docs',
      duration: '3 hours',
      resourceName: 'Official Kubernetes Concepts Documentation',
      resourceUrl: 'https://kubernetes.io/docs/concepts/',
      completed: true,
    },
    {
      id: 'task-2',
      gapName: 'Kubernetes Cluster Management & Helm Charts',
      title: 'Hands-on Local Cluster Setup with Minikube / Kind',
      category: 'practice',
      duration: '4 hours',
      resourceName: 'Interactive Minikube Workshop',
      resourceUrl: 'https://minikube.sigs.k8s.io/docs/start/',
      completed: true,
    },
    {
      id: 'task-3',
      gapName: 'Kubernetes Cluster Management & Helm Charts',
      title: 'Packaging & Deploying Microservices using Helm Charts',
      category: 'project',
      duration: '6 hours',
      resourceName: 'Helm ArtifactHub & Microservice Template',
      resourceUrl: 'https://helm.sh/docs/',
      completed: false,
    },
    {
      id: 'task-4',
      gapName: 'Golang gRPC Microservices & Protobuf',
      title: 'Go Language Syntax & Concurrency Patterns (Goroutines, Channels)',
      category: 'video',
      duration: '5 hours',
      resourceName: 'Go by Example & Tour of Go',
      resourceUrl: 'https://gobyexample.com/',
      completed: false,
    },
    {
      id: 'task-5',
      gapName: 'Golang gRPC Microservices & Protobuf',
      title: 'Designing Protocol Buffers (.proto) Schemas & Code Generation',
      category: 'docs',
      duration: '3 hours',
      resourceName: 'gRPC Go Official Quickstart',
      resourceUrl: 'https://grpc.io/docs/languages/go/quickstart/',
      completed: false,
    },
    {
      id: 'task-6',
      gapName: 'Golang gRPC Microservices & Protobuf',
      title: 'Build a High-Throughput gRPC Service with Stream Interceptors',
      category: 'project',
      duration: '8 hours',
      resourceName: 'gRPC Microservice Project Blueprint',
      resourceUrl: 'https://github.com/grpc/grpc-go',
      completed: false,
    },
    {
      id: 'task-7',
      gapName: 'Distributed Caching & Redis Eviction Strategies',
      title: 'Redis Data Structures, Pub/Sub & Cache Invalidation Patterns',
      category: 'docs',
      duration: '2 hours',
      resourceName: 'Redis Developer Hub & Best Practices',
      resourceUrl: 'https://redis.io/docs/',
      completed: true,
    },
  ]);

  // Active Sub-Tab
  const [subTab, setSubTab] = useState<'plan' | 'resources' | 'report' | 'chat'>('plan');

  // Chat Agent State
  const [messages, setMessages] = useState<
    { sender: 'user' | 'agent'; text: string; timestamp: string }[]
  >([
    {
      sender: 'agent',
      text: `Hello ${candidateName}! I am EduPath, your personalized AI learning agent. Based on your profile and target role as "${targetRole}", I have analyzed your skill gaps and structured a 4-week dynamic learning path. How can I assist your learning journey today?`,
      timestamp: 'Just now',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Toggle Task Completion
  const toggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  // Progress Metrics Calculation
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const progressPercentage = Math.round((completedTasks / totalTasks) * 100);

  // Dynamic Weekly Plan Grouping
  const weeklyPlan: WeekPlan[] = [
    {
      weekNumber: 1,
      title: 'Core Fundamentals & Architecture',
      focus: 'Mastering Kubernetes Cluster Primitives & Redis Caching',
      tasks: tasks.slice(0, 2).concat(tasks.slice(6, 7)),
    },
    {
      weekNumber: 2,
      title: 'Hands-on Framework Mastery',
      focus: 'Helm Chart Packaging & Golang Language Concurrency',
      tasks: tasks.slice(2, 4),
    },
    {
      weekNumber: 3,
      title: 'Applied Real-World Microservices',
      focus: 'Building Protocol Buffers & High-Throughput gRPC Services',
      tasks: tasks.slice(4, 6),
    },
    {
      weekNumber: 4,
      title: 'Cap-Stone Integration & Verification',
      focus: 'Deploying Multi-Region Microservices & Verification Audit',
      tasks: [
        {
          id: 'task-8',
          gapName: 'Cap-Stone Project',
          title: 'Full Cap-Stone: Deploy Distributed Microservice Cluster on Kubernetes',
          category: 'project',
          duration: '10 hours',
          resourceName: 'EduPath Capstone Review Checklist',
          resourceUrl: '#',
          completed: false,
        },
      ],
    },
  ];

  // Handle Q&A Chat Submission
  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    const newMsg = { sender: 'user' as const, text: userMsg, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages((prev) => [...prev, newMsg]);
    setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      let replyText = `Great question! To master "${userMsg.slice(0, 30)}...", I recommend focusing first on hands-on practical exercises. `;
      if (userMsg.toLowerCase().includes('kubernetes') || userMsg.toLowerCase().includes('k8s')) {
        replyText = `For Kubernetes, your biggest gap is Helm package management. I suggest completing Week 2's "Packaging Microservices using Helm Charts" task. Practice setting up a local Kind cluster and deploying a multi-replica FastAPI deployment!`;
      } else if (userMsg.toLowerCase().includes('golang') || userMsg.toLowerCase().includes('grpc')) {
        replyText = `For Golang & gRPC, start by writing a simple .proto schema and generating Go stubs using protoc. Follow that up with stream interceptors for logging and authentication in Week 3!`;
      } else if (userMsg.toLowerCase().includes('project') || userMsg.toLowerCase().includes('idea')) {
        replyText = `A top project idea for your level: Build a "High-Throughput Log Aggregation Service" using Golang gRPC, caching frequent queries with Redis, and deploying to Kubernetes via Helm. This covers all 3 of your identified skill gaps!`;
      } else if (userMsg.toLowerCase().includes('report') || userMsg.toLowerCase().includes('progress')) {
        replyText = `You have completed ${completedTasks} of ${totalTasks} key learning tasks (${progressPercentage}% complete). You have successfully acquired Redis Caching & Kubernetes Primitives basics. Next priority: Helm Charts & gRPC.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'agent',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold backdrop-blur-sm">
              <GraduationCap className="w-4 h-4 text-indigo-300" />
              EduPath Autonomous Learning Agent
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Personalized Skill Gap & Learning Plan
            </h2>
            <p className="text-indigo-200 text-sm leading-relaxed">
              Target Role: <span className="font-semibold text-white">{targetRole}</span> • Candidate: <span className="font-semibold text-white">{candidateName}</span>
            </p>
          </div>

          {/* Overall Progress Gauge */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 flex items-center gap-4 min-w-[220px]">
            <div className="w-14 h-14 rounded-full bg-indigo-600/80 border-2 border-indigo-400 flex items-center justify-center font-black text-lg text-white shrink-0">
              {progressPercentage}%
            </div>
            <div>
              <div className="text-xs text-indigo-200 font-medium">Curriculum Progress</div>
              <div className="text-sm font-bold text-white mt-0.5">
                {completedTasks} / {totalTasks} Tasks Done
              </div>
              <div className="w-full bg-white/20 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-emerald-400 h-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 space-x-2">
        <button
          onClick={() => setSubTab('plan')}
          className={`pb-3 px-4 font-semibold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            subTab === 'plan'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Weekly Learning Plan
        </button>
        <button
          onClick={() => setSubTab('resources')}
          className={`pb-3 px-4 font-semibold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            subTab === 'resources'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Compass className="w-4 h-4" />
          Curated Gap Resources
        </button>
        <button
          onClick={() => setSubTab('report')}
          className={`pb-3 px-4 font-semibold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            subTab === 'report'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Periodic Progress Report
        </button>
        <button
          onClick={() => setSubTab('chat')}
          className={`pb-3 px-4 font-semibold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            subTab === 'chat'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-indigo-600" />
          AI EduPath Q&A Assistant
        </button>
      </div>

      {/* Sub-Tab 1: Weekly Learning Plan */}
      {subTab === 'plan' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                Adaptive 4-Week Learning Journey
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Tasks are tailored specifically to bridge your identified skill gaps. Click checkboxes as you complete activities.
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
              Auto-Adapts to Progress
            </span>
          </div>

          <div className="space-y-4">
            {weeklyPlan.map((week) => (
              <div
                key={week.weekNumber}
                className="rounded-2xl bg-white border border-slate-200 p-5 space-y-4 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                      W{week.weekNumber}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{week.title}</h4>
                      <p className="text-xs text-slate-500">{week.focus}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 self-start sm:self-auto">
                    {week.tasks.filter((t) => t.completed).length} / {week.tasks.length} Completed
                  </span>
                </div>

                <div className="space-y-2.5">
                  {week.tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                        task.completed
                          ? 'bg-emerald-50/40 border-emerald-200/80 text-slate-700'
                          : 'bg-slate-50/80 border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleTask(task.id)}
                          className="mt-0.5 cursor-pointer text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                          ) : (
                            <div className="w-5 h-5 rounded-md border-2 border-slate-300 bg-white hover:border-indigo-500" />
                          )}
                        </button>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`font-semibold text-xs ${
                                task.completed ? 'line-through text-slate-500' : 'text-slate-900'
                              }`}
                            >
                              {task.title}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200/60">
                              {task.gapName}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" /> {task.duration}
                            </span>
                            <span>•</span>
                            <a
                              href={task.resourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:underline inline-flex items-center gap-1 font-medium"
                            >
                              {task.resourceName} <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-1 rounded shrink-0 ${
                          task.category === 'project'
                            ? 'bg-amber-100 text-amber-800'
                            : task.category === 'practice'
                            ? 'bg-blue-100 text-blue-800'
                            : task.category === 'video'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {task.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Curated Learning Resources */}
      {subTab === 'resources' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-600" />
              Curated Skill Gap Resources & Practice Tasks
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Hand-picked documentation, interactive tutorials, and project ideas mapped directly to missing skill requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {missingGaps.map((gap: string, idx: number) => (
              <div
                key={idx}
                className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4 shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    {gap}
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold border border-amber-200">
                    Skill Gap #0{idx + 1}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-600" /> Recommended Documentation
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      Read official architectural guidelines and API reference guides before coding.
                    </p>
                    <a
                      href="https://kubernetes.io/docs/home/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline inline-flex items-center gap-1 text-[11px] font-semibold"
                    >
                      Explore Official Docs <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-emerald-600" /> Recommended Hands-On Project Idea
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      Build a mini microservice that implements this concept and add it to your GitHub portfolio for automated verification.
                    </p>
                    <div className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                      Project Idea: "High-Throughput Distributed Microservice for {gap.split(' ')[0]}"
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Periodic Progress Report */}
      {subTab === 'report' && (
        <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                <Check className="w-3.5 h-3.5" /> EduPath Periodic Evaluation Report
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mt-2">
                Learner Skill Gap & Readiness Report
              </h3>
              <p className="text-xs text-slate-500">
                Generated for <span className="font-semibold text-slate-700">{candidateName}</span> on {new Date().toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" /> Print / Export Report
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                Skills Acquired
              </span>
              <div className="text-2xl font-black text-emerald-900">
                {completedTasks} / {totalTasks}
              </div>
              <p className="text-[11px] text-emerald-700">Redis Caching & K8s Architecture Basics</p>
            </div>

            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 space-y-1">
              <span className="text-xs font-bold text-indigo-800 uppercase tracking-wide">
                Skills In Progress
              </span>
              <div className="text-2xl font-black text-indigo-900">
                {totalTasks - completedTasks}
              </div>
              <p className="text-[11px] text-indigo-700">Helm Package Manager & Golang gRPC</p>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">
                Target JRS Readiness
              </span>
              <div className="text-2xl font-black text-amber-900">
                {jrsResult
                  ? `${Math.round(jrsResult.overall_jrs > 1 ? jrsResult.overall_jrs : jrsResult.overall_jrs * 100)}%`
                  : '78%'}
              </div>
              <p className="text-[11px] text-amber-700">Projected: 95% upon Week 4 completion</p>
            </div>
          </div>

          <div className="space-y-3 border-t border-slate-100 pt-4 text-xs">
            <h4 className="font-bold text-slate-900 text-sm">Recommended Next Steps:</h4>
            <ul className="space-y-2 text-slate-700">
              <li className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-indigo-600" />
                Complete Week 2 Task: Packaging & Deploying Microservices with Helm Charts.
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-indigo-600" />
                Create GitHub Repository for Golang gRPC microservice project to trigger automatic proof verification.
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Sub-Tab 4: Natural Language AI Q&A Assistant */}
      {subTab === 'chat' && (
        <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">EduPath AI Learning Assistant</h3>
                <p className="text-[11px] text-slate-500">Ask any question about your curriculum, gaps, or resources</p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
              Live Agent
            </span>
          </div>

          {/* Chat History Box */}
          <div className="h-80 overflow-y-auto space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs shadow-sm space-y-1 ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                  <span
                    className={`text-[10px] block text-right ${
                      msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 text-slate-500 text-xs px-4 py-2 rounded-2xl rounded-bl-none flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                  EduPath is analyzing your learning path...
                </div>
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask a question about your learning journey (e.g. 'How do I bridge my gRPC gap?')"
              className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
            />
            <button
              onClick={handleSendMessage}
              disabled={!chatInput.trim()}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-sm"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
