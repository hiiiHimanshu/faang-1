import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrototypeAuthGuard } from '@/auth/prototype-auth.guard';
import { CurrentUser } from '@/auth/current-user.decorator';
import { PrototypeDataService } from '@/data/prototype-data.service';

@Controller('accounts')
@UseGuards(PrototypeAuthGuard)
export class AccountsController {
  constructor(private readonly data: PrototypeDataService) {}

  @Get()
  list(@CurrentUser() user: { firebaseUid: string } | undefined) {
    if (!user) {
      return { accounts: [] };
    }

    const accounts = this.data.listAccounts(user.firebaseUid);
    return { accounts };
  }
}
