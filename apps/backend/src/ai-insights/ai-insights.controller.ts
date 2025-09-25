import { Controller, Get, Post, UseGuards, Query } from '@nestjs/common';
import { PrototypeAuthGuard } from '@/auth/prototype-auth.guard';
import { CurrentUser } from '@/auth/current-user.decorator';
import { PrototypeDataService } from '@/data/prototype-data.service';
import { AiInsightsService, TransactionData } from './ai-insights.service';

@Controller('ai-insights')
@UseGuards(PrototypeAuthGuard)
export class AiInsightsController {
  constructor(
    private readonly aiInsightsService: AiInsightsService,
    private readonly dataService: PrototypeDataService,
  ) {}

  @Get('health')
  async getHealth() {
    const isHealthy = await this.aiInsightsService.checkHealth();
    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      enabled: this.aiInsightsService.isServiceEnabled(),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('forecast/advanced')
  async getAdvancedForecast(
    @CurrentUser() user: { firebaseUid: string } | undefined,
    @Query('limit') limit = '100',
  ) {
    if (!user) {
      return { error: 'User not authenticated' };
    }

    // Get user transactions from data service
    const transactions = this.dataService.listTransactions(user.firebaseUid, {
      limit: parseInt(limit),
    });

    // Convert to AI service format
    const aiTransactions: TransactionData[] = transactions.map(txn => ({
      id: txn.id,
      account_id: txn.accountId,
      posted_at: txn.postedAt,
      amount: txn.amount,
      merchant_name: txn.merchantName,
      category: txn.category,
      description: txn.description,
      is_recurring: txn.isRecurring,
    }));

    // Get AI-powered forecast
    const forecast = await this.aiInsightsService.getAdvancedForecast(aiTransactions);
    
    if (!forecast) {
      // Fallback to basic forecast
      return this.dataService.getForecast(user.firebaseUid);
    }

    return forecast;
  }

  @Get('anomalies')
  async getAnomalies(
    @CurrentUser() user: { firebaseUid: string } | undefined,
    @Query('limit') limit = '500',
  ) {
    if (!user) {
      return { anomalies: [] };
    }

    // Get user transactions
    const transactions = this.dataService.listTransactions(user.firebaseUid, {
      limit: parseInt(limit),
    });

    // Convert to AI service format
    const aiTransactions: TransactionData[] = transactions.map(txn => ({
      id: txn.id,
      account_id: txn.accountId,
      posted_at: txn.postedAt,
      amount: txn.amount,
      merchant_name: txn.merchantName,
      category: txn.category,
      description: txn.description,
      is_recurring: txn.isRecurring,
    }));

    // Get AI-powered anomaly detection
    const anomalies = await this.aiInsightsService.detectAnomalies(aiTransactions);

    return { anomalies };
  }

  @Get('weekly-summary')
  async getWeeklySummary(
    @CurrentUser() user: { firebaseUid: string } | undefined,
  ) {
    if (!user) {
      return { error: 'User not authenticated' };
    }

    // Get user transactions
    const transactions = this.dataService.listTransactions(user.firebaseUid, {});

    // Convert to AI service format
    const aiTransactions: TransactionData[] = transactions.map(txn => ({
      id: txn.id,
      account_id: txn.accountId,
      posted_at: txn.postedAt,
      amount: txn.amount,
      merchant_name: txn.merchantName,
      category: txn.category,
      description: txn.description,
      is_recurring: txn.isRecurring,
    }));

    // Get AI-powered weekly summary
    const summary = await this.aiInsightsService.getWeeklySummary(aiTransactions);

    if (!summary) {
      return { error: 'Unable to generate weekly summary' };
    }

    return summary;
  }

  @Get('rising-payments')
  async getRisingPayments(
    @CurrentUser() user: { firebaseUid: string } | undefined,
  ) {
    if (!user) {
      return { rising_payments: [] };
    }

    // Get user transactions
    const transactions = this.dataService.listTransactions(user.firebaseUid, {});

    // Convert to AI service format
    const aiTransactions: TransactionData[] = transactions.map(txn => ({
      id: txn.id,
      account_id: txn.accountId,
      posted_at: txn.postedAt,
      amount: txn.amount,
      merchant_name: txn.merchantName,
      category: txn.category,
      description: txn.description,
      is_recurring: txn.isRecurring,
    }));

    // Get AI-powered rising payment detection
    const risingPayments = await this.aiInsightsService.detectRisingPayments(aiTransactions);

    return { rising_payments: risingPayments };
  }

  @Get('merchant-suggestions')
  async getMerchantSuggestions(
    @CurrentUser() user: { firebaseUid: string } | undefined,
  ) {
    if (!user) {
      return { suggestions: [] };
    }

    // Get user transactions
    const transactions = this.dataService.listTransactions(user.firebaseUid, {});

    // Convert to AI service format
    const aiTransactions: TransactionData[] = transactions.map(txn => ({
      id: txn.id,
      account_id: txn.accountId,
      posted_at: txn.postedAt,
      amount: txn.amount,
      merchant_name: txn.merchantName,
      category: txn.category,
      description: txn.description,
      is_recurring: txn.isRecurring,
    }));

    // Get AI-powered merchant tagging suggestions
    const suggestions = await this.aiInsightsService.autoTagMerchants(aiTransactions);

    return { suggestions };
  }

  @Post('refresh-insights')
  async refreshInsights(
    @CurrentUser() user: { firebaseUid: string } | undefined,
  ) {
    if (!user) {
      return { error: 'User not authenticated' };
    }

    // Get user transactions
    const transactions = this.dataService.listTransactions(user.firebaseUid, {});

    // Convert to AI service format
    const aiTransactions: TransactionData[] = transactions.map(txn => ({
      id: txn.id,
      account_id: txn.accountId,
      posted_at: txn.postedAt,
      amount: txn.amount,
      merchant_name: txn.merchantName,
      category: txn.category,
      description: txn.description,
      is_recurring: txn.isRecurring,
    }));

    // Run all AI analyses
    const [forecast, anomalies, weeklySummary, risingPayments, merchantSuggestions] = await Promise.all([
      this.aiInsightsService.getAdvancedForecast(aiTransactions),
      this.aiInsightsService.detectAnomalies(aiTransactions),
      this.aiInsightsService.getWeeklySummary(aiTransactions),
      this.aiInsightsService.detectRisingPayments(aiTransactions),
      this.aiInsightsService.autoTagMerchants(aiTransactions),
    ]);

    return {
      status: 'success',
      timestamp: new Date().toISOString(),
      insights: {
        forecast,
        anomalies: anomalies.length,
        weekly_summary: !!weeklySummary,
        rising_payments: risingPayments.length,
        merchant_suggestions: merchantSuggestions.length,
      },
    };
  }
}
