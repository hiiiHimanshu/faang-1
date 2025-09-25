from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import logging

from models.schemas import (
    TransactionData, 
    ForecastResponse, 
    AnomalyResponse, 
    WeeklySummaryResponse,
    RisingPaymentResponse,
    MerchantTagResponse
)
from services.forecasting_service import ForecastingService
from services.anomaly_service import AnomalyDetectionService
from services.merchant_service import MerchantTaggingService
from services.trend_service import TrendAnalysisService
from services.payment_service import PaymentAnalysisService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global services
forecasting_service = None
anomaly_service = None
merchant_service = None
trend_service = None
payment_service = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    global forecasting_service, anomaly_service, merchant_service, trend_service, payment_service
    
    logger.info("🚀 Initializing AI Insights Microservice...")
    
    # Initialize services
    forecasting_service = ForecastingService()
    anomaly_service = AnomalyDetectionService()
    merchant_service = MerchantTaggingService()
    trend_service = TrendAnalysisService()
    payment_service = PaymentAnalysisService()
    
    logger.info("✅ All services initialized successfully")
    
    yield
    
    # Shutdown
    logger.info("🔄 Shutting down AI Insights Microservice...")

app = FastAPI(
    title="Atlas Ledger AI Insights",
    description="Advanced AI-powered financial insights microservice",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:4000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "forecasting": "active",
            "anomaly_detection": "active",
            "merchant_tagging": "active",
            "trend_analysis": "active",
            "payment_analysis": "active"
        }
    }

@app.post("/forecast/advanced", response_model=ForecastResponse)
async def get_advanced_forecast(transactions: List[TransactionData]):
    """
    Generate advanced ML-powered spending forecast
    """
    try:
        forecast = await forecasting_service.generate_forecast(transactions)
        return forecast
    except Exception as e:
        logger.error(f"Forecasting error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Forecasting failed: {str(e)}")

@app.post("/anomalies/detect", response_model=List[AnomalyResponse])
async def detect_anomalies(transactions: List[TransactionData]):
    """
    Detect spending anomalies using advanced statistical methods
    """
    try:
        anomalies = await anomaly_service.detect_anomalies(transactions)
        return anomalies
    except Exception as e:
        logger.error(f"Anomaly detection error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Anomaly detection failed: {str(e)}")

@app.post("/insights/weekly-summary", response_model=WeeklySummaryResponse)
async def get_weekly_summary(transactions: List[TransactionData]):
    """
    Generate comprehensive weekly spending summary with trends
    """
    try:
        summary = await trend_service.generate_weekly_summary(transactions)
        return summary
    except Exception as e:
        logger.error(f"Weekly summary error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Weekly summary failed: {str(e)}")

@app.post("/payments/rising-detection", response_model=List[RisingPaymentResponse])
async def detect_rising_payments(transactions: List[TransactionData]):
    """
    Detect recurring payments with rising amounts
    """
    try:
        rising_payments = await payment_service.detect_rising_payments(transactions)
        return rising_payments
    except Exception as e:
        logger.error(f"Rising payment detection error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Rising payment detection failed: {str(e)}")

@app.post("/merchants/auto-tag", response_model=List[MerchantTagResponse])
async def auto_tag_merchants(transactions: List[TransactionData]):
    """
    Intelligently categorize merchants using NLP and ML
    """
    try:
        tagged_merchants = await merchant_service.auto_tag_merchants(transactions)
        return tagged_merchants
    except Exception as e:
        logger.error(f"Merchant tagging error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Merchant tagging failed: {str(e)}")

@app.get("/insights/streaming/{user_id}")
async def stream_insights(user_id: str):
    """
    Real-time streaming endpoint for live insights (WebSocket alternative)
    """
    # This would typically be a WebSocket endpoint
    # For now, return current insights
    return {
        "user_id": user_id,
        "timestamp": datetime.now().isoformat(),
        "message": "Streaming insights endpoint - would be WebSocket in production"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=5000,
        reload=True,
        log_level="info"
    )
