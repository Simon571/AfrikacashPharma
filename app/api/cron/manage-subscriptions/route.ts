/**
 * Tâche de fond pour gérer le cycle de vie des abonnements
 * Exécutée quotidiennement via un CRON job
 */

import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionService } from '@/lib/services/subscription.service';
import { NotificationService } from '@/lib/services/notification.service';
import { InstanceService } from '@/lib/services/instance.service';
import { prisma } from '@/lib/prisma';

const subscriptionService = new SubscriptionService();
const notificationService = new NotificationService();
const instanceService = new InstanceService();

/**
 * Endpoint CRON pour vérifier et gérer les abonnements
 * POST /api/cron/manage-subscriptions
 * À appeler quotidiennement via un service CRON (ex: Vercel Cron)
 */
export async function POST(req: NextRequest) {
  // Vérifier le token CRON
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get('Authorization');

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('Starting subscription management cron job...');

    // 1. Récupérer les abonnements qui expirent dans 2 jours
    console.log('Checking for expiring subscriptions...');
    const expiringSubscriptions = await subscriptionService.getExpiringSubscriptions(2);

    for (const sub of expiringSubscriptions) {
      const instance = await instanceService.getInstance(sub.instanceId);
      if (instance) {
        // Envoyer un rappel d'expiration
        await notificationService.sendExpirationReminder(
          instance.id,
          instance.ownerEmail,
          instance.ownerPhone,
          'both'
        );

        // Marquer comme envoyé
        await subscriptionService.markExpirationReminderSent(sub.id);

        console.log(`Sent expiration reminder for instance ${instance.id}`);
      }
    }

    // 2. Récupérer les abonnements expirés qui sont encore actifs
    console.log('Checking for expired subscriptions...');
    const expiredSubscriptions = await subscriptionService.getExpiredSubscriptions();

    for (const sub of expiredSubscriptions) {
      // Marquer comme expiré
      await subscriptionService.expireSubscription(sub.id);

      // Suspendre l'instance
      const instance = await instanceService.getInstance(sub.instanceId);
      if (instance && instance.status === 'active') {
        await instanceService.suspendInstance(
          instance.id,
          'Subscription expired'
        );

        console.log(`Suspended instance ${instance.id} due to subscription expiration`);
      }
    }

    // 3. Récupérer les abonnements avec paiements échoués
    console.log('Checking for failed payments...');
    const failedPayments = await prisma.payment.findMany({
      where: {
        status: 'failed',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Dernières 24h
        },
      },
    });

    for (const payment of failedPayments) {
      if (payment.subscriptionId) {
        const subscription = await subscriptionService.getSubscription(
          payment.subscriptionId
        );

        if (subscription) {
          // Enregistrer l'échec
          await subscriptionService.recordPaymentFailure(subscription.id);

          // Si plus de 2 tentatives échouées, envoyer une notification
          if (subscription.failedPaymentAttempts >= 2) {
            const instance = await instanceService.getInstance(subscription.instanceId);
            if (instance) {
              await notificationService.sendPaymentFailedNotification(
                instance.id,
                instance.ownerEmail,
                instance.ownerPhone,
                subscription.failedPaymentAttempts
              );

              console.log(
                `Sent payment failure notification for instance ${instance.id}`
              );
            }
          }
        }
      }
    }

    // 4. Renouveler les abonnements avec auto-renew activé
    console.log('Processing auto-renewals...');
    const subscriptionsToRenew = await prisma.subscription.findMany({
      where: {
        autoRenew: true,
        endDate: {
          lte: new Date(),
        },
        status: 'active',
      },
    });

    for (const sub of subscriptionsToRenew) {
      // TODO: Implémenter le renouvellement automatique avec paiement
      console.log(`Would auto-renew subscription ${sub.id}`);
    }

    // 5. Mettre à jour les statistiques des instances
    console.log('Updating instance statistics...');
    const instances = await prisma.instance.findMany({
      where: { status: 'active' },
    });

    for (const instance of instances) {
      // TODO: Récupérer les stats depuis la base de données de chaque instance
      await instanceService.updateInstanceStats(instance.id, {
        activeUsers: Math.floor(Math.random() * 100),
        totalOrders: Math.floor(Math.random() * 1000),
        monthlyRevenue: Math.random() * 5000,
      });
    }

    console.log('Subscription management cron job completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Subscription management completed',
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error in subscription management cron job:', error);
    return NextResponse.json(
      {
        error: 'Cron job failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
