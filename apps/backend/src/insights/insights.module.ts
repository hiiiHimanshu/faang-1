import { Module } from '@nestjs/common';
import { InsightsController } from './insights.controller';
import { DataModule } from '@/data/data.module';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [DataModule, AuthModule],
  controllers: [InsightsController],
})
export class InsightsModule {}
