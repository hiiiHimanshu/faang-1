import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Any
from collections import defaultdict
import logging

from models.schemas import TransactionData, WeeklySummaryResponse

logger = logging.getLogger(__name__)

class TrendAnalysisService:
    """Advanced trend analysis and weekly summaries"""
    
    def __init__(self):
        logger.info("📈 Trend analysis service initialized")
    
    async def generate_weekly_summary(self, transactions: List[TransactionData]) -> WeeklySummaryResponse:
        """Generate comprehensive weekly spending summary with trends"""
        try:
            if not transactions:
                return self._empty_summary()
            
            # Convert to DataFrame and prepare data
            df = self._prepare_data(transactions)
            
            # Get current week boundaries
            latest_date = df['date'].max()
            week_start = latest_date - timedelta(days=latest_date.weekday())
            week_end = week_start + timedelta(days=6)
            
            # Filter to current week
            current_week = df[
                (df['date'] >= week_start) & 
                (df['date'] <= week_end)
            ]
            
            if len(current_week) == 0:
                return self._empty_summary()
            
            # Calculate basic metrics
            total_spend = current_week[current_week['amount'] < 0]['amount'].abs().sum()
            total_income = current_week[current_week['amount'] > 0]['amount'].sum()
            net_change = total_income - total_spend
            
            # Spending by category
            spending_by_category = self._calculate_category_spending(current_week)
            
            # Trend analysis
            trend_analysis = await self._analyze_trends(df, current_week)
            
            # Week-over-week and month-over-month changes
            wow_change = await self._calculate_wow_change(df, week_start)
            mom_change = await self._calculate_mom_change(df, week_start)
            
            # Top merchants
            top_merchants = self._get_top_merchants(current_week)
            
            # Spending velocity (transactions per day)
            spending_velocity = len(current_week) / 7.0
            
            # Budget performance
            budget_performance = await self._analyze_budget_performance(current_week)
            
            return WeeklySummaryResponse(
                week_start=week_start.strftime('%Y-%m-%d'),
                week_end=week_end.strftime('%Y-%m-%d'),
                total_spend=round(total_spend, 2),
                total_income=round(total_income, 2),
                net_change=round(net_change, 2),
                spending_by_category=spending_by_category,
                trend_analysis=trend_analysis,
                week_over_week_change=round(wow_change, 2),
                month_over_month_change=round(mom_change, 2),
                top_merchants=top_merchants,
                spending_velocity=round(spending_velocity, 2),
                budget_performance=budget_performance
            )
            
        except Exception as e:
            logger.error(f"Weekly summary error: {str(e)}")
            return self._empty_summary()
    
    def _prepare_data(self, transactions: List[TransactionData]) -> pd.DataFrame:
        """Prepare transaction data for analysis"""
        data = []
        for txn in transactions:
            data.append({
                'date': pd.to_datetime(txn.posted_at).date(),
                'datetime': pd.to_datetime(txn.posted_at),
                'amount': txn.amount,
                'category': txn.category,
                'merchant': txn.merchant_name,
                'is_recurring': txn.is_recurring
            })
        
        df = pd.DataFrame(data)
        df['date'] = pd.to_datetime(df['date'])
        return df.sort_values('date')
    
    def _calculate_category_spending(self, df: pd.DataFrame) -> Dict[str, float]:
        """Calculate spending by category"""
        spending_data = df[df['amount'] < 0].copy()
        spending_data['abs_amount'] = spending_data['amount'].abs()
        
        category_spending = spending_data.groupby('category')['abs_amount'].sum()
        return {cat: round(amount, 2) for cat, amount in category_spending.items()}
    
    async def _analyze_trends(self, full_df: pd.DataFrame, current_week: pd.DataFrame) -> Dict[str, Any]:
        """Analyze spending trends"""
        trends = {}
        
        # Overall spending trend (last 4 weeks)
        four_weeks_ago = current_week['date'].min() - timedelta(weeks=4)
        recent_data = full_df[full_df['date'] >= four_weeks_ago]
        
        if len(recent_data) > 7:
            # Group by week and calculate weekly spending
            recent_data['week'] = recent_data['date'].dt.isocalendar().week
            weekly_spending = recent_data[recent_data['amount'] < 0].groupby('week')['amount'].apply(lambda x: x.abs().sum())
            
            if len(weekly_spending) >= 2:
                # Calculate trend direction
                trend_slope = np.polyfit(range(len(weekly_spending)), weekly_spending.values, 1)[0]
                
                if trend_slope > 10:
                    trends['overall_direction'] = 'increasing'
                    trends['trend_strength'] = 'strong' if abs(trend_slope) > 50 else 'moderate'
                elif trend_slope < -10:
                    trends['overall_direction'] = 'decreasing'
                    trends['trend_strength'] = 'strong' if abs(trend_slope) > 50 else 'moderate'
                else:
                    trends['overall_direction'] = 'stable'
                    trends['trend_strength'] = 'stable'
                
                trends['weekly_average'] = round(weekly_spending.mean(), 2)
                trends['volatility'] = round(weekly_spending.std(), 2)
        
        # Category trends
        category_trends = {}
        for category in current_week['category'].unique():
            cat_data = recent_data[recent_data['category'] == category]
            if len(cat_data) >= 4:
                cat_weekly = cat_data[cat_data['amount'] < 0].groupby(cat_data['date'].dt.isocalendar().week)['amount'].apply(lambda x: x.abs().sum())
                if len(cat_weekly) >= 2:
                    cat_slope = np.polyfit(range(len(cat_weekly)), cat_weekly.values, 1)[0]
                    if cat_slope > 5:
                        category_trends[category] = 'increasing'
                    elif cat_slope < -5:
                        category_trends[category] = 'decreasing'
                    else:
                        category_trends[category] = 'stable'
        
        trends['category_trends'] = category_trends
        
        # Day of week patterns
        dow_spending = current_week[current_week['amount'] < 0].groupby(current_week['datetime'].dt.day_name())['amount'].apply(lambda x: x.abs().sum())
        trends['busiest_day'] = dow_spending.idxmax() if len(dow_spending) > 0 else 'Unknown'
        trends['quietest_day'] = dow_spending.idxmin() if len(dow_spending) > 0 else 'Unknown'
        
        return trends
    
    async def _calculate_wow_change(self, df: pd.DataFrame, current_week_start: pd.Timestamp) -> float:
        """Calculate week-over-week spending change"""
        # Previous week
        prev_week_start = current_week_start - timedelta(weeks=1)
        prev_week_end = prev_week_start + timedelta(days=6)
        
        prev_week_data = df[
            (df['date'] >= prev_week_start) & 
            (df['date'] <= prev_week_end) &
            (df['amount'] < 0)
        ]
        
        current_week_data = df[
            (df['date'] >= current_week_start) & 
            (df['date'] <= current_week_start + timedelta(days=6)) &
            (df['amount'] < 0)
        ]
        
        prev_spend = prev_week_data['amount'].abs().sum()
        current_spend = current_week_data['amount'].abs().sum()
        
        if prev_spend > 0:
            return ((current_spend - prev_spend) / prev_spend) * 100
        return 0
    
    async def _calculate_mom_change(self, df: pd.DataFrame, current_week_start: pd.Timestamp) -> float:
        """Calculate month-over-month spending change"""
        # Same week last month
        last_month_start = current_week_start - timedelta(weeks=4)
        last_month_end = last_month_start + timedelta(days=6)
        
        last_month_data = df[
            (df['date'] >= last_month_start) & 
            (df['date'] <= last_month_end) &
            (df['amount'] < 0)
        ]
        
        current_week_data = df[
            (df['date'] >= current_week_start) & 
            (df['date'] <= current_week_start + timedelta(days=6)) &
            (df['amount'] < 0)
        ]
        
        last_month_spend = last_month_data['amount'].abs().sum()
        current_spend = current_week_data['amount'].abs().sum()
        
        if last_month_spend > 0:
            return ((current_spend - last_month_spend) / last_month_spend) * 100
        return 0
    
    def _get_top_merchants(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Get top merchants by spending"""
        spending_data = df[df['amount'] < 0].copy()
        spending_data['abs_amount'] = spending_data['amount'].abs()
        
        merchant_spending = spending_data.groupby('merchant').agg({
            'abs_amount': 'sum',
            'amount': 'count'
        }).rename(columns={'amount': 'transaction_count'})
        
        top_merchants = merchant_spending.nlargest(5, 'abs_amount')
        
        result = []
        for merchant, row in top_merchants.iterrows():
            result.append({
                'name': merchant,
                'total_spent': round(row['abs_amount'], 2),
                'transaction_count': int(row['transaction_count']),
                'average_transaction': round(row['abs_amount'] / row['transaction_count'], 2)
            })
        
        return result
    
    async def _analyze_budget_performance(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analyze budget performance (simplified)"""
        # This would integrate with actual budget data in a real implementation
        spending_by_category = self._calculate_category_spending(df)
        
        # Estimated weekly budgets (would come from user settings)
        estimated_weekly_budgets = {
            'Food & Dining': 150,
            'Transportation': 100,
            'Shopping': 200,
            'Bills & Utilities': 300,
            'Entertainment': 75
        }
        
        performance = {}
        for category, spent in spending_by_category.items():
            if category in estimated_weekly_budgets:
                budget = estimated_weekly_budgets[category]
                utilization = (spent / budget) * 100
                
                if utilization > 100:
                    status = 'over_budget'
                elif utilization > 80:
                    status = 'near_limit'
                else:
                    status = 'on_track'
                
                performance[category] = {
                    'budgeted': budget,
                    'spent': spent,
                    'remaining': max(0, budget - spent),
                    'utilization_percent': round(utilization, 1),
                    'status': status
                }
        
        return performance
    
    def _empty_summary(self) -> WeeklySummaryResponse:
        """Return empty summary when no data available"""
        today = datetime.now().date()
        week_start = today - timedelta(days=today.weekday())
        week_end = week_start + timedelta(days=6)
        
        return WeeklySummaryResponse(
            week_start=week_start.strftime('%Y-%m-%d'),
            week_end=week_end.strftime('%Y-%m-%d'),
            total_spend=0,
            total_income=0,
            net_change=0,
            spending_by_category={},
            trend_analysis={'message': 'Insufficient data for trend analysis'},
            week_over_week_change=0,
            month_over_month_change=0,
            top_merchants=[],
            spending_velocity=0,
            budget_performance={}
        )
