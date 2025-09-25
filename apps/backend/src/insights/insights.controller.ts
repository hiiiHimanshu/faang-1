import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PrototypeAuthGuard } from '@/auth/prototype-auth.guard';
import { CurrentUser } from '@/auth/current-user.decorator';
import { PrototypeDataService } from '@/data/prototype-data.service';

@Controller('insights')
@UseGuards(PrototypeAuthGuard)
export class InsightsController {
  constructor(private readonly data: PrototypeDataService) {}

  @Get('summary')
  summary(
    @CurrentUser() user: { firebaseUid: string } | undefined,
    @Query('period') period: 'week' | 'month' = 'month',
    @Query('start') start = new Date().toISOString().slice(0, 10),
  ) {
    if (!user) {
      return {
        totalSpend: 0,
        start,
        end: start,
        byCategory: [],
      };
    }

    return this.data.getSummary(user.firebaseUid, period, start);
  }

  @Get('forecast')
  forecast(@CurrentUser() user: { firebaseUid: string } | undefined) {
    if (!user) {
      return { next30DaySpend: 0, confidence: 0, methodology: 'N/A' };
    }

    return this.data.getForecast(user.firebaseUid);
  }
}
