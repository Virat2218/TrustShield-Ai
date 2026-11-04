import os
import json
import smtplib
from pathlib import Path
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from typing import Optional, Dict, Any
from dotenv import load_dotenv

env_path = Path(__file__).resolve().parent.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

def get_mail_config() -> Dict[str, Any]:
    return {
        "smtp_host": os.getenv("SMTP_HOST", "").strip(),
        "smtp_port": int(os.getenv("SMTP_PORT", "587")),
        "smtp_user": os.getenv("SMTP_USER", "").strip(),
        "smtp_password": os.getenv("SMTP_PASSWORD", "").strip(),
        "smtp_from_email": os.getenv("SMTP_FROM_EMAIL", os.getenv("SMTP_FROM", "noreply@trustshield.ai")).strip(),
        "smtp_tls": os.getenv("SMTP_TLS", "true").lower() in ("true", "1", "yes"),
        "frontend_url": os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/"),
        "environment": os.getenv("ENVIRONMENT", "development").lower(),
    }

# Backward compatibility module attributes
SMTP_HOST = os.getenv("SMTP_HOST", "").strip()
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "").strip()
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "").strip()
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", os.getenv("SMTP_FROM", "noreply@trustshield.ai")).strip()
SMTP_TLS = os.getenv("SMTP_TLS", "true").lower() in ("true", "1", "yes")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development").lower()

DEV_MAILBOX_FILE = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".dev_mailbox.json"
)

def send_password_reset_email(to_email: str, raw_token: str) -> bool:
    """
    Delivers a password reset token to the specified user's email address.
    
    If SMTP credentials are provided, sends a real email via SMTP.
    If no provider is configured:
      - In development/testing (ENVIRONMENT != 'production'): safely records the reset
        metadata to backend/.dev_mailbox.json for local testing without exposing tokens
        in public logs or HTTP responses.
      - In production (ENVIRONMENT == 'production'): safely rejects sending and logs a warning.
    
    SECURITY RULE: Does not log reset tokens or passwords.
    """
    cfg = get_mail_config()
    reset_link = f"{cfg['frontend_url']}/forgot-password?token={raw_token}"
    subject = "TrustShield AI - Password Reset Request"

    text_content = f"""Hello,

We received a request to reset your password for your TrustShield AI account.
To reset your password, please open the following link in your browser:

{reset_link}

This link is single-use and will expire in 15 minutes.
If you did not request this password reset, please ignore this email.

Stay secure,
The TrustShield AI Security Team
"""

    html_content = f"""<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background-color: #0a0e1a; color: #f8fafc; padding: 24px;">
  <div style="max-width: 520px; margin: 0 auto; background: #0d1635; border: 1px solid #1e293b; border-radius: 16px; padding: 32px;">
    <h2 style="color: #06b6d4; margin-top: 0;">🛡️ TrustShield AI</h2>
    <h3 style="color: #ffffff;">Password Reset Request</h3>
    <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
      We received a request to reset the password for your TrustShield AI account.
      Click the button below to choose a new secure password. This single-use link expires in 15 minutes.
    </p>
    <div style="text-align: center; margin: 28px 0;">
      <a href="{reset_link}" style="background: linear-gradient(135deg, #2563eb, #06b6d4); color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: bold; display: inline-block;">
        Reset My Password
      </a>
    </div>
    <p style="color: #64748b; font-size: 12px;">
      If the button above does not work, copy and paste this link into your browser:<br/>
      <span style="color: #38bdf8; word-break: break-all;">{reset_link}</span>
    </p>
    <p style="color: #64748b; font-size: 12px; margin-top: 24px; border-top: 1px solid #1e293b; padding-top: 16px;">
      If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
    </p>
  </div>
</body>
</html>
"""

    if cfg["smtp_host"]:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = cfg["smtp_from_email"]
            msg["To"] = to_email

            part1 = MIMEText(text_content, "plain")
            part2 = MIMEText(html_content, "html")
            msg.attach(part1)
            msg.attach(part2)

            if cfg["smtp_port"] == 465:
                with smtplib.SMTP_SSL(cfg["smtp_host"], cfg["smtp_port"], timeout=10) as server:
                    if cfg["smtp_user"] and cfg["smtp_password"]:
                        server.login(cfg["smtp_user"], cfg["smtp_password"])
                    server.sendmail(cfg["smtp_from_email"], [to_email], msg.as_string())
            else:
                with smtplib.SMTP(cfg["smtp_host"], cfg["smtp_port"], timeout=10) as server:
                    if cfg["smtp_tls"]:
                        server.starttls()
                    if cfg["smtp_user"] and cfg["smtp_password"]:
                        server.login(cfg["smtp_user"], cfg["smtp_password"])
                    server.sendmail(cfg["smtp_from_email"], [to_email], msg.as_string())
            return True
        except Exception as e:
            # Note: Do NOT log tokens or passwords
            print(f"⚠️ Failed to send password reset email via SMTP to {to_email}: {type(e).__name__}")
            return False

    # Safe local development procedure when no SMTP is configured
    if cfg["environment"] != "production":
        try:
            mailbox = []
            if os.path.exists(DEV_MAILBOX_FILE):
                try:
                    with open(DEV_MAILBOX_FILE, "r") as f:
                        mailbox = json.load(f)
                except Exception:
                    mailbox = []

            entry = {
                "to": to_email,
                "reset_link": reset_link,
                "token": raw_token,
                "timestamp": datetime.utcnow().isoformat(),
            }
            mailbox.append(entry)
            with open(DEV_MAILBOX_FILE, "w") as f:
                json.dump(mailbox, f, indent=2)

            print(f"📧 [DEV] SMTP not configured. Password reset link recorded in {os.path.basename(DEV_MAILBOX_FILE)} for recipient {to_email}")
        except Exception as e:
            print(f"⚠️ [DEV] Could not write to dev mailbox: {type(e).__name__}")
        return True

    # In production without SMTP configured
    print(f"⚠️ [PROD] SMTP provider not configured. Reset email could not be dispatched to {to_email}.")
    return False

def get_dev_latest_token(email: str) -> Optional[str]:
    """Helper for development & test suites to retrieve latest generated token without exposing it in logs."""
    if not os.path.exists(DEV_MAILBOX_FILE):
        return None
    try:
        with open(DEV_MAILBOX_FILE, "r") as f:
            mailbox = json.load(f)
        for item in reversed(mailbox):
            if item.get("to") == email.lower().strip():
                return item.get("token")
    except Exception:
        return None
    return None

