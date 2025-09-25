import { Module } from '@nestjs/common';
import { BudgetsController } from './budgets.controller';
import { DataModule } from '@/data/data.module';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [DataModule, AuthModule],
  controllers: [BudgetsController],
})
export class BudgetsModule {}
