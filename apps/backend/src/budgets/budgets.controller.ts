import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PrototypeAuthGuard } from '@/auth/prototype-auth.guard';
import { CurrentUser } from '@/auth/current-user.decorator';
import { PrototypeDataService } from '@/data/prototype-data.service';

@Controller('budgets')
@UseGuards(PrototypeAuthGuard)
export class BudgetsController {
  constructor(private readonly data: PrototypeDataService) {}

  @Post()
  upsert(
    @CurrentUser() user: { firebaseUid: string } | undefined,
    @Body() body: { category: string; monthlyLimit: number },
  ) {
    if (!user) {
      return { budget: null };
    }

    const budget = this.data.upsertBudget(user.firebaseUid, body);
    return { budget };
  }
}
