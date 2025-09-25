#!/bin/bash

# Atlas Ledger AI Insights Microservice Startup Script

echo "🚀 Starting Atlas Ledger AI Insights Microservice..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️ Upgrading pip..."
pip install --upgrade pip

# Install dependencies with fallback versions
echo "📚 Installing dependencies..."
pip install fastapi==0.104.1 || pip install fastapi
pip install "uvicorn[standard]==0.24.0" || pip install uvicorn
pip install pydantic==2.5.0 || pip install pydantic
pip install pydantic-settings==2.1.0 || pip install pydantic-settings
pip install numpy==1.24.3 || pip install numpy
pip install pandas==2.0.3 || pip install pandas
pip install scikit-learn==1.3.0 || pip install scikit-learn
pip install scipy==1.11.1 || pip install scipy
pip install python-dateutil==2.8.2 || pip install python-dateutil
pip install httpx==0.25.0 || pip install httpx
pip install python-multipart==0.0.6 || pip install python-multipart

echo "✅ Dependencies installed successfully!"

# Copy environment file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📄 Creating environment file..."
    cp .env.example .env
fi

# Start the service
echo "🌟 Starting FastAPI service on port 5000..."
python main.py
