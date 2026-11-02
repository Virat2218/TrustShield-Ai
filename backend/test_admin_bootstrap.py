"""
TrustShield AI - First-Admin Bootstrap & Authorization Test Suite

Tests:
1. Invalid account selection (non-existent user rejected).
2. Initial first-admin bootstrap (promotes user, sets is_admin=True, records audit log).
3. Repeated bootstrap attempts are safe and idempotent (no demotion, no error).
4. Refusal when an administrator already exists (second user cannot be bootstrapped).
5. Ordinary-user privilege boundaries (regular user gets 403 on all admin endpoints).
6. Unauthenticated access blocked (401 Unauthorized on admin endpoints).
7. Ordinary signup privilege boundaries (registration endpoint ignores any is_admin attempt).
8. Authorized administrative promotion (bootstrapped admin can elevate other users).
9. Protection against revoking the last remaining administrator (returns HTTP 400).
10. CLI execution via subprocess (--check, --email, exit codes 0 and 1).

Run:
    cd backend && ./venv/bin/python3 test_admin_bootstrap.py
"""

import os
import sys
import subprocess
from datetime import datetime

# Bootstrap path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Use an isolated test database
TEST_DB_NAME = "test_admin_bootstrap.db"
os.environ["DATABASE_URL"] = f"sqlite:///./{TEST_DB_NAME}"

# Configure test JWT secret
from services.auth_service import set_test_jwt_secret
set_test_jwt_secret("test-admin-bootstrap-jwt-secret-key-32")

from fastapi.testclient import TestClient
from main import app
from database import Base, engine, SessionLocal, User, AdminAuditLog
from bootstrap_admin import bootstrap_initial_admin, check_admin_status
from services.auth_service import get_password_hash, create_access_token


