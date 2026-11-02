import os
import sys
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from main import app
from database import SessionLocal, User, PasswordResetToken
from services.auth_service import get_password_hash
from services.mail_service import get_dev_latest_token

client = TestClient(app)

def run_password_reset_security_tests():
    print("=" * 60)
    print("TRUSTSHIELD AI - PASSWORD RESET SECURITY & AUTH TEST SUITE")
    print("=" * 60)

    db = SessionLocal()
    try:
        test_email = "victim_security_test@trustshield.ai"
        initial_pw = "InitialSecret123!"

        # Ensure clean test user
        user = db.query(User).filter(User.email == test_email).first()
        if user:
            db.delete(user)
            db.commit()

        user = User(
            email=test_email,
            hashed_password=get_password_hash(initial_pw),
            full_name="Security Test User",
            token_version=1,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # -------------------------------------------------------------
        # Test 1: Insecure endpoint is removed / rejected
        # -------------------------------------------------------------
        print("\n[Test 1] Insecure legacy reset endpoint rejected")
        insecure_resp = client.post(
            "/api/auth/reset-password",
            json={"email": test_email, "new_password": "HackedPassword123!"},
        )
        assert insecure_resp.status_code == 422, f"Expected 422 Unprocessable Entity, got {insecure_resp.status_code}"
        # Verify password in DB was NOT changed
        db.refresh(user)
        login_check = client.post(
            "/api/auth/login",
            json={"email": test_email, "password": initial_pw},
        )
        assert login_check.status_code == 200, "Password should not have been altered by insecure payload"
        print("    ✅ Insecure email-only reset payload strictly rejected (HTTP 422)")

        # -------------------------------------------------------------
        # Test 2: Generic response for existing user
        # -------------------------------------------------------------
        print("\n[Test 2] Generic response for existing user")
        resp_existing = client.post(
            "/api/auth/forgot-password",
            json={"email": test_email},
        )
        assert resp_existing.status_code == 200
        data_existing = resp_existing.json()
        assert data_existing.get("status") == "ok"
        expected_msg = "If an account matches that email address, instructions to reset your password have been sent."
        assert data_existing.get("message") == expected_msg
        print(f"    ✅ Generic message returned: '{data_existing.get('message')}'")

        # -------------------------------------------------------------
        # Test 3: Generic response for unknown user (User Enumeration Defense)
        # -------------------------------------------------------------
        print("\n[Test 3] User Enumeration Defense - Unknown Email")
        resp_unknown = client.post(
            "/api/auth/forgot-password",
            json={"email": "nonexistent_target_99999@trustshield.ai"},
        )
        assert resp_unknown.status_code == 200
        data_unknown = resp_unknown.json()
        assert data_unknown.get("status") == "ok"
        assert data_unknown.get("message") == expected_msg
        assert data_unknown == data_existing, "Response payload for unknown user must match existing user identically"
        print("    ✅ Unknown email yields identical HTTP 200 generic message without account leakage")

        # -------------------------------------------------------------
        # Test 4: Invalid token rejection
        # -------------------------------------------------------------
        print("\n[Test 4] Invalid token rejection")
        invalid_resp = client.post(
            "/api/auth/reset-password",
            json={"token": "completely_bogus_fake_token_1234567890", "new_password": "NewValidPass123!"},
        )
        assert invalid_resp.status_code == 400
        assert "invalid" in invalid_resp.json().get("detail", "").lower()
        print("    ✅ Non-existent token rejected with HTTP 400")

        # -------------------------------------------------------------
        # Test 5: Invalidation of prior tokens on new reset request
        # -------------------------------------------------------------
        print("\n[Test 5] Invalidation of prior outstanding tokens")
        # Request 1
        client.post("/api/auth/forgot-password", json={"email": test_email})
        token_1 = get_dev_latest_token(test_email)
        assert token_1 is not None

        # Request 2 (should invalidate token 1)
        client.post("/api/auth/forgot-password", json={"email": test_email})
        token_2 = get_dev_latest_token(test_email)
        assert token_2 is not None
        assert token_1 != token_2

        # Token 1 must now be rejected
        resp_token_1 = client.post(
            "/api/auth/reset-password",
            json={"token": token_1, "new_password": "NewPassword123!"},
        )
        assert resp_token_1.status_code == 400
        print("    ✅ Older outstanding reset token was successfully invalidated upon issuing new token")

        # -------------------------------------------------------------
        # Test 6: Expired token rejection
        # -------------------------------------------------------------
        print("\n[Test 6] Expired token rejection")
        # Find token 2 in DB and expire it manually
        import hashlib
        token_2_hash = hashlib.sha256(token_2.encode("utf-8")).hexdigest()
        db_token_2 = db.query(PasswordResetToken).filter(PasswordResetToken.token_hash == token_2_hash).first()
        assert db_token_2 is not None
        db_token_2.expires_at = datetime.utcnow() - timedelta(minutes=10)
        db.commit()

        expired_resp = client.post(
            "/api/auth/reset-password",
            json={"token": token_2, "new_password": "NewPassword123!"},
        )
        assert expired_resp.status_code == 400
        print("    ✅ Expired reset token rejected with HTTP 400")

        # -------------------------------------------------------------
        # Test 7: Successful password reset and token single-use enforcement
        # -------------------------------------------------------------
        print("\n[Test 7] Valid reset and single-use enforcement")
        # Generate fresh token
        client.post("/api/auth/forgot-password", json={"email": test_email})
        fresh_token = get_dev_latest_token(test_email)
        new_secret_pw = "UpdatedSecretPass456!"

        # First use -> Must succeed
        success_reset = client.post(
            "/api/auth/reset-password",
            json={"token": fresh_token, "new_password": new_secret_pw},
        )
        assert success_reset.status_code == 200
        print("    ✅ Valid password reset succeeded (HTTP 200)")

        # Verify login with new password succeeds
        login_new = client.post(
            "/api/auth/login",
            json={"email": test_email, "password": new_secret_pw},
        )
        assert login_new.status_code == 200
        print("    ✅ Authentication with updated password succeeded")

        # Verify login with old password fails
        login_old = client.post(
            "/api/auth/login",
            json={"email": test_email, "password": initial_pw},
        )
        assert login_old.status_code == 401
        print("    ✅ Authentication with old password rejected (HTTP 401)")

        # Reuse same token -> Must fail
        reuse_resp = client.post(
            "/api/auth/reset-password",
            json={"token": fresh_token, "new_password": "AnotherAttemptPass789!"},
        )
        assert reuse_resp.status_code == 400
        print("    ✅ Token reuse prevented: previously consumed token rejected (HTTP 400)")

        # -------------------------------------------------------------
        # Test 8: Invalidation of prior active sessions
        # -------------------------------------------------------------
        print("\n[Test 8] Invalidation of prior active sessions across devices")
        # 1. Log in to get active session 1
        sess1_resp = client.post(
            "/api/auth/login",
            json={"email": test_email, "password": new_secret_pw},
        )
        assert sess1_resp.status_code == 200
        token_session_1 = sess1_resp.json()["access_token"]

        # Verify session 1 works
        me_before = client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {token_session_1}"},
        )
        assert me_before.status_code == 200
        print("    ✅ Active session verified before reset (HTTP 200)")

        # 2. Perform another password reset
        client.post("/api/auth/forgot-password", json={"email": test_email})
        reset_token_session = get_dev_latest_token(test_email)
        final_pw = "FinalSecuredPassword789!"
        reset_resp = client.post(
            "/api/auth/reset-password",
            json={"token": reset_token_session, "new_password": final_pw},
        )
        assert reset_resp.status_code == 200

        # 3. Verify session 1 is now strictly rejected with HTTP 401
        me_after = client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {token_session_1}"},
        )
        assert me_after.status_code == 401
        assert "invalidated" in me_after.json().get("detail", "").lower() or "expired" in me_after.json().get("detail", "").lower()
        print("    ✅ Prior active session successfully invalidated upon password reset (HTTP 401)")

        # 4. New login after reset works
        sess2_resp = client.post(
            "/api/auth/login",
            json={"email": test_email, "password": final_pw},
        )
        assert sess2_resp.status_code == 200
        token_session_2 = sess2_resp.json()["access_token"]
        me_new = client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {token_session_2}"},
        )
        assert me_new.status_code == 200
        print("    ✅ New session authorized with updated credentials (HTTP 200)")

        print("\n" + "=" * 60)
        print("ALL PASSWORD RESET SECURITY TESTS PASSED SUCCESSFULLY! 🛡️")
        print("=" * 60)

    finally:
        db.close()

if __name__ == "__main__":
    run_password_reset_security_tests()

