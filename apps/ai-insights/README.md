# Atlas Ledger AI Insights Microservice

Advanced AI-powered financial insights microservice built with FastAPI, providing sophisticated analytics and machine learning capabilities for the Atlas Ledger personal finance platform.

## 🚀 Features

### Advanced Forecasting
- **ML-Powered Predictions**: Linear regression models with seasonal decomposition
- **Multi-Timeframe Forecasts**: 7-day and 30-day spending predictions
- **Savings Forecasting**: Predictive savings analysis based on income/expense trends
- **Category-Specific Forecasts**: Individual predictions for each spending category
- **Risk Factor Analysis**: Identification of potential financial risks

### Intelligent Anomaly Detection
- **Statistical Analysis**: Z-score based anomaly detection
- **Machine Learning**: Isolation Forest for pattern-based anomalies
- **Merchant-Specific Detection**: Unusual spending patterns per merchant
- **Temporal Anomalies**: Detection of unusual transaction timing
- **Multi-Severity Classification**: Low, medium, and high severity anomalies

### Smart Merchant Tagging
- **NLP-Based Categorization**: Natural language processing for merchant analysis
- **Pattern Matching**: Advanced regex and keyword matching
- **Confidence Scoring**: AI confidence levels for categorization suggestions
- **Similar Merchant Detection**: Finding related merchants for better categorization

### Trend Analysis & Weekly Summaries
- **Comprehensive Weekly Reports**: Detailed spending analysis with trends
- **Week-over-Week Comparisons**: Spending change analysis
- **Month-over-Month Tracking**: Long-term trend identification
- **Category Trend Analysis**: Individual category performance tracking
- **Budget Performance Monitoring**: Automated budget utilization analysis

### Rising Payment Detection
- **Subscription Monitoring**: Detection of increasing recurring payments
- **Frequency Analysis**: Automatic payment frequency identification
- **Trend Calculation**: Statistical analysis of payment increases
- **Alert Generation**: Proactive notifications for rising costs

## 🛠️ Technology Stack

- **FastAPI**: High-performance async web framework
- **Pandas & NumPy**: Data manipulation and numerical computing
- **Scikit-learn**: Machine learning algorithms
- **SciPy**: Statistical analysis and scientific computing
- **Pydantic**: Data validation and serialization
- **Uvicorn**: ASGI server for production deployment

## 📦 Installation

### Prerequisites
- Python 3.11+
- pip or conda

### Local Development

1. **Clone and navigate to the microservice directory**:
   ```bash
   cd apps/ai-insights
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the service**:
   ```bash
   python main.py
   ```

The service will be available at `http://localhost:5000`

### Docker Deployment

1. **Build the Docker image**:
   ```bash
   docker build -t atlas-ai-insights .
   ```

2. **Run the container**:
   ```bash
   docker run -p 5000:5000 atlas-ai-insights
   ```

## 🔌 API Endpoints

### Health Check
```http
GET /health
```
Returns service health status and active components.

### Advanced Forecasting
```http
POST /forecast/advanced
Content-Type: application/json

[
  {
    "id": "txn_123",
    "account_id": "acc_456",
    "posted_at": "2024-01-15T10:30:00Z",
    "amount": -45.67,
    "merchant_name": "Starbucks",
    "category": "Food & Dining",
    "description": "Coffee purchase",
    "is_recurring": false
  }
]
```

### Anomaly Detection
```http
POST /anomalies/detect
Content-Type: application/json

[transaction_data_array]
```

### Weekly Summary
```http
POST /insights/weekly-summary
Content-Type: application/json

[transaction_data_array]
```

### Rising Payment Detection
```http
POST /payments/rising-detection
Content-Type: application/json

[transaction_data_array]
```

### Merchant Auto-Tagging
```http
POST /merchants/auto-tag
Content-Type: application/json

[transaction_data_array]
```

## 🔗 Integration with Atlas Ledger

### NestJS Backend Integration

