import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { TransactionsUploadController } from './upload.controller';
import { DataModule } from '@/data/data.module';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [DataModule, AuthModule],
  controllers: [TransactionsController, TransactionsUploadController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
