import os
import sys

# Ensure backend directory is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from main import app
from database import SessionLocal, User, CommunityReport, ScamAlert, QuizQuestion
from services.auth_service import get_password_hash, create_access_token

def test_admin_features():
    db = SessionLocal()
    try:
        # Create normal test user
        normal_email = "regular_user@example.com"
        normal_user = db.query(User).filter(User.email == normal_email).first()
        if not normal_user:
            normal_user = User(
                email=normal_email,
                hashed_password=get_password_hash("password123"),
                full_name="Regular User",
                is_admin=False,
            )
            db.add(normal_user)
            db.commit()
            db.refresh(normal_user)
        else:
            normal_user.is_admin = False
            db.commit()

        # Create admin test user
        admin_email = "superadmin@trustshield.ai"
        admin_user = db.query(User).filter(User.email == admin_email).first()
        if not admin_user:
            admin_user = User(
                email=admin_email,
                hashed_password=get_password_hash("adminpassword123"),
                full_name="Super Admin",
                is_admin=True,
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
        else:
            admin_user.is_admin = True
            db.commit()

        normal_token = create_access_token({"sub": str(normal_user.id), "email": normal_user.email})
        admin_token = create_access_token({"sub": str(admin_user.id), "email": admin_user.email})

        with TestClient(app) as client:
            print("1. Testing unauthenticated access to /api/admin/analytics...")
            resp = client.get("/api/admin/analytics")
            assert resp.status_code == 401, f"Expected 401, got {resp.status_code}"
            print("   ✅ Unauthenticated access blocked (401)")

            print("2. Testing regular user access to /api/admin/analytics...")
            resp = client.get("/api/admin/analytics", headers={"Authorization": f"Bearer {normal_token}"})
            assert resp.status_code == 403, f"Expected 403 Forbidden, got {resp.status_code}"
            print("   ✅ Regular user blocked with 403 Forbidden")

            print("3. Testing admin user access to /api/admin/analytics...")
            resp = client.get("/api/admin/analytics", headers={"Authorization": f"Bearer {admin_token}"})
            assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
            data = resp.json()
            assert "stats" in data
            assert "scan_types_distribution" in data
            assert "risk_level_distribution" in data
            assert "activity_timeline" in data
            print(f"   ✅ Admin analytics returned real metrics: total_users={data['stats']['total_users']}")

            print("4. Testing admin user listing /api/admin/users...")
            resp = client.get("/api/admin/users", headers={"Authorization": f"Bearer {admin_token}"})
            assert resp.status_code == 200
            users = resp.json()
            assert len(users) >= 2
            print(f"   ✅ User management fetched {len(users)} users")

            print("5. Testing admin creating official scam alert /api/admin/alerts...")
            alert_payload = {
                "title": "Automated Test Digital Arrest Alert",
                "category": "Digital Arrest",
                "risk_level": "High",
                "description": "Scammers impersonating CBI over video call.",
                "how_it_works": "Victims are frightened into transferring funds.",
                "warning_signs": ["Demands for video call", "Threats of immediate arrest"],
                "prevention_tips": ["No legal agency operates like this", "Call 1930 immediately"],
                "source_name": "CERT-In Official Advisory",
                "source_url": "https://www.cert-in.org.in",
                "is_published": True,
            }
            resp = client.post("/api/admin/alerts", json=alert_payload, headers={"Authorization": f"Bearer {admin_token}"})
            assert resp.status_code == 201, f"Expected 201, got {resp.status_code}: {resp.text}"
            alert_id = resp.json()["id"]
            print(f"   ✅ Scam alert created with ID {alert_id}")

            print("6. Testing admin deleting the scam alert...")
            resp = client.delete(f"/api/admin/alerts/{alert_id}", headers={"Authorization": f"Bearer {admin_token}"})
            assert resp.status_code == 200
            print("   ✅ Alert successfully deleted")

            print("7. Testing admin creating quiz question /api/admin/quiz/questions...")
            q_payload = {
                "category": "Phishing",
                "difficulty": "Intermediate",
                "question": "What is the best way to verify an email from your bank?",
                "options": [
                    "Click the link inside the email",
                    "Open bank app independently or check official domain",
                    "Reply asking if it is real",
                    "Forward to friends",
                ],
                "correct_answer": 1,
                "explanation": "Always navigate to the bank's official app or website independently.",
            }
            resp = client.post("/api/admin/quiz/questions", json=q_payload, headers={"Authorization": f"Bearer {admin_token}"})
            assert resp.status_code == 201, f"Expected 201, got {resp.status_code}: {resp.text}"
            q_id = resp.json()["id"]
            print(f"   ✅ Quiz question created with ID {q_id}")

            print("8. Testing admin deleting the quiz question...")
            resp = client.delete(f"/api/admin/quiz/questions/{q_id}", headers={"Authorization": f"Bearer {admin_token}"})
            assert resp.status_code == 200
            print("   ✅ Quiz question successfully deleted")

            print("\n🎉 ALL FEATURE 3 (ADMIN DASHBOARD) TESTS PASSED SUCCESSFULLY!")
    finally:
        db.close()

if __name__ == "__main__":
    test_admin_features()

