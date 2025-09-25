import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '@/config/env.validation';
import axios, { AxiosInstance } from 'axios';

export interface TransactionData {
  id: string;
  account_id: string;
  posted_at: string;
  amount: number;
  merchant_name: string;
  category: string;
  description?: string;
  is_recurring: boolean;
}

export interface AdvancedForecastResponse {
  next_30_day_spend: number;
  next_7_day_spend: number;
  savings_forecast: number;
  confidence_score: number;
  methodology: string;
  trend_direction: string;
  seasonal_factors: Record<string, number>;
  category_forecasts: Array<{
    category: string;
    forecast: number;
    confidence: number;
  }>;
  risk_factors: string[];
}

export interface AnomalyResponse {
  transaction_id: string;
  anomaly_type: string;
  severity: string;
  confidence: number;
  description: string;
  expected_value?: number;
  actual_value: number;
  z_score: number;
  recommendation: string;
}

export interface WeeklySummaryResponse {
  week_start: string;
  week_end: string;
  total_spend: number;
  total_income: number;
  net_change: number;
  spending_by_category: Record<string, number>;
  trend_analysis: Record<string, any>;
  week_over_week_change: number;
  month_over_month_change: number;
  top_merchants: Array<{
    name: string;
    total_spent: number;
    transaction_count: number;
    average_transaction: number;
  }>;
  spending_velocity: number;
  budget_performance: Record<string, any>;
}

export interface RisingPaymentResponse {
  merchant_name: string;
  category: string;
  current_amount: number;
  previous_amount: number;
  increase_percentage: number;
  increase_amount: number;
  frequency: string;
  confidence: number;
  first_detected: string;
  last_payment: string;
  recommendation: string;
}

export interface MerchantTagResponse {
  merchant_name: string;
  original_category: string;
  suggested_category: string;
  confidence: number;
  reasoning: string;
  similar_merchants: string[];
  category_probabilities: Record<string, number>;
}

@Injectable()
export class AiInsightsService {
  private readonly logger = new Logger(AiInsightsService.name);
  private readonly httpClient: AxiosInstance;
  private readonly isEnabled: boolean;

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {
    const aiServiceUrl = this.configService.get<string>('AI_INSIGHTS_SERVICE_URL') || 'http://localhost:5000';
    this.isEnabled = this.configService.get<string>('AI_INSIGHTS_ENABLED') === 'true';

    this.httpClient = axios.create({
      baseURL: aiServiceUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (this.isEnabled) {
      this.logger.log('🤖 AI Insights service enabled');
    } else {
      this.logger.warn('🤖 AI Insights service disabled');
    }
  }

  async getAdvancedForecast(transactions: TransactionData[]): Promise<AdvancedForecastResponse | null> {
    if (!this.isEnabled) {
      return null;
    }

    try {
      this.logger.debug(`Getting advanced forecast for ${transactions.length} transactions`);
      
      const response = await this.httpClient.post<AdvancedForecastResponse>(
        '/forecast/advanced',
        transactions
      );

      this.logger.log(`✅ Advanced forecast generated with ${response.data.confidence_score} confidence`);
      return response.data;

    } catch (error) {
      this.logger.error('❌ Failed to get advanced forecast:', error.message);
      return null;
    }
  }

  async detectAnomalies(transactions: TransactionData[]): Promise<AnomalyResponse[]> {
    if (!this.isEnabled) {
      return [];
    }

    try {
      this.logger.debug(`Detecting anomalies in ${transactions.length} transactions`);
      
      const response = await this.httpClient.post<AnomalyResponse[]>(
        '/anomalies/detect',
        transactions
      );

      this.logger.log(`✅ Detected ${response.data.length} anomalies`);
      return response.data;

    } catch (error) {
      this.logger.error('❌ Failed to detect anomalies:', error.message);
      return [];
    }
  }

  async getWeeklySummary(transactions: TransactionData[]): Promise<WeeklySummaryResponse | null> {
    if (!this.isEnabled) {
      return null;
    }

    try {
      this.logger.debug(`Generating weekly summary for ${transactions.length} transactions`);
      
      const response = await this.httpClient.post<WeeklySummaryResponse>(
        '/insights/weekly-summary',
        transactions
      );

      this.logger.log(`✅ Weekly summary generated for ${response.data.week_start} to ${response.data.week_end}`);
      return response.data;

    } catch (error) {
      this.logger.error('❌ Failed to get weekly summary:', error.message);
      return null;
    }
  }

  async detectRisingPayments(transactions: TransactionData[]): Promise<RisingPaymentResponse[]> {
    if (!this.isEnabled) {
      return [];
    }

    try {
      this.logger.debug(`Detecting rising payments in ${transactions.length} transactions`);
      
      const response = await this.httpClient.post<RisingPaymentResponse[]>(
        '/payments/rising-detection',
        transactions
      );

      this.logger.log(`✅ Detected ${response.data.length} rising payments`);
      return response.data;

    } catch (error) {
      this.logger.error('❌ Failed to detect rising payments:', error.message);
      return [];
    }
  }

  async autoTagMerchants(transactions: TransactionData[]): Promise<MerchantTagResponse[]> {
    if (!this.isEnabled) {
      return [];
    }

    try {
      this.logger.debug(`Auto-tagging merchants for ${transactions.length} transactions`);
      
      const response = await this.httpClient.post<MerchantTagResponse[]>(
        '/merchants/auto-tag',
        transactions
      );

      this.logger.log(`✅ Generated ${response.data.length} merchant tagging suggestions`);
      return response.data;

    } catch (error) {
      this.logger.error('❌ Failed to auto-tag merchants:', error.message);
      return [];
    }
  }

  async checkHealth(): Promise<boolean> {
    if (!this.isEnabled) {
      return false;
    }

    try {
      const response = await this.httpClient.get('/health');
      return response.data.status === 'healthy';
    } catch (error) {
      this.logger.error('❌ AI Insights service health check failed:', error.message);
      return false;
    }
  }

  isServiceEnabled(): boolean {
    return this.isEnabled;
  }
}
