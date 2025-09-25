import { Module } from '@nestjs/common';
import { PrototypeDataService } from './prototype-data.service';

@Module({
  providers: [PrototypeDataService],
  exports: [PrototypeDataService],
})
export class DataModule {}
