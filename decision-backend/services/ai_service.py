import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GROQ_API_KEY", "").strip()
client = Groq(api_key=api_key)

PERSONALITY_PROMPTS = {
    "ceo": "You are a seasoned Silicon Valley CEO Advisor. Focus on leverage, unit economics, runway, enterprise value, and strategic competitive moats. Use crisp, high-level corporate vocabulary.",
    "brutal": "You are a Brutally Honest Reality Checker. Do not sugarcoat anything. Call out excuses, cognitive delusions, and poor risk management directly with sharp, unvarnished truth.",
    "funny": "You are a Hilarious & Witty Best Friend. Use entertaining metaphors, lighthearted jokes, and colloquial humor while still delivering genuinely insightful decision analysis.",
    "therapist": "You are an Empathetic Career Therapist. Prioritize emotional well-being, work-life boundaries, and burnout prevention. Validate the user's stress while guiding them toward equilibrium.",
    "analyst": "You are a Principal Data Scientist & Risk Quant. Speak in terms of probability distributions, expected value calculations, variance, downside hedging, and key performance indicators.",
    "stoic": "You are a Stoic Philosopher & Monk. Frame the decision around internal locus of control, virtue, long-term tranquility, and detachment from uncontrollable external outcomes."
}

def get_fallback_decision(question: str, category: str, urgency: str, mode: str) -> str:
    modes_data = {
        "ceo": {
            "rec": "PROCEED WITH CAUTION (CEO VERDICT)",
            "type": "caution",
            "score": 82,
            "risk": "Medium",
            "fin_risk": 65,
            "em_risk": 35,
            "upside": 88,
            "regret": 25,
            "summary": f"As your executive advisor, analyzing '{question}' under the {category} matrix reveals substantial enterprise valuation upside but immediate execution bottlenecks. Capital allocation must be balanced against operational runway.",
            "pros": ["High leverage opportunity expanding total addressable market", "Clear strategic moat against legacy industry incumbents", "Attracts top-tier senior talent motivated by high-velocity scaling"],
            "cons": ["Upfront capital burn reduces immediate balance sheet flexibility", "Requires tight asynchronous alignment across engineering leadership", "Short-term execution bandwidth may stretch current team capacity"],
            "future": "I'm you, 5 years from now. Taking the executive leap was crucial for our scale. We built something monumental, but keeping a close eye on burn rate saved us during Q4 turbulence.",
            "safe_title": "Stay & Optimize Core", "safe_em": "Stable but restless", "safe_car": "Predictable progression", "safe_fin": "Guaranteed baseline", "safe_story": "You stay in your current role, optimizing existing operations and securing steady cash flow.",
            "risk_title": "Hyper-Scale Leap", "risk_em": "High stress but exhilarating", "risk_car": "Exponential velocity", "risk_fin": "Potential 10x or zero", "risk_story": "You aggressively pivot all resources into this venture, capturing massive market share early.",
            "bal_title": "Calculated Phased Transition", "bal_em": "Empowered equilibrium", "bal_car": "Strategic pivot", "bal_fin": "Mild dip before surge", "bal_story": "You build a financial runway while running beta tests on weekends before full commitment.",
            "b_yes": "Agent Alpha (Aggressive Scale): Capture market share immediately before competitors replicate the feature set.",
            "b_no": "Agent Beta (Capital Preservation): Preserve runway and focus on achieving profitability with existing core SKU.",
            "b_judge": "Judge Agent: Execute a phased rollout—validate with early beta cohorts before committing full engineering resources."
        },
        "brutal": {
            "rec": "STOP OVERTHINKING & EXECUTE",
            "type": "no",
            "score": 91,
            "risk": "High",
            "fin_risk": 80,
            "em_risk": 75,
            "upside": 60,
            "regret": 85,
            "summary": f"Let's be brutally honest about '{question}'. You are masking hesitation with endless analysis. The fundamental friction isn't lack of data—it's fear of committing to the hard work required to execute.",
            "pros": ["Forces immediate confrontation with uncomfortable operational truths", "Eliminates cognitive dissonance and wishful thinking", "Saves time and money by cutting unviable projects early"],
            "cons": ["Ego bruising for leadership team members attached to the idea", "High short-term emotional turbulence during restructuring", "Requires uncomfortable conversations with stakeholders"],
            "future": "I'm you, 5 years from now. Thank goodness someone gave us the brutal truth back then. We stopped making excuses and actually did the work that mattered.",
            "safe_title": "Endless Procrastination", "safe_em": "Safety disguised as fear", "safe_car": "Stagnation", "safe_fin": "Eroding purchasing power", "safe_story": "You keep researching and planning forever without taking a single decisive action.",
            "risk_title": "Burn the Boats", "risk_em": "Raw terror and absolute focus", "risk_car": "Rapid evolution", "risk_fin": "High initial volatility", "risk_story": "You cut off all escape routes, forcing yourself to succeed or fail publicly.",
            "bal_title": "Strict 90-Day Sprint", "bal_em": "Disciplined execution", "bal_car": "Measurable progress", "bal_fin": "Controlled burn", "bal_story": "You set a hard 90-day deadline with clear KPIs to prove viability or kill the idea.",
            "b_yes": "Agent Alpha (Harsh Truth): Rip the band-aid off immediately. Stop funding a failing initiative.",
            "b_no": "Agent Beta (Comfort Zone): Stay the course to avoid upsetting internal team dynamics.",
            "b_judge": "Judge Agent: Harsh Truth wins. Delaying the inevitable only multiplies the cost of failure."
        },
        "funny": {
            "rec": "SEND IT 🚀 (WITH SNACKS)",
            "type": "yes",
            "score": 92,
            "risk": "Low",
            "fin_risk": 40,
            "em_risk": 20,
            "upside": 95,
            "regret": 10,
            "summary": f"Look, evaluating '{question}' is like deciding whether to get double cheese on pizza. The answer is obviously yes! Sure, there's a slight risk of a food coma, but the vibes are immaculate.",
            "pros": ["Maximum dopamine release and immediate team morale boost", "Generates legendary stories for future company all-hands meetings", "Surprisingly high probability of accidental viral success"],
            "cons": ["Accounting team might give you a mild side-eye during expense review", "Requires copious amounts of coffee to maintain momentum", "May result in spontaneous high-fives in office corridors"],
            "future": "I'm you, 5 years from now. I have absolutely zero regrets. We had a blast building it and the memes alone were worth the server costs!",
            "safe_title": "Boring Soup", "safe_em": "Yawn-inducing comfort", "safe_car": "Status quo", "safe_fin": "Safe but unexciting", "safe_story": "You take the safe road and spend the next 5 years wondering 'what if'.",
            "risk_title": "Full Goblin Mode", "risk_em": "Chaotic energy", "risk_car": "Wild roller coaster", "risk_fin": "Crypto-level swings", "risk_story": "You go all-in with zero sleep and a dream, achieving meme-lord status.",
            "bal_title": "Snack-Powered Progress", "bal_em": "Happy and caffeinated", "bal_car": "Steady climb", "bal_fin": "Solid ROI", "bal_story": "You balance hard work with frequent treat-yourself breaks, winning the marathon.",
            "b_yes": "Agent Alpha (YOLO Mode): Full speed ahead! Fortune favors the bold and the caffeinated.",
            "b_no": "Agent Beta (Overthinker): But what if the font color isn't perfectly optimized?!",
            "b_judge": "Judge Agent: YOLO Mode wins. You can fix the font later; you can't fake momentum."
        },
        "therapist": {
            "rec": "PRIORITIZE EQUILIBRIUM 🌿",
            "type": "caution",
            "score": 85,
            "risk": "Medium",
            "fin_risk": 50,
            "em_risk": 85,
            "upside": 80,
            "regret": 20,
            "summary": f"I hear the weight of '{question}' in your words. When looking at your {category} goals, remember that sustainable excellence requires emotional equilibrium. Don't sacrifice your peace for short-term validation.",
            "pros": ["Protects core emotional energy and prevents deep executive burnout", "Fosters a psychologically safe culture for your team", "Ensures long-term clarity and sustained decision-making stamina"],
            "cons": ["May feel like moving slower than hyper-aggressive peers initially", "Requires setting firm boundaries with demanding stakeholders", "Involves sitting with the discomfort of saying 'no'"],
            "future": "I'm you, 5 years from now. Learning to pace myself and protect my mental health was the true turning point of our career. Thank you for listening to your body.",
            "safe_title": "Deep Rest & Boundaries", "safe_em": "Profound peace", "safe_car": "Sustainable output", "safe_fin": "Stable security", "safe_story": "You enforce strict working hours and prioritize physical and emotional well-being.",
            "risk_title": "Relentless Hustle", "risk_em": "High risk of burnout", "risk_car": "Fast but fragile climb", "risk_fin": "Short-term spike", "risk_story": "You push past all limits, achieving external milestones at the cost of inner peace.",
            "bal_title": "Mindful Integration", "bal_em": "Centered harmony", "bal_car": "Joyful mastery", "bal_fin": "Healthy growth", "bal_story": "You blend high standards with self-compassion, thriving over the decades.",
            "b_yes": "Agent Alpha (Self-Care): Rest is a productive asset. Protect your sleep and sanity.",
            "b_no": "Agent Beta (Hustle Culture): Sleep when you're dead! Keep grinding 90-hour weeks!",
            "b_judge": "Judge Agent: Self-Care wins. A burnt-out engine cannot reach the destination."
        },
        "analyst": {
            "rec": "OPTIMAL EXPECTED VALUE 📊",
            "type": "yes",
            "score": 89,
            "risk": "Low",
            "fin_risk": 35,
            "em_risk": 25,
            "upside": 90,
            "regret": 15,
            "summary": f"Running Bayesian inference models on '{question}' across historical {category} benchmarks indicates an 89% positive expected value. Downside variance is tightly constrained by existing operational hedges.",
            "pros": ["Statistically robust positive ROI with a 3.4x projected multiple", "Low coefficient of variation ensures highly predictable execution", "Generates high-fidelity telemetry data for future algorithmic models"],
            "cons": ["Requires strict adherence to data logging protocols across all endpoints", "Initial setup latency of 14 days before statistical significance reached", "Susceptible to six-sigma tail risk events in macro markets"],
            "future": "I'm you, 5 years from now. Trusting the empirical probability distribution rather than gut emotion was the most profitable decision we ever made.",
            "safe_title": "Low-Variance Indexing", "safe_em": "Mathematically calm", "safe_car": "Linear compounding", "safe_fin": "Predictable returns", "safe_story": "You hedge all bets, securing a guaranteed but capped return profile.",
            "risk_title": "High-Beta Asymmetry", "risk_em": "High volatility", "risk_car": "Power law outcomes", "risk_fin": "Venture scale upside", "risk_story": "You allocate capital to high-risk, high-reward initiatives with 10x potential.",
            "bal_title": "Kelly Criterion Allocation", "bal_em": "Optimized composure", "bal_car": "Efficient frontier", "bal_fin": "Max compounded growth", "bal_story": "You optimally size your risk according to mathematical edge, maximizing terminal wealth.",
            "b_yes": "Agent Alpha (Empirical Quant): The data is unequivocal. Execute the optimization protocol.",
            "b_no": "Agent Beta (Gut Intuition): But my horoscope said Mercury is in retrograde!",
            "b_judge": "Judge Agent: Empirical Quant wins. Math doesn't care about retrograde."
        },
        "stoic": {
            "rec": "MAINTAIN TRANQUILITY 🥷",
            "type": "yes",
            "score": 90,
            "risk": "Low",
            "fin_risk": 30,
            "em_risk": 15,
            "upside": 88,
            "regret": 5,
            "summary": f"In considering '{question}', separate what is within your control (your effort, integrity, and focus) from what is external (competitor actions, market whims). Execute with unyielding discipline and remain detached from the applause.",
            "pros": ["Absolute invulnerability to external criticism and market volatility", "Razor-sharp focus on execution rather than performative optics", "Deep inner peace and unshakeable resilience in adversity"],
            "cons": ["May appear overly detached or emotionless to theatrical peers", "Requires constant daily practice of mindfulness and ego suppression", "Acceptance that external rewards are indifferent preferred indifferents"],
            "future": "I'm you, 5 years from now. We suffered more in imagination than in reality. Staying anchored to our core principles got us through everything.",
            "safe_title": "Quiet Mastery", "safe_em": "Unshakeable calm", "safe_car": "Respected craftsmanship", "safe_fin": "Sufficient abundance", "safe_story": "You focus entirely on daily excellence, letting external recognition follow naturally.",
            "risk_title": "Trial by Fire", "risk_em": "Stoic endurance", "risk_car": "Legendary leadership", "risk_fin": "High stakes testing", "risk_story": "You step into the eye of the storm, proving your character under maximum pressure.",
            "bal_title": "The Middle Way", "bal_em": "Serene equilibrium", "bal_car": "Virtuous leadership", "bal_fin": "Stable foundation", "bal_story": "You act with courage and justice, indifferent to both praise and blame.",
            "b_yes": "Agent Alpha (Stoic Resolve): Focus entirely on doing good work. Ignore the noise.",
            "b_no": "Agent Beta (Validation Seeker): But what if nobody retweets our announcement?!",
            "b_judge": "Judge Agent: Stoic Resolve wins. True value is self-contained."
        }
    }

    m = modes_data.get(mode, modes_data["ceo"])

    fallback_obj = {
        "recommendation": m["rec"],
        "type": m["type"],
        "confidence": m["score"],
        "risk_level": m["risk"],
        "career_upside": m["upside"],
        "financial_risk": m["fin_risk"],
        "emotional_risk": m["em_risk"],
        "regret_probability": m["regret"],
        "summary": m["summary"],
        "pros": m["pros"],
        "cons": m["cons"],
        "parallel_universe": [
            {
                "type": "Safe Path",
                "title": m["safe_title"],
                "emotional_outcome": m["safe_em"],
                "career_outcome": m["safe_car"],
                "financial_outcome": m["safe_fin"],
                "story": m["safe_story"]
            },
            {
                "type": "Risk Path",
                "title": m["risk_title"],
                "emotional_outcome": m["risk_em"],
                "career_outcome": m["risk_car"],
                "financial_outcome": m["risk_fin"],
                "story": m["risk_story"]
            },
            {
                "type": "Balanced Path",
                "title": m["bal_title"],
                "emotional_outcome": m["bal_em"],
                "career_outcome": m["bal_car"],
                "financial_outcome": m["bal_fin"],
                "story": m["bal_story"]
            }
        ],
        "future_self_message": m["future"],
        "bias_detection": [
            { "bias": "Loss Aversion", "description": "Over-indexing on potential downside rather than upside leverage.", "severity": "High" },
            { "bias": "Comfort Zone Anchoring", "description": "Preferring familiarity over optimal growth trajectory.", "severity": "Medium" }
        ],
        "stress_test": [
            "What if your primary income drops to zero in month 4?",
            "What if this ambition is just temporary burnout masking as passion?",
            "If you look back at age 80, what will you regret more: failing or never trying?"
        ],
        "do_nothing_path": {
            "result": "Chronic stagnation and creeping resentment.",
            "future": "By doing nothing, you lock in your current reality, watching opportunities pass to peers willing to act."
        },
        "battle_mode": {
            "agent_yes": m["b_yes"],
            "agent_no": m["b_no"],
            "judge_verdict": m["b_judge"]
        },
        "agent_logs": [
            f"[Context Agent] Parsing user dilemma and mapping {category} parameters...",
            f"[Emotion Agent] Detecting latent anxiety and cognitive biases under {mode.upper()} filter...",
            f"[Risk Agent] Evaluating downside risk: {m['fin_risk']}% financial, {m['em_risk']}% emotional...",
            f"[Future Simulator] Running 3 parallel timeline projections (Safe, Risk, Balanced)...",
            f"[Bias Agent] Identifying loss aversion and comfort zone anchoring...",
            f"[Decision Agent] Synthesizing final verdict: {m['rec']} ({m['score']}% confidence)."
        ]
    }
    return json.dumps(fallback_obj)


