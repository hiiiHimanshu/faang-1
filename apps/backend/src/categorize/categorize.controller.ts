import { Controller, Post, UseGuards } from '@nestjs/common';
import { PrototypeAuthGuard } from '@/auth/prototype-auth.guard';
import { CurrentUser } from '@/auth/current-user.decorator';
import { PrototypeDataService } from '@/data/prototype-data.service';

@Controller('categorize')
@UseGuards(PrototypeAuthGuard)
export class CategorizeController {
  constructor(private readonly data: PrototypeDataService) {}

  @Post('rebuild')
  rebuild(@CurrentUser() user: { firebaseUid: string } | undefined) {
    if (!user) {
      return { updated: 0 };
    }

    return this.data.rebuildCategories(user.firebaseUid);
  }
}
