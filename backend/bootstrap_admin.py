#!/usr/bin/env python3
"""
TrustShield AI - First-Admin Bootstrap Utility

Provides a safe, documented one-time bootstrap mechanism to designate the initial
system administrator.

Security guarantees:
1. One-Time Operation: Promotes an existing user ONLY when zero active administrators exist.
2. Refusal on Existing Admin: If any administrator already exists, further promotions via
   this script are strictly blocked. Subsequent promotions must be authorized by an existing
   administrator via the Admin Dashboard or authorized PATCH /api/admin/users/{id} API.
3. Safe Idempotence: Repeated bootstrap attempts for an existing administrator are harmless
   no-ops and will not demote, duplicate, or alter privileges.
4. Non-Destructive: Never demotes or replaces any existing administrator.
5. Audit Trail: All bootstrap actions are recorded in the admin_audit_logs table.
6. User Verification: Validates that the target account exists prior to elevation.

Usage:
    # From the backend directory:
    python bootstrap_admin.py --email admin@example.com
    python bootstrap_admin.py admin@example.com
    python bootstrap_admin.py --check
"""

import sys
import os
import argparse
from typing import Optional, Dict, Any, List
from datetime import datetime

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from database import init_db, SessionLocal, User, AdminAuditLog


def get_existing_admins(db: Any) -> List[User]:
    """Returns a list of all active administrators in the database."""
    return db.query(User).filter(User.is_admin == True).all()


def check_admin_status(db: Optional[Any] = None) -> Dict[str, Any]:
    """
    Inspects and reports current administrator accounts in the system.
    """
    owns_session = db is None
    session = SessionLocal() if owns_session else db
    try:
        admins = get_existing_admins(session)
        return {
            "has_admin": len(admins) > 0,
            "admin_count": len(admins),
            "admins": [
                {
                    "id": a.id,
                    "email": a.email,
                    "full_name": a.full_name,
                    "created_at": a.created_at.isoformat() if a.created_at else None,
                }
                for a in admins
            ],
        }
    finally:
        if owns_session:
            session.close()


def bootstrap_initial_admin(email: str, db: Optional[Any] = None) -> Dict[str, Any]:
    """
    Safely promotes an existing account to administrator status ONLY if no administrators exist.

    Returns a dict with:
        - success (bool): True if newly promoted or already an admin, False on failure/refusal.
        - status (str): 'promoted', 'already_admin', 'user_not_found', 'admin_exists', 'invalid_email'.
        - message (str): Human-readable explanation.
        - user (Optional[User]): Target user instance if found.
        - audit_id (Optional[int]): ID of the audit log record if newly promoted.
    """
    if not email or not isinstance(email, str) or not email.strip():
        return {
            "success": False,
            "status": "invalid_email",
            "message": "Error: A valid email address is required.",
            "user": None,
            "audit_id": None,
        }

    normalized_email = email.strip().lower()

    owns_session = db is None
    session = SessionLocal() if owns_session else db
    try:
        # 1. Verify target account exists
        target_user = session.query(User).filter(User.email == normalized_email).first()
        if not target_user:
            return {
                "success": False,
                "status": "user_not_found",
                "message": (
                    f"Account with email '{normalized_email}' does not exist. "
                    "Please register an account first via the TrustShield AI web UI or API, "
                    "then rerun this command."
                ),
                "user": None,
                "audit_id": None,
            }

        # 2. Check for existing administrators
        existing_admins = get_existing_admins(session)

        # 3. Idempotent check: Target user is ALREADY an administrator
        if target_user.is_admin:
            return {
                "success": True,
                "status": "already_admin",
                "message": (
                    f"Account '{normalized_email}' (User ID: {target_user.id}) is already an administrator. "
                    "No changes were made."
                ),
                "user": target_user,
                "audit_id": None,
            }

        # 4. Refusal check: Another administrator already exists in the system
        if len(existing_admins) > 0:
            admin_emails = ", ".join(a.email for a in existing_admins)
            return {
                "success": False,
                "status": "admin_exists",
                "message": (
                    f"Bootstrap Refused: {len(existing_admins)} administrator account(s) already exist ({admin_emails}). "
                    "Initial bootstrap is only permitted during initial setup when zero administrators exist. "
                    "To promote additional users, sign in as an existing administrator and use the "
                    "Admin Dashboard (/admin) or the authorized PATCH /api/admin/users/{user_id} endpoint."
                ),
                "user": target_user,
                "audit_id": None,
            }

        # 5. Safe promotion: Zero administrators currently exist
        target_user.is_admin = True

        # 6. Audit Trail record
        audit = AdminAuditLog(
            admin_user_id=target_user.id,
            action="BOOTSTRAP_FIRST_ADMIN",
            resource_type="USER",
            resource_id=str(target_user.id),
            details=(
                f"Initial system admin bootstrap: promoted '{target_user.email}' "
                f"(ID: {target_user.id}, Name: {target_user.full_name or 'N/A'}) "
                "as the initial administrator."
            ),
            created_at=datetime.utcnow(),
        )
        session.add(audit)
        session.commit()
        session.refresh(target_user)
        session.refresh(audit)

        return {
            "success": True,
            "status": "promoted",
            "message": (
                f"Success: User '{target_user.email}' (ID: {target_user.id}) has been successfully "
                "promoted as the initial TrustShield AI administrator."
            ),
            "user": target_user,
            "audit_id": audit.id,
        }
    finally:
        if owns_session:
            session.close()


