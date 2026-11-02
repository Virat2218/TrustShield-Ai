import re
import os
import hashlib
import base64
import httpx
from urllib.parse import urlparse
from typing import Optional

SUSPICIOUS_TLDS = {'.xyz', '.top', '.tk', '.ml', '.ga', '.cf', '.gq', '.pw', '.cc', '.su', '.icu', '.click', '.link', '.vip', '.cyou'}
URL_SHORTENERS = {'bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'ow.ly', 'short.io', 'cutt.ly', 'rb.gy', 'is.gd', 'buff.ly'}
SENSITIVE_BRANDS = ['paypal', 'amazon', 'google', 'apple', 'microsoft', 'facebook', 'instagram', 'netflix', 'bank', 'sbi', 'hdfc', 'icici', 'paytm', 'ebay', 'dropbox']

def analyze_url_structure(url: str) -> dict:
    """Analyze URL structure for suspicious patterns. Returns analysis dict."""
    try:
        parsed = urlparse(url)
    except Exception:
        return {"risk_score": 90, "risk_level": "high", "summary": "Invalid URL structure.", "warning_signs": ["Malformed URL"], "recommendations": [], "domain": url, "https_status": False}
    
    domain = parsed.netloc.lower()
    if ':' in domain:
        domain = domain.split(':')[0]  # Remove port
    
    https_status = parsed.scheme == 'https'
    warning_signs = []
    
    # Check for IP address URL
    ip_pattern = re.compile(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$')
    if ip_pattern.match(domain):
        warning_signs.append("IP address used instead of domain name (suspicious)")
    
    # Check HTTPS
    if not https_status:
        warning_signs.append("No HTTPS encryption (data transmitted in plaintext)")
    
    # Check URL shortener
    clean_domain = domain.lstrip('www.')
    if clean_domain in URL_SHORTENERS:
        warning_signs.append(f"URL shortener service detected ({clean_domain}) — destination hidden")
    
    # Check suspicious TLD
    for tld in SUSPICIOUS_TLDS:
        if domain.endswith(tld):
            warning_signs.append(f"Suspicious top-level domain ({tld})")
            break
    
    # Check brand name in non-official domain
    for brand in SENSITIVE_BRANDS:
        if brand in domain:
            # Check if it's the actual official domain
            official_domains = {
                'paypal': 'paypal.com', 'amazon': 'amazon.com', 'google': 'google.com',
                'apple': 'apple.com', 'microsoft': 'microsoft.com', 'facebook': 'facebook.com',
                'instagram': 'instagram.com', 'netflix': 'netflix.com', 'sbi': 'sbi.co.in',
                'hdfc': 'hdfcbank.com', 'icici': 'icicibank.com', 'paytm': 'paytm.com',
                'ebay': 'ebay.com', 'dropbox': 'dropbox.com',
            }
            official = official_domains.get(brand)
            if official and not (domain == official or domain.endswith('.' + official)):
                warning_signs.append(f'Brand name "{brand}" in unofficial domain — possible impersonation')
            break
    
    # Check excessive subdomains
    parts = domain.split('.')
    if len(parts) > 4:
        warning_signs.append("Excessive subdomains (common in phishing URLs)")
    
    # Check suspicious characters
    if re.search(r'[^\w\-./:/\[\]@!$&\'()*+,;=%~?#]', url):
        warning_signs.append("Unusual characters in URL")
    
    # Check long URL
    if len(url) > 200:
        warning_signs.append("Unusually long URL (often used to hide the true destination)")
    
    # Check for encoded/obfuscated content
    if re.search(r'%[0-9a-fA-F]{2}', url) and url.count('%') > 5:
        warning_signs.append("Heavy URL encoding (possible obfuscation)")
    
    # Check for multiple redirects hinted by URL
    if 'redirect' in url.lower() or 'return_url' in url.lower() or 'goto=' in url.lower():
        warning_signs.append("URL contains redirect parameters")
    
    # Compute risk score
    num_warnings = len(warning_signs)
    
    if ip_pattern.match(domain):
        base_score = 75
    elif clean_domain in URL_SHORTENERS:
        base_score = 55
    else:
        base_score = num_warnings * 18
    
    # High-severity bonuses
    impersonation = any('impersonation' in w for w in warning_signs)
    if impersonation:
        base_score = max(base_score, 80)
    
    risk_score = min(max(base_score, 3), 97)
    risk_level = 'high' if risk_score >= 60 else ('medium' if risk_score >= 30 else 'low')
    
    # Build summary
    if risk_level == 'high':
        summary = (
            f"This URL exhibits {num_warnings} high-risk characteristic(s): {', '.join(warning_signs[:2])}. "
            f"Do not visit this URL. It may be designed to steal your credentials or install malware."
        )
    elif risk_level == 'medium':
        summary = (
            f"This URL has {num_warnings} suspicious characteristic(s): {', '.join(warning_signs[:2])}. "
            f"Proceed with caution. Verify the website is legitimate before entering any personal information. "
            f"Note: HTTPS alone does not guarantee a website is trustworthy."
        )
    else:
        summary = (
            "No major structural red flags were detected in this URL. "
            "However, this analysis is based only on URL structure and cannot guarantee the website is safe. "
            "Always verify you are on the correct website before entering sensitive information."
        )
    
    recommendations = _get_url_recommendations(risk_level, warning_signs)
    
    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "domain": domain,
        "https_status": https_status,
        "warning_signs": warning_signs if warning_signs else ["No major structural issues detected"],
        "summary": summary,
        "recommendations": recommendations,
    }

def _get_url_recommendations(risk_level: str, warnings: list[str]) -> list[str]:
    recs = []
    if risk_level == 'high':
        recs.append("Do not visit this URL.")
        recs.append("If you received this link in a message, report it to the sender's platform.")
    elif risk_level == 'medium':
        recs.append("Verify this URL belongs to the legitimate organization before proceeding.")
    
    if any('HTTPS' in w or 'plaintext' in w for w in warnings):
        recs.append("Avoid entering passwords or personal data on non-HTTPS websites.")
    
    if any('shortener' in w.lower() for w in warnings):
        recs.append("Use a URL expander service (e.g., checkshorturl.com) to see the destination before visiting.")
    
    if any('impersonation' in w for w in warnings):
        recs.append("Navigate directly to the official website by typing the address in your browser.")
    
    if any('IP address' in w for w in warnings):
        recs.append("Legitimate websites use domain names, not raw IP addresses.")
    
    recs.append("Never enter login credentials, OTPs, or payment details on suspicious websites.")
    recs.append("When in doubt, contact the organization directly through official channels.")
    return list(dict.fromkeys(recs))  # deduplicate

async def check_google_safe_browsing(url: str, api_key: str) -> Optional[dict]:
    """
    Check URL against Google Safe Browsing API.
    Returns threat info dict if threat found, None if safe or API unavailable.
    """
    if not api_key:
        return None
    
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            payload = {
                "client": {"clientId": "trustshield-ai", "clientVersion": "1.0.0"},
                "threatInfo": {
                    "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
                    "platformTypes": ["ANY_PLATFORM"],
                    "threatEntryTypes": ["URL"],
                    "threatEntries": [{"url": url}],
                }
            }
            resp = await client.post(
                f"https://safebrowsing.googleapis.com/v4/threatMatches:find?key={api_key}",
                json=payload
            )
            resp.raise_for_status()
            data = resp.json()
            if data.get("matches"):
                return data["matches"]
    except Exception:
        pass
    return None
