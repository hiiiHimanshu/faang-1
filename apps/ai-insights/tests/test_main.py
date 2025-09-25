"""
Tests for the main FastAPI application
"""

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_check():
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "services" in data
    assert "timestamp" in data

def test_forecast_endpoint():
    """Test forecast endpoint with sample data"""
    sample_transactions = [
        {
            "id": "txn_1",
            "account_id": "acc_1",
            "posted_at": "2024-01-15T10:30:00Z",
            "amount": -45.67,
            "merchant_name": "Starbucks",
            "category": "Food & Dining",
            "description": "Coffee purchase",
            "is_recurring": False
        },
        {
            "id": "txn_2",
            "account_id": "acc_1",
            "posted_at": "2024-01-16T14:20:00Z",
            "amount": -125.50,
            "merchant_name": "Grocery Store",
            "category": "Groceries",
            "description": "Weekly shopping",
            "is_recurring": False
        }
    ]
    
    response = client.post("/forecast/advanced", json=sample_transactions)
    assert response.status_code == 200
    data = response.json()
    assert "next_30_day_spend" in data
    assert "confidence_score" in data
    assert "methodology" in data

def test_anomaly_detection():
    """Test anomaly detection endpoint"""
    sample_transactions = [
        {
            "id": "txn_1",
            "account_id": "acc_1",
            "posted_at": "2024-01-15T10:30:00Z",
            "amount": -45.67,
            "merchant_name": "Starbucks",
            "category": "Food & Dining",
            "is_recurring": False
        }
    ]
    
    response = client.post("/anomalies/detect", json=sample_transactions)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_weekly_summary():
    """Test weekly summary endpoint"""
    sample_transactions = [
        {
            "id": "txn_1",
            "account_id": "acc_1",
            "posted_at": "2024-01-15T10:30:00Z",
            "amount": -45.67,
            "merchant_name": "Starbucks",
            "category": "Food & Dining",
            "is_recurring": False
        }
    ]
    
    response = client.post("/insights/weekly-summary", json=sample_transactions)
    assert response.status_code == 200
    data = response.json()
    assert "week_start" in data
    assert "total_spend" in data
    assert "spending_by_category" in data

def test_merchant_tagging():
    """Test merchant auto-tagging endpoint"""
    sample_transactions = [
        {
            "id": "txn_1",
            "account_id": "acc_1",
            "posted_at": "2024-01-15T10:30:00Z",
            "amount": -45.67,
            "merchant_name": "Unknown Coffee Shop",
            "category": "Uncategorized",
            "is_recurring": False
        }
    ]
    
    response = client.post("/merchants/auto-tag", json=sample_transactions)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_rising_payments():
    """Test rising payment detection endpoint"""
    sample_transactions = [
        {
            "id": "txn_1",
            "account_id": "acc_1",
            "posted_at": "2024-01-15T10:30:00Z",
            "amount": -9.99,
            "merchant_name": "Netflix",
            "category": "Entertainment",
            "is_recurring": True
        },
        {
            "id": "txn_2",
            "account_id": "acc_1",
            "posted_at": "2024-02-15T10:30:00Z",
            "amount": -12.99,
            "merchant_name": "Netflix",
            "category": "Entertainment",
            "is_recurring": True
        }
    ]
    
    response = client.post("/payments/rising-detection", json=sample_transactions)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
