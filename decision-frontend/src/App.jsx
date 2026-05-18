import { useState, useEffect } from "react";
import { 
  Brain, 
  Sparkles, 
  Sun, 
  Moon, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Download, 
  ThumbsUp, 
  ThumbsDown, 
  TrendingUp, 
  ShieldAlert, 
  Clock, 
  Briefcase, 
  Layers, 
  DollarSign
} from "lucide-react";
import "./App.css";

const PRESETS = [
  {
    id: "hybrid-work",
    icon: <Briefcase className="preset-icon" size={18} />,
    title: "🏢 Hybrid vs 100% Remote",
    category: "Operations",
    prompt: "Should our tech startup transition from 3 mandatory office days to a 100% remote working model? We want to attract global talent but are worried about team culture and collaboration."
  },
  {
    id: "mobile-app",
    icon: <Layers className="preset-icon" size={18} />,
    title: "📱 Mobile App vs Web First",
    category: "Product",
    prompt: "Should we build a native iOS/Android app first or focus entirely on a responsive web application for our B2B SaaS platform launching in Q3?"
  },
  {
    id: "seed-funding",
    icon: <DollarSign className="preset-icon" size={18} />,
    title: "💰 Raise Seed vs Bootstrap",
    category: "Finance",
    prompt: "We have $15k MRR growing at 15% MoM. Should we raise a $1.5M seed round at a $10M cap, or continue bootstrapping to preserve equity until Series A metrics?"
  },
  {
    id: "ai-integration",
    icon: <Brain className="preset-icon" size={18} />,
    title: "🤖 Generative AI Feature",
    category: "Technology",
    prompt: "Should we integrate LLM-based generative workflows into our core customer support dashboard? The API costs are high but competitors are marketing AI capabilities."
  }
];

const MOCK_AI_RESPONSES = {
  "hybrid-work": {
    recommendation: "PROCEED WITH CAUTION",
    type: "caution",
    score: 76,
    impact: "High Positive",
    risk: "Medium",
    timeframe: "3-6 Months Transition",
    summary: "Transitioning to 100% remote offers massive leverage in global talent acquisition and reduces operational overhead. However, immediate transition without asynchronous documentation protocols poses a 35% risk to release cadence.",
    pros: [
      "Access to premium global talent pool at varied salary bands",
      "Immediate reduction in commercial real estate lease costs ($120k/yr saved)",
      "Higher employee NPS and retention among senior engineering staff"
    ],
    cons: [
      "Requires complete overhaul of synchronous communication habits",
      "Junior onboarding velocity drops by an estimated 25% initially",
      "Potential isolation and siloing between product and engineering teams"
    ]
  },
  "mobile-app": {
    recommendation: "RECOMMENDED: WEB FIRST",
    type: "yes",
    score: 91,
    impact: "Maximum Velocity",
    risk: "Low",
    timeframe: "Immediate Focus",
    summary: "For B2B SaaS platforms, 88% of core administrative workflows are performed on desktop environments. Prioritizing a responsive web app ensures rapid iteration cycles without App Store review delays.",
    pros: [
      "Unified codebase reduces engineering maintenance costs by 50%",
      "Instant deployment of bug fixes and feature rollouts without store approvals",
      "Seamless integration with existing B2B browser extensions and SAML auth"
    ],
    cons: [
      "Lack of native push notifications for urgent platform alerts",
      "Perception of lower 'app store status' amongst early consumer-centric investors",
      "Slight friction for field agents needing offline data synchronization"
    ]
  },
  "seed-funding": {
    recommendation: "RECOMMENDED: RAISE SEED",
    type: "yes",
    score: 84,
    impact: "High Growth",
    risk: "Controlled",
    timeframe: "Q2 Execution",
    summary: "At 15% MoM growth, you have achieved initial product-market fit. Raising $1.5M allows you to aggressively capture market share before well-funded incumbents replicate your feature set.",
    pros: [
      "Secures 24+ months of runway to aggressively scale enterprise sales team",
      "Institutional backing signals credibility to Tier-1 enterprise clients",
      "Enables hiring of specialized VP of Growth and Principal AI Architects"
    ],
    cons: [
      "15% immediate equity dilution for founding team members",
      "Introduction of board governance and monthly reporting overhead",
      "Pressure to maintain venture-scale growth trajectories (3x/2x/2x)"
    ]
  },
  "ai-integration": {
    recommendation: "RECOMMENDED: GO AHEAD",
    type: "yes",
    score: 89,
    impact: "Transformative",
    risk: "High API Cost",
    timeframe: "4 Weeks Sprint",
    summary: "Integrating LLM workflows directly addresses customer churn by reducing ticket resolution time from 4.2 hours to 18 minutes. The high API overhead can be offset by introducing a premium 'AI Tier' add-on.",
    pros: [
      "Immediate 75% reduction in Tier-1 repetitive support inquiries",
      "Significant marketing advantage and positioning in Q3 analyst reports",
      "Unlocks automated sentiment analysis and churn prediction signals"
    ],
    cons: [
      "Variable COGS increases server infrastructure bills by an estimated 32%",
      "Potential hallucination liabilities if automated actions are unmonitored",
      "Requires continuous prompt engineering and evaluation guardrails"
    ]
  }
};

