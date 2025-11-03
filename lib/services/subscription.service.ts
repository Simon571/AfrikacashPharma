/**
 * Service de gestion des abonnements
 * Responsable du cycle de vie des abonnements et des paiements
 */

import { prisma } from '@/lib/prisma';
import {
  Subscription,
  SubscriptionPlan,
  SUBSCRIPTION_PLANS,
  PlanType,
} from '@/types/multi-tenant';

export class SubscriptionService {
  /**
   * Crée un nouvel abonnement
   */
  async createSubscription(options: {
    planType: PlanType;
    planDuration?: number;
  }): Promise<Subscription> {
    const plan = SUBSCRIPTION_PLANS[options.planType];

    if (!plan) {
      throw new Error(`Plan type "${options.planType}" not found`);
    }

    const startDate = new Date();
    let endDate: Date | null = null;
    let trialDaysRemaining = 0;

    // Calculer la date d'expiration
    if (options.planType === 'trial') {
      const trialDays = options.planDuration || 7;
      trialDaysRemaining = trialDays;
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + trialDays);
    } else if (options.planType === 'monthly') {
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (options.planType === 'quarterly') {
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 3);
    } else if (options.planType === 'annual') {
      endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1);
    }
    // lifetime n'a pas de date d'expiration

    return {
      id: this.generateSubscriptionId(),
      instanceId: '', // À définir lors de la création de l'instance
      planType: options.planType,
      planName: plan.name,
      startDate,
      endDate: endDate || undefined,
      trialDaysRemaining,
      amount: plan.price,
      currency: plan.currency,
      billingCycle: plan.billingCycle as 'monthly' | 'quarterly' | 'annual' | undefined,
      autoRenew: options.planType !== 'trial',
      status: 'active',
      failedPaymentAttempts: 0,
      createdAt: startDate,
      updatedAt: startDate,
    };
  }

  /**
   * Crée un abonnement complet en base de données
   */
  async saveSubscription(
    instanceId: string,
    planType: PlanType,
    options?: {
      planDuration?: number;
      autoRenew?: boolean;
      paymentMethod?: string;
    }
  ): Promise<Subscription> {
    const plan = SUBSCRIPTION_PLANS[planType];

    if (!plan) {
      throw new Error(`Plan type "${planType}" not found`);
    }

    const startDate = new Date();
    let endDate: Date | null = null;
    let trialDaysRemaining = 0;

    if (planType === 'trial') {
      const trialDays = options?.planDuration || 7;
      trialDaysRemaining = trialDays;
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + trialDays);
    } else if (planType === 'monthly') {
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (planType === 'quarterly') {
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 3);
    } else if (planType === 'annual') {
      endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    return await prisma.subscription.create({
      data: {
        instanceId,
        planType,
        planName: plan.name,
        startDate,
        endDate: endDate || null,
        trialDaysRemaining,
        amount: plan.price,
        currency: plan.currency,
        billingCycle: plan.billingCycle || null,
        autoRenew: options?.autoRenew ?? planType !== 'trial',
        status: 'active',
        paymentMethod: options?.paymentMethod,
        failedPaymentAttempts: 0,
      },
    });
  }

  /**
   * Récupère un abonnement
   */
  async getSubscription(subscriptionId: string): Promise<Subscription | null> {
    return prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });
  }

  /**
   * Récupère l'abonnement d'une instance
   */
  async getInstanceSubscription(instanceId: string): Promise<Subscription | null> {
    return prisma.subscription.findUnique({
      where: { instanceId },
    });
  }

  /**
   * Renouvelle un abonnement
   */
  async renewSubscription(subscriptionId: string): Promise<Subscription> {
    const subscription = await this.getSubscription(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const plan = SUBSCRIPTION_PLANS[subscription.planType];
    const startDate = new Date();
    let endDate: Date | null = null;

    if (subscription.planType === 'monthly') {
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (subscription.planType === 'quarterly') {
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 3);
    } else if (subscription.planType === 'annual') {
      endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    return await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        startDate,
        endDate: endDate || null,
        status: 'active',
        failedPaymentAttempts: 0,
        nextBillingDate: endDate || null,
      },
    });
  }

  /**
   * Annule un abonnement
   */
  async cancelSubscription(subscriptionId: string): Promise<Subscription> {
    return await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'cancelled',
        endDate: new Date(),
      },
    });
  }

  /**
   * Suspend un abonnement (par manque de paiement)
   */
  async suspendSubscription(
    subscriptionId: string,
    reason: string
  ): Promise<Subscription> {
    return await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'suspended',
      },
    });
  }

  /**
   * Marque un abonnement comme expiré
   */
  async expireSubscription(subscriptionId: string): Promise<Subscription> {
    return await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'expired',
        endDate: new Date(),
      },
    });
  }

  /**
   * Enregistre un échec de paiement
   */
  async recordPaymentFailure(subscriptionId: string): Promise<Subscription> {
    const subscription = await this.getSubscription(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const newAttempts = subscription.failedPaymentAttempts + 1;

    // Suspendre après 3 tentatives échouées
    if (newAttempts >= 3) {
      return await this.suspendSubscription(
        subscriptionId,
        `Payment failed ${newAttempts} times`
      );
    }

    return await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        failedPaymentAttempts: newAttempts,
        status: newAttempts >= 2 ? 'pending_payment' : 'active',
      },
    });
  }

  /**
   * Récupère les abonnements expirés
   */
  async getExpiredSubscriptions(): Promise<Subscription[]> {
    const now = new Date();
    return prisma.subscription.findMany({
      where: {
        endDate: {
          lte: now,
        },
        status: 'active',
      },
    });
  }

  /**
   * Récupère les abonnements qui expirent bientôt
   */
  async getExpiringSubscriptions(daysUntilExpiration: number = 2): Promise<Subscription[]> {
    const now = new Date();
    const futureDate = new Date(now);
    futureDate.setDate(futureDate.getDate() + daysUntilExpiration);

    return prisma.subscription.findMany({
      where: {
        endDate: {
          lte: futureDate,
          gt: now,
        },
        status: 'active',
        expireReminderSentAt: null,
      },
    });
  }

  /**
   * Marque un rappel d'expiration comme envoyé
   */
  async markExpirationReminderSent(subscriptionId: string): Promise<void> {
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        expireReminderSentAt: new Date(),
      },
    });
  }

  /**
   * Génère un ID d'abonnement
   */
  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const subscriptionService = new SubscriptionService();
