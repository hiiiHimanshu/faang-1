import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrototypeAuthGuard } from '@/auth/prototype-auth.guard';
import { CurrentUser } from '@/auth/current-user.decorator';
import { PrototypeDataService } from '@/data/prototype-data.service';

@Controller('alerts')
@UseGuards(PrototypeAuthGuard)
export class AlertsController {
  constructor(private readonly data: PrototypeDataService) {}

  @Get()
  list(@CurrentUser() user: { firebaseUid: string } | undefined) {
    if (!user) {
      return { alerts: [] };
    }

    return { alerts: this.data.listAlerts(user.firebaseUid) };
  }
}
