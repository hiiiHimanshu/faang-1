import { Module } from '@nestjs/common';
import { AlertsController } from './alerts.controller';
import { DataModule } from '@/data/data.module';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [DataModule, AuthModule],
  controllers: [AlertsController],
})
export class AlertsModule {}
