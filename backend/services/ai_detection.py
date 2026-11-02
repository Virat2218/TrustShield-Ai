import re
import os
from urllib.parse import urlparse
from typing import Optional

# ─────────────────────────────────────────────
# Rule-based scam detection patterns
# ─────────────────────────────────────────────

PHISHING_PATTERNS = [
    (r'\bverify\s+your\s+account\b', "Account verification demand"),
    (r'\bconfirm\s+your\s+(identity|details|information)\b', "Identity confirmation request"),
    (r'\bupdate\s+your\s+(bank|payment|billing)\s+(details|information)\b', "Bank/payment update request"),
    (r'\b(your\s+)?account\s+(has\s+been\s+|is\s+)?(suspended|locked|blocked|compromised|hacked|frozen)\b', "Account suspension threat"),
    (r'(खाता|अकाउंट)\s*(ब्लॉक|बंद|निलंबित)', "Account suspension threat (Hindi)"),
    (r'\bclick\s+(here|the\s+link|below)\s*(immediately|now|urgently|asap)?\b', "Click link demand"),
    (r'(तुरंत|अभी)\s*(क्लिक\s*करें|लिंक\s*खोलें)', "Urgent click demand (Hindi)"),
    (r'\b(enter|share|send|provide)\s+(your\s+)?(otp|password|pin|cvv|card\s+number|credentials?)\b', "Credential / OTP theft attempt"),
    (r'(ओटीपी|पासवर्ड|पिन)\s*(साझा|शेयर|दर्ज)\s*करें', "OTP/credential sharing request (Hindi)"),
    (r'\b(otp|one.time.password)\s*(is|=|:)\s*\d{4,8}\b', "OTP in message (potential relay scam)"),
]

LOTTERY_PATTERNS = [
    (r'\b(congratulations|congrats|you\s+have\s+won|winner)\b', "Prize/lottery claim"),
    (r'\b(lottery|lucky\s+draw|prize|reward|gift\s+card)\b', "Lottery/prize mention"),
    (r'(बधाई\s*हो|लॉटरी|इनाम|विजेता|जीता\s*है|जीत\s*चुके)', "Prize/lottery claim (Hindi)"),
    (r'\bclaim\s+your\s+(prize|reward|winnings|gift)\b', "Prize claim request"),
    (r'\byou\s+are\s+(selected|chosen|lucky)\b', "Selection claim"),
    (r'\b(free\s+iphone|free\s+gift|free\s+money)\b', "Free gift offer"),
]

URGENCY_PATTERNS = [
    (r'\b(urgent|urgently|immediate|immediately|action\s+required|critical\s+alert)\b', "Urgent action demand"),
    (r'\b(act\s+now|act\s+immediately|respond\s+immediately|immediate\s+action)\b', "Urgent action demand"),
    (r'\b(last\s+chance|final\s+notice|expires?\s+in\s+\d+\s+hours?)\b', "Artificial urgency"),
    (r'\b(24\s*hours?|48\s*hours?)\s+(or\s+your\s+account|deadline)\b', "Time pressure threat"),
    (r'(24\s*घंटे|अंतिम\s*मौका|तुरंत\s*कार्रवाई|समय\s*सीमा)', "Urgency / time pressure (Hindi)"),
    (r'\bdo\s+not\s+(ignore|delay|miss)\s+this\b', "Ignore warning"),
]

FINANCIAL_SCAM_PATTERNS = [
    (r'\b(send\s+money|transfer\s+(funds?|money|amount))\b', "Money transfer request"),
    (r'(पैसे\s*भेजें|रुपये\s*ट्रांसफर|शुल्क\s*जमा)', "Money transfer demand (Hindi)"),
    (r'\b(investment|invest\s+now|guaranteed\s+return|double\s+your\s+money)\b', "Investment scam indicators"),
    (r'\b(bitcoin|crypto|btc)\s*(investment|profit|earn)\b', "Crypto investment scam"),
    (r'\bpay\s+(rs\.?|inr|₹|\$|usd)\s*[\d,]+\b', "Payment demand"),
    (r'\bemi\s+(not\s+paid|overdue|pending)\b', "EMI payment scam"),
    (r'\btax\s+(refund|return)\s*(processing|click)\b', "Tax refund scam"),
]

IMPERSONATION_PATTERNS = [
    (r'\b(rbi|reserve\s+bank|income\s+tax\s+department|irdai|sebi|trai)\b', "Government body impersonation"),
    (r'\b(amazon|flipkart|paytm|phonepe|google\s+pay|gpay)\s+(customer\s+care|support|helpline)\b', "Brand impersonation"),
    (r'\b(sbi|hdfc|icici|axis|kotak|yes\s+bank)\b.*\b(suspended|blocked|kyc|update)\b', "Bank impersonation"),
    (r'\bkyc\s+(update|verification|pending|expire)\b', "KYC scam"),
    (r'(केवाईसी\s*अपडेट|केवाईसी\s*सत्यापन)', "KYC update demand (Hindi)"),
    (r'\b(customer\s+care|helpline|toll.?free)\s*:?\s*[\+\d\-\s]{8,}\b', "Fake helpline number"),
]

