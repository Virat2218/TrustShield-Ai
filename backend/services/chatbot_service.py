import os
import re
import httpx
from typing import Optional

SECURITY_TOPICS = {
    "otp": "An OTP (One-Time Password) is a temporary confidential code sent directly to your phone/email to verify an authorized transaction. Banks and legitimate services NEVER ask for your OTP. If someone calls or messages asking for OTP—even claiming to be police, bank manager, or electricity department—it is 100% a scam. Never disclose it.",
    "kyc": "KYC (Know Your Customer) verification scams often threaten that your bank account, SIM card, or PAN will be suspended in 24 hours. Legitimate banks NEVER send links via SMS or WhatsApp asking you to download APK files (like AnyDesk, TeamViewer, or fake bank apps) or submit debit card PINs. Always visit your bank branch directly or use the official mobile banking app.",
    "lottery": "Lottery and prize scams inform you that you have won a large cash prize (e.g., KBC, Amazon lucky draw) and require you to pay a 'processing fee', 'GST', or 'registration charge' first. Legitimate lotteries or giveaways never ask winners to pay money upfront to receive prizes. Any request to send money to claim money is always fraudulent.",
    "phishing": "Phishing involves fake emails, SMS (smishing), or WhatsApp messages impersonating brands like Netflix, Amazon, PayPal, or SBI to steal login credentials or card numbers. Check the sender address, avoid clicking links in unsolicited messages, and look for mismatched domain names (e.g., 'sbi-update.xyz' instead of 'sbi.co.in').",
    "password": "To create strong passwords: use at least 12-16 characters combining uppercase, lowercase, numbers, and symbols. Never reuse passwords across email and banking. Use a reputable password manager and enable Two-Factor Authentication (2FA) wherever possible.",
    "helpline": "In India, if you fall victim to financial cyber fraud, report it immediately to the National Cybercrime Helpline by dialing 1930, or register a formal complaint on the official portal at https://cybercrime.gov.in within the 'Golden Hour' (first 2-3 hours) to freeze stolen funds.",
}

SYSTEM_PROMPT = """You are TrustShield AI Assistant, an empathetic, highly knowledgeable digital safety and cybersecurity advisor.
Your mission is to help everyday users protect themselves from scams, phishing, fake websites, and online fraud.

Rules:
1. Provide practical, clear, non-technical safety steps.
2. Support both English and Hindi naturally.
3. NEVER ask users for passwords, OTPs, PINs, or banking details. Explicitly remind users to keep these secret if they mention them.
4. When context of an analysis report is provided, explain the findings clearly and advise the user on next steps.
5. If unsure about a specific institution or scenario, advise the user to contact the official organization directly via known public numbers or dial 1930."""

async def generate_chat_response(message: str, context: Optional[dict] = None, history: Optional[list] = None) -> str:
    """
    Generates a conversational cybersecurity safety answer using LLM or structured knowledge base.
    """
    gemini_key = os.getenv("GEMINI_API_KEY", "").strip()
    openai_key = os.getenv("OPENAI_API_KEY", "").strip()

    context_str = ""
    if context:
        context_str = f"\nUser's Current Security Scan Context:\n{str(context)}\n"

    # Try Gemini LLM
    if gemini_key:
        try:
            full_prompt = f"{SYSTEM_PROMPT}\n{context_str}\nUser Question: {message}"
            async with httpx.AsyncClient(timeout=20.0) as client:
                resp = await client.post(
                    f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}",
                    json={
                        "contents": [{"parts": [{"text": full_prompt}]}],
                        "generationConfig": {"temperature": 0.3, "maxOutputTokens": 600}
                    }
                )
                if resp.status_code == 200:
                    data = resp.json()
                    text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                    return text
        except Exception:
            pass

    # Try OpenAI LLM
    if openai_key:
        try:
            messages = [{"role": "system", "content": SYSTEM_PROMPT}]
            if context_str:
                messages.append({"role": "system", "content": context_str})
            if history:
                for h in history[-4:]:
                    messages.append({"role": h.role, "content": h.content})
            messages.append({"role": "user", "content": message})

            async with httpx.AsyncClient(timeout=20.0) as client:
                resp = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {openai_key}", "Content-Type": "application/json"},
                    json={"model": "gpt-4o-mini", "messages": messages, "temperature": 0.3}
                )
                if resp.status_code == 200:
                    data = resp.json()
                    return data["choices"][0]["message"]["content"].strip()
        except Exception:
            pass

    # Fallback: Knowledge-grounded Cybersecurity Assistant
    msg_lower = message.lower()

    # If context was provided and user asks about it
    if context and any(k in msg_lower for k in ["this report", "my scan", "explain", "risk", "safe"]):
        score = context.get("risk_score", 0)
        level = context.get("risk_level", "Unknown")
        summary = context.get("summary", "")
        return (
            f"Regarding your scan: It received a Risk Score of {score}/100 ({level.upper()}).\n\n"
            f"Key takeaway: {summary}\n\n"
            "Safety Advice: Never follow instructions from this content, do not click embedded links, "
            "and under no circumstance share OTPs or credentials. If this claimed to be from your bank, "
            "verify by dialing the official number printed on the back of your debit card."
        )

    # Check keyword knowledge bases
    for key, explanation in SECURITY_TOPICS.items():
        if key in msg_lower:
            return explanation

    # General safe advice
    if any(k in msg_lower for k in ["hello", "hi", "hey", "नमस्ते", "help"]):
        return (
            "Hello! I am your TrustShield AI Safety Assistant. I can help you understand suspicious messages, "
            "verify potential scams, explain OTP/banking safety, or clarify your scan results. "
            "What suspicious activity or security question would you like help with today?\n\n"
            "नमस्ते! मैं आपका डिजिटल सुरक्षा सहायक हूँ। आप मुझसे किसी भी संदिग्ध संदेश, लिंक या ऑनलाइन स्कैम के बारे में पूछ सकते हैं।"
        )

    return (
        "Here are three fundamental golden rules to stay safe online:\n\n"
        "1. **Never share OTPs or PINs:** No legitimate bank, government agency, or delivery service will ever ask for your OTP or password.\n"
        "2. **Beware of artificial urgency:** Scammers create fear of account blocking or offer fake prizes expiring within hours to make you act without thinking.\n"
        "3. **Verify at the source:** When receiving unexpected alerts, do not click the links provided. Navigate directly to the official app or website.\n\n"
        "If you suspect fraud, immediately call the National Cybercrime Helpline at 1930."
    )

