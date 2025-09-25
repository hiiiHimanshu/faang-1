import { Module } from '@nestjs/common';
import { AccountsController } from './accounts.controller';
import { DataModule } from '@/data/data.module';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [DataModule, AuthModule],
  controllers: [AccountsController],
})
export class AccountsModule {}
