import os
import io
import logging
from pathlib import Path
from typing import Optional
from PIL import Image
import pytesseract
from fastapi import UploadFile, HTTPException
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

env_path = Path(__file__).resolve().parent.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

def get_max_screenshot_mb() -> int:
    return int(os.getenv("MAX_SCREENSHOT_SIZE_MB", "5"))

def get_max_upload_size_bytes() -> int:
    return get_max_screenshot_mb() * 1024 * 1024

def configure_tesseract():
    candidate_paths = [
        os.getenv("TESSERACT_CMD", "").strip(),
        "/opt/homebrew/bin/tesseract",
        "/usr/local/bin/tesseract",
        "/usr/bin/tesseract",
    ]
    for p in candidate_paths:
        if p and os.path.isfile(p) and os.access(p, os.X_OK):
            pytesseract.pytesseract.tesseract_cmd = p
            return p
    return "tesseract"

configure_tesseract()

# Configurable maximum upload size (default 5 MB)
MAX_SCREENSHOT_SIZE_MB = get_max_screenshot_mb()
MAX_UPLOAD_SIZE_BYTES = get_max_upload_size_bytes()
STREAM_CHUNK_SIZE = 64 * 1024  # 64 KB read buffer

# Explicit allowlist of supported raster formats (Pillow format identifiers)
ALLOWED_RASTER_FORMATS = {"PNG", "JPEG", "WEBP"}

class OCRError(Exception):
    """Domain exception raised when OCR processing or engine encounters an error."""
    pass

async def stream_and_validate_upload(file: UploadFile, max_bytes: int = MAX_UPLOAD_SIZE_BYTES) -> bytes:
    """
    Streams an uploaded file in bounded chunks to prevent unbounded memory consumption.
    Rejects:
      - Empty files with HTTP 400 Bad Request.
      - Oversized files with HTTP 413 Payload Too Large as soon as the threshold is exceeded.
    """
    chunks = []
    total_bytes = 0

    try:
        while True:
            chunk = await file.read(STREAM_CHUNK_SIZE)
            if not chunk:
                break
            total_bytes += len(chunk)
            if total_bytes > max_bytes:
                max_mb = max_bytes // (1024 * 1024)
                raise HTTPException(
                    status_code=413,
                    detail=f"Uploaded file exceeds the maximum allowed size of {max_mb} MB.",
                )
            chunks.append(chunk)
    finally:
        await file.close()

    if total_bytes == 0:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty.",
        )

    return b"".join(chunks)

def validate_raster_image(image_bytes: bytes) -> str:
    """
    Validates actual file contents using Pillow byte-level verification.
    Does NOT trust client-supplied filename or MIME type.
    
    Rejects:
      - Malformed or corrupted image data with HTTP 400 Bad Request.
      - Non-allowlisted formats with HTTP 415 Unsupported Media Type.
    Returns the verified uppercase format string ('PNG', 'JPEG', 'WEBP').
    """
    try:
        with Image.open(io.BytesIO(image_bytes)) as img:
            img.verify()
            detected_format = (img.format or "").upper()
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid or corrupted image file. Please upload a valid PNG, JPEG, or WEBP image.",
        )

    if detected_format not in ALLOWED_RASTER_FORMATS:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported image format '{detected_format}'. Supported formats: PNG, JPEG, WEBP.",
        )

    return detected_format

def extract_text_from_image(image_bytes: bytes) -> str:
    """
    Safely re-opens the validated image stream (required after verify()),
    converts to RGB if needed, runs Tesseract OCR, and ensures resources are closed.
    
    Raises OCRError with a sanitized user-facing message on failure without leaking
    internal stack traces or system command output.
    """
    configure_tesseract()
    try:
        with Image.open(io.BytesIO(image_bytes)) as img:
            # Normalize color mode for OCR (handles RGBA, P, CMYK, etc.)
            if img.mode not in ("RGB", "L"):
                img = img.convert("RGB")

            extracted = pytesseract.image_to_string(img)
            return extracted.strip()
    except pytesseract.TesseractNotFoundError:
        logger.error("OCR engine (tesseract) is not installed or accessible in system PATH.")
        raise OCRError("OCR service is temporarily unavailable.")
    except Exception as e:
        logger.error(f"OCR extraction failed: {type(e).__name__}: {str(e)}")
        raise OCRError("OCR text extraction encountered an error while processing the image.")
