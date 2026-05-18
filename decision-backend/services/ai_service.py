import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def get_ai_decision(question: str):

    prompt = f"""
You are an AI Decision Maker.

User question: {question}

Do the following:
1. Analyze situation
2. Give pros and cons
3. Give final recommendation (YES/NO/MAYBE)
4. Give confidence (0-100)
5. Give risk level (Low/Medium/High)

Respond in JSON format:
{{
  "recommendation": "",
  "confidence": ,
  "risk": "",
  "reason": ""
}}
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7
    )

    return response.choices[0].message.content