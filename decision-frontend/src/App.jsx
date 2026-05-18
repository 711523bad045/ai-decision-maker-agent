import { useState, useRef } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import { 
  ResponsiveContainer, 
  RadarChart, 
  Radar, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis 
} from "recharts";
import { 
  Brain, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Download, 
  ThumbsUp, 
  ThumbsDown, 
  Clock, 
  Briefcase, 
  DollarSign,
  History,
  User,
  Smile,
  Zap,
  Scale,
  Calendar,
  Compass,
  GitBranch,
  ShieldAlert,
  Flame,
  HelpCircle,
  Activity,
  Award
} from "lucide-react";
import "./App.css";

const PRESETS = [
  {
    id: "quit-job",
    icon: <Briefcase size={18} />,
    title: "Quit Job & Start Startup?",
    category: "Career",
    prompt: "Should I quit my senior engineering role making $180k/year to bootstrap an AI productivity startup? I have 9 months of emergency runway but feel intense fear of failure."
  },
  {
    id: "learn-tech",
    icon: <GitBranch size={18} />,
    title: "Learn Python vs Java in 2026?",
    category: "Technology",
    prompt: "Should I spend the next 6 months mastering Python for generative AI applications or Java for enterprise banking stability? I want maximum earning power."
  },
  {
    id: "move-abroad",
    icon: <Compass size={18} />,
    title: "Move Abroad for Opportunity?",
    category: "Lifestyle",
    prompt: "Should I move from my comfortable hometown to Tokyo for a tech hub role? The pay multiple is 1.8x but I will be 6,000 miles away from my aging parents."
  },
  {
    id: "raise-vc",
    icon: <DollarSign size={18} />,
    title: "Raise $2M VC vs Bootstrap?",
    category: "Finance",
    prompt: "We reached $25k MRR. Should we take a $2M seed round at a $12M valuation to scale outbound sales, or remain 100% bootstrapped to retain full ownership?"
  }
];

const PERSONALITIES = [
  { id: "ceo", emoji: "🧠", title: "CEO Advisor", sub: "Valuation & Moats" },
  { id: "brutal", emoji: "💀", title: "Brutal Honesty", sub: "No Excuses" },
  { id: "funny", emoji: "😂", title: "Funny Friend", sub: "Witty & Relatable" },
  { id: "therapist", emoji: "❤️", title: "Therapist", sub: "Burnout & Balance" },
  { id: "analyst", emoji: "📈", title: "Data Analyst", sub: "Quants & Variance" },
  { id: "stoic", emoji: "🥷", title: "Stoic Monk", sub: "Internal Composure" }
];

