import { Body, Controller, Post } from '@nestjs/common';
import { PrototypeDataService } from '@/data/prototype-data.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly data: PrototypeDataService) {}

  @Post('register')
  register(@Body() body: { firebaseUid: string; email: string }) {
    const { firebaseUid, email } = body;
    const user = this.data.registerUser(firebaseUid, email);
    return {
      id: user.id,
      firebaseUid: user.firebaseUid,
      email: user.email,
    };
  }
}