SUSPICIOUS_LINK_PATTERNS = [
    (r'https?://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', "IP-based URL (suspicious)"),
    (r'https?://[^\s]*\.(xyz|top|tk|ml|ga|cf|gq|pw|cc|su)(/|\s|$)', "Suspicious TLD"),
    (r'https?://[^\s]*bit\.ly[^\s]*', "URL shortener (bit.ly)"),
    (r'https?://[^\s]*tinyurl[^\s]*', "URL shortener (tinyurl)"),
    (r'https?://[^\s]*goo\.gl[^\s]*', "URL shortener (goo.gl)"),
    (r'https?://[^\s]*(paypal|amazon|google|apple|microsoft|facebook)[^\s]*\.[a-z]{2,}(?<!\.(com|org|net|edu|gov))', "Brand name in suspicious domain"),
]

ALL_PATTERNS = (
    PHISHING_PATTERNS + LOTTERY_PATTERNS + URGENCY_PATTERNS +
    FINANCIAL_SCAM_PATTERNS + IMPERSONATION_PATTERNS + SUSPICIOUS_LINK_PATTERNS
)

def _find_matches(text: str, patterns: list) -> tuple[list[str], list[str]]:
    """Returns (warning_signs, suspicious_phrases)"""
    text_lower = text.lower()
    warnings = []
    phrases = []
    seen_warnings = set()
    for pattern, label in patterns:
        matches = re.findall(pattern, text_lower, re.IGNORECASE)
        if matches:
            if label not in seen_warnings:
                warnings.append(label)
                seen_warnings.add(label)
            for m in matches:
                if isinstance(m, str) and len(m) > 3 and m not in phrases:
                    phrases.append(m)
    return warnings, phrases

def _calculate_risk_score(num_warnings: int, pattern_groups_hit: dict) -> int:
    """Calculate risk score 0-100 based on number and type of pattern matches."""
    if num_warnings == 0:
        return 5
    
    base = min(num_warnings * 12, 60)
    bonus = 0
    
    # High-weight patterns
    if pattern_groups_hit.get('phishing'):
        bonus += 20
    if pattern_groups_hit.get('financial'):
        bonus += 15
    if pattern_groups_hit.get('impersonation'):
        bonus += 15
    if pattern_groups_hit.get('lottery') and pattern_groups_hit.get('urgency'):
        bonus += 10
    
    score = min(base + bonus, 97)
    return max(score, 5)

def _get_risk_level(score: int) -> str:
    if score >= 60:
        return 'high'
    elif score >= 30:
        return 'medium'
    return 'low'

def _get_recommendations(risk_level: str, warnings: list[str]) -> list[str]:
    recs = []
    
    if risk_level == 'high':
        recs.append("Do not respond to this message or click any links.")
        recs.append("Block and report the sender immediately.")
    elif risk_level == 'medium':
        recs.append("Exercise caution before taking any action.")
    
    if any('OTP' in w or 'password' in w or 'credential' in w or 'PIN' in w for w in warnings):
        recs.append("Never share OTPs, passwords, or PINs with anyone — including bank employees.")
    
    if any('link' in w.lower() or 'URL' in w.lower() for w in warnings):
        recs.append("Do not click any links in this message. Visit the official website directly.")
    
    if any('bank' in w.lower() or 'KYC' in w or 'impersonation' in w.lower() for w in warnings):
        recs.append("Contact your bank directly using the number on the back of your card to verify.")
    
    if any('money' in w.lower() or 'transfer' in w.lower() or 'payment' in w.lower() for w in warnings):
        recs.append("Never transfer money to an unknown account. Verify the recipient through official channels.")
    
    if any('prize' in w.lower() or 'lottery' in w.lower() or 'reward' in w.lower() for w in warnings):
        recs.append("Legitimate lotteries do not require upfront payments or personal information.")
    
    if any('government' in w.lower() or 'tax' in w.lower() or 'RBI' in w or 'IRDAI' in w for w in warnings):
        recs.append("Government agencies do not contact citizens via SMS/WhatsApp for payments.")
    
    recs.append("If in doubt, consult someone you trust or contact cybercrime helpline 1930.")
    
    # Deduplicate
    seen = set()
    unique = []
    for r in recs:
        if r not in seen:
            seen.add(r)
            unique.append(r)
    return unique

def _build_summary(risk_level: str, warnings: list[str], num_patterns: int) -> str:
    if risk_level == 'high':
        return (
            f"This message contains {num_patterns} high-risk indicators strongly associated with "
            f"scams and fraud attempts. Detected patterns include: {', '.join(warnings[:3])}. "
            f"This message should be treated as highly suspicious. Do not act on its instructions."
        )
    elif risk_level == 'medium':
        return (
            f"This message contains {num_patterns} pattern(s) that may indicate a scam or phishing attempt. "
            f"Detected: {', '.join(warnings[:3])}. Proceed with caution and verify through official channels before acting."
        )
    else:
        return (
            "No strong scam indicators were detected in this message. However, this analysis is not a guarantee of safety. "
            "Always exercise caution with unsolicited messages and never share personal or financial information."
        )

