import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from main import app
from database import SessionLocal, User, ScanRecord, CommunityReport, ScamAlert, QuizQuestion
from services.auth_service import get_password_hash, create_access_token

def run_comprehensive_suite():
    print("=" * 60)
    print("TRUSTSHIELD AI - COMPREHENSIVE END-TO-END TEST SUITE")
    print("=" * 60)

    db = SessionLocal()
    try:
        # Setup admin and regular user
        admin_email = "admin_suite@trustshield.ai"
        admin = db.query(User).filter(User.email == admin_email).first()
        if not admin:
            admin = User(
                email=admin_email,
                hashed_password=get_password_hash("AdminPass123!"),
                full_name="Suite Admin",
                is_admin=True,
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
        else:
            admin.is_admin = True
            db.commit()

        user_email = "citizen_suite@trustshield.ai"
        user = db.query(User).filter(User.email == user_email).first()
        if not user:
            user = User(
                email=user_email,
                hashed_password=get_password_hash("CitizenPass123!"),
                full_name="Suite Citizen",
                is_admin=False,
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        admin_token = create_access_token({"sub": str(admin.id), "email": admin.email})
        user_token = create_access_token({"sub": str(user.id), "email": user.email})

        with TestClient(app) as client:
            # 1. Health check
            print("\n[1] Health Check")
            res = client.get("/api/health")
            assert res.status_code == 200
            print("    ✅ Backend health is OK")

            # 2. Phase 1: Message Analysis
            print("\n[2] Phase 1 - Scam Message Analysis")
            res = client.post("/api/analyze-message", json={"message": "Urgent: Your bank account is locked! Click http://secure-bank-login.xyz to verify your OTP immediately!"})
            assert res.status_code == 200
            data = res.json()
            assert data["risk_level"].lower() in ["high", "medium"]
            print(f"    ✅ Message analyzed: Risk={data['risk_level']}, Score={data['risk_score']}")

            # 3. Phase 1: URL Analysis
            print("\n[3] Phase 1 - URL Safety Checker")
            res = client.post("/api/analyze-url", json={"url": "http://192.168.1.1/login.php?update=true"})
            assert res.status_code == 200
            data = res.json()
            assert "risk_score" in data
            print(f"    ✅ URL analyzed: Risk={data['risk_level']}, Score={data['risk_score']}")

            # 4. Phase 2: News Verification
            print("\n[4] Phase 2 - Fake News Verification")
            res = client.post("/api/verify-news", json={"claim": "WHO announced that lemon juice cures cancer in 48 hours."})
            assert res.status_code == 200
            data = res.json()
            assert "status" in data
            print(f"    ✅ News verified: Status='{data['status']}', Confidence={data['confidence_level']}%")

            # 5. Phase 2: Chatbot Assistant
            print("\n[5] Phase 2 - AI Safety Assistant Chatbot")
            res = client.post("/api/chat", json={"message": "Someone called asking for my electricity bill payment on a private phone number. Is it a scam?"})
            assert res.status_code == 200
            data = res.json()
            assert len(data["reply"]) > 20
            print(f"    ✅ Safety Chatbot replied: '{data['reply'][:60]}...'")

            # 6. Phase 3 - Feature 1: Scam Awareness Quiz
            print("\n[6] Phase 3 - Feature 1: Scam Awareness Quiz")
            res = client.get("/api/quiz/categories")
            assert res.status_code == 200
            cats_resp = res.json()
            cats = cats_resp["categories"]
            assert len(cats) >= 7

            res = client.get("/api/quiz/questions?category=Phishing&difficulty=Beginner&limit=3")
            assert res.status_code == 200
            q_data = res.json()
            assert len(q_data) > 0
            # Ensure correct answer is not leaked in question list
            for q in q_data:
                assert "correct_answer" not in q
                assert "explanation" not in q

            first_q = q_data[0]
            sub_res = client.post(
                "/api/quiz/submit",
                json={
                    "category": "Phishing",
                    "difficulty": "Beginner",
                    "answers": [{"question_id": first_q["id"], "selected_answer": 0}],
                },
                headers={"Authorization": f"Bearer {user_token}"},
            )
            assert sub_res.status_code == 200
            sub_data = sub_res.json()
            assert "score" in sub_data
            assert "percentage" in sub_data
            assert "results" in sub_data
            print(f"    ✅ Quiz evaluated: Score={sub_data['score']}/{sub_data['total_questions']}, {sub_data['percentage']}%")

            # 7. Phase 3 - Feature 2: Community Scam Reporting
            print("\n[7] Phase 3 - Feature 2: Community Scam Reporting")
            rep_res = client.post(
                "/api/community/reports",
                data={
                    "category": "Digital Arrest",
                    "suspicious_url": "https://fake-cbi-portal.xyz",
                    "phone_number": "+91 9876543210",
                    "message": "You are under digital arrest. Call Skype CBI office.",
                    "description": "Received video call from fake police demanding Rs. 50,000.",
                    "incident_date": "2026-11-02",
                },
                headers={"Authorization": f"Bearer {user_token}"},
            )
            assert rep_res.status_code == 201
            rep_data = rep_res.json()
            ref_id = rep_data["reference_id"]
            report_db_id = rep_data["id"]
            assert ref_id.startswith("TSA-REP-")
            print(f"    ✅ Community report filed: Ref ID={ref_id}")

            # 8. Phase 3 - Feature 3: Admin Dashboard & Moderation
            print("\n[8] Phase 3 - Feature 3: Admin Dashboard & Moderation")
            # Unprivileged attempt
            unauth = client.get("/api/admin/analytics", headers={"Authorization": f"Bearer {user_token}"})
            assert unauth.status_code == 403, "Regular user should get 403 on admin routes"

            # Admin analytics
            admin_res = client.get("/api/admin/analytics", headers={"Authorization": f"Bearer {admin_token}"})
            assert admin_res.status_code == 200
            analytics = admin_res.json()
            assert analytics["stats"]["total_reports"] >= 1
            print(f"    ✅ Admin analytics computed: Total Reports={analytics['stats']['total_reports']}")

            # Moderate the report
            mod_res = client.patch(
                f"/api/admin/reports/{report_db_id}",
                json={"status": "Verified", "moderation_notes": "Confirmed extortion ring; forwarded to 1930."},
                headers={"Authorization": f"Bearer {admin_token}"},
            )
            assert mod_res.status_code == 200
            print(f"    ✅ Admin successfully moderated report {ref_id} to 'Verified'")

            # 9. Phase 3 - Feature 4: Scam Alerts Center
            print("\n[9] Phase 3 - Feature 4: Scam Alerts Center")
            alert_res = client.get("/api/alerts")
            assert alert_res.status_code == 200
            alerts = alert_res.json()
            assert alerts["total"] >= 7
            first_alert = alerts["items"][0]
            print(f"    ✅ Scam Alerts fetched: Total={alerts['total']}, Sample='{first_alert['title']}'")

            detail_res = client.get(f"/api/alerts/{first_alert['id']}")
            assert detail_res.status_code == 200
            detail = detail_res.json()
            assert len(detail["warning_signs"]) > 0
            assert len(detail["prevention_tips"]) > 0
            print(f"    ✅ Alert detail verified with {len(detail['warning_signs'])} warning signs")

            print("\n" + "=" * 60)
            print("ALL PHASE 1, PHASE 2, AND PHASE 3 TESTS COMPLETED SUCCESSFULLY!")
            print("=" * 60)
    finally:
        db.close()

if __name__ == "__main__":
    run_comprehensive_suite()
