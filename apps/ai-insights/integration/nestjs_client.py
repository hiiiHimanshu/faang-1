"""
Integration client for communicating with NestJS backend
"""

import httpx
import asyncio
from typing import List, Dict, Any, Optional
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class NestJSClient:
    """Client for integrating with Atlas Ledger NestJS backend"""
    
    def __init__(self, base_url: str = "http://localhost:4000"):
        self.base_url = base_url.rstrip('/')
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def get_user_transactions(self, user_id: str, limit: int = 1000) -> List[Dict[str, Any]]:
        """Fetch user transactions from NestJS backend"""
        try:
            headers = {"Authorization": f"Bearer {user_id}"}
            response = await self.client.get(
                f"{self.base_url}/transactions",
                headers=headers,
                params={"limit": limit}
            )
            response.raise_for_status()
            
            data = response.json()
            return data.get('transactions', [])
            
        except Exception as e:
            logger.error(f"Failed to fetch transactions for user {user_id}: {str(e)}")
            return []
    
    async def send_insights_update(self, user_id: str, insights: Dict[str, Any]) -> bool:
        """Send AI insights back to NestJS backend"""
        try:
            headers = {
                "Authorization": f"Bearer {user_id}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "user_id": user_id,
                "timestamp": datetime.now().isoformat(),
                "insights": insights,
                "source": "ai-insights-microservice"
            }
            
            response = await self.client.post(
                f"{self.base_url}/insights/ai-update",
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            
            logger.info(f"Successfully sent insights update for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send insights update for user {user_id}: {str(e)}")
            return False
    
    async def notify_anomaly(self, user_id: str, anomaly: Dict[str, Any]) -> bool:
        """Send anomaly notification to NestJS backend"""
        try:
            headers = {
                "Authorization": f"Bearer {user_id}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "user_id": user_id,
                "anomaly": anomaly,
                "timestamp": datetime.now().isoformat(),
                "severity": anomaly.get("severity", "medium")
            }
            
            response = await self.client.post(
                f"{self.base_url}/alerts/anomaly",
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            
            logger.info(f"Successfully sent anomaly notification for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send anomaly notification for user {user_id}: {str(e)}")
            return False
    
    async def update_merchant_categories(self, user_id: str, suggestions: List[Dict[str, Any]]) -> bool:
        """Send merchant categorization suggestions to NestJS backend"""
        try:
            headers = {
                "Authorization": f"Bearer {user_id}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "user_id": user_id,
                "suggestions": suggestions,
                "timestamp": datetime.now().isoformat()
            }
            
            response = await self.client.post(
                f"{self.base_url}/categorize/ai-suggestions",
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            
            logger.info(f"Successfully sent merchant suggestions for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send merchant suggestions for user {user_id}: {str(e)}")
            return False
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()

# Global client instance
nestjs_client = NestJSClient()

async def get_nestjs_client() -> NestJSClient:
    """Dependency injection for NestJS client"""
    return nestjs_client
