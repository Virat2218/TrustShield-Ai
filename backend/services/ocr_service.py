import io
from PIL import Image
import pytesseract
from typing import Optional

ALLOWED_FORMATS = {"PNG", "JPEG", "JPG", "WEBP"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

def extract_text_from_image(image_bytes: bytes) -> str:
    """
    Validates image bytes using PIL and extracts text via Tesseract OCR.
    Raises ValueError with descriptive message if validation or OCR fails.
    """
    if len(image_bytes) > MAX_FILE_SIZE:
        raise ValueError("Image file size exceeds the 5 MB limit.")

    try:
        image = Image.open(io.BytesIO(image_bytes))
        image.verify()  # Verify image integrity
    except Exception as e:
        raise ValueError("Invalid or corrupted image file.")

    # Re-open after verify() because verify() can close file stream
    image = Image.open(io.BytesIO(image_bytes))

    format_upper = (image.format or "").upper()
    if format_upper not in ALLOWED_FORMATS:
        raise ValueError(f"Unsupported image format ({format_upper}). Allowed: PNG, JPEG, WEBP.")

    # Convert image to RGB if needed (handles RGBA, P, etc.)
    if image.mode not in ("RGB", "L"):
        image = image.convert("RGB")

    try:
        # Run Tesseract OCR with English and Hindi if available, otherwise default
        extracted = pytesseract.image_to_string(image)
        return extracted.strip()
    except Exception as e:
        # If tesseract command fails, raise clear descriptive error
        raise ValueError(f"OCR processing failed: {str(e)}")

