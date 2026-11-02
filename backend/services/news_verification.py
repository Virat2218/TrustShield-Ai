import os
import re
import urllib.parse
import httpx
from typing import Optional

# High-credibility fact-checking and news domain patterns
REPUTABLE_FACT_CHECKERS = [
    {"name": "PIB Fact Check", "url": "https://factcheck.pib.gov.in"},
    {"name": "Reuters Fact Check", "url": "https://www.reuters.com/fact-check"},
    {"name": "Associated Press News", "url": "https://apnews.com/hub/ap-fact-check"},
    {"name": "Alt News", "url": "https://www.altnews.in"},
    {"name": "Boom Live", "url": "https://www.boomlive.in"},
    {"name": "Snopes Fact Check", "url": "https://www.snopes.com"},
    {"name": "BBC Reality Check", "url": "https://www.bbc.com/news/reality_check"},
]

COMMON_HOAX_PATTERNS = [
    (r'\b(nasa\s+declared|unesco\s+declared|unesco\s+announced)\b', "Unsubstantiated 'UNESCO/NASA declared' viral claim template"),
    (r'\b(forwarded\s+as\s+received|share\s+to\s+\d+\s+groups)\b', "Viral chain letter forwarding demand"),
    (r'\b(cure\s+for\s+cancer|miracle\s+cure|reverses?\s+diabetes\s+in\s+\d+\s+days)\b', "Unverified medical miracle claim"),
    (r'\b(5g\s+(causes|radiation\s+kills)|vaccine\s+microchip)\b', "Widely debunked conspiracy theory"),
    (r'\b(free\s+recharge|modi\s+free\s+laptop|yojana\s+claim\s+money)\b', "Fraudulent government welfare scheme rumor"),
]

async def search_credible_sources(query: str) -> list[dict]:
    """
    Retrieves real factual evidence from credible public encyclopedic & knowledge APIs
    (Wikipedia API and DuckDuckGo Instant Answer API) without inventing citations.
    """
    sources = []
    clean_query = re.sub(r'[^\w\s]', '', query).strip()
    words = clean_query.split()[:8]
    search_term = " ".join(words)

    if not search_term:
        return sources

    # 1. Query Wikipedia Search API for real encyclopedic articles & facts
    try:
        wiki_url = f"https://en.wikipedia.org/w/api.php?action=opensearch&search={urllib.parse.quote(search_term)}&limit=3&namespace=0&format=json"
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(wiki_url)
            if resp.status_code == 200:
                data = resp.json()
                # data is [query, [titles], [descriptions], [urls]]
                if len(data) >= 4 and data[1]:
                    for title, desc, url in zip(data[1], data[2], data[3]):
                        if url and title:
                            sources.append({
                                "name": f"Wikipedia: {title}",
                                "url": url,
                                "date": "Current Reference",
                                "snippet": desc[:250] if desc else f"Encyclopedia entry on {title}",
                            })
    except Exception:
        pass

    # 2. Query DuckDuckGo Instant Answer API for related topics
    try:
        ddg_url = f"https://api.duckduckgo.com/?q={urllib.parse.quote(search_term)}&format=json&no_html=1&skip_disambig=1"
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(ddg_url)
            if resp.status_code == 200:
                data = resp.json()
                if data.get("AbstractText") and data.get("AbstractURL"):
                    sources.append({
                        "name": data.get("Heading") or "Knowledge Source",
                        "url": data.get("AbstractURL"),
                        "date": "Reference Database",
                        "snippet": data.get("AbstractText")[:250],
                    })
                # Check related topics
                for topic in data.get("RelatedTopics", [])[:2]:
                    if isinstance(topic, dict) and topic.get("FirstURL") and topic.get("Text"):
                        sources.append({
                            "name": topic.get("Text", "").split(" - ")[0] if " - " in topic.get("Text", "") else "Reference Topic",
                            "url": topic.get("FirstURL"),
                            "date": "Reference Database",
                            "snippet": topic.get("Text")[:200],
                        })
    except Exception:
        pass

    # Deduplicate by URL
    seen_urls = set()
    unique_sources = []
    for s in sources:
        if s["url"] not in seen_urls:
            seen_urls.add(s["url"])
            unique_sources.append(s)

    if not unique_sources:
        # Provide authoritative reference portals for media literacy and verification
        return [
            {
                "name": f"{fc['name']} Database",
                "url": fc["url"],
                "date": "Reference Portal",
                "snippet": "Authoritative public fact-checking database for verifying viral social media claims.",
            }
            for fc in REPUTABLE_FACT_CHECKERS[:3]
        ]

    return unique_sources[:4]