def get_ai_decision(question: str, category: str = "General Strategy", urgency: str = "Normal", mode: str = "ceo") -> str:
    persona_instruction = PERSONALITY_PROMPTS.get(mode, PERSONALITY_PROMPTS["ceo"])

    prompt = f"""
You are the core intelligence engine of DecisionOS — Multi-Agent Decision Intelligence.
"AI simulates consequences before you decide."

User dilemma / scenario: "{question}"
Category: {category}
Urgency: {urgency}
Personality Advisory Mode: {mode.upper()} - {persona_instruction}

You must orchestrate a live simulation across 6 AI Agents (Context, Emotion, Risk, Bias, Future Simulator, Decision Agent) and output a highly rigorous, cinematic decision intelligence dossier.

Respond STRICTLY in JSON format matching this exact schema:
{{
  "recommendation": "Short punchy recommendation title matching the persona (e.g. RECOMMENDED: GO AHEAD, PROCEED WITH CAUTION, NOT RECOMMENDED)",
  "type": "yes or caution or no",
  "confidence": integer between 70 and 99,
  "risk_level": "Low or Medium or High",
  "career_upside": integer between 50 and 99,
  "financial_risk": integer between 10 and 95,
  "emotional_risk": integer between 10 and 95,
  "regret_probability": integer between 5 and 90,
  "summary": "Deep, cinematic executive synthesis matching the personality mode tone (approx 3-4 sentences)",
  "pros": [
    "Strategic Pro point 1",
    "Strategic Pro point 2",
    "Strategic Pro point 3"
  ],
  "cons": [
    "Risk / Con point 1",
    "Risk / Con point 2",
    "Risk / Con point 3"
  ],
  "parallel_universe": [
    {{
      "type": "Safe Path",
      "title": "Title of safe path",
      "emotional_outcome": "Emotional state in safe path",
      "career_outcome": "Career result",
      "financial_outcome": "Financial projection",
      "story": "Cinematic narrative of what happens in this safe timeline."
    }},
    {{
      "type": "Risk Path",
      "title": "Title of high risk path",
      "emotional_outcome": "Emotional state in risk path",
      "career_outcome": "Career result",
      "financial_outcome": "Financial projection",
      "story": "Cinematic narrative of what happens when taking the hyper-scale leap."
    }},
    {{
      "type": "Balanced Path",
      "title": "Title of calculated path",
      "emotional_outcome": "Emotional state in balanced path",
      "career_outcome": "Career result",
      "financial_outcome": "Financial projection",
      "story": "Cinematic narrative of a phased, calculated transition."
    }}
  ],
  "future_self_message": "I'm you, 5 years from now. A profound quote reflecting back on taking or avoiding this decision.",
  "bias_detection": [
    {{
      "bias": "Name of bias (e.g. Loss Aversion, Comfort Zone Bias, Social Pressure)",
      "description": "Explanation of how this bias is influencing the user.",
      "severity": "High or Medium or Low"
    }}
  ],
  "stress_test": [
    "Hard interrogation question 1 (e.g. What if income drops to zero in month 4?)",
    "Hard interrogation question 2 (e.g. What if this ambition is temporary burnout?)",
    "Hard interrogation question 3 (e.g. What will you regret more at age 80?)"
  ],
  "do_nothing_path": {{
    "result": "Summary of missed opportunities and stagnation.",
    "future": "Cinematic explanation of what happens if the user chooses to do absolutely nothing."
  }},
  "battle_mode": {{
    "agent_yes": "Agent Alpha (Pro-Action): Why you should absolutely execute.",
    "agent_no": "Agent Beta (Conservative): Why you should stay safe or preserve capital.",
    "judge_verdict": "Judge Agent: The definitive ruling on who wins the debate and why."
  }},
  "agent_logs": [
    "[Context Agent] Parsing user dilemma and mapping life parameters...",
    "[Emotion Agent] Detecting latent stress and psychological anchoring...",
    "[Risk Agent] Evaluating financial variance and downside exposure...",
    "[Future Simulator] Running 3 parallel timeline projections...",
    "[Bias Agent] Identifying cognitive biases and loss aversion...",
    "[Decision Agent] Synthesizing final recommendation dossier..."
  ]
}}
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        content = response.choices[0].message.content
        json.loads(content)
        return content
    except Exception as e:
        print(f"Groq API call failed: {e}. Falling back to dynamic generator.")
        return get_fallback_decision(question, category, urgency, mode)