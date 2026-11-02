import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from main import app

def test_alerts_endpoints():
    with TestClient(app) as client:
        print("1. Testing GET /api/alerts...")
        resp = client.get("/api/alerts")
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
        data = resp.json()
        assert "total" in data
        assert "items" in data
        assert data["total"] >= 7, f"Expected at least 7 alerts, got {data['total']}"
        first_alert = data["items"][0]
        assert "title" in first_alert
        assert "category" in first_alert
        assert "risk_level" in first_alert
        print(f"   ✅ Fetched {data['total']} alerts. Sample: '{first_alert['title']}'")

        print("2. Testing GET /api/alerts/categories...")
        resp = client.get("/api/alerts/categories")
        assert resp.status_code == 200
        cats = resp.json()
        assert len(cats) >= 5
        assert "Digital Arrest" in cats
        print(f"   ✅ Fetched {len(cats)} categories: {cats}")

        print("3. Testing GET /api/alerts with category filter 'Digital Arrest'...")
        resp = client.get("/api/alerts?category=Digital+Arrest")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] >= 1
        assert all(it["category"] == "Digital Arrest" for it in data["items"])
        print(f"   ✅ Filtered category successfully: {len(data['items'])} matching")

        print("4. Testing GET /api/alerts with search query 'electricity'...")
        resp = client.get("/api/alerts?search=electricity")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] >= 1
        assert "electricity" in data["items"][0]["title"].lower() or "electricity" in data["items"][0]["description"].lower()
        print(f"   ✅ Search query returned matching alerts: {data['items'][0]['title']}")

        print("5. Testing GET /api/alerts/{alert_id} for detail...")
        alert_id = first_alert["id"]
        resp = client.get(f"/api/alerts/{alert_id}")
        assert resp.status_code == 200
        detail = resp.json()
        assert detail["id"] == alert_id
        assert len(detail["warning_signs"]) > 0
        assert len(detail["prevention_tips"]) > 0
        assert "how_it_works" in detail
        assert "source_name" in detail
        print(f"   ✅ Detail endpoint verified with {len(detail['warning_signs'])} warning signs and {len(detail['prevention_tips'])} prevention tips")

        print("6. Testing GET /api/alerts/99999 for 404...")
        resp = client.get("/api/alerts/99999")
        assert resp.status_code == 404
        print("   ✅ Non-existent alert correctly returned 404")

        print("\n🎉 ALL FEATURE 4 (SCAM ALERTS) BACKEND TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_alerts_endpoints()