def _reset_db():
    """Drops and recreates all tables in the isolated test database."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def _cleanup_db():
    """Removes the test database file."""
    db_file = os.path.join(os.path.dirname(__file__), TEST_DB_NAME)
    if os.path.exists(db_file):
        try:
            os.remove(db_file)
        except Exception:
            pass


def _create_user(db, email: str, full_name: str = "Test User", password: str = "Password123!") -> User:
    user = User(
        email=email.strip().lower(),
        hashed_password=get_password_hash(password),
        full_name=full_name,
        is_admin=False,
        token_version=1,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def run_admin_bootstrap_tests():
    print("=" * 65)
    print("TRUSTSHIELD AI - FIRST-ADMIN BOOTSTRAP TEST SUITE")
    print("=" * 65)

    _reset_db()
    db = SessionLocal()

    try:
        # -------------------------------------------------------------
        # Test 1: Invalid account selection
        # -------------------------------------------------------------
        print("\n[Test 1] Invalid account selection")
        res_nonexistent = bootstrap_initial_admin("nonexistent@example.com", db=db)
        assert res_nonexistent["success"] is False
        assert res_nonexistent["status"] == "user_not_found"
        assert "does not exist" in res_nonexistent["message"]

        res_empty = bootstrap_initial_admin("", db=db)
        assert res_empty["success"] is False
        assert res_empty["status"] == "invalid_email"
        print("    ✅ Non-existent and empty emails correctly rejected")

        # -------------------------------------------------------------
        # Test 2: Initial first-admin creation
        # -------------------------------------------------------------
        print("\n[Test 2] First-admin creation when zero admins exist")
        status_before = check_admin_status(db=db)
        assert status_before["has_admin"] is False
        assert status_before["admin_count"] == 0

        # Create first registered user
        user1 = _create_user(db, "first_admin@trustshield.ai", "First Admin")
        assert user1.is_admin is False

        # Run bootstrap promotion
        res_bootstrap = bootstrap_initial_admin(user1.email, db=db)
        assert res_bootstrap["success"] is True
        assert res_bootstrap["status"] == "promoted"
        assert res_bootstrap["audit_id"] is not None
        print(f"    ✅ Bootstrap succeeded: {res_bootstrap['message']}")

        # Verify database state
        db.refresh(user1)
        assert user1.is_admin is True

        # Verify audit log entry
        audit_entry = db.query(AdminAuditLog).filter(AdminAuditLog.id == res_bootstrap["audit_id"]).first()
        assert audit_entry is not None
        assert audit_entry.admin_user_id == user1.id
        assert audit_entry.action == "BOOTSTRAP_FIRST_ADMIN"
        assert audit_entry.resource_type == "USER"
        assert audit_entry.resource_id == str(user1.id)
        assert user1.email in audit_entry.details
        print(f"    ✅ Audit log recorded: action={audit_entry.action}, user_id={audit_entry.admin_user_id}")

        # Verify check_admin_status
        status_after = check_admin_status(db=db)
        assert status_after["has_admin"] is True
        assert status_after["admin_count"] == 1
        assert status_after["admins"][0]["email"] == user1.email
        print("    ✅ check_admin_status reports 1 active administrator")

        # -------------------------------------------------------------
        # Test 3: Safe idempotence on repeated bootstrap
        # -------------------------------------------------------------
        print("\n[Test 3] Repeated bootstrap attempts for existing admin (safe idempotence)")
        res_repeat = bootstrap_initial_admin(user1.email, db=db)
        assert res_repeat["success"] is True
        assert res_repeat["status"] == "already_admin"
        assert "already an administrator" in res_repeat["message"]

        db.refresh(user1)
        assert user1.is_admin is True, "Admin must not be demoted or altered"
        print("    ✅ Re-running bootstrap on existing admin is a harmless no-op")

        # -------------------------------------------------------------
        # Test 4: Refusal when an administrator already exists
        # -------------------------------------------------------------
        print("\n[Test 4] Refusal when an administrator already exists")
        user2 = _create_user(db, "second_user@trustshield.ai", "Second User")
        assert user2.is_admin is False

        res_refusal = bootstrap_initial_admin(user2.email, db=db)
        assert res_refusal["success"] is False
        assert res_refusal["status"] == "admin_exists"
        assert "Bootstrap Refused" in res_refusal["message"]
        assert user1.email in res_refusal["message"]

        # Ensure user2 was NOT promoted
        db.refresh(user2)
        assert user2.is_admin is False
        # Ensure user1 was NOT modified
        db.refresh(user1)
        assert user1.is_admin is True
        print("    ✅ Bootstrap correctly refused promotion: existing admin cannot be bypassed")

        # -------------------------------------------------------------
        # Test 5 & 6: Ordinary-user and unauthenticated boundaries
        # -------------------------------------------------------------
        print("\n[Test 5] Ordinary-user privilege boundaries (403 Forbidden)")
        with TestClient(app) as client:
            user2_token = create_access_token({"sub": str(user2.id), "email": user2.email, "token_version": 1})
            admin1_token = create_access_token({"sub": str(user1.id), "email": user1.email, "token_version": 1})

            # Ordinary user cannot access admin analytics
            resp_ana = client.get("/api/admin/analytics", headers={"Authorization": f"Bearer {user2_token}"})
            assert resp_ana.status_code == 403
            assert "Administrative privileges required" in resp_ana.text

            # Ordinary user cannot list users
            resp_users = client.get("/api/admin/users", headers={"Authorization": f"Bearer {user2_token}"})
            assert resp_users.status_code == 403

            # Ordinary user cannot promote themselves or anyone else
            resp_promote = client.patch(
                f"/api/admin/users/{user2.id}",
                json={"is_admin": True},
                headers={"Authorization": f"Bearer {user2_token}"},
            )
            assert resp_promote.status_code == 403
            print("    ✅ Regular user strictly blocked with 403 on all admin endpoints")

            print("\n[Test 6] Unauthenticated access boundaries (401 Unauthorized)")
            resp_unauth = client.get("/api/admin/analytics")
            assert resp_unauth.status_code == 401
            print("    ✅ Unauthenticated request blocked with 401 Unauthorized")

            # -------------------------------------------------------------
            # Test 7: Ordinary signup cannot set is_admin
            # -------------------------------------------------------------
            print("\n[Test 7] Ordinary signup cannot choose is_admin")
            resp_signup = client.post(
                "/api/auth/register",
                json={
                    "email": "attacker@example.com",
                    "password": "Password123!",
                    "full_name": "Attacker",
                    "is_admin": True,  # Attacker attempts privilege escalation
                },
            )
            assert resp_signup.status_code == 201
            signup_data = resp_signup.json()
            assert signup_data["user"]["is_admin"] is False

            created_user = db.query(User).filter(User.email == "attacker@example.com").first()
            assert created_user is not None
            assert created_user.is_admin is False
            print("    ✅ Ordinary registration ignores is_admin: account created as standard user")

            # -------------------------------------------------------------
            # Test 8: Authorized promotion by bootstrapped admin
            # -------------------------------------------------------------
            print("\n[Test 8] Authorized promotion by existing administrator")
            resp_auth_promote = client.patch(
                f"/api/admin/users/{user2.id}",
                json={"is_admin": True},
                headers={"Authorization": f"Bearer {admin1_token}"},
            )
            assert resp_auth_promote.status_code == 200
            db.refresh(user2)
            assert user2.is_admin is True

            # user2 can now access admin analytics
            resp_user2_admin = client.get("/api/admin/analytics", headers={"Authorization": f"Bearer {user2_token}"})
            assert resp_user2_admin.status_code == 200
            print("    ✅ Bootstrapped admin successfully authorized elevation of second administrator")

            # -------------------------------------------------------------
            # Test 9: Protection against revoking the last remaining administrator
            # -------------------------------------------------------------
            print("\n[Test 9] Protection against revoking the last administrator")
            # Demote user2 first (now 1 admin remains: user1)
            resp_demote_user2 = client.patch(
                f"/api/admin/users/{user2.id}",
                json={"is_admin": False},
                headers={"Authorization": f"Bearer {admin1_token}"},
            )
            assert resp_demote_user2.status_code == 200
            db.refresh(user2)
            assert user2.is_admin is False

            # Now try to demote user1 (the last admin)
            resp_demote_last = client.patch(
                f"/api/admin/users/{user1.id}",
                json={"is_admin": False},
                headers={"Authorization": f"Bearer {admin1_token}"},
            )
            assert resp_demote_last.status_code == 400
            assert "Cannot revoke administrator privileges from the last active administrator" in resp_demote_last.text
            db.refresh(user1)
            assert user1.is_admin is True
            print("    ✅ Revoking the last remaining administrator rejected with HTTP 400")

        # -------------------------------------------------------------
        # Test 10: CLI execution via subprocess
        # -------------------------------------------------------------
        print("\n[Test 10] CLI execution via subprocess")
        python_bin = sys.executable
        script_path = os.path.join(os.path.dirname(__file__), "bootstrap_admin.py")
        env = os.environ.copy()
        env["DATABASE_URL"] = str(engine.url)

        # 10a: --check
        res_cli_check = subprocess.run(
            [python_bin, script_path, "--check"],
            capture_output=True,
            text=True,
            env=env,
        )
        assert res_cli_check.returncode == 0
        assert "1 active administrator" in res_cli_check.stdout

        # 10b: refusal on existing admin via CLI
        res_cli_refuse = subprocess.run(
            [python_bin, script_path, "--email", "second_user@trustshield.ai"],
            capture_output=True,
            text=True,
            env=env,
        )
        assert res_cli_refuse.returncode == 1
        assert "Bootstrap Refused" in res_cli_refuse.stderr

        # 10c: non-existent email via CLI
        res_cli_missing = subprocess.run(
            [python_bin, script_path, "--email", "ghost@example.com"],
            capture_output=True,
            text=True,
            env=env,
        )
        assert res_cli_missing.returncode == 1
        assert "does not exist" in res_cli_missing.stderr

        # 10d: idempotent check for current admin via CLI
        res_cli_same = subprocess.run(
            [python_bin, script_path, "--email", "first_admin@trustshield.ai"],
            capture_output=True,
            text=True,
            env=env,
        )
        assert res_cli_same.returncode == 0
        assert "already an administrator" in res_cli_same.stdout
        print("    ✅ CLI subprocess execution verified (--check, refusal, missing, idempotent)")

        print("\n" + "=" * 65)
        print("ALL 10 ADMIN BOOTSTRAP & AUTHORIZATION TESTS PASSED! 🛡️")
        print("=" * 65)
        return True

    finally:
        db.close()
        _cleanup_db()


if __name__ == "__main__":
    success = run_admin_bootstrap_tests()
    sys.exit(0 if success else 1)
