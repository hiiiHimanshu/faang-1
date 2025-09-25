#!/usr/bin/env python3
"""
Production runner for AI Insights microservice
"""

import uvicorn
import os
from config import settings

if __name__ == "__main__":
    # Configure uvicorn for production
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        workers=settings.workers,
        log_level=settings.log_level.lower(),
        reload=settings.debug,
        access_log=True
    )
