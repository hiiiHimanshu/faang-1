import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validateEnvironment } from './config/env.validation';
import { DataModule } from './data/data.module';
import { AuthModule } from './auth/auth.module';
import { TransactionsModule } from './transactions/transactions.module';
import { AccountsModule } from './accounts/accounts.module';
import { AlertsModule } from './alerts/alerts.module';
import { BudgetsModule } from './budgets/budgets.module';
import { InsightsModule } from './insights/insights.module';
import { CategorizeModule } from './categorize/categorize.module';
import { AiInsightsModule } from './ai-insights/ai-insights.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnvironment,
    }),
    DataModule,
    AuthModule,
    AccountsModule,
    TransactionsModule,
    AlertsModule,
    BudgetsModule,
    InsightsModule,
    CategorizeModule,
    AiInsightsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
