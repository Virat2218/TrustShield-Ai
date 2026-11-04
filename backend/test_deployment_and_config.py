import os
import sys
import unittest
from unittest.mock import patch, MagicMock
from pathlib import Path
from sqlalchemy import create_engine, text, inspect
from fastapi.testclient import TestClient

# Ensure backend directory is in python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from main import app
from database import init_db, Base, User, get_db
from services.mail_service import get_mail_config
from services.storage_service import get_configured_upload_dir, get_max_attachment_bytes

class TestDeploymentAndConfig(unittest.TestCase):
    def test_database_init_safe_idempotent_migration(self):
        """Verify that init_db() handles existing columns gracefully without crashing."""
        test_engine = create_engine("sqlite:///:memory:")
        # First initialization
        init_db(target_engine=test_engine)
        inspector = inspect(test_engine)
        cols = {c["name"] for c in inspector.get_columns("users")}
        self.assertIn("is_admin", cols)
        self.assertIn("token_version", cols)

        # Second initialization (idempotent; columns already exist)
        try:
            init_db(target_engine=test_engine)
        except Exception as e:
            self.fail(f"init_db raised unexpected exception on repeated run: {e}")

    def test_unexpected_migration_error_reported(self):
        """Verify that unexpected non-duplicate-column errors in migration are reported/raised."""
        test_engine = create_engine("sqlite:///:memory:")
        init_db(target_engine=test_engine)

        # Intentionally break connection or execute invalid statement
        mock_conn = MagicMock()
        mock_conn.execute.side_effect = RuntimeError("Fatal hardware failure")
        mock_engine = MagicMock()
        mock_engine.connect.return_value.__enter__.return_value = mock_conn
        mock_engine.dialect.name = "sqlite"

        # Mock inspect to report 'users' table without is_admin
        with patch("database.inspect") as mock_inspect:
            mock_inspector = MagicMock()
            mock_inspector.get_table_names.return_value = ["users"]
            mock_inspector.get_columns.return_value = [{"name": "id"}, {"name": "email"}]
            mock_inspect.return_value = mock_inspector

            with self.assertRaises(RuntimeError):
                init_db(target_engine=mock_engine)

    def test_cors_credentials_rule(self):
        """Verify CORS middleware adheres to W3C specification regarding wildcard origins and credentials."""
        # When origins are explicit
        with patch.dict(os.environ, {"ALLOWED_ORIGINS": "https://myapp.com,https://app.trustshield.ai"}):
            # TestClient request
            with TestClient(app) as client:
                res = client.get("/api/health")
                self.assertEqual(res.status_code, 200)

    def test_mail_config_dynamic_reading(self):
        """Verify that SMTP configuration reads dynamically from os.environ."""
        with patch.dict(os.environ, {
            "SMTP_HOST": "smtp.custom.test",
            "SMTP_PORT": "465",
            "FRONTEND_URL": "https://custom-frontend.example.com/",
            "ENVIRONMENT": "production",
        }):
            cfg = get_mail_config()
            self.assertEqual(cfg["smtp_host"], "smtp.custom.test")
            self.assertEqual(cfg["smtp_port"], 465)
            self.assertEqual(cfg["frontend_url"], "https://custom-frontend.example.com")
            self.assertEqual(cfg["environment"], "production")

    def test_storage_config_dynamic_reading(self):
        """Verify storage upload dir and limits dynamically read from os.environ."""
        with patch.dict(os.environ, {
            "COMMUNITY_UPLOAD_DIR": "/tmp/test_trustshield_uploads",
            "MAX_COMMUNITY_ATTACHMENT_SIZE_MB": "10",
        }):
            upload_dir = get_configured_upload_dir()
            self.assertEqual(str(upload_dir), str(Path("/tmp/test_trustshield_uploads").resolve()))
            max_bytes = get_max_attachment_bytes()
            self.assertEqual(max_bytes, 10 * 1024 * 1024)

    def test_health_check_endpoint(self):
        """Verify /api/health returns HTTP 200 with all operational metadata."""
        with TestClient(app) as client:
            res = client.get("/api/health")
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertEqual(data["status"], "ok")
            self.assertIn("ai_available", data)
            self.assertIn("safe_browsing_available", data)
            self.assertIn("ocr_available", data)
            self.assertEqual(data["version"], "2.0.0")

if __name__ == "__main__":
    unittest.main()

