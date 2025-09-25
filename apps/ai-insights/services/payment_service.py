import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Any
from collections import defaultdict
import logging

from models.schemas import TransactionData, RisingPaymentResponse

logger = logging.getLogger(__name__)

class PaymentAnalysisService:
    """Detect rising payments and recurring payment analysis"""
    
    def __init__(self):
        logger.info("💳 Payment analysis service initialized")
    
    async def detect_rising_payments(self, transactions: List[TransactionData]) -> List[RisingPaymentResponse]:
        """Detect recurring payments with rising amounts"""
        try:
            if len(transactions) < 10:
                return []
            
            # Convert to DataFrame
            df = self._prepare_data(transactions)
            
            # Group by merchant to find recurring patterns
            merchant_groups = df.groupby('merchant')
            rising_payments = []
            
            for merchant, group in merchant_groups:
                if len(group) < 3:  # Need at least 3 transactions to detect trend
                    continue
                
                # Analyze this merchant's payment pattern
                payment_analysis = await self._analyze_merchant_payments(merchant, group)
                if payment_analysis:
                    rising_payments.append(payment_analysis)
            
            # Sort by increase percentage (highest first)
            rising_payments.sort(key=lambda x: x.increase_percentage, reverse=True)
            
            return rising_payments[:10]  # Return top 10
            
        except Exception as e:
            logger.error(f"Rising payment detection error: {str(e)}")
            return []
    
    def _prepare_data(self, transactions: List[TransactionData]) -> pd.DataFrame:
        """Prepare transaction data for payment analysis"""
        data = []
        for txn in transactions:
            # Only analyze negative amounts (spending)
            if txn.amount < 0:
                data.append({
                    'date': pd.to_datetime(txn.posted_at),
                    'amount': abs(txn.amount),
                    'merchant': txn.merchant_name,
                    'category': txn.category,
                    'is_recurring': txn.is_recurring
                })
        
        df = pd.DataFrame(data)
        return df.sort_values('date') if len(df) > 0 else df
    
    async def _analyze_merchant_payments(self, merchant: str, group: pd.DataFrame) -> RisingPaymentResponse:
        """Analyze payment pattern for a specific merchant"""
        
        # Sort by date
        group = group.sort_values('date')
        
        # Check if payments are recurring (similar intervals)
        if not self._is_recurring_pattern(group):
            return None
        
        # Analyze amount trend
        amounts = group['amount'].values
        dates = group['date'].values
        
        # Check for increasing trend
        if len(amounts) < 3:
            return None
        
        # Calculate trend using linear regression
        x = np.arange(len(amounts))
        slope, intercept = np.polyfit(x, amounts, 1)
        
        # Only flag if there's a significant upward trend
        if slope <= 0.5:  # Less than $0.50 increase per payment
            return None
        
        # Calculate statistics
        recent_amount = amounts[-1]
        older_amount = amounts[0]
        increase_amount = recent_amount - older_amount
        increase_percentage = (increase_amount / older_amount) * 100 if older_amount > 0 else 0
        
        # Only flag significant increases
        if increase_percentage < 5:  # Less than 5% increase
            return None
        
        # Determine payment frequency
        frequency = self._determine_frequency(group)
        
        # Calculate confidence based on data quality
        confidence = self._calculate_confidence(group, slope, increase_percentage)
        
        # Generate recommendation
        recommendation = self._generate_recommendation(merchant, increase_percentage, frequency)
        
        return RisingPaymentResponse(
            merchant_name=merchant,
            category=group['category'].iloc[-1],
            current_amount=round(recent_amount, 2),
            previous_amount=round(older_amount, 2),
            increase_percentage=round(increase_percentage, 1),
            increase_amount=round(increase_amount, 2),
            frequency=frequency,
            confidence=confidence,
            first_detected=group['date'].iloc[0].strftime('%Y-%m-%d'),
            last_payment=group['date'].iloc[-1].strftime('%Y-%m-%d'),
            recommendation=recommendation
        )
    
    def _is_recurring_pattern(self, group: pd.DataFrame) -> bool:
        """Check if payments follow a recurring pattern"""
        if len(group) < 3:
            return False
        
        dates = group['date'].values
        intervals = []
        
        for i in range(1, len(dates)):
            interval = (pd.to_datetime(dates[i]) - pd.to_datetime(dates[i-1])).days
            intervals.append(interval)
        
        if not intervals:
            return False
        
        # Check if intervals are relatively consistent
        avg_interval = np.mean(intervals)
        std_interval = np.std(intervals)
        
        # Consider it recurring if:
        # 1. Average interval is between 7-90 days (weekly to quarterly)
        # 2. Standard deviation is less than 30% of average
        if 7 <= avg_interval <= 90 and std_interval < avg_interval * 0.3:
            return True
        
        # Also check for monthly patterns (25-35 days)
        monthly_intervals = [i for i in intervals if 25 <= i <= 35]
        if len(monthly_intervals) >= len(intervals) * 0.7:  # 70% of intervals are monthly
            return True
        
        return False
    
    def _determine_frequency(self, group: pd.DataFrame) -> str:
        """Determine payment frequency"""
        dates = group['date'].values
        if len(dates) < 2:
            return "unknown"
        
        intervals = []
        for i in range(1, len(dates)):
            interval = (pd.to_datetime(dates[i]) - pd.to_datetime(dates[i-1])).days
            intervals.append(interval)
        
        avg_interval = np.mean(intervals)
        
        if avg_interval <= 10:
            return "weekly"
        elif 25 <= avg_interval <= 35:
            return "monthly"
        elif 85 <= avg_interval <= 95:
            return "quarterly"
        elif avg_interval >= 350:
            return "yearly"
        else:
            return f"every_{int(avg_interval)}_days"
    
    def _calculate_confidence(self, group: pd.DataFrame, slope: float, increase_percentage: float) -> float:
        """Calculate confidence in the rising payment detection"""
        confidence = 0.5  # Base confidence
        
        # More data points = higher confidence
        data_points = len(group)
        confidence += min(0.2, data_points / 50)
        
        # Stronger trend = higher confidence
        confidence += min(0.2, slope / 10)
        
        # Higher percentage increase = higher confidence
        confidence += min(0.2, increase_percentage / 100)
        
        # Consistent intervals = higher confidence
        if self._has_consistent_intervals(group):
            confidence += 0.1
        
        return min(0.95, max(0.3, confidence))
    
    def _has_consistent_intervals(self, group: pd.DataFrame) -> bool:
        """Check if payment intervals are consistent"""
        dates = group['date'].values
        if len(dates) < 3:
            return False
        
        intervals = []
        for i in range(1, len(dates)):
            interval = (pd.to_datetime(dates[i]) - pd.to_datetime(dates[i-1])).days
            intervals.append(interval)
        
        std_dev = np.std(intervals)
        mean_interval = np.mean(intervals)
        
        # Consistent if standard deviation is less than 20% of mean
        return std_dev < mean_interval * 0.2 if mean_interval > 0 else False
    
    def _generate_recommendation(self, merchant: str, increase_percentage: float, frequency: str) -> str:
        """Generate recommendation for rising payment"""
        if increase_percentage > 50:
            severity = "significant"
        elif increase_percentage > 20:
            severity = "notable"
        else:
            severity = "moderate"
        
        recommendations = {
            "significant": f"Review your {frequency} payment to {merchant} - it has increased significantly. Consider contacting them about the price change or looking for alternatives.",
            "notable": f"Your {frequency} payment to {merchant} has increased notably. You may want to review your subscription or service plan.",
            "moderate": f"Your {frequency} payment to {merchant} has increased moderately. This could be due to plan changes or price adjustments."
        }
        
        return recommendations.get(severity, f"Monitor your {frequency} payments to {merchant} for continued increases.")
    
    async def _detect_subscription_changes(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Detect subscription plan changes (bonus feature)"""
        # This could be expanded to detect when someone upgrades/downgrades subscriptions
        # by looking for sudden amount changes in recurring payments
        
        subscription_keywords = [
            'netflix', 'spotify', 'hulu', 'disney', 'amazon prime',
            'apple music', 'youtube', 'subscription', 'monthly'
        ]
        
        changes = []
        
        for merchant in df['merchant'].unique():
            merchant_lower = merchant.lower()
            
            # Check if this looks like a subscription service
            is_subscription = any(keyword in merchant_lower for keyword in subscription_keywords)
            
            if is_subscription:
                merchant_data = df[df['merchant'] == merchant].sort_values('date')
                
                if len(merchant_data) >= 2:
                    # Look for sudden amount changes
                    amounts = merchant_data['amount'].values
                    
                    for i in range(1, len(amounts)):
                        prev_amount = amounts[i-1]
                        curr_amount = amounts[i]
                        
                        change_percent = abs(curr_amount - prev_amount) / prev_amount * 100
                        
                        if change_percent > 15:  # 15% change threshold
                            changes.append({
                                'merchant': merchant,
                                'date': merchant_data.iloc[i]['date'].strftime('%Y-%m-%d'),
                                'old_amount': prev_amount,
                                'new_amount': curr_amount,
                                'change_type': 'upgrade' if curr_amount > prev_amount else 'downgrade',
                                'change_percent': round(change_percent, 1)
                            })
        
        return changes
