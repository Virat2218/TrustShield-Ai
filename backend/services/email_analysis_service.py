import re
from typing import Optional
from schemas.analysis import EmailAnalysisRequest, EmailAnalysisResponse, AuthProtocolVerdict

POPULAR_BRANDS = [
    ("HDFC", "hdfcbank.com"),
    ("State Bank of India", "sbi.co.in"),
    ("SBI", "sbi.co.in"),
    ("ICICI", "icicibank.com"),
    ("Axis Bank", "axisbank.com"),
    ("Kotak", "kotak.com"),
    ("PayPal", "paypal.com"),
    ("Amazon", "amazon.com"),
    ("Apple", "apple.com"),
    ("Microsoft", "microsoft.com"),
    ("Google", "google.com"),
    ("Netflix", "netflix.com"),
    ("Income Tax", "incometax.gov.in"),
    ("RBI", "rbi.org.in"),
    ("Reserve Bank of India", "rbi.org.in"),
    ("FedEx", "fedex.com"),
    ("DHL", "dhl.com"),
    ("India Post", "indiapost.gov.in"),
    ("Paytm", "paytm.com"),
    ("PhonePe", "phonepe.com"),
]

PUBLIC_FREEMAIL_DOMAINS = {
    "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com",
    "mail.com", "protonmail.com", "aol.com", "zoho.com", "yandex.com"
}

SUSPICIOUS_TLDS = {".xyz", ".top", ".work", ".click", ".fit", ".icu", ".rest", ".tk", ".ml", ".ga", ".cf", ".gq"}

def _extract_domain(email_str: Optional[str]) -> Optional[str]:
    if not email_str:
        return None
    match = re.search(r"@([a-zA-Z0-9.\-]+)", email_str.strip())
    if match:
        return match.group(1).lower().strip(".")
    return None

def _parse_auth_header(headers_text: str, protocol: str) -> AuthProtocolVerdict:
    if not headers_text:
        return AuthProtocolVerdict(status="UNKNOWN", details="No raw email headers provided for validation.")
    
    text_lower = headers_text.lower()
    
    if protocol == "spf":
        match = re.search(r"(?:received-spf:\s*([a-z]+)|spf=([a-z]+))", text_lower)
        if match:
            res = (match.group(1) or match.group(2)).upper()
            if res in ["PASS", "FAIL", "SOFTFAIL", "NEUTRAL", "NONE", "PERMERROR", "TEMPERROR"]:
                return AuthProtocolVerdict(
                    status=res,
                    details=f"SPF authentication verdict in headers: {res}"
                )
        return AuthProtocolVerdict(status="NONE", details="No explicit SPF verdict found in provided header text.")

    elif protocol == "dkim":
        match = re.search(r"dkim=([a-z]+)", text_lower)
        if match:
            res = match.group(1).upper()
            if res in ["PASS", "FAIL", "NEUTRAL", "PERMERROR", "TEMPERROR"]:
                return AuthProtocolVerdict(
                    status=res,
                    details=f"DKIM digital signature verdict: {res}"
                )
        return AuthProtocolVerdict(status="NONE", details="No explicit DKIM verification verdict found in provided header text.")

    elif protocol == "dmarc":
        match = re.search(r"dmarc=([a-z]+)", text_lower)
        if match:
            res = match.group(1).upper()
            if res in ["PASS", "FAIL", "NONE", "TEMPERROR"]:
                return AuthProtocolVerdict(
                    status=res,
                    details=f"DMARC alignment policy check: {res}"
                )
        return AuthProtocolVerdict(status="NONE", details="No explicit DMARC policy result found in provided header text.")

    return AuthProtocolVerdict(status="UNKNOWN", details="Unrecognized authentication protocol.")