def main():
    parser = argparse.ArgumentParser(
        description="TrustShield AI First-Admin Bootstrap Tool",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=(
            "Examples:\n"
            "  python bootstrap_admin.py --email admin@trustshield.ai\n"
            "  python bootstrap_admin.py admin@trustshield.ai\n"
            "  python bootstrap_admin.py --check\n"
        ),
    )
    parser.add_argument(
        "positional_email",
        nargs="?",
        help="Email address of the existing registered user to elevate as administrator.",
    )
    parser.add_argument(
        "--email",
        "-e",
        dest="flag_email",
        help="Email address of the existing registered user to elevate as administrator.",
    )
    parser.add_argument(
        "--check",
        "-c",
        action="store_true",
        help="Check whether any administrator accounts currently exist and list them.",
    )

    args = parser.parse_args()

    # Ensure database tables exist
    init_db()

    # 1. Handle --check status inquiry
    if args.check:
        status_info = check_admin_status()
        if not status_info["has_admin"]:
            print("🛡️  TrustShield AI Admin Status:")
            print("   Status: NO ADMINISTRATOR CONFIGURED")
            print("   You may run: python bootstrap_admin.py --email <your-registered-email>")
        else:
            print(f"🛡️  TrustShield AI Admin Status: {status_info['admin_count']} active administrator(s):")
            for a in status_info["admins"]:
                print(f"   - [ID {a['id']}] {a['email']} ({a['full_name'] or 'No name'})")
        sys.exit(0)

    # 2. Extract target email
    target_email = args.flag_email or args.positional_email
    if not target_email:
        parser.print_help(sys.stderr)
        print("\n❌ Error: Please specify the email address of the user to promote via --email <email> or positional argument.", file=sys.stderr)
        sys.exit(1)

    # 3. Perform bootstrap
    result = bootstrap_initial_admin(target_email)

    if result["status"] == "promoted":
        user = result["user"]
        print("=" * 65)
        print("🛡️  TRUSTSHIELD AI - FIRST-ADMIN BOOTSTRAP COMPLETE")
        print("=" * 65)
        print(f"✅ User Promoted:    {user.email}")
        print(f"   User ID:          {user.id}")
        print(f"   Full Name:        {user.full_name or 'N/A'}")
        print(f"   Audit Log ID:     {result['audit_id']}")
        print(f"   Action Recorded:  BOOTSTRAP_FIRST_ADMIN")
        print("=" * 65)
        print("Next steps:")
        print("1. Log in at http://localhost:5173/login with this account.")
        print("2. Navigate to the Admin Dashboard at http://localhost:5173/admin/dashboard (or /admin).")
        print("3. Manage threat alerts, moderate scam reports, and invite other team members.")
        print("=" * 65)
        sys.exit(0)

    elif result["status"] == "already_admin":
        print(f"ℹ️  {result['message']}")
        sys.exit(0)

    else:
        print(f"❌ {result['message']}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()

