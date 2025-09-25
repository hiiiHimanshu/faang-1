import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PrototypeAuthGuard } from '@/auth/prototype-auth.guard';
import { CurrentUser } from '@/auth/current-user.decorator';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
@UseGuards(PrototypeAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  async listTransactions(
    @CurrentUser() user: { firebaseUid: string } | undefined,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('cat') category?: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit
      ? Math.min(Number.parseInt(limit, 10) || 10, 50)
      : 10;
    const transactions = await this.transactionsService.listRecentTransactions({
      firebaseUid: user?.firebaseUid,
      limit: parsedLimit,
      from,
      to,
      category,
    });
    return { transactions };
  }
}