The FastAPI microservice integrates with the existing NestJS backend by replacing the basic implementations in `prototype-data.service.ts` with sophisticated ML-powered analysis.

#### Example Integration Code (NestJS):

```typescript
// In your insights.service.ts
import { Injectable, HttpService } from '@nestjs/common';

@Injectable()
export class EnhancedInsightsService {
  constructor(private httpService: HttpService) {}

  async getAdvancedForecast(transactions: TransactionData[]) {
    const response = await this.httpService.post(
      'http://localhost:5000/forecast/advanced',
      transactions
    ).toPromise();
    
    return response.data;
  }

  async detectAnomalies(transactions: TransactionData[]) {
    const response = await this.httpService.post(
      'http://localhost:5000/anomalies/detect',
      transactions
    ).toPromise();
    
    return response.data;
  }
}
```

### Environment Configuration

Add to your NestJS `.env` file:
```env
AI_INSIGHTS_SERVICE_URL=http://localhost:5000
AI_INSIGHTS_ENABLED=true
```

## 📊 Response Examples

### Forecast Response
```json
{
  "next_30_day_spend": 1250.75,
  "next_7_day_spend": 287.50,
  "savings_forecast": 450.25,
  "confidence_score": 0.82,
  "methodology": "Advanced ML with Linear Regression, Seasonal Decomposition, and Trend Analysis",
  "trend_direction": "increasing",
  "seasonal_factors": {
    "monday": 0.95,
    "tuesday": 0.88,
    "wednesday": 0.92,
    "thursday": 1.05,
    "friday": 1.25,
    "saturday": 1.35,
    "sunday": 1.10
  },
  "category_forecasts": [
    {
      "category": "Food & Dining",
      "forecast": 375.50,
      "confidence": 0.78
    }
  ],
  "risk_factors": [
    "weekend_overspending",
    "increasing_spending_trend"
  ]
}
```

### Anomaly Response
```json
[
  {
    "transaction_id": "txn_123",
    "anomaly_type": "unusual_amount",
    "severity": "high",
    "confidence": 0.89,
    "description": "Transaction amount $450.00 is unusually high",
    "expected_value": 125.50,
    "actual_value": 450.00,
    "z_score": 3.2,
    "recommendation": "Review this $450.00 transaction at Premium Electronics"
  }
]
```

## 🔧 Configuration

### Model Parameters

The service uses configurable parameters for ML models:

- **Anomaly Detection Threshold**: Z-score > 3.0 for statistical anomalies
- **Isolation Forest Contamination**: 10% expected anomaly rate
- **Forecast Confidence Minimum**: 30% minimum confidence score
- **Rising Payment Threshold**: 5% minimum increase to flag

### Performance Tuning

- **Batch Processing**: Handles up to 10,000 transactions per request
- **Memory Optimization**: Efficient pandas operations with chunking
- **Caching**: In-memory caching for repeated merchant analysis
- **Async Processing**: Non-blocking operations for better performance

## 🚦 Monitoring & Logging

The service includes comprehensive logging:

```python
import logging

# Configure logging level
logging.basicConfig(level=logging.INFO)

# Service logs include:
# - Request/response timing
# - Model performance metrics
# - Error tracking and debugging
# - Resource usage monitoring
```

## 🔒 Security Considerations

- **Input Validation**: Pydantic models ensure data integrity
- **Rate Limiting**: Configurable request rate limits
- **CORS Configuration**: Restricted to Atlas Ledger domains
- **Data Privacy**: No persistent storage of transaction data

## 🧪 Testing

Run tests with:
```bash
pytest tests/ -v
```

## 📈 Performance Metrics

- **Response Time**: < 500ms for most endpoints
- **Throughput**: 100+ requests/second
- **Memory Usage**: < 512MB for typical workloads
- **CPU Usage**: Optimized for multi-core processing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

This microservice is part of the Atlas Ledger project and follows the same licensing terms.
