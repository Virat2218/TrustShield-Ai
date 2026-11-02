import os
import sys
import secrets
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Set test environment flag
os.environ["TESTING"] = "true"

import jwt
from fastapi.testclient import TestClient
from main import app
from database import SessionLocal, User
from services.auth_service import (
    validate_jwt_secret,
    create_access_token,
    decode_access_token,
    set_test_jwt_secret,
    get_password_hash,
    ALGORITHM,
)

client = TestClient(app)

def run_jwt_security_tests():
    print("=" * 60)
    print("TRUSTSHIELD AI - JWT SECRET & AUTHENTICATION INTEGRITY TESTS")
    print("=" * 60)

    # -------------------------------------------------------------
    # Test 1: Missing JWT secret fails validation
    # -------------------------------------------------------------
    print("\n[Test 1] Missing JWT_SECRET_KEY is rejected")
    try:
        validate_jwt_secret(secret="", enforce_non_test=True)
        assert False, "Should have raised RuntimeError for empty secret"
    except RuntimeError as e:
        assert "not set" in str(e).lower() or "missing" in str(e).lower()
        print("    ✅ Empty/missing JWT_SECRET_KEY correctly raises RuntimeError")

    # -------------------------------------------------------------
    # Test 2: Too short JWT secret (< 32 chars) fails validation
    # -------------------------------------------------------------
    print("\n[Test 2] Short JWT_SECRET_KEY (< 32 chars) is rejected")
    try:
        validate_jwt_secret(secret="too_short_key_12345", enforce_non_test=True)
        assert False, "Should have raised RuntimeError for short secret"
    except RuntimeError as e:
        assert "too short" in str(e).lower()
        print("    ✅ Short JWT secret (19 chars) correctly raises RuntimeError")

    # -------------------------------------------------------------
    # Test 3: Known placeholder / example secret fails validation
    # -------------------------------------------------------------
    print("\n[Test 3] Known placeholder secrets are rejected")
    placeholders = [
        "trustshield-ai-secure-jwt-secret-key-phase2-2026",
        "trustshield-ai-super-secret-jwt-key-change-in-production-2026",
        "some-random-key-change-in-production-now",
        "your-secret-key-that-is-long-enough-32-chars",
    ]
    for ph in placeholders:
        try:
            validate_jwt_secret(secret=ph, enforce_non_test=True)
            assert False, f"Placeholder '{ph}' should have been rejected"
        except RuntimeError as e:
            assert "placeholder" in str(e).lower() or "insecure default" in str(e).lower()
    print("    ✅ Insecure placeholder secrets correctly raise RuntimeError")

    # -------------------------------------------------------------
    # Test 4: Strong, random secret passes validation
    # -------------------------------------------------------------
    print("\n[Test 4] Strong 256-bit cryptographically secure key accepted")
    strong_key = secrets.token_urlsafe(32)
    assert len(strong_key) >= 32
    valid_key = validate_jwt_secret(secret=strong_key, enforce_non_test=True)
    assert valid_key == strong_key
    print(f"    ✅ Strong key ({len(strong_key)} chars) validated successfully")

    # -------------------------------------------------------------
    # Test 5: Tokens signed with a different key are strictly rejected
    # -------------------------------------------------------------
    print("\n[Test 5] Token forged with different / attacker secret is rejected")
    legit_key = secrets.token_urlsafe(32)
    attacker_key = secrets.token_urlsafe(32)

    set_test_jwt_secret(legit_key)

    # Attacker crafts a token with a different secret
    forged_payload = {
        "sub": "1",
        "email": "victim@trustshield.ai",
        "token_version": 1,
        "exp": datetime.utcnow() + timedelta(hours=1),
    }
    forged_token = jwt.encode(forged_payload, attacker_key, algorithm=ALGORITHM)

    # Server decoding with legit_key must return None
    decoded = decode_access_token(forged_token)
    assert decoded is None, "Forged token with wrong signature should not decode"

    # API request with forged token must be rejected with 401
    resp = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {forged_token}"},
    )
    assert resp.status_code == 401, f"Expected 401 Unauthorized, got {resp.status_code}"
    print("    ✅ Forged token signed with different key rejected with HTTP 401")

    # -------------------------------------------------------------
    # Test 6: Expired token is strictly rejected
    # -------------------------------------------------------------
    print("\n[Test 6] Expired token is rejected")
    expired_payload = {
        "sub": "1",
        "email": "victim@trustshield.ai",
        "token_version": 1,
        "exp": datetime.utcnow() - timedelta(minutes=10),
    }
    expired_token = jwt.encode(expired_payload, legit_key, algorithm=ALGORITHM)

    decoded_expired = decode_access_token(expired_token)
    assert decoded_expired is None, "Expired token should not decode"

    resp_exp = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {expired_token}"},
    )
    assert resp_exp.status_code == 401
    print("    ✅ Expired token rejected with HTTP 401")

    # -------------------------------------------------------------
    # Test 7: Token missing 'sub' claim is rejected
    # -------------------------------------------------------------
    print("\n[Test 7] Token without 'sub' claim is rejected")
    nosub_payload = {
        "email": "victim@trustshield.ai",
        "exp": datetime.utcnow() + timedelta(hours=1),
    }
    nosub_token = jwt.encode(nosub_payload, legit_key, algorithm=ALGORITHM)
    resp_nosub = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {nosub_token}"},
    )
    assert resp_nosub.status_code == 401
    print("    ✅ Token missing 'sub' claim rejected with HTTP 401")

    # -------------------------------------------------------------
    # Test 8: Valid token signed with correct key is accepted
    # -------------------------------------------------------------
    print("\n[Test 8] Valid token signed with correct key succeeds")
    db = SessionLocal()
    try:
        user_email = "jwt_valid_test@trustshield.ai"
        user = db.query(User).filter(User.email == user_email).first()
        if not user:
            user = User(
                email=user_email,
                hashed_password=get_password_hash("ValidPass123!"),
                full_name="JWT Tester",
                token_version=1,
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        legit_token = create_access_token(
            data={"sub": str(user.id), "email": user.email, "token_version": user.token_version}
        )
        resp_valid = client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {legit_token}"},
        )
        assert resp_valid.status_code == 200
        user_profile = resp_valid.json()
        assert user_profile["email"] == user_email
        print("    ✅ Valid token authorized successfully (HTTP 200)")

        # -------------------------------------------------------------
        # Test 9: JWT secrets are not leaked in endpoints
        # -------------------------------------------------------------
        print("\n[Test 9] Secrets are never leaked in API endpoints")
        health_resp = client.get("/api/health")
        assert health_resp.status_code == 200
        health_text = health_resp.text
        assert legit_key not in health_text
        assert "JWT_SECRET_KEY" not in health_text

        profile_text = resp_valid.text
        assert legit_key not in profile_text
        assert "JWT_SECRET_KEY" not in profile_text
        print("    ✅ Endpoints do not leak secret key in responses")

    finally:
        db.close()
        # Reset test secret
        set_test_jwt_secret(None)

    print("\n" + "=" * 60)
    print("ALL JWT SECRET & INTEGRITY TESTS PASSED! 🛡️")
    print("=" * 60)

if __name__ == "__main__":
    run_jwt_security_tests()
