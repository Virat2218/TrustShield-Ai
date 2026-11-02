import os
import sys
import io
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ["TESTING"] = "true"

from fastapi.testclient import TestClient
from main import app
from services import ocr_service

client = TestClient(app)

def create_valid_test_png(text_simulation: bool = True) -> bytes:
    """Creates a valid in-memory PNG image bytes."""
    img = Image.new("RGB", (200, 80), color=(255, 255, 255))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()

def create_valid_test_jpeg() -> bytes:
    """Creates a valid in-memory JPEG image bytes."""
    img = Image.new("RGB", (100, 60), color=(200, 200, 200))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()

def create_unsupported_bmp() -> bytes:
    """Creates a valid BMP image (unsupported raster format for our API)."""
    img = Image.new("RGB", (50, 50), color=(100, 100, 100))
    buf = io.BytesIO()
    img.save(buf, format="BMP")
    return buf.getvalue()

def run_screenshot_upload_security_tests():
    print("=" * 60)
    print("TRUSTSHIELD AI - SCREENSHOT UPLOAD HARDENING & OCR TESTS")
    print("=" * 60)

    # -------------------------------------------------------------
    # Test 1: Empty file upload is rejected (HTTP 400)
    # -------------------------------------------------------------
    print("\n[Test 1] Empty 0-byte file upload rejection")
    empty_file = io.BytesIO(b"")
    resp_empty = client.post(
        "/api/analyze-screenshot",
        files={"file": ("empty.png", empty_file, "image/png")},
    )
    assert resp_empty.status_code == 400, f"Expected 400, got {resp_empty.status_code}"
    assert "empty" in resp_empty.json()["detail"].lower()
    print("    ✅ 0-byte upload rejected with HTTP 400 ('Uploaded file is empty.')")

    # -------------------------------------------------------------
    # Test 2: Oversized file upload is rejected (HTTP 413) via streaming
    # -------------------------------------------------------------
    print("\n[Test 2] Oversized file rejected before memory accumulation")
    # Simulate an oversized upload exceeding MAX_UPLOAD_SIZE_BYTES
    oversized_bytes = b"X" * (5 * 1024 * 1024 + 1024)  # 5 MB + 1 KB
    resp_oversized = client.post(
        "/api/analyze-screenshot",
        files={"file": ("huge.png", io.BytesIO(oversized_bytes), "image/png")},
    )
    assert resp_oversized.status_code == 413, f"Expected 413, got {resp_oversized.status_code}"
    assert "exceeds" in resp_oversized.json()["detail"].lower()
    print("    ✅ Oversized upload rejected with HTTP 413 Payload Too Large")

    # -------------------------------------------------------------
    # Test 3: Spoofed MIME type and extension rejected by Pillow check
    # -------------------------------------------------------------
    print("\n[Test 3] Spoofed MIME type & extension rejected (non-image payload)")
    spoofed_bytes = b"#!/bin/bash\necho 'MALWARE EXECUTION ATTEMPT'\nexit 1\n"
    resp_spoof = client.post(
        "/api/analyze-screenshot",
        files={"file": ("malware.png", io.BytesIO(spoofed_bytes), "image/png")},
    )
    assert resp_spoof.status_code == 400, f"Expected 400, got {resp_spoof.status_code}"
    assert "invalid or corrupted" in resp_spoof.json()["detail"].lower()
    print("    ✅ Spoofed extension & MIME header rejected with HTTP 400 (Pillow verification)")

    # -------------------------------------------------------------
    # Test 4: Unsupported format disguised with allowed extension
    # -------------------------------------------------------------
    print("\n[Test 4] Unsupported format (BMP disguised as .png) rejected")
    bmp_bytes = create_unsupported_bmp()
    resp_unsupported = client.post(
        "/api/analyze-screenshot",
        files={"file": ("fake_screenshot.png", io.BytesIO(bmp_bytes), "image/png")},
    )
    assert resp_unsupported.status_code == 415, f"Expected 415, got {resp_unsupported.status_code}"
    assert "unsupported image format" in resp_unsupported.json()["detail"].lower()
    print("    ✅ Unsupported format (BMP) correctly rejected with HTTP 415")

    # -------------------------------------------------------------
    # Test 5: Malformed corrupted image bytes rejected
    # -------------------------------------------------------------
    print("\n[Test 5] Malformed corrupted image rejected")
    # Valid PNG 8-byte signature followed by corrupted junk
    corrupted_bytes = b"\x89PNG\r\n\x1a\n" + b"\x00\x00\x00\rIHDR" + b"CORRUPTED_DATA_TRUNCATED"
    resp_corrupt = client.post(
        "/api/analyze-screenshot",
        files={"file": ("corrupted.png", io.BytesIO(corrupted_bytes), "image/png")},
    )
    assert resp_corrupt.status_code == 400, f"Expected 400, got {resp_corrupt.status_code}"
    assert "invalid or corrupted" in resp_corrupt.json()["detail"].lower()
    print("    ✅ Corrupted image rejected with HTTP 400")

    # -------------------------------------------------------------
    # Test 6: Valid raster image validation & safe OCR processing
    # -------------------------------------------------------------
    print("\n[Test 6] Valid PNG image passes Pillow verification & format allowlist")
    png_bytes = create_valid_test_png()
    format_detected = ocr_service.validate_raster_image(png_bytes)
    assert format_detected == "PNG"
    print("    ✅ Valid PNG byte content verified and recognized as 'PNG'")

    jpeg_bytes = create_valid_test_jpeg()
    format_jpeg = ocr_service.validate_raster_image(jpeg_bytes)
    assert format_jpeg == "JPEG"
    print("    ✅ Valid JPEG byte content verified and recognized as 'JPEG'")

    # -------------------------------------------------------------
    # Test 7: OCR processing with mocked text extraction & end-to-end analysis
    # -------------------------------------------------------------
    print("\n[Test 7] End-to-end valid screenshot analysis")
    original_extract = ocr_service.extract_text_from_image
    try:
        # Mock OCR extraction to return scam text for end-to-end verification
        ocr_service.extract_text_from_image = lambda b: "URGENT: Your electricity connection will be disconnected tonight. Call officer at 9876543210."
        
        valid_upload = io.BytesIO(png_bytes)
        resp_valid = client.post(
            "/api/analyze-screenshot",
            files={"file": ("electricity_notice.png", valid_upload, "image/png")},
        )
        assert resp_valid.status_code == 200, f"Expected 200, got {resp_valid.status_code}"
        data = resp_valid.json()
        assert "electricity" in data["extracted_text"].lower()
        assert "risk_score" in data
        assert "risk_level" in data
        print(f"    ✅ End-to-end analysis succeeded: Risk Level={data['risk_level']}, Score={data['risk_score']}")

    finally:
        ocr_service.extract_text_from_image = original_extract

    # -------------------------------------------------------------
    # Test 8: OCR engine error does NOT leak internal exceptions
    # -------------------------------------------------------------
    print("\n[Test 8] OCR error sanitization without internal exception leakage")
    try:
        def raise_ocr_error(b):
            raise ocr_service.OCRError("OCR text extraction encountered an error while processing the image.")
        
        ocr_service.extract_text_from_image = raise_ocr_error

        valid_upload2 = io.BytesIO(png_bytes)
        resp_ocr_fail = client.post(
            "/api/analyze-screenshot",
            files={"file": ("test_ocr_fail.png", valid_upload2, "image/png")},
        )
        assert resp_ocr_fail.status_code == 503, f"Expected 503, got {resp_ocr_fail.status_code}"
        error_detail = resp_ocr_fail.json()["detail"]
        assert "temporarily unavailable" in error_detail or "currently unavailable" in error_detail
        # Ensure no python traceback, paths, or raw exceptions leak
        assert "Traceback" not in error_detail
        assert "pytesseract" not in error_detail
        assert "/usr" not in error_detail
        print("    ✅ OCR engine failure returned sanitized HTTP 503 without leaking stack traces or internal paths")

    finally:
        ocr_service.extract_text_from_image = original_extract

    print("\n" + "=" * 60)
    print("ALL SCREENSHOT UPLOAD HARDENING & OCR TESTS PASSED! 🛡️")
    print("=" * 60)

if __name__ == "__main__":
    run_screenshot_upload_security_tests()
