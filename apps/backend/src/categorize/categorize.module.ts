import { Module } from '@nestjs/common';
import { CategorizeController } from './categorize.controller';
import { DataModule } from '@/data/data.module';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [DataModule, AuthModule],
  controllers: [CategorizeController],
})
export class CategorizeModule {}
