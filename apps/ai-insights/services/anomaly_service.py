import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict, Any
from scipy import stats
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import logging

from models.schemas import TransactionData, AnomalyResponse, AnomalyType

logger = logging.getLogger(__name__)

class AnomalyDetectionService:
    """Advanced anomaly detection using statistical and ML methods"""
    
    def __init__(self):
        self.isolation_forest = IsolationForest(contamination=0.1, random_state=42)
        self.scaler = StandardScaler()
        self.merchant_profiles = {}
        logger.info("🔍 Anomaly detection service initialized")
    
    async def detect_anomalies(self, transactions: List[TransactionData]) -> List[AnomalyResponse]:
        """Detect anomalies using multiple methods"""
        try:
            if len(transactions) < 10:
                return []
            
            # Convert to DataFrame
            df = self._prepare_data(transactions)
            
            anomalies = []
            
            # 1. Statistical anomalies (Z-score based)
            statistical_anomalies = await self._detect_statistical_anomalies(df)
            anomalies.extend(statistical_anomalies)
            
            # 2. ML-based anomalies (Isolation Forest)
            ml_anomalies = await self._detect_ml_anomalies(df)
            anomalies.extend(ml_anomalies)
            
            # 3. Merchant-specific anomalies
            merchant_anomalies = await self._detect_merchant_anomalies(df)
            anomalies.extend(merchant_anomalies)
            
            # 4. Temporal anomalies
            temporal_anomalies = await self._detect_temporal_anomalies(df)
            anomalies.extend(temporal_anomalies)
            
            # Remove duplicates and sort by severity
            unique_anomalies = self._deduplicate_anomalies(anomalies)
            
            return sorted(unique_anomalies, key=lambda x: x.confidence, reverse=True)
            
        except Exception as e:
            logger.error(f"Anomaly detection error: {str(e)}")
            return []
    
    def _prepare_data(self, transactions: List[TransactionData]) -> pd.DataFrame:
        """Prepare transaction data for anomaly detection"""
        data = []
        for txn in transactions:
            data.append({
                'id': txn.id,
                'date': pd.to_datetime(txn.posted_at),
                'amount': abs(txn.amount),
                'category': txn.category,
                'merchant': txn.merchant_name,
                'is_recurring': txn.is_recurring,
                'hour': pd.to_datetime(txn.posted_at).hour,
                'day_of_week': pd.to_datetime(txn.posted_at).dayofweek,
                'day_of_month': pd.to_datetime(txn.posted_at).day
            })
        
        df = pd.DataFrame(data)
        return df.sort_values('date')
    
    async def _detect_statistical_anomalies(self, df: pd.DataFrame) -> List[AnomalyResponse]:
        """Detect anomalies using statistical methods (Z-score)"""
        anomalies = []
        
        # Overall amount anomalies
        amounts = df['amount'].values
        z_scores = np.abs(stats.zscore(amounts))
        
        # Threshold for anomaly (3 standard deviations)
        threshold = 3.0
        
        for idx, z_score in enumerate(z_scores):
            if z_score > threshold:
                row = df.iloc[idx]
                expected_amount = amounts.mean()
                
                severity = self._calculate_severity(z_score, threshold)
                confidence = min(0.95, z_score / 5.0)  # Cap at 95%
                
                anomalies.append(AnomalyResponse(
                    transaction_id=row['id'],
                    anomaly_type=AnomalyType.UNUSUAL_AMOUNT,
                    severity=severity,
                    confidence=confidence,
                    description=f"Transaction amount ${row['amount']:.2f} is unusually high",
                    expected_value=expected_amount,
                    actual_value=row['amount'],
                    z_score=z_score,
                    recommendation=f"Review this ${row['amount']:.2f} transaction at {row['merchant']}"
                ))
        
        # Category-specific anomalies
        for category in df['category'].unique():
            category_data = df[df['category'] == category]
            if len(category_data) < 3:
                continue
                
            cat_amounts = category_data['amount'].values
            cat_z_scores = np.abs(stats.zscore(cat_amounts))
            
            for idx, z_score in enumerate(cat_z_scores):
                if z_score > 2.5:  # Lower threshold for category-specific
                    row = category_data.iloc[idx]
                    expected_amount = cat_amounts.mean()
                    
                    severity = self._calculate_severity(z_score, 2.5)
                    confidence = min(0.90, z_score / 4.0)
                    
                    anomalies.append(AnomalyResponse(
                        transaction_id=row['id'],
                        anomaly_type=AnomalyType.UNUSUAL_AMOUNT,
                        severity=severity,
                        confidence=confidence,
                        description=f"Unusual {category} spending: ${row['amount']:.2f}",
                        expected_value=expected_amount,
                        actual_value=row['amount'],
                        z_score=z_score,
                        recommendation=f"This {category} transaction is {z_score:.1f}x above normal"
                    ))
        
        return anomalies
    
    async def _detect_ml_anomalies(self, df: pd.DataFrame) -> List[AnomalyResponse]:
        """Detect anomalies using Isolation Forest"""
        if len(df) < 20:
            return []
        
        anomalies = []
        
        # Prepare features for ML
        features = df[['amount', 'hour', 'day_of_week', 'day_of_month']].copy()
        
        # Add merchant frequency
        merchant_counts = df['merchant'].value_counts()
        features['merchant_frequency'] = df['merchant'].map(merchant_counts)
        
        # Add category frequency
        category_counts = df['category'].value_counts()
        features['category_frequency'] = df['category'].map(category_counts)
        
        # Scale features
        features_scaled = self.scaler.fit_transform(features)
        
        # Detect anomalies
        anomaly_labels = self.isolation_forest.fit_predict(features_scaled)
        anomaly_scores = self.isolation_forest.decision_function(features_scaled)
        
        for idx, (label, score) in enumerate(zip(anomaly_labels, anomaly_scores)):
            if label == -1:  # Anomaly detected
                row = df.iloc[idx]
                
                # Convert score to confidence (more negative = more anomalous)
                confidence = min(0.95, abs(score) * 2)
                severity = self._calculate_severity_from_score(score)
                
                anomalies.append(AnomalyResponse(
                    transaction_id=row['id'],
                    anomaly_type=AnomalyType.UNUSUAL_MERCHANT,
                    severity=severity,
                    confidence=confidence,
                    description=f"ML detected unusual transaction pattern at {row['merchant']}",
                    expected_value=None,
                    actual_value=row['amount'],
                    z_score=score,
                    recommendation=f"Review this transaction - unusual for your spending patterns"
                ))
        
        return anomalies
    
    async def _detect_merchant_anomalies(self, df: pd.DataFrame) -> List[AnomalyResponse]:
        """Detect merchant-specific anomalies"""
        anomalies = []
        
        # Build merchant profiles
        merchant_profiles = {}
        for merchant in df['merchant'].unique():
            merchant_data = df[df['merchant'] == merchant]
            if len(merchant_data) >= 2:
                merchant_profiles[merchant] = {
                    'avg_amount': merchant_data['amount'].mean(),
                    'std_amount': merchant_data['amount'].std(),
                    'typical_categories': merchant_data['category'].mode().tolist(),
                    'transaction_count': len(merchant_data)
                }
        
        # Check each transaction against merchant profile
        for _, row in df.iterrows():
            merchant = row['merchant']
            if merchant in merchant_profiles:
                profile = merchant_profiles[merchant]
                
                # Check amount anomaly for this merchant
                if profile['std_amount'] > 0:
                    z_score = abs(row['amount'] - profile['avg_amount']) / profile['std_amount']
                    
                    if z_score > 2.0 and profile['transaction_count'] >= 3:
                        severity = self._calculate_severity(z_score, 2.0)
                        confidence = min(0.85, z_score / 3.0)
                        
                        anomalies.append(AnomalyResponse(
                            transaction_id=row['id'],
                            anomaly_type=AnomalyType.UNUSUAL_AMOUNT,
                            severity=severity,
                            confidence=confidence,
                            description=f"Unusual amount for {merchant}: ${row['amount']:.2f}",
                            expected_value=profile['avg_amount'],
                            actual_value=row['amount'],
                            z_score=z_score,
                            recommendation=f"This amount is unusual for {merchant} (typical: ${profile['avg_amount']:.2f})"
                        ))
        
        return anomalies
    
    async def _detect_temporal_anomalies(self, df: pd.DataFrame) -> List[AnomalyResponse]:
        """Detect time-based anomalies"""
        anomalies = []
        
        # Unusual timing (very late/early transactions)
        for _, row in df.iterrows():
            hour = row['hour']
            
            # Flag transactions between 2 AM and 5 AM as potentially unusual
            if 2 <= hour <= 5:
                anomalies.append(AnomalyResponse(
                    transaction_id=row['id'],
                    anomaly_type=AnomalyType.UNUSUAL_TIMING,
                    severity="medium",
                    confidence=0.70,
                    description=f"Transaction at unusual time: {hour:02d}:00",
                    expected_value=None,
                    actual_value=hour,
                    z_score=0,
                    recommendation="Verify this transaction wasn't unauthorized"
                ))
        
        # Frequency anomalies (too many transactions in short period)
        df_sorted = df.sort_values('date')
        for i in range(len(df_sorted) - 4):
            # Check for 5+ transactions within 1 hour
            window = df_sorted.iloc[i:i+5]
            time_span = (window['date'].max() - window['date'].min()).total_seconds() / 3600
            
            if time_span <= 1.0:  # 5 transactions within 1 hour
                for _, row in window.iterrows():
                    anomalies.append(AnomalyResponse(
                        transaction_id=row['id'],
                        anomaly_type=AnomalyType.UNUSUAL_FREQUENCY,
                        severity="high",
                        confidence=0.80,
                        description="High transaction frequency detected",
                        expected_value=None,
                        actual_value=5,
                        z_score=0,
                        recommendation="Multiple transactions in short time - verify legitimacy"
                    ))
                break  # Don't flag overlapping windows
        
        return anomalies
    
    def _calculate_severity(self, z_score: float, threshold: float) -> str:
        """Calculate severity based on Z-score"""
        if z_score > threshold * 2:
            return "high"
        elif z_score > threshold * 1.5:
            return "medium"
        else:
            return "low"
    
    def _calculate_severity_from_score(self, score: float) -> str:
        """Calculate severity from ML anomaly score"""
        if score < -0.3:
            return "high"
        elif score < -0.1:
            return "medium"
        else:
            return "low"
    
    def _deduplicate_anomalies(self, anomalies: List[AnomalyResponse]) -> List[AnomalyResponse]:
        """Remove duplicate anomalies for the same transaction"""
        seen_transactions = set()
        unique_anomalies = []
        
        # Sort by confidence to keep the highest confidence anomaly for each transaction
        sorted_anomalies = sorted(anomalies, key=lambda x: x.confidence, reverse=True)
        
        for anomaly in sorted_anomalies:
            if anomaly.transaction_id not in seen_transactions:
                unique_anomalies.append(anomaly)
                seen_transactions.add(anomaly.transaction_id)
        
        return unique_anomalies
