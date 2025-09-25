import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  async getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: 'mock',
        firebaseAuth: 'mock',
      },
    } as const;
  }
}
