import re
import os
import hashlib
import base64
import httpx
from enum import Enum
from dataclasses import dataclass
from urllib.parse import urlparse
from typing import Optional, List, Dict, Any

SAFE_BROWSING_TIMEOUT_SECONDS = float(os.getenv("SAFE_BROWSING_TIMEOUT_SECONDS", "5.0"))

class SafeBrowsingStatus(str, Enum):
    THREAT_FOUND = "threat_found"
    NO_MATCHES = "no_matches"
    NOT_CONFIGURED = "not_configured"
    API_ERROR = "api_error"

@dataclass
class SafeBrowsingResult:
    status: SafeBrowsingStatus
    threats: List[str]
    details: str
    raw_matches: Optional[List[Dict[str, Any]]] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "status": self.status.value if isinstance(self.status, SafeBrowsingStatus) else str(self.status),
            "threats": self.threats or [],
            "details": self.details or "",
        }

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

async def check_google_safe_browsing(
    url: str,
    api_key: Optional[str] = None,
    timeout_seconds: Optional[float] = None,
) -> SafeBrowsingResult:
    """
    Check URL against Google Safe Browsing API v4.
    Returns SafeBrowsingResult with explicit status:
      - THREAT_FOUND: threat matches detected in database
      - NO_MATCHES: API completed successfully, zero matches found
      - NOT_CONFIGURED: API key missing or empty
      - API_ERROR: HTTP error, timeout, network error, or malformed response
    """
    key = (api_key if api_key is not None else os.getenv("GOOGLE_SAFE_BROWSING_API_KEY", "")).strip()
    if not key:
        return SafeBrowsingResult(
            status=SafeBrowsingStatus.NOT_CONFIGURED,
            threats=[],
            details="Google Safe Browsing API key is not configured. External threat database check was not performed.",
        )

    t_sec = timeout_seconds if timeout_seconds is not None else SAFE_BROWSING_TIMEOUT_SECONDS
    timeout = httpx.Timeout(t_sec, connect=min(3.0, t_sec))

    payload = {
        "client": {"clientId": "trustshield-ai", "clientVersion": "1.0.0"},
        "threatInfo": {
            "threatTypes": [
                "MALWARE",
                "SOCIAL_ENGINEERING",
                "UNWANTED_SOFTWARE",
                "POTENTIALLY_HARMFUL_APPLICATION",
            ],
            "platformTypes": ["ANY_PLATFORM"],
            "threatEntryTypes": ["URL"],
            "threatEntries": [{"url": url}],
        },
    }

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.post(
                "https://safebrowsing.googleapis.com/v4/threatMatches:find",
                params={"key": key},
                json=payload,
            )

        if resp.status_code != 200:
            return SafeBrowsingResult(
                status=SafeBrowsingStatus.API_ERROR,
                threats=[],
                details=f"Google Safe Browsing API returned HTTP {resp.status_code}. External check did not complete.",
            )

        try:
            data = resp.json()
        except Exception:
            return SafeBrowsingResult(
                status=SafeBrowsingStatus.API_ERROR,
                threats=[],
                details="Google Safe Browsing API returned an invalid non-JSON response. External check did not complete.",
            )

        matches = data.get("matches", []) if isinstance(data, dict) else []
        if matches:
            threat_types = [
                m.get("threatType", "UNKNOWN_THREAT")
                for m in matches
                if isinstance(m, dict)
            ]
            return SafeBrowsingResult(
                status=SafeBrowsingStatus.THREAT_FOUND,
                threats=threat_types,
                details=f"Confirmed threat match in Google Safe Browsing: {', '.join(threat_types)}",
                raw_matches=matches,
            )
        else:
            return SafeBrowsingResult(
                status=SafeBrowsingStatus.NO_MATCHES,
                threats=[],
                details="Google Safe Browsing check completed: no active threat matches found.",
            )

    except httpx.TimeoutException:
        return SafeBrowsingResult(
            status=SafeBrowsingStatus.API_ERROR,
            threats=[],
            details="Google Safe Browsing request timed out. External threat database check did not complete.",
        )
    except httpx.RequestError as exc:
        return SafeBrowsingResult(
            status=SafeBrowsingStatus.API_ERROR,
            threats=[],
            details=f"Google Safe Browsing connection failure ({type(exc).__name__}). External threat database check did not complete.",
        )
    except Exception as exc:
        return SafeBrowsingResult(
            status=SafeBrowsingStatus.API_ERROR,
            threats=[],
            details=f"Google Safe Browsing check failed unexpectedly ({type(exc).__name__}). External threat database check did not complete.",
        )
