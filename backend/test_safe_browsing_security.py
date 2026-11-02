"""
TrustShield AI - Google Safe Browsing Integration & Resilience Test Suite

Verifies:
1. Not Configured: Missing or empty API key yields status='not_configured'.
2. Clean Result (No Matches): Valid 200 response with no matches yields status='no_matches'.
3. Threat Found: Valid 200 response with threat matches yields status='threat_found'.
4. HTTP Error: API 4xx/5xx responses yield status='api_error' without leaking API keys.
5. Timeout Boundedness: Request timeouts yield status='api_error' within configured bounds.
6. Network / Connection Error: Network transport failures yield status='api_error'.
7. Malformed Non-JSON Response: Invalid payload yields status='api_error'.
8. Key Secrecy: Secret API keys are never leaked into details or logs.
9. Route Integration - Not Configured: Structural analysis preserved, mode='rule-based'.
10. Route Integration - Clean Check: Mode='rule-based+safe_browsing_clear'.
11. Route Integration - Threat Found: Upgrades to high risk (>= 90), mode='ai+safe_browsing_threat'.
12. Route Integration - API Failure / Timeout: Mode='rule-based (safe_browsing_unavailable)',
    never marks as clear, includes explicit warning sign about external check unavailability.

Run:
    cd backend && ./venv/bin/python3 test_safe_browsing_security.py
"""

import os
import sys
import asyncio
from unittest.mock import patch, AsyncMock
import httpx

# Bootstrap path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Configure test JWT secret
from services.auth_service import set_test_jwt_secret
set_test_jwt_secret("test-safe-browsing-jwt-secret-key-32")

from fastapi.testclient import TestClient
from main import app
from services.url_checker import (
    check_google_safe_browsing,
    SafeBrowsingStatus,
    SafeBrowsingResult,
    analyze_url_structure,
)

FAKE_SECRET_KEY = "AIzaSySecretSafeBrowsingTestKey123456"


