import re
import pandas as pd
from typing import List, Dict, Any
from collections import Counter
import logging

from models.schemas import TransactionData, MerchantTagResponse

logger = logging.getLogger(__name__)

class MerchantTaggingService:
    """Intelligent merchant categorization using NLP and pattern matching"""
    
    def __init__(self):
        self.category_keywords = {
            'Food & Dining': [
                'restaurant', 'cafe', 'coffee', 'pizza', 'burger', 'food', 'dining',
                'mcdonalds', 'starbucks', 'subway', 'kfc', 'dominos', 'uber eats',
                'doordash', 'grubhub', 'delivery', 'takeout', 'dine', 'eat'
            ],
            'Transportation': [
                'uber', 'lyft', 'taxi', 'gas', 'fuel', 'shell', 'exxon', 'chevron',
                'bp', 'mobil', 'parking', 'metro', 'bus', 'train', 'airline',
                'flight', 'car rental', 'hertz', 'avis', 'enterprise'
            ],
            'Shopping': [
                'amazon', 'walmart', 'target', 'costco', 'ebay', 'store', 'shop',
                'retail', 'mall', 'clothing', 'shoes', 'electronics', 'best buy',
                'apple store', 'nike', 'adidas', 'h&m', 'zara', 'macys'
            ],
            'Bills & Utilities': [
                'electric', 'electricity', 'water', 'gas utility', 'internet',
                'phone', 'mobile', 'verizon', 'att', 'tmobile', 'comcast',
                'utility', 'bill', 'payment', 'service', 'subscription'
            ],
            'Entertainment': [
                'netflix', 'spotify', 'hulu', 'disney', 'movie', 'theater',
                'cinema', 'game', 'gaming', 'steam', 'playstation', 'xbox',
                'entertainment', 'music', 'streaming', 'youtube', 'twitch'
            ],
            'Healthcare': [
                'hospital', 'doctor', 'medical', 'pharmacy', 'cvs', 'walgreens',
                'health', 'dental', 'vision', 'clinic', 'medicine', 'prescription'
            ],
            'Finance': [
                'bank', 'atm', 'fee', 'interest', 'loan', 'credit', 'investment',
                'transfer', 'deposit', 'withdrawal', 'finance', 'insurance'
            ],
            'Education': [
                'school', 'university', 'college', 'tuition', 'education',
                'learning', 'course', 'training', 'book', 'textbook'
            ]
        }
        
        self.merchant_patterns = {
            r'.*uber.*': 'Transportation',
            r'.*lyft.*': 'Transportation',
            r'.*starbucks.*': 'Food & Dining',
            r'.*mcdonalds.*': 'Food & Dining',
            r'.*amazon.*': 'Shopping',
            r'.*walmart.*': 'Shopping',
            r'.*netflix.*': 'Entertainment',
            r'.*spotify.*': 'Entertainment',
            r'.*cvs.*': 'Healthcare',
            r'.*walgreens.*': 'Healthcare'
        }
        
        logger.info("🏷️ Merchant tagging service initialized")
    
    async def auto_tag_merchants(self, transactions: List[TransactionData]) -> List[MerchantTagResponse]:
        """Intelligently categorize merchants using NLP and ML"""
        try:
            merchant_suggestions = []
            
            # Group transactions by merchant
            merchant_groups = {}
            for txn in transactions:
                merchant = txn.merchant_name.lower().strip()
                if merchant not in merchant_groups:
                    merchant_groups[merchant] = []
                merchant_groups[merchant].append(txn)
            
            # Analyze each merchant
            for merchant, txns in merchant_groups.items():
                suggestion = await self._analyze_merchant(merchant, txns)
                if suggestion:
                    merchant_suggestions.append(suggestion)
            
            return merchant_suggestions
            
        except Exception as e:
            logger.error(f"Merchant tagging error: {str(e)}")
            return []
    
    async def _analyze_merchant(self, merchant: str, transactions: List[TransactionData]) -> MerchantTagResponse:
        """Analyze a specific merchant and suggest category"""
        
        # Get current categories used for this merchant
        current_categories = [txn.category for txn in transactions]
        most_common_category = Counter(current_categories).most_common(1)[0][0]
        
        # Calculate category probabilities
        category_scores = {}
        
        # 1. Pattern matching
        pattern_category = self._match_patterns(merchant)
        if pattern_category:
            category_scores[pattern_category] = category_scores.get(pattern_category, 0) + 0.4
        
        # 2. Keyword matching
        keyword_categories = self._match_keywords(merchant)
        for category, score in keyword_categories.items():
            category_scores[category] = category_scores.get(category, 0) + score
        
        # 3. Transaction amount analysis
        amount_category = self._analyze_amounts(transactions)
        if amount_category:
            category_scores[amount_category] = category_scores.get(amount_category, 0) + 0.2
        
        # 4. Frequency analysis
        frequency_category = self._analyze_frequency(transactions)
        if frequency_category:
            category_scores[frequency_category] = category_scores.get(frequency_category, 0) + 0.1
        
        # Normalize scores
        if category_scores:
            max_score = max(category_scores.values())
            category_probabilities = {
                cat: round(score / max_score, 3) for cat, score in category_scores.items()
            }
            
            # Get best suggestion
            suggested_category = max(category_scores.keys(), key=category_scores.get)
            confidence = category_probabilities[suggested_category]
            
            # Only suggest if confidence is reasonable and different from current
            if confidence > 0.3 and suggested_category != most_common_category:
                return MerchantTagResponse(
                    merchant_name=merchant.title(),
                    original_category=most_common_category,
                    suggested_category=suggested_category,
                    confidence=confidence,
                    reasoning=self._generate_reasoning(merchant, suggested_category, confidence),
                    similar_merchants=self._find_similar_merchants(merchant),
                    category_probabilities=category_probabilities
                )
        
        return None
    
    def _match_patterns(self, merchant: str) -> str:
        """Match merchant against known patterns"""
        for pattern, category in self.merchant_patterns.items():
            if re.match(pattern, merchant, re.IGNORECASE):
                return category
        return None
    
    def _match_keywords(self, merchant: str) -> Dict[str, float]:
        """Match merchant against category keywords"""
        scores = {}
        merchant_words = re.findall(r'\w+', merchant.lower())
        
        for category, keywords in self.category_keywords.items():
            score = 0
            for word in merchant_words:
                for keyword in keywords:
                    if keyword in word or word in keyword:
                        score += 0.1
                        break
            
            if score > 0:
                scores[category] = min(score, 0.3)  # Cap at 0.3
        
        return scores
    
    def _analyze_amounts(self, transactions: List[TransactionData]) -> str:
        """Analyze transaction amounts to infer category"""
        amounts = [abs(txn.amount) for txn in transactions]
        avg_amount = sum(amounts) / len(amounts)
        
        # Amount-based heuristics
        if avg_amount < 10:
            return 'Food & Dining'  # Small purchases often food
        elif avg_amount > 500:
            return 'Bills & Utilities'  # Large amounts often bills
        elif 50 < avg_amount < 200:
            return 'Shopping'  # Medium amounts often shopping
        
        return None
    
    def _analyze_frequency(self, transactions: List[TransactionData]) -> str:
        """Analyze transaction frequency to infer category"""
        if len(transactions) == 1:
            return None
        
        # Check if transactions are recurring (similar amounts, regular intervals)
        amounts = [abs(txn.amount) for txn in transactions]
        dates = [pd.to_datetime(txn.posted_at) for txn in transactions]
        
        # Check for recurring patterns
        amount_std = pd.Series(amounts).std()
        amount_mean = pd.Series(amounts).mean()
        
        if amount_std < amount_mean * 0.1:  # Very consistent amounts
            # Check date intervals
            if len(dates) >= 2:
                intervals = [(dates[i] - dates[i-1]).days for i in range(1, len(dates))]
                avg_interval = sum(intervals) / len(intervals)
                
                if 25 <= avg_interval <= 35:  # Monthly
                    return 'Bills & Utilities'
                elif 6 <= avg_interval <= 8:  # Weekly
                    return 'Food & Dining'
        
        return None
    
    def _generate_reasoning(self, merchant: str, category: str, confidence: float) -> str:
        """Generate human-readable reasoning for the suggestion"""
        reasons = []
        
        # Check what contributed to this categorization
        if self._match_patterns(merchant):
            reasons.append("matches known merchant pattern")
        
        keyword_matches = self._match_keywords(merchant)
        if category in keyword_matches:
            reasons.append("contains relevant keywords")
        
        if confidence > 0.7:
            certainty = "highly confident"
        elif confidence > 0.5:
            certainty = "moderately confident"
        else:
            certainty = "somewhat confident"
        
        reasoning = f"I'm {certainty} this is {category} because it {' and '.join(reasons)}"
        return reasoning
    
    def _find_similar_merchants(self, merchant: str) -> List[str]:
        """Find similar merchants (simplified implementation)"""
        # In a real implementation, this would use more sophisticated similarity matching
        similar = []
        merchant_words = set(re.findall(r'\w+', merchant.lower()))
        
        # Common similar merchants based on keywords
        if 'coffee' in merchant or 'cafe' in merchant:
            similar = ['Starbucks', 'Dunkin', 'Local Coffee Shop']
        elif 'gas' in merchant or 'fuel' in merchant:
            similar = ['Shell', 'Exxon', 'Chevron', 'BP']
        elif 'grocery' in merchant or 'market' in merchant:
            similar = ['Walmart', 'Target', 'Kroger', 'Safeway']
        elif 'restaurant' in merchant or 'food' in merchant:
            similar = ['Local Restaurant', 'Fast Food Chain', 'Delivery Service']
        
        return similar[:3]  # Return top 3
