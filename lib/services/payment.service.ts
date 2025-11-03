/**
 * Service de gestion des paiements
 * Intègre AvadaPay, Strowallet, et Stripe
 */

import { prisma } from '@/lib/prisma';
import {
  Payment,
  PaymentRequest,
  PaymentResult,
  PaymentProvider,
} from '@/types/multi-tenant';

interface PaymentGateway {
  validatePayment(transactionId: string): Promise<boolean>;
  initiatePayment(amount: number, description: string): Promise<PaymentResult>;
}

class AvadaPayGateway implements PaymentGateway {
  private apiUrl = 'https://api.avadapay.com';
  private apiKey = process.env.AVADAPAY_API_KEY || '';

  async validatePayment(transactionId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/transactions/${transactionId}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });
      const data = await response.json();
      return data.status === 'completed';
    } catch (error) {
      console.error('AvadaPay validation error:', error);
      return false;
    }
  }

  async initiatePayment(amount: number, description: string): Promise<PaymentResult> {
    try {
      const response = await fetch(`${this.apiUrl}/payments/initiate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          description,
          currency: 'EUR',
          redirectUrl: `${process.env.APP_URL}/api/payments/avadapay/callback`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to initiate AvadaPay payment');
      }

      const data = await response.json();

      return {
        success: true,
        transactionId: data.transactionId,
        redirectUrl: data.redirectUrl,
      };
    } catch (error) {
      return {
        success: false,
        error: `AvadaPay payment failed: ${error}`,
      };
    }
  }
}

class StrowalletGateway implements PaymentGateway {
  private apiUrl = 'https://api.strowallet.com';
  private apiKey = process.env.STROWALLET_API_KEY || '';
  private apiSecret = process.env.STROWALLET_API_SECRET || '';

  async validatePayment(transactionId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/transaction/${transactionId}`, {
        headers: {
          'X-API-Key': this.apiKey,
        },
      });
      const data = await response.json();
      return data.status === 'success';
    } catch (error) {
      console.error('Strowallet validation error:', error);
      return false;
    }
  }

  async initiatePayment(amount: number, description: string): Promise<PaymentResult> {
    try {
      const timestamp = Date.now().toString();
      const signature = this.generateSignature(timestamp);

      const response = await fetch(`${this.apiUrl}/payment/create`, {
        method: 'POST',
        headers: {
          'X-API-Key': this.apiKey,
          'X-Signature': signature,
          'X-Timestamp': timestamp,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency: 'EUR',
          description,
          returnUrl: `${process.env.APP_URL}/api/payments/strowallet/callback`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to initiate Strowallet payment');
      }

      const data = await response.json();

      return {
        success: true,
        transactionId: data.transactionId,
        redirectUrl: data.paymentUrl,
      };
    } catch (error) {
      return {
        success: false,
        error: `Strowallet payment failed: ${error}`,
      };
    }
  }

  private generateSignature(timestamp: string): string {
    const crypto = require('crypto');
    const message = `${this.apiKey}${timestamp}${this.apiSecret}`;
    return crypto.createHash('sha256').update(message).digest('hex');
  }
}

class StripeGateway implements PaymentGateway {
  private stripeKey = process.env.STRIPE_SECRET_KEY || '';
  private stripe: any;

  constructor() {
    const Stripe = require('stripe');
    this.stripe = new Stripe(this.stripeKey);
  }

  async validatePayment(transactionId: string): Promise<boolean> {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(transactionId);
      return session.payment_status === 'paid';
    } catch (error) {
      console.error('Stripe validation error:', error);
      return false;
    }
  }

  async initiatePayment(amount: number, description: string): Promise<PaymentResult> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: description,
              },
              unit_amount: Math.round(amount * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.APP_URL}/api/payments/stripe/callback?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.APP_URL}/payments/cancelled`,
      });

      return {
        success: true,
        transactionId: session.id,
        redirectUrl: session.url,
      };
    } catch (error) {
      return {
        success: false,
        error: `Stripe payment failed: ${error}`,
      };
    }
  }
}

export class PaymentService {
  private gateways: Record<PaymentProvider, PaymentGateway> = {
    avadapay: new AvadaPayGateway(),
    strowallet: new StrowalletGateway(),
    stripe: new StripeGateway(),
    manual: new AvadaPayGateway(), // Fallback
  };

  /**
   * Initie un paiement
   */
  async initiatePayment(request: PaymentRequest): Promise<PaymentResult> {
    const gateway = this.gateways[request.paymentMethod];
    if (!gateway) {
      return {
        success: false,
        error: `Payment method ${request.paymentMethod} not supported`,
      };
    }

    // Créer un enregistrement de paiement en base de données
    const payment = await prisma.payment.create({
      data: {
        instanceId: request.instanceId,
        amount: request.amount,
        currency: request.currency,
        paymentMethod: request.paymentMethod,
        status: 'pending',
        metadata: request.metadata,
      },
    });

    try {
      const result = await gateway.initiatePayment(
        request.amount,
        `Abonnement PharmaSuite - ${request.instanceId}`
      );

      if (result.success && result.transactionId) {
        // Mettre à jour le paiement avec la référence de transaction
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            transactionReference: result.transactionId,
          },
        });
      }

      return result;
    } catch (error) {
      // Marquer le paiement comme échoué
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'failed',
        },
      });

      return {
        success: false,
        error: `Payment initiation failed: ${error}`,
      };
    }
  }

  /**
   * Valide un paiement (appelé après le callback du fournisseur)
   */
  async validatePayment(
    paymentMethod: PaymentProvider,
    transactionId: string
  ): Promise<boolean> {
    const gateway = this.gateways[paymentMethod];
    if (!gateway) {
      throw new Error(`Payment method ${paymentMethod} not supported`);
    }

    return gateway.validatePayment(transactionId);
  }

  /**
   * Confirme un paiement
   */
  async confirmPayment(paymentId: string, transactionReference: string): Promise<Payment> {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    // Valider le paiement avec le fournisseur
    const isValid = await this.validatePayment(
      payment.paymentMethod as PaymentProvider,
      transactionReference
    );

    if (!isValid) {
      throw new Error('Payment validation failed');
    }

    // Marquer le paiement comme reçu
    const confirmed = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'received',
        paidAt: new Date(),
        transactionReference,
      },
    });

    // Si lié à un abonnement, le renouveler
    if (confirmed.subscriptionId) {
      // TODO: Appeler subscriptionService.renewSubscription()
    }

    return confirmed;
  }

  /**
   * Enregistre un échec de paiement
   */
  async recordPaymentFailure(paymentId: string, reason: string): Promise<Payment> {
    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'failed',
        metadata: {
          ...payment?.metadata,
          failureReason: reason,
        },
      },
    });

    // Si lié à un abonnement, enregistrer l'échec
    if (payment.subscriptionId) {
      // TODO: Appeler subscriptionService.recordPaymentFailure()
    }

    return payment;
  }

  /**
   * Rembourse un paiement
   */
  async refundPayment(paymentId: string, reason: string): Promise<Payment> {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    return await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'refunded',
        metadata: {
          ...payment.metadata,
          refundReason: reason,
          refundedAt: new Date(),
        },
      },
    });
  }

  /**
   * Récupère les paiements d'une instance
   */
  async getInstancePayments(instanceId: string): Promise<Payment[]> {
    return prisma.payment.findMany({
      where: { instanceId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Récupère les paiements d'un abonnement
   */
  async getSubscriptionPayments(subscriptionId: string): Promise<Payment[]> {
    return prisma.payment.findMany({
      where: { subscriptionId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const paymentService = new PaymentService();