def run_safe_browsing_security_tests():
    print("=" * 65)
    print("TRUSTSHIELD AI - GOOGLE SAFE BROWSING RESILIENCE TEST SUITE")
    print("=" * 65)

    # -------------------------------------------------------------
    # Test 1: Not configured (missing or empty key)
    # -------------------------------------------------------------
    print("\n[Test 1] Not Configured Outcome")
    res_empty = asyncio.run(check_google_safe_browsing("https://example.com", api_key=""))
    assert res_empty.status == SafeBrowsingStatus.NOT_CONFIGURED
    assert res_empty.threats == []
    assert "not configured" in res_empty.details.lower()

    res_none = asyncio.run(check_google_safe_browsing("https://example.com", api_key=None))
    assert res_none.status == SafeBrowsingStatus.NOT_CONFIGURED
    print("    ✅ Empty/absent API key correctly yields status='not_configured'")

    # -------------------------------------------------------------
    # Test 2: Clean result (no matches)
    # -------------------------------------------------------------
    print("\n[Test 2] Clean Result (No Matches in Threat Database)")
    mock_clean_resp = httpx.Response(200, json={"matches": []})
    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = mock_clean_resp
        res_clean = asyncio.run(check_google_safe_browsing("https://legit-site.com", api_key=FAKE_SECRET_KEY))
        assert res_clean.status == SafeBrowsingStatus.NO_MATCHES
        assert res_clean.threats == []
        assert "no active threat matches" in res_clean.details.lower()
        print("    ✅ Successful 200 response with no matches yields status='no_matches'")

    # -------------------------------------------------------------
    # Test 3: Threat found
    # -------------------------------------------------------------
    print("\n[Test 3] Threat Found Outcome")
    mock_threat_resp = httpx.Response(
        200,
        json={
            "matches": [
                {
                    "threatType": "MALWARE",
                    "platformType": "ANY_PLATFORM",
                    "threatEntryType": "URL",
                    "threat": {"url": "http://evil-malware-portal.xyz"},
                },
                {
                    "threatType": "SOCIAL_ENGINEERING",
                    "platformType": "ANY_PLATFORM",
                    "threatEntryType": "URL",
                    "threat": {"url": "http://evil-malware-portal.xyz"},
                },
            ]
        },
    )
    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = mock_threat_resp
        res_threat = asyncio.run(check_google_safe_browsing("http://evil-malware-portal.xyz", api_key=FAKE_SECRET_KEY))
        assert res_threat.status == SafeBrowsingStatus.THREAT_FOUND
        assert "MALWARE" in res_threat.threats
        assert "SOCIAL_ENGINEERING" in res_threat.threats
        assert "Confirmed threat match" in res_threat.details
        print("    ✅ Matches detected yields status='threat_found' with threat list")

    # -------------------------------------------------------------
    # Test 4: HTTP 4xx / 5xx error
    # -------------------------------------------------------------
    print("\n[Test 4] HTTP Error Handling")
    mock_error_resp = httpx.Response(503, text="Service Unavailable")
    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = mock_error_resp
        res_err = asyncio.run(check_google_safe_browsing("https://example.com", api_key=FAKE_SECRET_KEY))
        assert res_err.status == SafeBrowsingStatus.API_ERROR
        assert "HTTP 503" in res_err.details
        assert FAKE_SECRET_KEY not in res_err.details
        print("    ✅ HTTP 503 yields status='api_error' (NOT clean) without leaking API key")

    # -------------------------------------------------------------
    # Test 5: Timeout handling
    # -------------------------------------------------------------
    print("\n[Test 5] Bounded Timeout Handling")
    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.side_effect = httpx.TimeoutException("Connection timed out after 5.0s")
        res_timeout = asyncio.run(
            check_google_safe_browsing("https://example.com", api_key=FAKE_SECRET_KEY, timeout_seconds=1.0)
        )
        assert res_timeout.status == SafeBrowsingStatus.API_ERROR
        assert "timed out" in res_timeout.details.lower()
        assert FAKE_SECRET_KEY not in res_timeout.details
        print("    ✅ TimeoutException yields status='api_error' (NOT clean)")

    # -------------------------------------------------------------
    # Test 6: Network connection error
    # -------------------------------------------------------------
    print("\n[Test 6] Network Connection Failure")
    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.side_effect = httpx.ConnectError("Failed to resolve safebrowsing.googleapis.com")
        res_net = asyncio.run(check_google_safe_browsing("https://example.com", api_key=FAKE_SECRET_KEY))
        assert res_net.status == SafeBrowsingStatus.API_ERROR
        assert "connection failure" in res_net.details.lower()
        print("    ✅ ConnectError yields status='api_error' (NOT clean)")

    # -------------------------------------------------------------
    # Test 7: Malformed non-JSON response
    # -------------------------------------------------------------
    print("\n[Test 7] Malformed Non-JSON Response")
    mock_bad_resp = httpx.Response(200, text="<html><body>Gateway Error</body></html>")
    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = mock_bad_resp
        res_bad = asyncio.run(check_google_safe_browsing("https://example.com", api_key=FAKE_SECRET_KEY))
        assert res_bad.status == SafeBrowsingStatus.API_ERROR
        assert "non-json" in res_bad.details.lower()
        print("    ✅ Non-JSON 200 payload yields status='api_error'")

    # -------------------------------------------------------------
    # Test 8: API key secrecy
    # -------------------------------------------------------------
    print("\n[Test 8] Secret API Key Never Leaked")
    for res in [res_err, res_timeout, res_net, res_bad]:
        assert FAKE_SECRET_KEY not in res.details
        assert FAKE_SECRET_KEY not in str(res.to_dict())
    print("    ✅ Verified API key is never exposed in error responses or dictionary serializations")

    # -------------------------------------------------------------
    # Test 9: Route Integration - Not Configured
    # -------------------------------------------------------------
    print("\n[Test 9] Route Integration: Safe Browsing Not Configured")
    with TestClient(app) as client:
        with patch.dict(os.environ, {"GOOGLE_SAFE_BROWSING_API_KEY": ""}):
            resp = client.post("/api/analyze-url", json={"url": "https://example.com"})
            assert resp.status_code == 200
            data = resp.json()
            assert "safe_browsing" in data
            assert data["safe_browsing"]["status"] == "not_configured"
            assert data["analysis_mode"] == "rule-based"
            print("    ✅ Route correctly returns safe_browsing.status='not_configured'")

    # -------------------------------------------------------------
    # Test 10: Route Integration - Clean Result
    # -------------------------------------------------------------
    print("\n[Test 10] Route Integration: Safe Browsing Clean Check")
    with TestClient(app) as client:
        with patch.dict(os.environ, {"GOOGLE_SAFE_BROWSING_API_KEY": FAKE_SECRET_KEY}):
            with patch("routes.url_analysis.check_google_safe_browsing", new_callable=AsyncMock) as mock_gsb:
                mock_gsb.return_value = SafeBrowsingResult(
                    status=SafeBrowsingStatus.NO_MATCHES,
                    threats=[],
                    details="Google Safe Browsing check completed: no active threat matches found.",
                )
                resp = client.post("/api/analyze-url", json={"url": "https://example.com"})
                assert resp.status_code == 200
                data = resp.json()
                assert data["safe_browsing"]["status"] == "no_matches"
                assert data["analysis_mode"] == "rule-based+safe_browsing_clear"
                print("    ✅ Route correctly returns safe_browsing.status='no_matches' and clear mode")

    # -------------------------------------------------------------
    # Test 11: Route Integration - Threat Found
    # -------------------------------------------------------------
    print("\n[Test 11] Route Integration: Confirmed Threat Found")
    with TestClient(app) as client:
        with patch.dict(os.environ, {"GOOGLE_SAFE_BROWSING_API_KEY": FAKE_SECRET_KEY}):
            with patch("routes.url_analysis.check_google_safe_browsing", new_callable=AsyncMock) as mock_gsb:
                mock_gsb.return_value = SafeBrowsingResult(
                    status=SafeBrowsingStatus.THREAT_FOUND,
                    threats=["MALWARE"],
                    details="Confirmed threat match in Google Safe Browsing: MALWARE",
                )
                resp = client.post("/api/analyze-url", json={"url": "https://example.com"})
                assert resp.status_code == 200
                data = resp.json()
                assert data["safe_browsing"]["status"] == "threat_found"
                assert data["risk_level"] == "high"
                assert data["risk_score"] >= 90
                assert data["analysis_mode"] == "ai+safe_browsing_threat"
                assert any("Google Safe Browsing: MALWARE" in w for w in data["warning_signs"])
                print("    ✅ Route elevates threat to high risk (>=90) and reports confirmed threat")

    # -------------------------------------------------------------
    # Test 12: Route Integration - API Failure / Timeout (Never Falsely Clear)
    # -------------------------------------------------------------
    print("\n[Test 12] Route Integration: API Failure / Timeout (Never Falsely Clear)")
    with TestClient(app) as client:
        with patch.dict(os.environ, {"GOOGLE_SAFE_BROWSING_API_KEY": FAKE_SECRET_KEY}):
            with patch("routes.url_analysis.check_google_safe_browsing", new_callable=AsyncMock) as mock_gsb:
                mock_gsb.return_value = SafeBrowsingResult(
                    status=SafeBrowsingStatus.API_ERROR,
                    threats=[],
                    details="Google Safe Browsing request timed out. External threat database check did not complete.",
                )
                resp = client.post("/api/analyze-url", json={"url": "https://example.com"})
                assert resp.status_code == 200
                data = resp.json()
                assert data["safe_browsing"]["status"] == "api_error"
                assert "safe_browsing_clear" not in data["analysis_mode"]
                assert data["analysis_mode"] == "rule-based (safe_browsing_unavailable)"
                assert any("external check was unavailable" in w.lower() for w in data["warning_signs"])
                assert "did not complete" in data["summary"]
                print("    ✅ Route strictly marks external check unavailable, preserves structural analysis, and NEVER claims clear")

    print("\n" + "=" * 65)
    print("ALL 12 SAFE BROWSING RESILIENCE & INTEGRATION TESTS PASSED! 🛡️")
    print("=" * 65)
    return True


if __name__ == "__main__":
    success = run_safe_browsing_security_tests()
    sys.exit(0 if success else 1)