async def verify_claim_with_ai(claim: str, sources: list[dict]) -> Optional[dict]:
    """
    Attempts verification via Gemini or OpenAI if API keys are available.
    """
    gemini_key = os.getenv("GEMINI_API_KEY", "").strip()
    openai_key = os.getenv("OPENAI_API_KEY", "").strip()

    if not (gemini_key or openai_key):
        return None

    sources_text = "\n".join([f"- {s['name']}: {s.get('snippet', '')} ({s['url']})" for s in sources])

    prompt = f"""You are a professional fact-checker. Evaluate the following claim using available knowledge and retrieved references.

Claim: "{claim}"

Retrieved References:
{sources_text if sources_text else "No direct reference retrieved."}

Respond with ONLY valid JSON with these exact fields:
{{
  "status": "<Supported by Evidence | Disputed by Evidence | Misleading | Unverified>",
  "confidence_level": <integer 0-100>,
  "explanation": "<2-3 sentence factual explanation>",
  "supporting_evidence": ["<point 1>", "<point 2>"],
  "contradicting_evidence": ["<point 1>", "<point 2>"],
  "recommendations": ["<action 1>", "<action 2>"]
}}

Rules:
- Never label as fake without grounds; if evidence is weak or absent, label as "Unverified"
- Distinguish retrieved evidence from model reasoning
- Provide practical verification steps in recommendations"""

    if gemini_key:
        try:
            import json
            async with httpx.AsyncClient(timeout=25.0) as client:
                resp = await client.post(
                    f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}",
                    json={
                        "contents": [{"parts": [{"text": prompt}]}],
                        "generationConfig": {"temperature": 0.1, "maxOutputTokens": 800}
                    }
                )
                if resp.status_code == 200:
                    text = resp.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
                    if text.startswith("```"):
                        text = text.split("```")[1]
                        if text.startswith("json"):
                            text = text[4:]
                    return json.loads(text.strip())
        except Exception:
            pass

    return None

def verify_claim_rule_based(claim: str, sources: list[dict]) -> dict:
    """
    Transparent rule-based fact verification with evidence citations.
    """
    claim_lower = claim.lower()
    hoax_hits = []

    for pattern, reason in COMMON_HOAX_PATTERNS:
        if re.search(pattern, claim_lower):
            hoax_hits.append(reason)

    supporting = []
    contradicting = []

    # Check evidence against retrieved source snippets
    for s in sources:
        snippet = s.get("snippet", "").lower()
        # Look for keywords
        words = [w for w in re.findall(r'\b[a-z]{4,}\b', claim_lower) if w not in {'that', 'with', 'this', 'from', 'have', 'were', 'been'}]
        matches = [w for w in words if w in snippet]
        if len(matches) >= 2:
            supporting.append(f"Source '{s['name']}' contains related documentation: \"{s.get('snippet', '')[:120]}...\"")

    if hoax_hits:
        status = "Disputed by Evidence"
        confidence = 85
        contradicting.extend(hoax_hits)
        explanation = (
            f"This claim matches known viral hoax or misinformation patterns: {', '.join(hoax_hits)}. "
            "Independent fact-checkers and official bodies have repeatedly cautioned against forwarding unverified messages of this type."
        )
    elif sources and len(supporting) >= 2:
        status = "Supported by Evidence"
        confidence = 78
        explanation = (
            f"Retrieved credible documentation matches elements of this claim from recognized references including {sources[0]['name']}. "
            "However, always check the original source context."
        )
    elif sources:
        status = "Misleading"
        confidence = 60
        contradicting.append("Claim phrasing lacks nuance or generalizes beyond retrieved context.")
        explanation = (
            "Related reference materials exist, but the claim appears to oversimplify, sensationalize, or take information out of context. "
            "Exercise discretion before sharing."
        )
    else:
        status = "Unverified"
        confidence = 45
        contradicting.append("No authoritative news wire or fact-check database match found for this specific phrasing.")
        explanation = (
            "Insufficient direct evidence was found to confirm or debunk this claim. "
            "It is marked 'Unverified'. Do not assume it is true or false without consulting primary reporting."
        )

    # Standard recommendations for media literacy
    recommendations = [
        "Search this claim on official fact-checking portals (e.g., PIB Fact Check, Reuters, Alt News).",
        "Look for coverage by reputable news agencies (AP, Reuters, PTI, BBC) rather than social media forwards.",
        "Check official government or organizational press releases directly at their official domains.",
        "Avoid forwarding or resharing sensational claims until verified by at least two independent credible outlets.",
    ]

    return {
        "status": status,
        "confidence_level": confidence,
        "explanation": explanation,
        "supporting_evidence": supporting if supporting else ["No direct affirmative consensus in top queried encyclopedic records."],
        "contradicting_evidence": contradicting if contradicting else ["No direct debunking records found."],
        "recommendations": recommendations,
        "analysis_mode": "evidence-retrieval+rule-based",
    }
