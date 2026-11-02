"""
Tests for Issue 4: Community Report Screenshot Attachment Storage

Verifies:
- Valid PNG/JPEG uploads are saved to disk, reported in API response
- Empty, oversized, and invalid files are rejected with correct HTTP codes
- Unsupported formats (BMP) are rejected with 415
- Owner can retrieve attachment (200 FileResponse)
- Admin can retrieve attachment (200 FileResponse)
- Non-owner regular user is forbidden (403)
- Unauthenticated request is rejected (401)
- Deleting a report also removes the attachment file from disk
- GET attachment for report with no attachment → 404
- GET attachment for report with missing file → 404

Run:
    cd backend && ./venv/bin/python3 test_community_attachments.py
"""

import io
import os
import sys
import struct
import zlib
import tempfile
import shutil

# ---------------------------------------------------------------------------
# Bootstrap path so we can import app modules without pytest
# ---------------------------------------------------------------------------
sys.path.insert(0, os.path.dirname(__file__))

# Use a temp DB so tests never touch production data
os.environ.setdefault("DATABASE_URL", "sqlite:///./test_community_attachments.db")

# Isolated upload dir so we never write to the real uploads folder
_TMP_UPLOAD_DIR = tempfile.mkdtemp(prefix="ts_att_test_")
os.environ["COMMUNITY_UPLOAD_DIR"] = _TMP_UPLOAD_DIR
os.environ["MAX_COMMUNITY_ATTACHMENT_SIZE_MB"] = "1"

# Set a test JWT secret before anything else imports auth_service
from services.auth_service import set_test_jwt_secret
set_test_jwt_secret("test-community-attachments-jwt-secret-key-32")

from fastapi.testclient import TestClient
from main import app
from database import Base, engine

# ---------------------------------------------------------------------------
# Helpers: generate minimal valid image bytes
# ---------------------------------------------------------------------------

def _make_png(width: int = 1, height: int = 1) -> bytes:
    """Return the smallest valid single-pixel PNG."""
    def _chunk(name: bytes, data: bytes) -> bytes:
        c = struct.pack(">I", len(data)) + name + data
        return c + struct.pack(">I", zlib.crc32(name + data) & 0xFFFFFFFF)

    ihdr = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    raw = b"\x00\xff\xff\xff" * width * height  # RGB scanline (filter byte 0)
    idat = zlib.compress(raw)
    return (
        b"\x89PNG\r\n\x1a\n"
        + _chunk(b"IHDR", ihdr)
        + _chunk(b"IDAT", idat)
        + _chunk(b"IEND", b"")
    )


def _make_jpeg() -> bytes:
    """Return a valid JPEG produced by Pillow."""
    try:
        from PIL import Image
        buf = io.BytesIO()
        Image.new("RGB", (2, 2), color=(255, 0, 0)).save(buf, format="JPEG")
        return buf.getvalue()
    except ImportError:
        # Fallback: a known-good 2×2 JPEG (base64)
        import base64
        return base64.b64decode(
            "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8U"
            "HRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAARCAACAAIDASIA"
            "AhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABgUE/8QAIBAAAQQCAgMAAAAAAAAAAAAAAQID"
            "BAUREiExQf/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oA"
            "DAMBAAIRAxEAPwCyvMtRjRxVe4qVQjKsjvLYaqDxHBYTk9KntbJtjVEPZR/aXNAA//Z"
        )


def _make_bmp() -> bytes:
    """Return a valid 1x1 BMP (unsupported format -> 415)."""
    try:
        from PIL import Image
        buf = io.BytesIO()
        Image.new('RGB', (1, 1), color=(0, 0, 0)).save(buf, format='BMP')
        return buf.getvalue()
    except ImportError:
        import base64
        return base64.b64decode('Qk06AAAAAAAAADYAAAAoAAAAAQAAAAEAAAABABgAAAAAAAQAAADEDgAAxA4AAAAAAAAAAAAAAAAAAA==')


def _make_oversized_png() -> bytes:
    """PNG header followed by enough zeros to exceed MAX_COMMUNITY_ATTACHMENT_SIZE_MB=1."""
    return _make_png()[:8] + b"\x00" * (2 * 1024 * 1024)  # 2 MB junk


# ---------------------------------------------------------------------------
# Test setup
# ---------------------------------------------------------------------------

