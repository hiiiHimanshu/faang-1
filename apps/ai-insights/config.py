"""
Configuration settings for AI Insights microservice
"""

import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Application settings"""
    
    # Service Configuration
    service_name: str = "atlas-ai-insights"
    service_version: str = "1.0.0"
    debug: bool = False
    
    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 5000
    workers: int = 1
    
    # CORS Configuration
    allowed_origins: List[str] = ["http://localhost:3000", "http://localhost:4000"]
    
    # Logging Configuration
    log_level: str = "INFO"
    log_format: str = "json"
    
    # ML Model Configuration
    anomaly_threshold: float = 3.0
    isolation_forest_contamination: float = 0.1
    min_forecast_confidence: float = 0.3
    rising_payment_threshold: float = 5.0
    
    # Performance Configuration
    max_transactions_per_request: int = 10000
    request_timeout: int = 30
    cache_ttl: int = 300
    
    # Integration Configuration
    nestjs_backend_url: str = "http://localhost:4000"
    frontend_url: str = "http://localhost:3000"
    
    class Config:
        env_file = ".env"
        case_sensitive = False

# Global settings instance
settings = Settings()
