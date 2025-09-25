import { Module } from '@nestjs/common';
import { DataModule } from '@/data/data.module';
import { AuthController } from './auth.controller';
import { PrototypeAuthGuard } from './prototype-auth.guard';

@Module({
  imports: [DataModule],
  controllers: [AuthController],
  providers: [PrototypeAuthGuard],
  exports: [PrototypeAuthGuard],
})
export class AuthModule {}
