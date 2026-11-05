import os
import sys
import json
from io import BytesIO
from PIL import Image
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from main import app
from database import init_db, SessionLocal, User
from services.auth_service import get_password_hash
from services.mail_service import get_dev_latest_token

def test_complete_platform_user_flows():
    print("=" * 65)
    print("🛡️  TRUSTSHIELD AI - END-TO-END FLOW VERIFICATION")
    print("=" * 65)

    with TestClient(app) as client:
        # 1. Health check
        print("[1] Health Check")
        h_resp = client.get("/api/health")
        assert h_resp.status_code == 200, f"Health check failed: {h_resp.text}"
        h_data = h_resp.json()
        assert h_data["status"] == "ok"
        print(f"    ✅ Backend Health: ok | AI: {h_data['ai_available']} | OCR: {h_data['ocr_available']}")

        # 2. Registration & Authentication
        print("\n[2] User Registration & Profile")
        test_email = "flow_user@trustshield.ai"
        db = SessionLocal()
        existing = db.query(User).filter(User.email == test_email).first()
        if existing:
            db.delete(existing)
            db.commit()
        db.close()

        reg_resp = client.post("/api/auth/register", json={
            "email": test_email,
            "password": "Password123!",
            "full_name": "Flow Test User",
        })
        assert reg_resp.status_code == 201, f"Registration failed: {reg_resp.text}"
        auth_data = reg_resp.json()
        token = auth_data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("    ✅ User registered successfully, JWT token acquired")

        # 3. Profile
        prof_resp = client.get("/api/auth/me", headers=headers)
        assert prof_resp.status_code == 200
        assert prof_resp.json()["email"] == test_email
        print(f"    ✅ Profile verified: {prof_resp.json()['full_name']}")

        # 4. Message Analysis
        print("\n[3] Scam Message Analysis")
        msg_resp = client.post("/api/analyze-message", json={
            "message": "URGENT: Your bank account is locked. Click here immediately to verify your OTP."
        }, headers=headers)
        assert msg_resp.status_code == 200
        msg_data = msg_resp.json()
        assert msg_data["risk_level"] in ("medium", "high")
        print(f"    ✅ Message analysis completed: Risk={msg_data['risk_level']}, Score={msg_data['risk_score']}")

        # 5. URL Safety Checker
        print("\n[4] URL Safety Checker")
        url_resp = client.post("/api/analyze-url", json={
            "url": "http://192.168.1.1/secure-login/paypal.php"
        }, headers=headers)
        assert url_resp.status_code == 200
        url_data = url_resp.json()
        assert "safe_browsing" in url_data
        print(f"    ✅ URL analyzed: Risk={url_data['risk_level']}, SafeBrowsing={url_data['safe_browsing']['status']}")

        # 6. Screenshot Upload & Validation
        print("\n[5] Screenshot Upload Analysis")
        img_buffer = BytesIO()
        img = Image.new("RGB", (200, 100), color=(255, 255, 255))
        img.save(img_buffer, format="PNG")
        img_bytes = img_buffer.getvalue()

        files = {"file": ("screenshot.png", img_bytes, "image/png")}
        # Empty text image will return 422 or valid OCR result
        ss_resp = client.post("/api/analyze-screenshot", files=files, headers=headers)
        # Should gracefully return 422 (no text extracted) or 200 if OCR read something, or 503 if OCR unavailable
        assert ss_resp.status_code in (200, 422, 503)
        print(f"    ✅ Screenshot upload handled safely (HTTP {ss_resp.status_code})")

        # 7. Fake News Verification
        print("\n[6] Fake News Verification")
        news_resp = client.post("/api/verify-news", json={
            "claim": "UNESCO has officially declared the Indian national anthem the best in the world."
        }, headers=headers)
        assert news_resp.status_code == 200
        news_data = news_resp.json()
        assert "status" in news_data
        assert "sources" in news_data
        print(f"    ✅ News verified: Status='{news_data['status']}', Mode='{news_data['analysis_mode']}'")

        # 8. AI Safety Assistant Chatbot
        print("\n[7] AI Safety Assistant Chatbot")
        chat_resp = client.post("/api/chat", json={
            "message": "What should I do if I clicked a suspicious link?"
        })
        assert chat_resp.status_code == 200
        chat_data = chat_resp.json()
        assert len(chat_data["reply"]) > 20
        print(f"    ✅ Chatbot responded: {chat_data['reply'][:60]}...")

        # 9. Scam Awareness Quiz
        print("\n[8] Scam Awareness Quiz Center")
        cat_resp = client.get("/api/quiz/categories")
        assert cat_resp.status_code == 200
        q_resp = client.get("/api/quiz/questions?category=all&difficulty=Beginner&limit=2")
        assert q_resp.status_code == 200
        questions = q_resp.json()
        assert len(questions) > 0

        sub_resp = client.post("/api/quiz/submit", json={
            "category": "all",
            "difficulty": "Beginner",
            "answers": [{"question_id": questions[0]["id"], "selected_answer": 0}]
        }, headers=headers)
        assert sub_resp.status_code == 200
        print(f"    ✅ Quiz evaluated: Score={sub_resp.json()['score']}/{sub_resp.json()['total_questions']}")

        # 10. Community Incident Reporting
        print("\n[9] Community Incident Reporting")
        report_form = {
            "category": "Phishing",
            "description": "Received suspicious SMS impersonating power department threatening disconnection.",
            "suspicious_url": "http://fake-power-bill.xyz/pay",
            "phone_number": "+919876543210",
        }
        rep_resp = client.post("/api/community/reports", data=report_form, headers=headers)
        assert rep_resp.status_code == 201
        report_data = rep_resp.json()
        report_id = report_data["id"]
        print(f"    ✅ Report filed: Ref ID={report_data['reference_id']}")

        # 11. Scam Alerts Center
        print("\n[10] Scam Alerts Center")
        alerts_resp = client.get("/api/alerts")
        assert alerts_resp.status_code == 200
        alerts_data = alerts_resp.json()
        assert alerts_data["total"] >= 1
        print(f"    ✅ Scam alerts fetched: Total={alerts_data['total']}")

        # 12. Scan History
        print("\n[11] Scan History")
        hist_resp = client.get("/api/history", headers=headers)
        assert hist_resp.status_code == 200
        history_items = hist_resp.json()
        assert len(history_items) >= 2
        print(f"    ✅ Scan history fetched: {len(history_items)} recorded scans")

        # 13. Password Reset Workflow
        print("\n[12] Two-Step Password Reset Flow")
        forgot_resp = client.post("/api/auth/forgot-password", json={"email": test_email})
        assert forgot_resp.status_code == 200
        raw_token = get_dev_latest_token(test_email)
        assert raw_token is not None, "Password reset token should be recorded in dev mailbox"

        reset_resp = client.post("/api/auth/reset-password", json={
            "token": raw_token,
            "new_password": "NewSecretPassword456!",
        })
        assert reset_resp.status_code == 200
        print("    ✅ Password successfully reset via single-use token")

        # Prior session token should now be invalidated
        old_auth_check = client.get("/api/auth/me", headers=headers)
        assert old_auth_check.status_code == 401
        print("    ✅ Prior session token strictly invalidated across devices")

        # 14. Email Sender & Header Checker Endpoint
        print("\n[13] Email Sender & Header Checker")
        email_resp = client.post("/api/analyze-email", json={
            "sender_email": "support@paypal.security-alert-center.top",
            "sender_display_name": "PayPal Customer Support",
            "reply_to_email": "fraud-reply@gmail.com",
            "subject": "Your account is suspended immediately",
            "headers_text": "Received-SPF: fail\nAuthentication-Results: mx.google.com; dkim=fail; dmarc=fail"
        })
        assert email_resp.status_code == 200
        email_data = email_resp.json()
        assert email_data["risk_level"] == "High"
        assert email_data["spoofing_suspected"] is True
        assert email_data["spf_status"]["status"] == "FAIL"
        print("    ✅ Email header & sender spoofing analysis verified (High Risk, SPF/DKIM/DMARC: FAIL)")

    print("\n" + "=" * 65)
    print("🎉 ALL PLATFORM USER FLOWS VERIFIED SUCCESSFULLY!")
    print("=" * 65)

if __name__ == "__main__":
    test_complete_platform_user_flows()
