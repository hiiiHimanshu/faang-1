import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { EnvironmentVariables } from '@/config/env.validation';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private readonly stripe: Stripe | null;

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {
    const secretKey = configService.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      this.logger.warn(
        'Stripe secret key missing. Billing operations are disabled.',
      );
      this.stripe = null;
      return;
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2025-08-27.basil',
    });
  }

  isEnabled() {
    return Boolean(this.stripe);
  }

  async createCheckoutSession(params: Stripe.Checkout.SessionCreateParams) {
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    return this.stripe.checkout.sessions.create(params);
  }

  async listProducts(limit = 10) {
    if (!this.stripe) {
      return [] as Stripe.Product[];
    }

    const { data } = await this.stripe.products.list({ limit });
    return data;
  }
}
