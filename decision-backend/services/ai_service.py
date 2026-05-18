import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def get_ai_decision(question: str):

    prompt = f"""
You are an advanced Decision Intelligence System.

User Question: {question}

Perform deep analysis and return JSON with:

1. recommendation (YES / NO / MAYBE)
2. confidence (0-100)
3. risk (Low/Medium/High)

4. parallel_universe (3 scenarios with title + story)
5. future_self (message from future self after 5 years)
6. bias_detection (list of psychological biases affecting decision)

Respond ONLY in valid JSON format:

{{
  "recommendation": "",
  "confidence": 0,
  "risk": "",
  "parallel_universe": [
    {{
      "title": "",
      "story": ""
    }}
  ],
  "future_self": "",
  "bias_detection": []
}}
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.8
    )

    return response.choices[0].message.content