const DEFAULT_RESPONSE = {
  recommendation: "RECOMMENDED: GO AHEAD",
  type: "yes",
  score: 85,
  impact: "High Positive",
  risk: "Moderate",
  timeframe: "Immediate Execution",
  summary: "Based on our multi-factor decision matrix, the proposed strategy shows strong alignment with long-term enterprise growth and positive ROI. Key mitigation strategies should be enacted for potential operational bottlenecks.",
  pros: [
    "Demonstrates excellent strategic alignment with market demand",
    "High probability of achieving target key performance indicators within 90 days",
    "Provides significant competitive moat against traditional industry players"
  ],
  cons: [
    "Requires upfront capital allocation and dedicated cross-functional resources",
    "Short-term execution bandwidth may stretch current engineering capacity",
    "Subject to minor external macroeconomic fluctuations in Q4"
  ]
};

const LOADING_STEPS = [
  "Initializing multi-dimensional decision matrix...",
  "Running Monte Carlo risk simulations across market variables...",
  "Evaluating historical precedent & competitive intelligence...",
  "Synthesizing pros, cons, and confidence intervals...",
  "Finalizing strategic recommendation report..."
];

function App() {
  const [theme, setTheme] = useState("light");
  const [prompt, setPrompt] = useState("");
  const [category, setCategory] = useState("General Strategy");
  const [urgency, setUrgency] = useState("Normal");
  const [selectedPreset, setSelectedPreset] = useState(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [result, setResult] = useState(null);

  // Toggle Theme
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Loading Steps effect
  useEffect(() => {
    let interval;
    if (isAnalyzing) {
      interval = setInterval(() => {
        setLoadingStepIndex((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
      }, 700);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  // Handle Preset Click
  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset.id);
    setPrompt(preset.prompt);
    setCategory(preset.category);
    setResult(null);
  };

  // Run Analysis
  const runAnalysis = (e) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    setIsAnalyzing(true);
    setLoadingStepIndex(0);
    setResult(null);

    setTimeout(() => {
      setIsAnalyzing(false);
      // Determine response
      if (selectedPreset && MOCK_AI_RESPONSES[selectedPreset]) {
        setResult(MOCK_AI_RESPONSES[selectedPreset]);
      } else {
        setResult(DEFAULT_RESPONSE);
      }
    }, 3800);
  };

  const resetAnalysis = () => {
    setPrompt("");
    setSelectedPreset(null);
    setResult(null);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="logo-group">
          <div className="logo-icon">
            <Brain size={26} />
          </div>
          <div>
            <h1 className="logo-title">DecisionOS</h1>
            <div className="badge-sub">
              <Sparkles size={13} /> Powered by AI Decision Agent
            </div>
          </div>
        </div>

        <div className="header-actions">
          <button 
            className="icon-btn" 
            onClick={toggleTheme} 
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="hero-section">
        <h2 className="hero-title">Eliminate Decision Paralysis.</h2>
        <p className="hero-subtitle">
          Input your business scenario, strategic dilemma, or trade-offs. Our AI agent evaluates market risks, financial ROI, and operational viability to give you an instant, data-driven recommendation.
        </p>
      </section>

      {/* Presets */}
      <section className="quick-presets">
        <div className="presets-label">
          <span>⚡ Select an Instant Strategic Scenario</span>
        </div>
        <div className="presets-grid">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              className={`preset-pill ${selectedPreset === p.id ? "active" : ""}`}
              onClick={() => handlePresetSelect(p)}
            >
              {p.icon}
              <span>{p.title}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Analyzer Card */}
      {!isAnalyzing && !result && (
        <div className="analyzer-card">
          <div className="input-header">
            <label className="input-title">
              <Sparkles className="accent-icon" size={22} color="var(--accent-color)" />
              <span>Describe Your Decision Dilemma</span>
            </label>
          </div>

          <div className="options-row">
            <div className="select-group">
              <span className="select-label">Category:</span>
              <select 
                className="custom-select" 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="General Strategy">🌐 General Strategy</option>
                <option value="Product">📱 Product Management</option>
                <option value="Finance">💰 Financial & Capital</option>
                <option value="Operations">⚙️ Operations & HR</option>
                <option value="Technology">🤖 Technology & AI</option>
              </select>
            </div>

            <div className="select-group">
              <span className="select-label">Urgency:</span>
              <select 
                className="custom-select" 
                value={urgency} 
                onChange={(e) => setUrgency(e.target.value)}
              >
                <option value="Normal">⏱️ Normal / Planned</option>
                <option value="High">🔥 High Priority</option>
                <option value="Urgent">🚨 Immediate Action</option>
              </select>
            </div>
          </div>

          <div className="textarea-container">
            <textarea
              className="prompt-textarea"
              placeholder="Example: Should we invest $50,000 in upgrading our legacy database systems this quarter, or hire two new sales development reps to boost outbound leads?"
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                if (selectedPreset) setSelectedPreset(null);
              }}
            />
            <div className="char-counter">
              {prompt.length} / 1000 characters
            </div>
          </div>

          <button 
            className="btn-analyze" 
            onClick={runAnalysis}
            disabled={!prompt.trim()}
          >
            <span>Run AI Decision Analysis</span>
            <ArrowRight size={20} />
          </button>
        </div>
      )}

      {/* Loading State */}
      {isAnalyzing && (
        <div className="loading-box">
          <div className="loader-pulse">
            <div className="loader-circle-outer"></div>
            <div className="loader-circle-inner"></div>
          </div>
          <h3 className="loading-text">Analyzing Scenario Matrix...</h3>
          <p className="step-indicator">
            {LOADING_STEPS[loadingStepIndex] || "Finalizing report..."}
          </p>
        </div>
      )}

      {/* Result Display */}
      {result && !isAnalyzing && (
        <div className="result-card" style={{ "--score": result.score }}>
          <div className="result-banner">
            <div className="result-recommendation">
              <span className="conf-val-label">Strategic Verdict</span>
              <div className={`rec-badge ${result.type}`}>
                {result.type === "yes" && <CheckCircle2 size={28} />}
                {result.type === "caution" && <AlertTriangle size={28} />}
                {result.type === "no" && <XCircle size={28} />}
                <span>{result.recommendation}</span>
              </div>
            </div>

            <div className="confidence-widget">
              <div className="gauge-circle">
                <div className="gauge-inner">
                  <span className="conf-rating">{result.score}%</span>
                </div>
              </div>
              <div className="confidence-labels">
                <span className="conf-val-label">Confidence Score</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Highly rigorous match</span>
              </div>
            </div>
          </div>

          <div className="result-body">
            {/* Overview Metrics */}
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-header">
                  <span className="metric-label">Projected Impact</span>
                  <TrendingUp size={20} color="var(--accent-color)" />
                </div>
                <span className="metric-value">{result.impact}</span>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <span className="metric-label">Risk Profile</span>
                  <ShieldAlert size={20} color={result.risk === 'Low' ? '#22c55e' : result.risk === 'Medium' ? '#eab308' : '#ef4444'} />
                </div>
                <span className="metric-value">{result.risk}</span>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <span className="metric-label">Execution Horizon</span>
                  <Clock size={20} color="var(--accent-color)" />
                </div>
                <span className="metric-value">{result.timeframe}</span>
              </div>
            </div>

            {/* Analysis Summary */}
            <div className="analysis-summary">
              <div className="section-title" style={{ marginBottom: '0.5rem' }}>
                <Sparkles size={18} color="var(--accent-color)" />
                <span>Executive Synthesis</span>
              </div>
              <p>{result.summary}</p>
            </div>

            {/* Pros & Cons */}
            <div className="pros-cons-grid">
              <div className="pro-con-box pros">
                <div className="pro-con-title">
                  <ThumbsUp size={20} />
                  <span>Key Advantages & ROI</span>
                </div>
                <ul className="list-items">
                  {result.pros.map((pro, index) => (
                    <li key={index} className="list-item">
                      <CheckCircle2 size={18} color="var(--success-text)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pro-con-box cons">
                <div className="pro-con-title">
                  <ThumbsDown size={20} />
                  <span>Risks & Friction Points</span>
                </div>
                <ul className="list-items">
                  {result.cons.map((con, index) => (
                    <li key={index} className="list-item">
                      <XCircle size={18} color="var(--danger-text)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="result-footer">
            <button className="btn-secondary" onClick={resetAnalysis}>
              <RefreshCw size={18} />
              <span>Analyze Another Scenario</span>
            </button>
            
            <button className="btn-download" onClick={() => window.print()}>
              <Download size={18} />
              <span>Export Executive Brief</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