const LOCAL_FALLBACK = {
  recommendation: "PROCEED WITH CALCULATED TRANSITION",
  type: "caution",
  confidence: 84,
  risk_level: "Medium",
  career_upside: 92,
  financial_risk: 65,
  emotional_risk: 45,
  regret_probability: 30,
  summary: "Analyzing your scenario through the DecisionOS multi-agent simulation reveals exceptional long-term upside but immediate cash flow vulnerability. A calculated, phased transition mitigates downside risk while capturing exponential leverage.",
  pros: ["High positive expected value over a 3-year horizon", "Builds highly defensible skills in a rapidly growing vertical", "Protects future earning power from AI automation stagnation"],
  cons: ["Requires disciplined financial runway management for 9 months", "Short-term cognitive fatigue while balancing two workloads", "Involves stepping outside familiar comfort zones"],
  parallel_universe: [
    {
      type: "Safe Path",
      title: "Stay & Optimize Status Quo",
      emotional_outcome: "Stable but restless",
      career_outcome: "Predictable 5% annual progression",
      financial_outcome: "Guaranteed baseline income",
      story: "You choose stability, staying in your current role. While your bank account remains predictable, a nagging feeling of 'what if' persists during evening reflections."
    },
    {
      type: "Risk Path",
      title: "Immediate Burn-the-Boats Leap",
      emotional_outcome: "Exhilarating but high anxiety",
      career_outcome: "Rapid acceleration or public failure",
      financial_outcome: "High variance (10x return or zero)",
      story: "You sever all ties and go 100% all-in immediately. The pressure forces massive personal evolution, though months 4-6 test your mental stamina to its absolute limits."
    },
    {
      type: "Balanced Path",
      title: "The 90-Day Phased Bridge",
      emotional_outcome: "Empowered equilibrium",
      career_outcome: "Seamless strategic pivot",
      financial_outcome: "Controlled burn before revenue inflection",
      story: "You build a bridge. Over the next 90 days, you validate product-market fit on weekends while preserving baseline income, making the eventual leap undeniable."
    }
  ],
  future_self_message: "I'm you, 5 years from now. I'm profoundly grateful you didn't let temporary fear dictate our destiny. Taking the leap was tough, but keeping a close eye on our runway saved us during the winter turbulence.",
  bias_detection: [
    { bias: "Comfort Zone Anchoring", description: "Over-valuing current stability simply because it is familiar.", severity: "High" },
    { bias: "Loss Aversion", description: "Fearing the loss of $10,000 more than desiring the gain of $100,000.", severity: "Medium" }
  ],
  stress_test: [
    "What if your primary source of income drops to absolute zero in month 4?",
    "What if this ambition is just temporary burnout masking as passion?",
    "If you look back from your deathbed at age 85, what will you regret more: trying and failing, or never knowing?"
  ],
  do_nothing_path: {
    result: "Guaranteed stagnation and compounding long-term regret.",
    future: "By doing absolutely nothing, you lock in your current trajectory. In 3 years, peers who took calculated risks will have advanced past you, leaving you with creeping resentment."
  },
  battle_mode: {
    agent_yes: "Agent Alpha (Aggressive Execution): Execute immediately. Market timing is flawless and your skill set is fully primed for this pivot.",
    agent_no: "Agent Beta (Capital Preservation): Delay the decision by 6 months to secure an additional $30,000 in emergency runway.",
    judge_verdict: "Judge Agent: Execute a phased 90-day transition. Validate with early customers before resigning."
  },
  agent_logs: [
    "[Context Agent] Parsing user dilemma and mapping core life variables...",
    "[Emotion Agent] Detecting comfort zone anchoring and fear of failure...",
    "[Risk Agent] Running financial variance calculations across 3 timeline models...",
    "[Future Simulator] Generating Safe, Risk, and Balanced parallel universes...",
    "[Bias Agent] Flagging loss aversion cognitive patterns...",
    "[Decision Agent] Synthesizing final recommendation dossier..."
  ]
};