def analyze_email_details(request: EmailAnalysisRequest) -> EmailAnalysisResponse:
    warning_signs = []
    risk_score = 10
    recommendations = []
    spoofing_suspected = False
    domain_mismatch = False

    sender_domain = _extract_domain(request.sender_email)
    reply_to_domain = _extract_domain(request.reply_to)

    # 1. Display Name Impersonation
    display_name = (request.sender_display_name or "").strip()
    if display_name and sender_domain:
        for brand_name, brand_official_domain in POPULAR_BRANDS:
            if brand_name.lower() in display_name.lower():
                if brand_official_domain not in sender_domain:
                    spoofing_suspected = True
                    risk_score += 45
                    warning_signs.append(
                        f"Display name claims to be '{display_name}', but sending address domain '{sender_domain}' is not official '{brand_official_domain}'."
                    )
                    break

    # 2. Free Webmail Domain for Institutional Sender
    if sender_domain in PUBLIC_FREEMAIL_DOMAINS and display_name:
        is_official_claim = any(kw in display_name.lower() for kw in [
            "bank", "support", "security", "officer", "customs", "tax", "police", "service", "care", "delivery"
        ])
        if is_official_claim:
            spoofing_suspected = True
            risk_score += 35
            warning_signs.append(
                f"Official organization impersonation: sender claims '{display_name}' but sends from a public free email ({sender_domain})."
            )

    # 3. Suspicious TLD
    if sender_domain:
        for tld in SUSPICIOUS_TLDS:
            if sender_domain.endswith(tld):
                risk_score += 25
                warning_signs.append(f"Sender email uses an uncommon, high-abuse top-level domain ({tld}).")
                break

    # 4. Reply-To Mismatch
    if sender_domain and reply_to_domain and sender_domain != reply_to_domain:
        domain_mismatch = True
        risk_score += 30
        warning_signs.append(
            f"Reply-To diversion: Replies will be sent to '{reply_to_domain}', which differs from sender domain '{sender_domain}'."
        )

    # 5. Header Authentication Parsing (SPF, DKIM, DMARC)
    spf_res = _parse_auth_header(request.headers_text or "", "spf")
    dkim_res = _parse_auth_header(request.headers_text or "", "dkim")
    dmarc_res = _parse_auth_header(request.headers_text or "", "dmarc")

    if spf_res.status == "FAIL":
        risk_score += 35
        warning_signs.append("SPF validation failed: sending server is not authorized to send email for this domain.")
    elif spf_res.status == "SOFTFAIL":
        risk_score += 20
        warning_signs.append("SPF softfail: sending server is doubtful under domain policy.")

    if dkim_res.status == "FAIL":
        risk_score += 30
        warning_signs.append("DKIM verification failed: email body or headers were altered in transit or forged.")

    if dmarc_res.status == "FAIL":
        risk_score += 40
        warning_signs.append("DMARC alignment failed: domain owner policy rejected sender authenticity.")

    # 6. Subject line & body check
    combined_content = f"{request.subject or ''} {request.email_body or ''}".lower()
    if re.search(r"\b(account\s+(blocked|suspended|frozen)|immediate\s+action|verify\s+now|otp|urgent\s+notice)\b", combined_content):
        risk_score += 20
        warning_signs.append("Urgency/threat language in subject or email body demanding swift action.")

    if re.search(r"\b(password|pin|cvv|aadhaar|pan\s+card|debit\s+card)\b", combined_content):
        risk_score += 20
        warning_signs.append("Explicit request for sensitive credentials, OTP, or identity documents.")

    # Score clamping
    risk_score = min(max(risk_score, 5), 98)

    if risk_score >= 65:
        risk_level = "High"
        summary = "High risk email indicators detected. There is a strong probability of domain spoofing, identity impersonation, or phishing."
        recommendations.append("Do NOT click any links, open attachments, or reply to this sender.")
        recommendations.append("Verify directly through the company's official mobile app or authentic public telephone helpline.")
        recommendations.append("Mark this message as phishing in your email provider to train spam filters.")
    elif risk_score >= 35:
        risk_level = "Medium"
        summary = "Medium risk email. One or more inconsistencies (such as Reply-To divergence or unconfirmed authentication) require caution."
        recommendations.append("Double-check the sender's full email address rather than relying on the visible display name.")
        recommendations.append("Do not provide passwords, OTPs, or financial information via email.")
    else:
        risk_level = "Low"
        summary = "No overt spoofing or domain forgery detected based on the provided sender details and headers."
        recommendations.append("Always exercise caution if an unexpected email requests financial transfers or personal data.")
        recommendations.append("Legitimate organizations will never ask for your password or OTP via email.")

    return EmailAnalysisResponse(
        risk_score=risk_score,
        risk_level=risk_level,
        summary=summary,
        warning_signs=warning_signs,
        sender_domain=sender_domain,
        reply_to_domain=reply_to_domain,
        domain_mismatch=domain_mismatch,
        spoofing_suspected=spoofing_suspected,
        spf_status=spf_res,
        dkim_status=dkim_res,
        dmarc_status=dmarc_res,
        recommendations=recommendations,
    )
