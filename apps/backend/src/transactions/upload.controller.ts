import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PrototypeAuthGuard } from '@/auth/prototype-auth.guard';
import { CurrentUser } from '@/auth/current-user.decorator';
import { PrototypeDataService } from '@/data/prototype-data.service';

@Controller('transactions')
@UseGuards(PrototypeAuthGuard)
export class TransactionsUploadController {
  constructor(private readonly data: PrototypeDataService) {}

  @Post('upload')
  upload(
    @CurrentUser() user: { firebaseUid: string } | undefined,
    @Body() body: { rows: Array<Record<string, string>> },
  ) {
    if (!user) {
      return { imported: 0 };
    }

    return this.data.uploadTransactions(user.firebaseUid, body.rows ?? []);
  }
}
