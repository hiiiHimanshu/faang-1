import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrototypeDataService } from '@/data/prototype-data.service';

@Injectable()
export class PrototypeAuthGuard implements CanActivate {
  constructor(private readonly data: PrototypeDataService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const header: string | undefined = request.headers['authorization'];

    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const token = header.slice('Bearer '.length).trim();
    if (!token) {
      throw new UnauthorizedException('Empty token');
    }

    const firebaseUid = token;
    const user =
      this.data.getUser(firebaseUid) ??
      this.data.registerUser(firebaseUid, `${firebaseUid}@prototype.local`);
    request.user = { firebaseUid, id: user.id, email: user.email };
    return true;
  }
}