def analyze_message_rules(message: str) -> dict:
    """Rule-based scam message analysis."""
    phishing_warnings, phishing_phrases = _find_matches(message, PHISHING_PATTERNS)
    lottery_warnings, lottery_phrases = _find_matches(message, LOTTERY_PATTERNS)
    urgency_warnings, urgency_phrases = _find_matches(message, URGENCY_PATTERNS)
    financial_warnings, financial_phrases = _find_matches(message, FINANCIAL_SCAM_PATTERNS)
    impersonation_warnings, impersonation_phrases = _find_matches(message, IMPERSONATION_PATTERNS)
    link_warnings, link_phrases = _find_matches(message, SUSPICIOUS_LINK_PATTERNS)
    
    all_warnings = list(dict.fromkeys(
        phishing_warnings + lottery_warnings + urgency_warnings +
        financial_warnings + impersonation_warnings + link_warnings
    ))
    all_phrases = list(dict.fromkeys(
        phishing_phrases + lottery_phrases + urgency_phrases +
        financial_phrases + impersonation_phrases + link_phrases
    ))
    
    pattern_groups_hit = {
        'phishing': bool(phishing_warnings),
        'lottery': bool(lottery_warnings),
        'urgency': bool(urgency_warnings),
        'financial': bool(financial_warnings),
        'impersonation': bool(impersonation_warnings),
        'link': bool(link_warnings),
    }
    
    risk_score = _calculate_risk_score(len(all_warnings), pattern_groups_hit)
    risk_level = _get_risk_level(risk_score)
    
    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "summary": _build_summary(risk_level, all_warnings, len(all_warnings)),
        "warning_signs": all_warnings if all_warnings else ["No specific high-risk patterns detected"],
        "suspicious_phrases": all_phrases[:10],  # Limit to 10
        "recommendations": _get_recommendations(risk_level, all_warnings),
        "analysis_mode": "rule-based",
    }


# ─────────────────────────────────────────────
# Optional: AI-powered analysis via Gemini or OpenAI
# ─────────────────────────────────────────────

async def analyze_message_ai(message: str) -> Optional[dict]:
    """
    Attempt AI-powered analysis. Returns None if AI is not available.
    Tries Gemini first, then OpenAI, then falls back to None.
    """
    gemini_key = os.getenv("GEMINI_API_KEY", "").strip()
    openai_key = os.getenv("OPENAI_API_KEY", "").strip()
    
    if gemini_key:
        try:
            return await _analyze_with_gemini(message, gemini_key)
        except Exception:
            pass
    
    if openai_key:
        try:
            return await _analyze_with_openai(message, openai_key)
        except Exception:
            pass
    
    return None

async def _analyze_with_gemini(message: str, api_key: str) -> dict:
    import httpx
    
    prompt = f"""You are a cybersecurity expert specializing in scam detection. Analyze the following message and respond with a JSON object.

Message to analyze:
\"\"\"
{message}
\"\"\"

Respond with ONLY a valid JSON object (no markdown, no explanation) with these exact fields:
{{
  "risk_score": <integer 0-100>,
  "risk_level": "<low|medium|high>",
  "summary": "<2-3 sentence plain-language explanation>",
  "warning_signs": ["<sign1>", "<sign2>"],
  "suspicious_phrases": ["<phrase1>", "<phrase2>"],
  "recommendations": ["<action1>", "<action2>"]
}}

Rules:
- risk_score 0-33 = low, 34-66 = medium, 67-100 = high
- Be conservative: do not mark messages as definitively safe
- warning_signs: specific patterns you detected (e.g., "Urgent payment demand", "OTP theft attempt")
- suspicious_phrases: exact excerpts from the message that are suspicious (up to 8)
- recommendations: clear, actionable safety steps (3-6 items)
- If no scam indicators found, still provide at least one general safety recommendation"""
    
    async with httpx.AsyncClient(timeout=25) as client:
        resp = await client.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}",
            json={
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.1, "maxOutputTokens": 1000}
            }
        )
        resp.raise_for_status()
        data = resp.json()
        text = data["candidates"][0]["content"]["parts"][0]["text"]
        # Strip markdown code fences if present
        text = text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        import json
        result = json.loads(text.strip())
        result["analysis_mode"] = "ai"
        return result

async def _analyze_with_openai(message: str, api_key: str) -> dict:
    import httpx
    import json
    
    prompt = f"""Analyze this message for scam/phishing indicators. Respond with ONLY a JSON object with fields: risk_score (0-100 int), risk_level (low/medium/high), summary (string), warning_signs (array), suspicious_phrases (array), recommendations (array).

Message: {message}"""
    
    async with httpx.AsyncClient(timeout=25) as client:
        resp = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={
                "model": "gpt-4o-mini",
                "messages": [{"role": "user", "content": prompt}],
                "response_format": {"type": "json_object"},
                "temperature": 0.1
            }
        )
        resp.raise_for_status()
        data = resp.json()
        result = json.loads(data["choices"][0]["message"]["content"])
        result["analysis_mode"] = "ai"
        return result
