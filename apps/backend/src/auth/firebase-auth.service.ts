import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { EnvironmentVariables } from '@/config/env.validation';

@Injectable()
export class FirebaseAuthService {
  private readonly logger = new Logger(FirebaseAuthService.name);
  private app: admin.app.App | null = null;
  private enabled: boolean;

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {
    const projectId = configService.get<string>('FIREBASE_PROJECT_ID');
    const clientEmail = configService.get<string>('FIREBASE_CLIENT_EMAIL');
    const rawPrivateKey = configService.get<string>('FIREBASE_PRIVATE_KEY');

    this.enabled = Boolean(projectId && clientEmail && rawPrivateKey);

    if (!this.enabled) {
      this.logger.warn(
        'Firebase credentials missing. Auth checks are disabled.',
      );
      return;
    }

    const privateKey = rawPrivateKey?.replace(/\\n/g, '\n');

    try {
      this.app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      this.logger.log('Firebase Admin initialized');
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin', error as Error);
      this.enabled = false;
    }
  }

  isEnabled() {
    return this.enabled;
  }

  getApp() {
    return this.app;
  }

  getMessaging(): admin.messaging.Messaging | null {
    if (!this.app || !this.enabled) {
      return null;
    }
    return admin.messaging(this.app);
  }

  async verifyIdToken(token: string): Promise<DecodedIdToken | null> {
    if (!this.enabled || !this.app) {
      return null;
    }

    try {
      const decoded = await admin.auth(this.app).verifyIdToken(token, true);
      return decoded;
    } catch (error) {
      this.logger.warn('Failed to verify Firebase token', error as Error);
      throw error;
    }
  }
}