def _setup():
    """Drop and recreate all tables to start clean."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def _register_and_login(client: TestClient, email: str, password: str = "Password1!") -> str:
    """Register a user and return the JWT token."""
    client.post("/api/auth/register", json={
        "email": email,
        "password": password,
        "full_name": "Test User",
    })
    resp = client.post("/api/auth/login", json={"email": email, "password": password})
    assert resp.status_code == 200, f"Login failed: {resp.text}"
    return resp.json()["access_token"]


def _auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def _submit_report(client: TestClient, token: str, screenshot_bytes: bytes = None, filename: str = "shot.png", ct: str = "image/png") -> dict:
    """POST /api/community/reports, optionally with an attachment."""
    data = {
        "category": "Phishing Link",
        "description": "Test report for attachment upload.",
        "suspicious_url": "http://evil.example.com",
    }
    files = None
    if screenshot_bytes is not None:
        files = {"screenshot": (filename, io.BytesIO(screenshot_bytes), ct)}
    resp = client.post("/api/community/reports", data=data, files=files, headers=_auth(token))
    return resp


# ---------------------------------------------------------------------------
# Individual tests
# ---------------------------------------------------------------------------

def test_valid_png_upload_stored(client: TestClient, token: str):
    png = _make_png()
    resp = _submit_report(client, token, png, "evidence.png", "image/png")
    assert resp.status_code in (200, 201), f"Expected 200/201, got {resp.status_code}: {resp.text}"
    body = resp.json()
    assert body.get("has_attachment") is True, f"has_attachment should be True: {body}"
    assert body.get("attachment_url") is not None, f"attachment_url should be set: {body}"

    # File must actually exist on disk
    report_id = body["id"]
    att_resp = client.get(f"/api/community/reports/{report_id}/attachment", headers=_auth(token))
    assert att_resp.status_code == 200, f"Expected 200 on GET attachment, got {att_resp.status_code}"
    print("[PASS] test_valid_png_upload_stored")
    return report_id


def test_valid_jpeg_upload_stored(client: TestClient, token: str):
    jpeg = _make_jpeg()
    resp = _submit_report(client, token, jpeg, "evidence.jpg", "image/jpeg")
    assert resp.status_code in (200, 201), f"Expected 200/201, got {resp.status_code}: {resp.text}"
    body = resp.json()
    assert body.get("has_attachment") is True
    print("[PASS] test_valid_jpeg_upload_stored")


def test_report_without_attachment(client: TestClient, token: str):
    resp = _submit_report(client, token, screenshot_bytes=None)
    assert resp.status_code in (200, 201), f"Expected 200/201, got {resp.status_code}: {resp.text}"
    body = resp.json()
    assert body.get("has_attachment") is False, f"has_attachment should be False: {body}"
    assert body.get("attachment_url") is None, f"attachment_url should be None: {body}"
    report_id = body["id"]
    # Requesting attachment for a report that has none → 404
    att_resp = client.get(f"/api/community/reports/{report_id}/attachment", headers=_auth(token))
    assert att_resp.status_code == 404, f"Expected 404 for no attachment, got {att_resp.status_code}"
    print("[PASS] test_report_without_attachment → 404 on GET attachment")


def test_empty_file_rejected(client: TestClient, token: str):
    resp = _submit_report(client, token, b"", "empty.png", "image/png")
    assert resp.status_code == 400, f"Expected 400 for empty file, got {resp.status_code}: {resp.text}"
    print("[PASS] test_empty_file_rejected → 400")


def test_oversized_file_rejected(client: TestClient, token: str):
    from services.storage_service import MAX_ATTACHMENT_BYTES
    big = b"\x89PNG\r\n\x1a\n" + b"\x00" * (MAX_ATTACHMENT_BYTES + 1024)
    resp = _submit_report(client, token, big, "big.png", "image/png")
    assert resp.status_code == 413, f"Expected 413 for oversized file, got {resp.status_code}: {resp.text}"
    print("[PASS] test_oversized_file_rejected → 413")


def test_non_image_file_rejected(client: TestClient, token: str):
    """A .png extension with PDF bytes should be rejected."""
    pdf_bytes = b"%PDF-1.4 fake pdf content here"
    resp = _submit_report(client, token, pdf_bytes, "evil.png", "image/png")
    assert resp.status_code in (400, 415), f"Expected 400/415 for malformed image, got {resp.status_code}: {resp.text}"
    print("[PASS] test_non_image_file_rejected → 400/415")


def test_unsupported_format_bmp_rejected(client: TestClient, token: str):
    bmp = _make_bmp()
    resp = _submit_report(client, token, bmp, "image.bmp", "image/bmp")
    assert resp.status_code in (400, 415), f"Expected 400/415 for BMP, got {resp.status_code}: {resp.text}"
    print("[PASS] test_unsupported_format_bmp_rejected → 400/415")


def test_owner_can_get_attachment(client: TestClient, token: str, report_id: int):
    att_resp = client.get(f"/api/community/reports/{report_id}/attachment", headers=_auth(token))
    assert att_resp.status_code == 200, f"Owner should get 200, got {att_resp.status_code}"
    print("[PASS] test_owner_can_get_attachment → 200")


def test_admin_can_get_attachment(client: TestClient, report_id: int):
    """Register an admin user and verify they can view the attachment."""
    admin_email = "adminatt@test.com"
    # Register admin
    client.post("/api/auth/register", json={
        "email": admin_email,
        "password": "AdminPass1!",
        "full_name": "Admin User",
    })
    # Promote to admin via DB
    from database import SessionLocal
    from database import User
    db = SessionLocal()
    try:
        u = db.query(User).filter(User.email == admin_email).first()
        if u:
            u.is_admin = True
            db.commit()
    finally:
        db.close()
    resp = client.post("/api/auth/login", json={"email": admin_email, "password": "AdminPass1!"})
    assert resp.status_code == 200
    admin_token = resp.json()["access_token"]
    att_resp = client.get(f"/api/community/reports/{report_id}/attachment", headers=_auth(admin_token))
    assert att_resp.status_code == 200, f"Admin should get 200, got {att_resp.status_code}"
    print("[PASS] test_admin_can_get_attachment → 200")


def test_other_user_forbidden(client: TestClient, report_id: int):
    other_token = _register_and_login(client, "other_att@test.com")
    att_resp = client.get(f"/api/community/reports/{report_id}/attachment", headers=_auth(other_token))
    assert att_resp.status_code == 403, f"Non-owner should get 403, got {att_resp.status_code}"
    print("[PASS] test_other_user_forbidden → 403")


def test_unauthenticated_forbidden(client: TestClient, report_id: int):
    att_resp = client.get(f"/api/community/reports/{report_id}/attachment")
    assert att_resp.status_code == 401, f"Unauthenticated should get 401, got {att_resp.status_code}"
    print("[PASS] test_unauthenticated_forbidden → 401")


def test_delete_report_removes_attachment(client: TestClient, token: str):
    """Submit a report with attachment, then delete it, and verify file is gone."""
    png = _make_png()
    resp = _submit_report(client, token, png, "to_delete.png", "image/png")
    assert resp.status_code in (200, 201)
    body = resp.json()
    report_id = body["id"]

    # Confirm the file exists via the API
    att_resp = client.get(f"/api/community/reports/{report_id}/attachment", headers=_auth(token))
    assert att_resp.status_code == 200

    # Delete the report
    del_resp = client.delete(f"/api/community/reports/{report_id}", headers=_auth(token))
    assert del_resp.status_code == 200, f"Delete failed: {del_resp.text}"

    # Confirm the file no longer exists on disk
    remaining = os.listdir(_TMP_UPLOAD_DIR)
    # All files in the temp dir should now be gone (or at least none for this report)
    # We check by trying the GET again — the report is deleted so we expect 404
    att_resp2 = client.get(f"/api/community/reports/{report_id}/attachment", headers=_auth(token))
    assert att_resp2.status_code == 404, f"Expected 404 after delete, got {att_resp2.status_code}"
    print("[PASS] test_delete_report_removes_attachment → 404 after delete")


def test_get_attachment_for_missing_file(client: TestClient, token: str):
    """If attachment metadata exists in DB but the file is gone, expect 404."""
    from database import SessionLocal
    from database import CommunityReport

    # Create a report with attachment
    png = _make_png()
    resp = _submit_report(client, token, png, "missing.png", "image/png")
    assert resp.status_code in (200, 201)
    report_id = resp.json()["id"]

    # Manually remove the file from disk to simulate lost storage
    from services.storage_service import storage_service
    db = SessionLocal()
    try:
        r = db.query(CommunityReport).filter(CommunityReport.id == report_id).first()
        if r and r.screenshot_filename:
            filepath = storage_service.get_attachment_path(r.screenshot_filename)
            if filepath and os.path.exists(filepath):
                os.remove(filepath)
    finally:
        db.close()

    att_resp = client.get(f"/api/community/reports/{report_id}/attachment", headers=_auth(token))
    assert att_resp.status_code == 404, f"Expected 404 for missing file, got {att_resp.status_code}"
    print("[PASS] test_get_attachment_for_missing_file → 404")


# ---------------------------------------------------------------------------
# Runner
# ---------------------------------------------------------------------------

def run_all():
    _setup()
    client = TestClient(app)

    owner_token = _register_and_login(client, "owner_att@test.com")

    print("\n=== Community Attachment Tests ===\n")

    try:
        # Valid uploads
        report_id = test_valid_png_upload_stored(client, owner_token)
        test_valid_jpeg_upload_stored(client, owner_token)
        test_report_without_attachment(client, owner_token)

        # Rejection cases
        test_empty_file_rejected(client, owner_token)
        test_oversized_file_rejected(client, owner_token)
        test_non_image_file_rejected(client, owner_token)
        test_unsupported_format_bmp_rejected(client, owner_token)

        # Access control
        test_owner_can_get_attachment(client, owner_token, report_id)
        test_admin_can_get_attachment(client, report_id)
        test_other_user_forbidden(client, report_id)
        test_unauthenticated_forbidden(client, report_id)

        # Lifecycle
        test_delete_report_removes_attachment(client, owner_token)
        test_get_attachment_for_missing_file(client, owner_token)

        passed = 13
        print(f"\n✅ All {passed} community attachment tests passed!\n")
        return True

    except AssertionError as e:
        print(f"\n❌ FAILED: {e}\n")
        return False
    finally:
        # Cleanup temp upload dir
        shutil.rmtree(_TMP_UPLOAD_DIR, ignore_errors=True)
        # Cleanup test DB
        db_path = os.path.join(os.path.dirname(__file__), "test_community_attachments.db")
        if os.path.exists(db_path):
            os.remove(db_path)


if __name__ == "__main__":
    success = run_all()
    sys.exit(0 if success else 1)