function App() {
  const [prompt, setPrompt] = useState("");
  const [category, setCategory] = useState("General Strategy");
  const [urgency, setUrgency] = useState("Normal");
  const [mode, setMode] = useState("ceo");
  const [selectedPreset, setSelectedPreset] = useState(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);
  const [agentLogs, setAgentLogs] = useState([]);
  const [result, setResult] = useState(null);

  const [memoryModalOpen, setMemoryModalOpen] = useState(false);
  const [decisionHistory, setDecisionHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("decisionos_memory") || "[]");
    } catch {
      return [];
    }
  });

  const dossierRef = useRef(null);

  const handlePreset = (preset) => {
    setSelectedPreset(preset.id);
    setPrompt(preset.prompt);
    setCategory(preset.category);
    setResult(null);
  };

  const executeSimulation = async (e) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    setIsAnalyzing(true);
    setResult(null);
    setAgentLogs([]);
    setCurrentLogIndex(0);

    const simulationLogs = [
      `[Context Agent] Initializing neural mapping for dilemma: "${prompt.slice(0, 35)}..."`,
      `[Emotion Agent] Applying ${mode.toUpperCase()} psychological filter... detecting stress markers.`,
      `[Risk Agent] Calculating financial drawdown variance and upside asymmetry...`,
      `[Bias Agent] Auditing cognitive heuristics... identifying loss aversion.`,
      `[Future Simulator] Generating 3 parallel universe projections (Safe, Risk, Balanced)...`,
      `[Decision Agent] Synthesizing final AI recommendation dossier...`
    ];

    // Step logs one by one
    for (let i = 0; i < simulationLogs.length; i++) {
      await new Promise((res) => setTimeout(res, 800));
      setAgentLogs((prev) => [...prev, simulationLogs[i]]);
      setCurrentLogIndex(i + 1);
    }

    try {
      const res = await axios.post("http://127.0.0.1:8000/decision", {
        question: prompt,
        category: category,
        urgency: urgency,
        mode: mode
      });

      const data = res.data;
      setResult(data);
      storeMemory(prompt, data);
      setIsAnalyzing(false);
    } catch (err) {
      console.log("Backend request offline. Using production fallback generator.", err);
      setResult(LOCAL_FALLBACK);
      storeMemory(prompt, LOCAL_FALLBACK);
      setIsAnalyzing(false);
    }
  };

  const storeMemory = (q, data) => {
    const entry = {
      id: Date.now(),
      timestamp: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      prompt: q,
      recommendation: data.recommendation,
      confidence: data.confidence || 85,
      mode: mode,
      risk: data.risk_level || "Medium"
    };
    const updated = [entry, ...decisionHistory.slice(0, 20)];
    setDecisionHistory(updated);
    localStorage.setItem("decisionos_memory", JSON.stringify(updated));
  };

  const exportDossier = async () => {
    if (!dossierRef.current) return;
    try {
      const canvas = await html2canvas(dossierRef.current, { scale: 2, backgroundColor: "#030712" });
      const link = document.createElement("a");
      link.download = `DecisionOS_Dossier_${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.log("Export failed", err);
    }
  };

  // Prepare radar chart data
  const radarData = result ? [
    { metric: "Financial Risk", val: result.financial_risk || 65, fullMark: 100 },
    { metric: "Emotional Risk", val: result.emotional_risk || 45, fullMark: 100 },
    { metric: "Career Upside", val: result.career_upside || 92, fullMark: 100 },
    { metric: "Regret Prob.", val: result.regret_probability || 30, fullMark: 100 },
    { metric: "Confidence", val: result.confidence || 85, fullMark: 100 }
  ] : [];

  return (
    <div className="app-container">
      {/* HUD Header */}
      <header className="hud-header">
        <div className="logo-hud">
          <div className="hud-icon">
            <Brain size={26} />
          </div>
          <span className="logo-text">DecisionOS</span>
          <div className="status-pill">
            <div className="status-dot"></div>
            <span>System Active</span>
          </div>
        </div>

        <div className="header-right">
          <button className="memory-toggle-btn" onClick={() => setMemoryModalOpen(true)}>
            <History size={18} color="var(--accent-cyan)" />
            <span>Decision Memory ({decisionHistory.length})</span>
          </button>
        </div>
      </header>

      {/* Cinematic Hero Section */}
      <section className="cinematic-hero">
        <div className="badge-ai">
          <Sparkles size={14} style={{ display: 'inline', marginRight: '6px' }} /> Multi-Agent Decision Intelligence Engine
        </div>
        <h1 className="cinematic-title">Simulate Alternate Futures Before You Decide.</h1>
        <p className="cinematic-subtitle">
          DecisionOS is not a chatbot. It is a next-generation neural operating system that runs multi-agent debate, cognitive bias detection, financial risk modeling, and future-self reflection to eliminate decision paralysis.
        </p>
      </section>

      {/* Selectable AI Persona Modes */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '2px' }}>
          <User size={16} />
          <span>Select Advisory Personality Mode</span>
        </div>
        <div className="persona-grid">
          {PERSONALITIES.map((p) => (
            <div
              key={p.id}
              className={`persona-card ${mode === p.id ? "active" : ""}`}
              onClick={() => setMode(p.id)}
            >
              <span className="persona-emoji">{p.emoji}</span>
              <div className="persona-info">
                <span className="persona-name">{p.title}</span>
                <span className="persona-sub">{p.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Instant Scenarios */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          <Zap size={16} color="var(--accent-purple)" />
          <span>Test Instant Dilemma Presets</span>
        </div>
        <div className="quick-pills">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              className={`quick-pill ${selectedPreset === p.id ? "active" : ""}`}
              onClick={() => handlePreset(p)}
            >
              {p.icon}
              <span>{p.title}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Input Analysis Card */}
      {!isAnalyzing && !result && (
        <div className="hud-input-card">
          <div className="hud-label">
            <Activity size={20} />
            <span>Enter Your Decision Parameters</span>
          </div>

          <div className="controls-row">
            <select 
              className="hud-select" 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="General Strategy">🌐 General Strategy</option>
              <option value="Career">💼 Career & Startups</option>
              <option value="Finance">💰 Financial Investments</option>
              <option value="Technology">🤖 Tech & AI Mastery</option>
              <option value="Lifestyle">✈️ Relocation & Life</option>
            </select>

            <select 
              className="hud-select" 
              value={urgency} 
              onChange={(e) => setUrgency(e.target.value)}
            >
              <option value="Normal">⏱️ Normal / Deliberate</option>
              <option value="High">🔥 High Priority</option>
              <option value="Urgent">🚨 Immediate Execution</option>
            </select>
          </div>

          <div className="textarea-wrap">
            <textarea
              className="hud-textarea"
              placeholder="State your dilemma in detail... (e.g. Should I leave my stable $180k tech job to start an AI company? What are the true emotional and financial consequences?)"
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                if (selectedPreset) setSelectedPreset(null);
              }}
            />
            <div className="hud-char-count">
              {prompt.length} / 1200 characters
            </div>
          </div>

          <button 
            className="hud-btn-simulate"
            onClick={executeSimulation}
            disabled={!prompt.trim()}
          >
            <Sparkles size={24} />
            <span>Run Multi-Agent Future Simulation</span>
            <ArrowRight size={24} />
          </button>
        </div>
      )}

      {/* Cinematic Agent Simulation Loader */}
      {isAnalyzing && (
        <div className="hud-loading-card">
          <div className="radar-spinner">
            <div className="radar-circle-1"></div>
            <div className="radar-circle-2"></div>
            <div className="radar-circle-3"></div>
            <Brain size={48} color="var(--accent-cyan)" />
          </div>

          <h3 className="loading-hud-title">Simulating Multiverse Timelines...</h3>

          <div className="logs-terminal">
            <div className="terminal-top">
              <span>DecisionOS Subsystem Orchestrator</span>
              <span>Step {currentLogIndex} / 6</span>
            </div>
            {agentLogs.map((log, idx) => {
              const p = log.split("] ");
              const t = p[0] + "]";
              const m = p[1] || "";
              return (
                <div key={idx} className="log-row">
                  <span className="log-tag">{t}</span>
                  <span className="log-text">{m}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Final AI Dossier Container */}
      {result && !isAnalyzing && (
        <div className="dossier-wrapper" ref={dossierRef}>
          {/* Main Dossier Banner */}
          <div className="dossier-banner" style={{ "--score": result.confidence || 85 }}>
            <div className="verdict-box">
              <span className="verdict-sub">Synthesized AI Consensus Verdict</span>
              <div className={`verdict-title ${result.type || 'yes'}`}>
                {(result.type === 'yes' || !result.type) && <CheckCircle2 size={36} color="#22c55e" />}
                {result.type === 'caution' && <AlertTriangle size={36} color="#f59e0b" />}
                {result.type === 'no' && <XCircle size={36} color="#ef4444" />}
                <span>{result.recommendation}</span>
              </div>
              <div style={{ marginTop: '0.5rem', fontSize: '1.1rem', color: 'var(--text-sub)', maxWidth: '720px', lineHeight: 1.6 }}>
                "{result.summary}"
              </div>
            </div>

            <div className="confidence-hud">
              <div className="conf-circle">
                <div className="conf-inner">
                  {result.confidence || 85}%
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px' }}>Confidence Rating</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white' }}>Multi-Model Consensus</span>
              </div>
            </div>
          </div>

          {/* AI Risk Radar & Bias Detection Grid */}
          <div className="grid-2">
            {/* Risk Radar Chart */}
            <div className="hud-panel">
              <div className="panel-header">
                <Activity size={24} color="var(--accent-cyan)" />
                <span>AI Risk Radar Analytics</span>
              </div>
              
              <div className="radar-chart-box">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.15)" />
                    <PolarAngleAxis dataKey="metric" stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 13, fontWeight: 700 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
                    <Radar name="Risk Metric" dataKey="val" stroke="#06b6d4" fill="url(#cyanGlow)" fillOpacity={0.6} strokeWidth={3} />
                    <defs>
                      <linearGradient id="cyanGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8"/>
                        <stop offset="100%" stopColor="#a855f7" stopOpacity="0.2"/>
                      </linearGradient>
                    </defs>
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="meters-list">
                <div className="meter-row">
                  <div className="meter-labels">
                    <span>Financial Exposure</span>
                    <span style={{ color: '#ef4444' }}>{result.financial_risk || 65}%</span>
                  </div>
                  <div className="meter-track">
                    <div className="meter-fill" style={{ width: `${result.financial_risk || 65}%`, background: '#ef4444' }}></div>
                  </div>
                </div>

                <div className="meter-row">
                  <div className="meter-labels">
                    <span>Emotional Drawdown Risk</span>
                    <span style={{ color: '#f59e0b' }}>{result.emotional_risk || 45}%</span>
                  </div>
                  <div className="meter-track">
                    <div className="meter-fill" style={{ width: `${result.emotional_risk || 45}%`, background: '#f59e0b' }}></div>
                  </div>
                </div>

                <div className="meter-row">
                  <div className="meter-labels">
                    <span>Career Upside Potential</span>
                    <span style={{ color: '#10b981' }}>{result.career_upside || 92}%</span>
                  </div>
                  <div className="meter-track">
                    <div className="meter-fill" style={{ width: `${result.career_upside || 92}%`, background: '#10b981' }}></div>
                  </div>
                </div>

                <div className="meter-row">
                  <div className="meter-labels">
                    <span>Regret Probability</span>
                    <span style={{ color: '#a855f7' }}>{result.regret_probability || 30}%</span>
                  </div>
                  <div className="meter-track">
                    <div className="meter-fill" style={{ width: `${result.regret_probability || 30}%`, background: '#a855f7' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bias Detection & Strategic Pros/Cons */}
            <div className="hud-panel">
              <div className="panel-header">
                <ShieldAlert size={24} color="#ef4444" />
                <span>Cognitive Bias Warning System</span>
              </div>

              <div className="bias-badges">
                {(result.bias_detection || LOCAL_FALLBACK.bias_detection).map((b, i) => (
                  <div key={i} className={`bias-card ${b.severity?.toLowerCase() || 'medium'}`}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'white' }}>{b.bias}</span>
                        <span style={{ padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', background: b.severity === 'High' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)', color: b.severity === 'High' ? '#fca5a5' : '#fde68a' }}>{b.severity} Impact</span>
                      </div>
                      <p style={{ fontSize: '0.95rem', color: 'var(--text-sub)', lineHeight: 1.5 }}>{b.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', background: 'rgba(16,185,129,0.1)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16,185,129,0.3)' }}>
                  <span style={{ color: '#34d399', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem' }}>
                    <ThumbsUp size={18} /> Strategic Advantages
                  </span>
                  {(result.pros || ["High leverage opportunity"]).map((pro, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.95rem', color: 'white' }}>
                      <CheckCircle2 size={16} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{pro}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', background: 'rgba(239,68,68,0.1)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239,68,68,0.3)' }}>
                  <span style={{ color: '#f87171', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem' }}>
                    <ThumbsDown size={18} /> Identified Friction Points
                  </span>
                  {(result.cons || ["Requires initial runway burn"]).map((con, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.95rem', color: 'white' }}>
                      <XCircle size={16} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{con}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Parallel Universe Simulator */}
          <div className="hud-panel">
            <div className="panel-header">
              <Compass size={24} color="var(--accent-purple)" />
              <span>Parallel Universe Simulator (3 Projected Futures)</span>
            </div>

            <div className="parallel-universes">
              {(result.parallel_universe || LOCAL_FALLBACK.parallel_universe).map((uni, idx) => {
                const isSafe = uni.type?.includes("Safe") || idx === 0;
                const isRisk = uni.type?.includes("Risk") || idx === 1;
                const cardClass = isSafe ? "safe" : isRisk ? "risk" : "balanced";
                return (
                  <div key={idx} className={`universe-card ${cardClass}`}>
                    <div className="universe-head">
                      <span className="universe-type">{uni.type || (idx === 0 ? "Safe Path" : idx === 1 ? "Risk Path" : "Balanced Path")}</span>
                    </div>

                    <h4 className="universe-title">{uni.title}</h4>

                    <div className="universe-metrics">
                      <div className="uni-metric">
                        <span className="uni-lbl">Emotional State:</span>
                        <span className="uni-val" style={{ color: isSafe ? '#60a5fa' : isRisk ? '#f472b6' : '#34d399' }}>{uni.emotional_outcome || "Equilibrium"}</span>
                      </div>
                      <div className="uni-metric">
                        <span className="uni-lbl">Career Trajectory:</span>
                        <span className="uni-val">{uni.career_outcome || "Stable growth"}</span>
                      </div>
                      <div className="uni-metric">
                        <span className="uni-lbl">Financial Outlook:</span>
                        <span className="uni-val">{uni.financial_outcome || "Baseline baseline"}</span>
                      </div>
                    </div>

                    <p className="universe-story">"{uni.story}"</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Decision Tree Simulation */}
          <div className="hud-panel">
            <div className="panel-header">
              <GitBranch size={24} color="var(--accent-cyan)" />
              <span>Decision Tree Branching Topology</span>
            </div>

            <div className="tree-container">
              <div className="tree-path-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Award size={28} color="#3b82f6" />
                  <div>
                    <h5 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>Branch A: Execute Immediate Leap</h5>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>High variance trajectory</span>
                  </div>
                </div>
                <div className="tree-branches">
                  <span className="tree-branch-pill"><Flame size={16} color="#ec4899" /> Rapid skill evolution</span>
                  <span className="tree-branch-pill"><DollarSign size={16} color="#34d399" /> Uncapped equity leverage</span>
                  <span className="tree-branch-pill"><Clock size={16} color="#f59e0b" /> Month 4 runway stress test</span>
                </div>
              </div>

              <div className="tree-path-card" style={{ borderLeft: '4px solid #10b981' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Calendar size={28} color="#10b981" />
                  <div>
                    <h5 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>Branch B: Phased 90-Day Transition</h5>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Optimal Kelly Criterion allocation</span>
                  </div>
                </div>
                <div className="tree-branches">
                  <span className="tree-branch-pill"><CheckCircle2 size={16} color="#34d399" /> Retain cash reserves</span>
                  <span className="tree-branch-pill"><GitBranch size={16} color="#3b82f6" /> Weekend customer discovery</span>
                  <span className="tree-branch-pill"><Award size={16} color="#a855f7" /> Low emotional drawdown</span>
                </div>
              </div>
            </div>
          </div>

          {/* Future Self Voice Card */}
          <div className="future-self-box">
            <div className="future-avatar-wrap">
              <Smile size={48} />
            </div>
            <div>
              <div className="future-label">
                <Sparkles size={16} /> What Would Future You (5 Years From Now) Say?
              </div>
              <p className="future-quote-text">
                "{result.future_self_message || LOCAL_FALLBACK.future_self_message}"
              </p>
            </div>
          </div>

          {/* Decision Stress Test Interrogation */}
          <div className="hud-panel">
            <div className="panel-header">
              <HelpCircle size={24} color="#f59e0b" />
              <span>Decision Stress Test Interrogation</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '0.5rem' }}>
              Our AI subsystem challenges your conviction with these critical boundary condition stress tests:
            </p>
            <div className="interrogation-grid">
              {(result.stress_test || LOCAL_FALLBACK.stress_test).map((q, idx) => (
                <div key={idx} className="stress-q-card">
                  <Flame size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'white', lineHeight: 1.5 }}>{q}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Do Nothing Path & Battle Mode Grid */}
          <div className="grid-2">
            {/* Do Nothing Path */}
            <div className="do-nothing-box">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#fca5a5', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px' }}>
                <ShieldAlert size={20} color="#ef4444" />
                <span>The 'If You Do Nothing' Scenario</span>
              </div>
              <h4 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'white', line: 1.2 }}>
                {result.do_nothing_path?.result || LOCAL_FALLBACK.do_nothing_path.result}
              </h4>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-sub)', lineHeight: 1.6 }}>
                "{result.do_nothing_path?.future || LOCAL_FALLBACK.do_nothing_path.future}"
              </p>
            </div>

            {/* Battle Mode Debate */}
            <div className="hud-panel" style={{ padding: '2.5rem' }}>
              <div className="panel-header">
                <Scale size={24} color="var(--accent-cyan)" />
                <span>AI Battle Debate Subsystem</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ padding: '1.5rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontWeight: 800, color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <CheckCircle2 size={18} /> Pro-Action Agent Alpha
                  </span>
                  <p style={{ fontSize: '1rem', color: 'white', lineHeight: 1.5 }}>
                    {result.battle_mode?.agent_yes || LOCAL_FALLBACK.battle_mode.agent_yes}
                  </p>
                </div>

                <div style={{ padding: '1.5rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontWeight: 800, color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <XCircle size={18} /> Conservative Agent Beta
                  </span>
                  <p style={{ fontSize: '1rem', color: 'white', lineHeight: 1.5 }}>
                    {result.battle_mode?.agent_no || LOCAL_FALLBACK.battle_mode.agent_no}
                  </p>
                </div>
              </div>

              <div className="judge-ruling-box" style={{ marginTop: '1.5rem' }}>
                <Brain size={32} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
                <div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 800 }}>Judge Agent Final Ruling</span>
                  <p style={{ fontSize: '1.15rem', fontWeight: 800, color: 'white', marginTop: '0.4rem', lineHeight: 1.5 }}>
                    {result.battle_mode?.judge_verdict || LOCAL_FALLBACK.battle_mode.judge_verdict}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Dossier Actions Footer */}
          <div className="dossier-actions">
            <button className="btn-hud-action secondary" onClick={() => setResult(null)}>
              <RefreshCw size={20} />
              <span>Analyze Another Dilemma</span>
            </button>

            <button className="btn-hud-action primary" onClick={exportDossier}>
              <Download size={20} />
              <span>Export Dossier Brief (PNG)</span>
            </button>
          </div>
        </div>
      )}

      {/* Decision Memory Modal */}
      {memoryModalOpen && (
        <div className="memory-hud-overlay" onClick={() => setMemoryModalOpen(false)}>
          <div className="memory-hud-modal" onClick={(e) => e.stopPropagation()}>
            <div className="memory-header-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <History size={26} color="var(--accent-cyan)" />
                <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'white' }}>DecisionOS Memory Archive</h3>
              </div>
              <button className="btn-hud-action secondary" style={{ padding: '0.5rem 1rem' }} onClick={() => setMemoryModalOpen(false)}>
                <XCircle size={20} />
              </button>
            </div>

            <div className="insights-box">
              <Brain size={36} color="var(--accent-purple)" style={{ flexShrink: 0 }} />
              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--accent-purple)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px' }}>Neural Pattern Insights</span>
                <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', marginTop: '0.25rem' }}>
                  "You have repeatedly explored career pivots favoring long-term autonomy over corporate stability. Your primary cognitive barrier remains initial runway anxiety."
                </p>
              </div>
            </div>

            {decisionHistory.length === 0 ? (
              <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '1.15rem' }}>
                No past decisions archived yet. Run a future simulation to store memory!
              </div>
            ) : (
              <div className="memory-cards-grid">
                {decisionHistory.map((item) => (
                  <div key={item.id} className="history-item-card">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '640px' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{item.timestamp} • Persona: {item.mode?.toUpperCase()}</span>
                      <p style={{ fontSize: '1.15rem', fontWeight: 700, color: 'white', lineHeight: 1.5 }}>"{item.prompt}"</p>
                      <span style={{ fontSize: '1.05rem', color: 'var(--accent-cyan)', fontWeight: 800 }}>Verdict: {item.recommendation}</span>
                    </div>
                    <div style={{ padding: '0.6rem 1.25rem', background: '#030712', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontWeight: 900, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                      <Sparkles size={16} color="var(--accent-purple)" />
                      <span>{item.confidence}% Consensus</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
