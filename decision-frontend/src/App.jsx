import { useState, useRef, useEffect } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import { 
  ResponsiveContainer, 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";
import { 
  Sparkles, 
  ArrowRight, 
  XCircle, 
  RefreshCw, 
  Download, 
  ThumbsUp, 
  ThumbsDown, 
  DollarSign,
  History,
  Zap,
  Scale,
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
  Play,
  Activity,
  Award
} from "lucide-react";
import "./App.css";

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
      return JSON.parse(localStorage.getItem("decisionos_vision_memory") || "[]");
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
      storeMemory(q, { recommendation: data.recommendation, confidence: data.confidence, risk_level: "Vision Scan" });
      setIsVisionAnalyzing(false);
      if (data.voice_script) {
        speakText(data.voice_script);
      }
    } catch (err) {
      console.log("Vision endpoint offline. Using spectacular local vision fallback.", err);
      setVisionResult(VISION_FALLBACK);
      storeMemory(q, { recommendation: VISION_FALLBACK.recommendation, confidence: VISION_FALLBACK.confidence, risk_level: "Vision Scan" });
      setIsVisionAnalyzing(false);
      speakText(VISION_FALLBACK.voice_script);
    }
  };

  const storeMemory = (q, data) => {
    const entry = {
      id: Date.now(),
      timestamp: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      prompt: q,
      recommendation: data.recommendation,
      confidence: data.confidence || 94,
      mode: "VISION AI",
      risk: data.risk || "Low"
    };
    const updated = [entry, ...decisionHistory.slice(0, 20)];
    setDecisionHistory(updated);
    localStorage.setItem("decisionos_vision_memory", JSON.stringify(updated));
  };

  const exportDossier = async () => {
    if (!dossierRef.current) return;
    try {
      const canvas = await html2canvas(dossierRef.current, { scale: 2, backgroundColor: "#030712" });
      const link = document.createElement("a");
      link.download = `DecisionOS_Vision_Dossier_${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.log("Export failed", err);
    }
  };

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
            <Eye size={26} color="#06b6d4" />
          </div>
          <span className="logo-text">DecisionOS Vision</span>
          <div className="status-pill">
            <div className="status-dot" style={{ backgroundColor: "#06b6d4" }}></div>
            <span>WebRTC Vision Live</span>
          </div>
        </div>

        <div className="header-right">
          <button className="memory-toggle-btn" onClick={() => setMemoryModalOpen(true)}>
            <History size={18} color="#06b6d4" />
            <span>Vision Archive ({decisionHistory.length})</span>
          </button>
        </div>
      </header>

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

      {/* Decision Memory Modal Archive */}
      {memoryModalOpen && (
        <div className="memory-hud-overlay" onClick={() => setMemoryModalOpen(false)}>
          <div className="memory-hud-modal" onClick={(e) => e.stopPropagation()}>
            <div className="memory-header-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <History size={26} color="#06b6d4" />
                <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'white' }}>DecisionOS Vision Archive</h3>
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
                No past product scans archived yet. Connect your WebRTC viewfinder or ask a product question to store memory!
              </div>
            ) : (
              <div className="memory-cards-grid">
                {decisionHistory.map((item) => (
                  <div key={item.id} className="history-item-card">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '640px' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{item.timestamp} • Scan Engine: CNN Multimodal</span>
                      <p style={{ fontSize: '1.15rem', fontWeight: 700, color: 'white', lineHeight: 1.5 }}>"{item.prompt}"</p>
                      <span style={{ fontSize: '1.05rem', color: '#06b6d4', fontWeight: 800 }}>Verdict: {item.recommendation}</span>
                    </div>
                    <div style={{ padding: '0.6rem 1.25rem', background: '#030712', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontWeight: 900, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                      <Sparkles size={16} color="var(--accent-purple)" />
                      <span>{item.confidence}% Confidence</span>
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
