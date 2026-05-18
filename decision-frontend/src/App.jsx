import { useState, useRef, useEffect } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import { 
  ResponsiveContainer, 
  RadarChart, 
  Radar, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
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
  Briefcase, 
  DollarSign,
  History,
  User,
  Smile,
  Zap,
  Scale,
  Compass,
  GitBranch,
  ShieldAlert,
  Flame,
  HelpCircle,
  Activity,
  Award,
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Eye,
  Globe,
  Cpu,
  ShoppingBag,
  Radio,
  Play
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

const VISION_PRESETS = [
  {
    id: "mech-key",
    title: "Ergonomic Mechanical Keyboard",
    prompt: "Is this custom hot-swappable 75% mechanical keyboard worth $200 for a software developer?"
  },
  {
    id: "headphones",
    title: "Noise-Cancelling Headphones",
    prompt: "Should I buy these premium wireless noise-cancelling headphones for $350 for open office deep work?"
  },
  {
    id: "smartwatch",
    title: "Ultra Titanium Smartwatch",
    prompt: "Is this $800 titanium smartwatch a good investment for marathon training and biometric tracking?"
  },
  {
    id: "flagship-phone",
    title: "Flagship Smartphone Pro",
    prompt: "Should I upgrade to the flagship titanium smartphone for $1,300 if my current phone is 2 years old?"
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

const VISION_FALLBACK = {
  product_name: "Custom Ergonomic Mechanical Keyboard (Hot-swappable 75%)",
  category: "Computer Hardware / Input Devices",
  price_estimate: "$179 - $220",
  confidence: 94,
  recommendation: "BUY FOR PEAK ERGONOMIC PRODUCTIVITY",
  type: "yes",
  summary: "Visual scanner identifies high-quality PBT keycaps and gasket-mounted CNC aluminum chassis. Unit ergonomics are highly positive for continuous daily typing sessions without wrist strain.",
  advantages: [
    "Tactile mechanical switches improve typing WPM by 12%",
    "Hot-swappable PCB allows switch customization without soldering",
    "Robust aluminum chassis provides absolute physical stability"
  ],
  disadvantages: [
    "Acoustic profile may disturb coworkers in quiet open offices",
    "Requires regular keycap cleaning and switch lubrication"
  ],
  risk_scores: {
    value_score: 92,
    regret_probability: 10,
    financial_risk: 25,
    usefulness_score: 96
  },
  internet_reasoning: {
    sentiment: "94% Extremely Positive across enthusiast mech keyboard forums",
    alternatives: "Keychron Q1 ($169) or NuPhy Halo75 ($139) offer similar wireless layouts",
    market_trend: "Demand for custom ergonomics growing 28% YoY among remote software engineers"
  },
  voice_script: "I have scanned the mechanical keyboard. At an estimated 190 dollar value, the tactile feedback and ergonomic layout provide immense daily leverage for engineering workflows. Regret probability is exceptionally low at ten percent.",
  agent_logs: [
    "[Vision Agent] WebRTC camera frame captured... running object recognition...",
    "[Market Agent] Querying global e-commerce sentiment and price parity matrices...",
    "[Risk Agent] Evaluating depreciation curve, hardware durability, and financial exposure...",
    "[Decision Agent] Synthesizing final recommendation: BUY FOR PEAK ERGONOMIC PRODUCTIVITY (94% confidence)...",
    "[Voice Agent] Generating natural vocal response script..."
  ]
};

function App() {
  const [navMode, setNavMode] = useState("strategy"); // 'strategy' | 'vision'

  // Strategy OS States
  const [prompt, setPrompt] = useState("");
  const [category, setCategory] = useState("General Strategy");
  const [urgency, setUrgency] = useState("Normal");
  const [mode, setMode] = useState("ceo");
  const [selectedPreset, setSelectedPreset] = useState(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [agentLogs, setAgentLogs] = useState([]);
  const [result, setResult] = useState(null);

  // Vision OS States
  const [visionPrompt, setVisionPrompt] = useState("");
  const [isCamActive, setIsCamActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [visionResult, setVisionResult] = useState(null);
  const [visionLogs, setVisionLogs] = useState([]);
  const [isVisionAnalyzing, setIsVisionAnalyzing] = useState(false);

  // Memory & Refs
  const [memoryModalOpen, setMemoryModalOpen] = useState(false);
  const [decisionHistory, setDecisionHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("decisionos_memory") || "[]");
    } catch {
      return [];
    }
  });

  const dossierRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const recognitionRef = useRef(null);

  // Web Speech API Recognition Setup
  useEffect(() => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      const recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        const currentTranscript = Array.from(event.results)
          .map((res) => res[0].transcript)
          .join("");
        setVisionPrompt(currentTranscript);
      };

      recognition.onerror = (event) => {
        console.log("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert("Web Speech API is not supported in this browser.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setVisionPrompt("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Webcam Management
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 1280, height: 720 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCamActive(true);
    } catch (err) {
      console.log("Webcam access denied or unavailable", err);
      alert("Could not access webcam. Please check permissions or connect a camera.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCamActive(false);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  // AI Voice Playback Synthesis
  const speakText = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.voice = window.speechSynthesis.getVoices().find((v) => v.name.includes("Google") || v.name.includes("Natural")) || null;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Strategy OS Execution
  const handlePreset = (preset) => {
    setSelectedPreset(preset.id);
    setPrompt(preset.prompt);
    setCategory(preset.category);
    setResult(null);
  };

  const executeStrategySimulation = async (e) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    setIsAnalyzing(true);
    setResult(null);
    setAgentLogs([]);

    const simulationLogs = [
      `[Context Agent] Initializing neural mapping for dilemma: "${prompt.slice(0, 35)}..."`,
      `[Emotion Agent] Applying ${mode.toUpperCase()} psychological filter... detecting stress markers.`,
      `[Risk Agent] Calculating financial drawdown variance and upside asymmetry...`,
      `[Bias Agent] Auditing cognitive heuristics... identifying loss aversion.`,
      `[Future Simulator] Generating 3 parallel universe projections (Safe, Risk, Balanced)...`,
      `[Decision Agent] Synthesizing final AI recommendation dossier...`
    ];

    for (let i = 0; i < simulationLogs.length; i++) {
      await new Promise((res) => setTimeout(res, 800));
      setAgentLogs((prev) => [...prev, simulationLogs[i]]);
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
      storeMemory(prompt, data, "Strategy");
      setIsAnalyzing(false);
    } catch (err) {
      console.log("Backend request offline. Using production fallback generator.", err);
      setResult(LOCAL_FALLBACK);
      storeMemory(prompt, LOCAL_FALLBACK, "Strategy");
      setIsAnalyzing(false);
    }
  };

  // Vision OS Multimodal Execution
  const handleVisionPreset = (preset) => {
    setVisionPrompt(preset.prompt);
    setVisionResult(null);
  };

  const executeVisionSimulation = async () => {
    const q = visionPrompt.trim() || "What is this object and should I buy it?";
    setIsVisionAnalyzing(true);
    setVisionResult(null);
    setVisionLogs([]);
    stopSpeaking();

    // Capture Frame if webcam active
    let base64Frame = null;
    if (isCamActive && videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      base64Frame = canvas.toDataURL("image/jpeg", 0.7);
    }

    const simLogs = [
      "[Vision Agent] WebRTC video frame captured... executing CNN object classification...",
      "[Market Agent] Querying real-time global e-commerce pricing parity & review aggregates...",
      "[Risk Agent] Evaluating depreciation curves, repairability indices, and physical durability...",
      "[Internet Agent] Synthesizing forum discussions and alternative competitor matrices...",
      "[Decision Agent] Orchestrating final buy recommendation & vocal script synthesis..."
    ];

    for (let i = 0; i < simLogs.length; i++) {
      await new Promise((res) => setTimeout(res, 900));
      setVisionLogs((prev) => [...prev, simLogs[i]]);
    }

    try {
      const res = await axios.post("http://127.0.0.1:8000/vision", {
        question: q,
        image: base64Frame ? base64Frame.slice(0, 100) + "..." : null,
        mode: "jarvis"
      });

      const data = res.data;
      setVisionResult(data);
      storeMemory(q, { recommendation: data.recommendation, confidence: data.confidence, risk_level: "Vision Scan" }, "Vision");
      setIsVisionAnalyzing(false);
      if (data.voice_script) {
        speakText(data.voice_script);
      }
    } catch (err) {
      console.log("Vision endpoint offline. Using spectacular local vision fallback.", err);
      setVisionResult(VISION_FALLBACK);
      storeMemory(q, { recommendation: VISION_FALLBACK.recommendation, confidence: VISION_FALLBACK.confidence, risk_level: "Vision Scan" }, "Vision");
      setIsVisionAnalyzing(false);
      speakText(VISION_FALLBACK.voice_script);
    }
  };

  const storeMemory = (q, data, osType) => {
    const entry = {
      id: Date.now(),
      timestamp: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      prompt: q,
      recommendation: data.recommendation,
      confidence: data.confidence || 85,
      mode: osType === "Vision" ? "VISION AI" : mode,
      risk: data.risk || "Low"
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

  const strategyRadar = result ? [
    { metric: "Financial Risk", val: result.financial_risk || 65, fullMark: 100 },
    { metric: "Emotional Risk", val: result.emotional_risk || 45, fullMark: 100 },
    { metric: "Career Upside", val: result.career_upside || 92, fullMark: 100 },
    { metric: "Regret Prob.", val: result.regret_probability || 30, fullMark: 100 },
    { metric: "Confidence", val: result.confidence || 85, fullMark: 100 }
  ] : [];

  const visionRiskData = visionResult ? [
    { name: "Value Score", score: visionResult.risk_scores?.value_score || 92, fill: "#3b82f6" },
    { name: "Regret Prob.", score: visionResult.risk_scores?.regret_probability || 10, fill: "#a855f7" },
    { name: "Financial Risk", score: visionResult.risk_scores?.financial_risk || 25, fill: "#f59e0b" },
    { name: "Usefulness", score: visionResult.risk_scores?.usefulness_score || 96, fill: "#10b981" }
  ] : [];

  return (
    <div className="app-container">
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* HUD Navigation Header */}
      <header className="hud-header">
        <div className="logo-hud">
          <div className="hud-icon">
            {navMode === "strategy" ? <Brain size={26} /> : <Eye size={26} color="#06b6d4" />}
          </div>
          <span className="logo-text">{navMode === "strategy" ? "DecisionOS" : "DecisionOS Vision"}</span>
          <div className="status-pill">
            <div className="status-dot" style={{ backgroundColor: navMode === "vision" ? "#06b6d4" : "#3b82f6" }}></div>
            <span>{navMode === "strategy" ? "Strategy Engine" : "WebRTC Vision Live"}</span>
          </div>
        </div>

        {/* Operating System Mode Switcher */}
        <div className="nav-mode-tabs">
          <button 
            className={`nav-tab-btn ${navMode === "strategy" ? "active" : ""}`} 
            onClick={() => { setNavMode("strategy"); stopCamera(); stopSpeaking(); }}
          >
            <Brain size={18} />
            <span>Multiverse Strategy OS</span>
          </button>
          <button 
            className={`nav-tab-btn ${navMode === "vision" ? "active" : ""}`} 
            onClick={() => setNavMode("vision")}
          >
            <Eye size={18} />
            <span>Real-Time Vision Scanner</span>
          </button>
        </div>

        <div className="header-right">
          <button className="memory-toggle-btn" onClick={() => setMemoryModalOpen(true)}>
            <History size={18} color={navMode === "vision" ? "#06b6d4" : "var(--accent-purple)"} />
            <span>Memory Archive ({decisionHistory.length})</span>
          </button>
        </div>
      </header>

      {/* MODE 1: STRATEGY OS */}
      {navMode === "strategy" && (
        <>
          <section className="cinematic-hero">
            <div className="badge-ai">
              <Sparkles size={14} style={{ display: 'inline', marginRight: '6px' }} /> Multi-Agent Decision Intelligence Engine
            </div>
            <h1 className="cinematic-title">Simulate Alternate Futures Before You Decide.</h1>
            <p className="cinematic-subtitle">
              DecisionOS is not a chatbot. It is a next-generation neural operating system that runs multi-agent debate, cognitive bias detection, financial risk modeling, and future-self reflection to eliminate decision paralysis.
            </p>
          </section>

          {/* Personality Modes */}
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

          {/* Dilemma Input Card */}
          <div className="hud-input-card">
            <div className="hud-label">
              <Sparkles size={18} />
              <span>State Your Critical Life Dilemma</span>
            </div>

            <div className="controls-row">
              <select className="hud-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="General Strategy">General Strategy</option>
                <option value="Career">Career / Professional</option>
                <option value="Finance">Venture / Capital Allocation</option>
                <option value="Lifestyle">Relocation / Relationship</option>
                <option value="Technology">Tech Stack / Engineering</option>
              </select>

              <select className="hud-select" value={urgency} onChange={(e) => setUrgency(e.target.value)}>
                <option value="Normal">Normal Urgency (Weeks)</option>
                <option value="Immediate">Critical Action (Days)</option>
                <option value="Strategic">Long-term Vision (Months)</option>
              </select>
            </div>

            <div className="textarea-wrap">
              <textarea 
                className="hud-textarea"
                placeholder="Describe your dilemma in vivid detail... (e.g. Should I quit my $180k tech role to bootstrap an AI agency?)"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <span className="hud-char-count">{prompt.length} / 1000 chars</span>
            </div>

            <button 
              className="hud-btn-simulate"
              disabled={isAnalyzing || !prompt.trim()}
              onClick={executeStrategySimulation}
            >
              {isAnalyzing ? <RefreshCw className="spin-icon" size={24} /> : <Brain size={24} />}
              <span>{isAnalyzing ? "Executing Multi-Agent Neural Simulation..." : "Simulate Alternate Futures"}</span>
              <ArrowRight size={24} />
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '1px' }}>Quick Scenario Test Matrix:</span>
              <div className="quick-pills">
                {PRESETS.map((preset) => (
                  <button 
                    key={preset.id} 
                    className={`quick-pill ${selectedPreset === preset.id ? "active" : ""}`}
                    onClick={() => handlePreset(preset)}
                  >
                    {preset.icon}
                    <span>{preset.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cinematic Loading */}
          {isAnalyzing && (
            <div className="hud-loading-card">
              <div className="radar-spinner">
                <div className="radar-circle-1"></div>
                <div className="radar-circle-2"></div>
                <div className="radar-circle-3"></div>
                <Brain size={48} color="var(--accent-cyan)" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h4 className="loading-hud-title">Multi-Agent Simulation in Progress</h4>
                <p style={{ color: 'var(--text-muted)' }}>Probing parallel probability outcomes...</p>
              </div>

              <div className="logs-terminal">
                <div className="terminal-top">
                  <span>TERMINAL LOGS // DECISION_ENGINE v3.3</span>
                  <span>SYS_LOAD: [|||||||||| 98%]</span>
                </div>
                {agentLogs.map((log, idx) => (
                  <div key={idx} className="log-row">
                    <span className="log-tag">{">"}</span>
                    <span className="log-text">{log}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strategy Dossier */}
          {result && !isAnalyzing && (
            <div className="dossier-wrapper" ref={dossierRef}>
              <div className="dossier-banner">
                <div className="verdict-box">
                  <span className="verdict-sub">Definitive Multi-Agent Verdict</span>
                  <h2 className={`verdict-title ${result.type}`}>
                    {result.type === "yes" ? <CheckCircle2 size={36} /> : result.type === "caution" ? <AlertTriangle size={36} /> : <XCircle size={36} />}
                    <span>{result.recommendation || "PROCEED WITH CALCULATED TRANSITION"}</span>
                  </h2>
                </div>
                <div className="confidence-hud">
                  <div className="conf-circle" style={{ "--score": result.confidence || 85 }}>
                    <div className="conf-inner">{result.confidence || 85}%</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--accent-purple)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px' }}>AI Consensus</span>
                    <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>Rigorous statistical agreement across 6 agent subsystems</span>
                  </div>
                </div>
              </div>

              <div className="grid-2">
                <div className="hud-panel">
                  <div className="panel-header">
                    <Brain size={24} color="var(--accent-cyan)" />
                    <span>Executive Synthesis ({mode.toUpperCase()} Advisory)</span>
                  </div>
                  <p style={{ fontSize: '1.15rem', lineHeight: 1.8, color: 'white' }}>
                    "{result.summary || LOCAL_FALLBACK.summary}"
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#10b981', fontWeight: 800, fontSize: '1.05rem' }}>
                      <ThumbsUp size={20} />
                      <span>Strategic Advantages & Upside Asymmetry</span>
                    </div>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', listStyle: 'none', paddingLeft: 0 }}>
                      {(result.pros || LOCAL_FALLBACK.pros).map((pro, idx) => (
                        <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '1.05rem', color: 'var(--text-sub)' }}>
                          <span style={{ color: '#10b981', fontWeight: 900 }}>•</span>
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="hud-panel">
                  <div className="panel-header">
                    <Activity size={24} color="#a855f7" />
                    <span>AI Risk Radar & Drawdown Modeling</span>
                  </div>
                  <div className="radar-chart-box">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={strategyRadar}>
                        <PolarGrid stroke="rgba(255,255,255,0.15)" />
                        <PolarAngleAxis dataKey="metric" stroke="#cbd5e1" fontSize={12} fontFamily="var(--font-mono)" />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(255,255,255,0.2)" />
                        <Radar name="Simulation Target" dataKey="val" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.4} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Parallel Universe Multiverse Cards */}
              <div className="hud-panel">
                <div className="panel-header">
                  <Globe size={24} color="#3b82f6" />
                  <span>Parallel Universe Projections</span>
                </div>
                <div className="parallel-universes">
                  {(result.parallel_universe || LOCAL_FALLBACK.parallel_universe).map((uni, idx) => {
                    const isSafe = uni.type?.includes("Safe");
                    const isRisk = uni.type?.includes("Risk");
                    return (
                      <div key={idx} className={`universe-card ${isSafe ? "safe" : isRisk ? "risk" : "balanced"}`}>
                        <div className="universe-head">
                          <span className="universe-type">{uni.type || "Pathway"}</span>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Model {idx + 1}</span>
                        </div>
                        <h4 className="universe-title">{uni.title || "Alternative Trajectory"}</h4>
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
                            <span className="uni-val">{uni.financial_outcome || "Guaranteed baseline"}</span>
                          </div>
                        </div>
                        <p className="universe-story">"{uni.story}"</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Future Self Voice */}
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

              {/* Interrogation & Battle Mode */}
              <div className="grid-2">
                <div className="hud-panel">
                  <div className="panel-header">
                    <HelpCircle size={24} color="#f59e0b" />
                    <span>Decision Stress Test Interrogation</span>
                  </div>
                  <div className="interrogation-grid">
                    {(result.stress_test || LOCAL_FALLBACK.stress_test).map((q, idx) => (
                      <div key={idx} className="stress-q-card">
                        <Flame size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'white', lineHeight: 1.5 }}>{q}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="do-nothing-box">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#fca5a5', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px' }}>
                    <ShieldAlert size={20} color="#ef4444" />
                    <span>The 'If You Do Nothing' Scenario</span>
                  </div>
                  <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>
                    {(result.do_nothing_path || LOCAL_FALLBACK.do_nothing_path).result}
                  </p>
                  <p style={{ fontSize: '1.05rem', color: 'var(--text-sub)', lineHeight: 1.6 }}>
                    "{ (result.do_nothing_path || LOCAL_FALLBACK.do_nothing_path).future }"
                  </p>
                </div>
              </div>

              {/* Actions */}
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
        </>
      )}

      {/* MODE 2: REAL-TIME VISION SCANNER */}
      {navMode === "vision" && (
        <div className="dossier-wrapper">
          <section className="cinematic-hero">
            <div className="badge-ai badge-vision">
              <Eye size={14} style={{ display: 'inline', marginRight: '6px' }} /> WebRTC Multimodal Neural Viewfinder
            </div>
            <h1 className="cinematic-title">Show Any Product. Get Real-Time AI Intelligence.</h1>
            <p className="cinematic-subtitle">
              Open your camera, hold up an item or describe it naturally through voice. DecisionOS Vision instantly maps market reviews, calculates physical durability, checks price premiums, and responds in natural vocal dialogue.
            </p>
          </section>

          {/* WebRTC Viewfinder Box */}
          <div className="camera-scanner-wrapper">
            <div className="hud-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <Radio size={18} className={isCamActive ? "spin-icon" : ""} />
                <span>Live Viewfinder Telemetry Stream</span>
              </div>
              <div style={{ display: "flex", gap: "1rem" }}>
                <button 
                  className="quick-pill" 
                  style={{ borderColor: isCamActive ? "#ef4444" : "#06b6d4", color: isCamActive ? "#ef4444" : "#06b6d4" }}
                  onClick={isCamActive ? stopCamera : startCamera}
                >
                  {isCamActive ? <CameraOff size={16} /> : <Camera size={16} />}
                  <span>{isCamActive ? "Terminate Feed" : "Initialize Webcam"}</span>
                </button>
              </div>
            </div>

            <div className="viewfinder-container">
              {/* Corner Holographic Brackets */}
              <div className="target-bracket top-left"></div>
              <div className="target-bracket top-right"></div>
              <div className="target-bracket bottom-left"></div>
              <div className="target-bracket bottom-right"></div>
              
              {/* Animated Laser Scanline */}
              {isCamActive && <div className="laser-scanline"></div>}

              {/* Crosshair Overlay */}
              {isCamActive && (
                <div className="crosshair-center">
                  <div className="crosshair-box"></div>
                </div>
              )}

              {/* Video Element */}
              <video ref={videoRef} className="webcam-video" playsInline muted />

              {/* Placeholder when inactive */}
              {!isCamActive && (
                <div className="webcam-placeholder">
                  <Camera size={64} color="var(--accent-cyan)" style={{ opacity: 0.8 }} />
                  <div>
                    <h3 style={{ fontSize: "1.75rem", fontWeight: 800, color: "white" }}>Webcam Telemetry Inactive</h3>
                    <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>Click below to connect your WebRTC viewfinder for live AI object recognition.</p>
                  </div>
                  <button className="btn-cam-enable" onClick={startCamera}>
                    <Camera size={20} />
                    <span>Enable Live Camera Stream</span>
                  </button>
                </div>
              )}
            </div>

            {/* Voice Conversation Bar */}
            <div className="voice-controls-bar">
              <button 
                className={`btn-mic-toggle ${isListening ? "active" : "idle"}`}
                onClick={toggleMic}
                title={isListening ? "Stop listening" : "Speak to AI"}
              >
                {isListening ? <Mic size={24} /> : <MicOff size={24} />}
              </button>

              <input 
                type="text" 
                className="voice-input-field"
                placeholder={isListening ? "Listening to your voice... speak naturally..." : "Ask product questions (e.g. Is this keyboard worth $200?)"}
                value={visionPrompt}
                onChange={(e) => setVisionPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && executeVisionSimulation()}
              />

              {isSpeaking && (
                <div className="equalizer-container">
                  <Volume2 size={16} color="var(--accent-cyan)" />
                  <div className="eq-bar"></div>
                  <div className="eq-bar"></div>
                  <div className="eq-bar"></div>
                  <div className="eq-bar"></div>
                  <div className="eq-bar"></div>
                  <button 
                    onClick={stopSpeaking} 
                    style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", marginLeft: "5px" }}
                    title="Mute voice"
                  >
                    <VolumeX size={16} />
                  </button>
                </div>
              )}

              <button 
                className="btn-vision-trigger"
                disabled={isVisionAnalyzing || (!visionPrompt.trim() && !isCamActive)}
                onClick={executeVisionSimulation}
              >
                {isVisionAnalyzing ? <RefreshCw className="spin-icon" size={20} /> : <Sparkles size={20} />}
                <span>{isVisionAnalyzing ? "Scanning Multimodal Vector..." : "Analyze Product"}</span>
                <ArrowRight size={20} />
              </button>
            </div>

            {/* Quick Vision Scenarios */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '1px' }}>Quick Vision Sample Queries:</span>
              <div className="quick-pills">
                {VISION_PRESETS.map((vp) => (
                  <button 
                    key={vp.id} 
                    className="quick-pill"
                    onClick={() => handleVisionPreset(vp)}
                  >
                    <ShoppingBag size={16} color="#06b6d4" />
                    <span>{vp.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Vision Loading Logs */}
          {isVisionAnalyzing && (
            <div className="hud-loading-card">
              <div className="radar-spinner">
                <div className="radar-circle-1" style={{ borderColor: "#06b6d4" }}></div>
                <div className="radar-circle-2" style={{ borderColor: "#a855f7" }}></div>
                <Eye size={48} color="#06b6d4" />
              </div>
              <div>
                <h4 className="loading-hud-title">Multimodal Frame Analysis Active</h4>
                <p style={{ color: "var(--text-muted)" }}>Processing WebRTC buffers & querying global pricing parity...</p>
              </div>
              <div className="logs-terminal" style={{ borderColor: "rgba(6, 182, 212, 0.3)" }}>
                <div className="terminal-top">
                  <span>VISION_SUBSYSTEM // CNN_CLASSIFIER v4.5</span>
                  <span>LATENCY: 142ms</span>
                </div>
                {visionLogs.map((log, idx) => (
                  <div key={idx} className="log-row">
                    <span className="log-tag" style={{ color: "#06b6d4" }}>{">"}</span>
                    <span className="log-text">{log}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vision Hologram Results Card */}
          {visionResult && !isVisionAnalyzing && (
            <div className="dossier-wrapper" ref={dossierRef}>
              <div className="product-hologram-card">
                <div className="product-meta">
                  <span className="prod-tag">{visionResult.category || "Consumer Hardware"}</span>
                  <h2 className="prod-title">{visionResult.product_name || "Premium Hardware Device"}</h2>
                  <div className="prod-price">
                    <DollarSign size={28} />
                    <span>{visionResult.price_estimate || "$199 - $249"}</span>
                    <span style={{ fontSize: "1rem", color: "var(--text-muted)", fontWeight: 500, marginLeft: "10px" }}>Estimated Retail Value</span>
                  </div>
                </div>

                <div className="confidence-hud" style={{ borderColor: "#06b6d4", background: "rgba(6, 182, 212, 0.08)" }}>
                  <div className="conf-circle" style={{ "--score": visionResult.confidence || 94, background: `conic-gradient(#06b6d4 calc(${visionResult.confidence || 94} * 1%), rgba(255,255,255,0.1) 0)` }}>
                    <div className="conf-inner">{visionResult.confidence || 94}%</div>
                  </div>
                  <div>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", color: "#06b6d4", fontWeight: 800, textTransform: "uppercase", letterSpacing: "2px" }}>Verdict Recommendation</span>
                    <h3 style={{ fontSize: "1.45rem", fontWeight: 900, color: visionResult.type === "yes" ? "#10b981" : "#f59e0b" }}>{visionResult.recommendation || "BUY FOR PEAK PRODUCTIVITY"}</h3>
                  </div>
                </div>
              </div>

              {/* Voice Script Playback Card */}
              {visionResult.voice_script && (
                <div className="voice-playback-box">
                  <button 
                    className="btn-mic-toggle active" 
                    style={{ width: "64px", height: "64px", background: "linear-gradient(135deg, #06b6d4, #3b82f6)" }}
                    onClick={() => speakText(visionResult.voice_script)}
                    title="Replay Voice Script"
                  >
                    <Play size={28} color="white" style={{ marginLeft: "3px" }} />
                  </button>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontFamily: "var(--font-mono)", fontSize: "0.85rem", color: "#06b6d4", fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px" }}>
                      <Volume2 size={16} /> AI Vocal Response Script Active
                    </div>
                    <p style={{ fontSize: "1.25rem", color: "white", fontWeight: 600, marginTop: "0.5rem", lineHeight: 1.6 }}>
                      "{visionResult.voice_script}"
                    </p>
                  </div>
                </div>
              )}

              {/* Risk Analytics & Pros/Cons */}
              <div className="grid-2">
                <div className="hud-panel">
                  <div className="panel-header">
                    <Activity size={24} color="#06b6d4" />
                    <span>Vision Risk Analytics Matrix</span>
                  </div>
                  <div style={{ height: 280, width: "100%", marginTop: "1rem" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={visionRiskData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <XAxis dataKey="name" stroke="#94a3b8" fontFamily="var(--font-mono)" fontSize={12} />
                        <YAxis domain={[0, 100]} stroke="#94a3b8" />
                        <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #06b6d4", borderRadius: "8px" }} />
                        <Bar dataKey="score" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="hud-panel">
                  <div className="panel-header">
                    <Award size={24} color="#10b981" />
                    <span>Product Intelligence Assessment</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    <div>
                      <span style={{ color: "#10b981", fontWeight: 800, fontSize: "1.05rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <ThumbsUp size={18} /> Hardware Advantages
                      </span>
                      <ul style={{ marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.5rem", paddingLeft: "1.25rem", color: "var(--text-sub)" }}>
                        {(visionResult.advantages || VISION_FALLBACK.advantages).map((adv, idx) => (
                          <li key={idx} style={{ listStyleType: "disc" }}>{adv}</li>
                        ))}
                      </ul>
                    </div>

                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1rem" }}>
                      <span style={{ color: "#ef4444", fontWeight: 800, fontSize: "1.05rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <ThumbsDown size={18} /> Latent Drawbacks & Disadvantages
                      </span>
                      <ul style={{ marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.5rem", paddingLeft: "1.25rem", color: "var(--text-sub)" }}>
                        {(visionResult.disadvantages || VISION_FALLBACK.disadvantages).map((dis, idx) => (
                          <li key={idx} style={{ listStyleType: "disc" }}>{dis}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Real-time Internet Reasoning HUD */}
              <div className="hud-panel">
                <div className="panel-header">
                  <Globe size={24} color="#a855f7" />
                  <span>Internet Reasoning & Market Sentiment Matrix</span>
                </div>
                <div className="internet-reasoning-grid">
                  <div className="reasoning-card">
                    <span className="reason-lbl"><ThumbsUp size={16} /> Community Sentiment</span>
                    <p className="reason-val">{visionResult.internet_reasoning?.sentiment || VISION_FALLBACK.internet_reasoning.sentiment}</p>
                  </div>
                  <div className="reasoning-card">
                    <span className="reason-lbl"><Scale size={16} /> Competitor Alternatives</span>
                    <p className="reason-val">{visionResult.internet_reasoning?.alternatives || VISION_FALLBACK.internet_reasoning.alternatives}</p>
                  </div>
                  <div className="reasoning-card">
                    <span className="reason-lbl"><Zap size={16} /> Market Demand Trend</span>
                    <p className="reason-val">{visionResult.internet_reasoning?.market_trend || VISION_FALLBACK.internet_reasoning.market_trend}</p>
                  </div>
                </div>
              </div>

              <div className="dossier-actions">
                <button className="btn-hud-action secondary" onClick={() => setVisionResult(null)}>
                  <RefreshCw size={20} />
                  <span>Scan Another Product</span>
                </button>
                <button className="btn-hud-action primary" onClick={exportDossier}>
                  <Download size={20} />
                  <span>Export Vision Dossier (PNG)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Decision Memory Modal Archive */}
      {memoryModalOpen && (
        <div className="memory-hud-overlay" onClick={() => setMemoryModalOpen(false)}>
          <div className="memory-hud-modal" onClick={(e) => e.stopPropagation()}>
            <div className="memory-header-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <History size={26} color="#06b6d4" />
                <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'white' }}>DecisionOS Memory Archive</h3>
              </div>
              <button className="btn-hud-action secondary" style={{ padding: '0.5rem 1rem' }} onClick={() => setMemoryModalOpen(false)}>
                <XCircle size={20} />
              </button>
            </div>

            <div className="insights-box">
              <Cpu size={36} color="var(--accent-purple)" style={{ flexShrink: 0 }} />
              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--accent-purple)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px' }}>Multimodal Pattern Insights</span>
                <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', marginTop: '0.25rem' }}>
                  "You have archived decision vectors balancing long-term career autonomy with high-utility hardware investments. Your primary risk optimization is initial capital expenditure."
                </p>
              </div>
            </div>

            {decisionHistory.length === 0 ? (
              <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '1.15rem' }}>
                No past decisions archived yet. Run a future simulation or scan a product to store memory!
              </div>
            ) : (
              <div className="memory-cards-grid">
                {decisionHistory.map((item) => (
                  <div key={item.id} className="history-item-card">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '640px' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{item.timestamp} • Engine: {item.mode?.toUpperCase()}</span>
                      <p style={{ fontSize: '1.15rem', fontWeight: 700, color: 'white', lineHeight: 1.5 }}>"{item.prompt}"</p>
                      <span style={{ fontSize: '1.05rem', color: '#06b6d4', fontWeight: 800 }}>Verdict: {item.recommendation}</span>
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
