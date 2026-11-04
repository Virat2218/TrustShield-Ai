import os
import io
import uuid
import re
import logging
from pathlib import Path
from typing import Optional, Tuple
from PIL import Image
from fastapi import UploadFile, HTTPException
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

env_path = Path(__file__).resolve().parent.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

# Configurable storage directory (private, outside the public frontend tree)
BASE_DIR = Path(__file__).resolve().parent.parent
DEFAULT_UPLOAD_DIR = str(BASE_DIR / "uploads" / "reports")

def get_configured_upload_dir() -> Path:
    env_dir = os.getenv("COMMUNITY_UPLOAD_DIR", "").strip()
    return Path(env_dir).resolve() if env_dir else Path(DEFAULT_UPLOAD_DIR).resolve()

COMMUNITY_UPLOAD_DIR = str(get_configured_upload_dir())

# Size limit and chunking
def get_max_attachment_mb() -> int:
    return int(os.getenv("MAX_COMMUNITY_ATTACHMENT_SIZE_MB", "5"))

def get_max_attachment_bytes() -> int:
    return get_max_attachment_mb() * 1024 * 1024

MAX_ATTACHMENT_SIZE_MB = get_max_attachment_mb()
MAX_ATTACHMENT_BYTES = get_max_attachment_bytes()
STREAM_CHUNK_SIZE = 64 * 1024  # 64 KB

# Allowed raster formats
ALLOWED_ATTACHMENT_FORMATS = {"PNG", "JPEG", "WEBP"}

SAFE_FILENAME_REGEX = re.compile(r"^[a-zA-Z0-9_\-\.]+$")

class StorageService:
    """
    Manages persistent storage for community report attachments.
    Designed with a clean interface allowing future integration of S3/cloud object storage.
    """

    def __init__(self, upload_dir: Optional[str] = None):
        target = upload_dir if upload_dir is not None else get_configured_upload_dir()
        self.upload_dir = Path(target).resolve()
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    def _resolve_safe_path(self, filename: str) -> Optional[Path]:
        """
        Validates that filename is safe and returns the resolved absolute Path strictly
        within the configured upload directory. Prevents path traversal vulnerabilities.
        """
        if not filename or not SAFE_FILENAME_REGEX.match(filename):
            return None

        # Disallow directory components
        if "/" in filename or "\\" in filename or ".." in filename:
            return None

        resolved = (self.upload_dir / filename).resolve()
        try:
            # Ensure the resolved file path is inside upload_dir
            resolved.relative_to(self.upload_dir)
            return resolved
        except ValueError:
            # Path traversal attempt outside root
            return None

    async def stream_and_validate_attachment(self, file: UploadFile) -> Tuple[bytes, str]:
        """
        Streams attachment in bounded chunks with size limit enforcement.
        Validates image content using Pillow byte signature checks.
        Returns (image_bytes, format_upper).
        """
        chunks = []
        total_bytes = 0

        try:
            while True:
                chunk = await file.read(STREAM_CHUNK_SIZE)
                if not chunk:
                    break
                total_bytes += len(chunk)
                if total_bytes > MAX_ATTACHMENT_BYTES:
                    raise HTTPException(
                        status_code=413,
                        detail=f"Attachment file size exceeds the allowed limit of {MAX_ATTACHMENT_SIZE_MB} MB.",
                    )
                chunks.append(chunk)
        finally:
            await file.close()

        if total_bytes == 0:
            raise HTTPException(
                status_code=400,
                detail="Uploaded screenshot file is empty.",
            )

        file_bytes = b"".join(chunks)

        # Validate image integrity with Pillow
        try:
            with Image.open(io.BytesIO(file_bytes)) as img:
                img.verify()
                detected_format = (img.format or "").upper()
        except Exception:
            raise HTTPException(
                status_code=400,
                detail="Invalid or corrupted image attachment. Please upload a valid PNG, JPEG, or WEBP screenshot.",
            )

        if detected_format not in ALLOWED_ATTACHMENT_FORMATS:
            raise HTTPException(
                status_code=415,
                detail=f"Unsupported attachment format '{detected_format}'. Supported raster formats: PNG, JPEG, WEBP.",
            )

        return file_bytes, detected_format

    def save_attachment(self, file_bytes: bytes, detected_format: str) -> str:
        """
        Saves file bytes to disk under an opaque server-generated identifier.
        Returns the safe opaque filename.
        """
        ext = "jpg" if detected_format == "JPEG" else detected_format.lower()
        opaque_name = f"report_att_{uuid.uuid4().hex}.{ext}"
        target_path = self._resolve_safe_path(opaque_name)

        if not target_path:
            raise RuntimeError("Failed to resolve safe storage destination for attachment.")

        with open(target_path, "wb") as f:
            f.write(file_bytes)

        return opaque_name

    def get_attachment_path(self, filename: str) -> Optional[Path]:
        """
        Resolves and verifies existence of an attachment file on disk.
        Returns None if not found or if path traversal is detected.
        """
        target = self._resolve_safe_path(filename)
        if target and target.is_file():
            return target
        return None

    def delete_attachment(self, filename: str) -> bool:
        """
        Safely deletes an attachment file from the storage directory.
        Strictly prevents deleting outside the configured upload directory.
        """
        target = self._resolve_safe_path(filename)
        if target and target.is_file():
            try:
                target.unlink()
                return True
            except OSError as e:
                logger.error(f"Failed to delete attachment {filename}: {e}")
                return False
        return False

# Global storage instance
storage_service = StorageService()

