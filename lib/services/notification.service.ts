/**
 * Service de notifications
 * Envoie des emails, SMS WhatsApp, et notifications push
 */

import { prisma } from '@/lib/prisma';
import { Notification, NotificationChannel, NotificationTemplate } from '@/types/multi-tenant';

interface EmailProvider {
  send(to: string, subject: string, html: string): Promise<boolean>;
}

interface WhatsAppProvider {
  send(to: string, message: string): Promise<boolean>;
}

class SMTPEmailProvider implements EmailProvider {
  private smtpHost = process.env.SMTP_HOST || '';
  private smtpPort = parseInt(process.env.SMTP_PORT || '587');
  private smtpUser = process.env.SMTP_USER || '';
  private smtpPassword = process.env.SMTP_PASSWORD || '';
  private fromEmail = process.env.SMTP_FROM_EMAIL || 'noreply@afrikacashpharma.com';

  async send(to: string, subject: string, html: string): Promise<boolean> {
    try {
      const nodemailer = require('nodemailer');

      const transporter = nodemailer.createTransport({
        host: this.smtpHost,
        port: this.smtpPort,
        secure: this.smtpPort === 465,
        auth: {
          user: this.smtpUser,
          pass: this.smtpPassword,
        },
      });

      await transporter.sendMail({
        from: this.fromEmail,
        to,
        subject,
        html,
      });

      return true;
    } catch (error) {
      console.error('Email send error:', error);
      return false;
    }
  }
}

class TwilioWhatsAppProvider implements WhatsAppProvider {
  private accountSid = process.env.TWILIO_ACCOUNT_SID || '';
  private authToken = process.env.TWILIO_AUTH_TOKEN || '';
  private twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '';
  private twilio: any;

  constructor() {
    const Twilio = require('twilio');
    this.twilio = new Twilio(this.accountSid, this.authToken);
  }

  async send(to: string, message: string): Promise<boolean> {
    try {
      await this.twilio.messages.create({
        from: `whatsapp:${this.twilioPhoneNumber}`,
        to: `whatsapp:${to}`,
        body: message,
      });
      return true;
    } catch (error) {
      console.error('WhatsApp send error:', error);
      return false;
    }
  }
}

export class NotificationService {
  private emailProvider: EmailProvider;
  private whatsappProvider: WhatsAppProvider;

  constructor() {
    this.emailProvider = new SMTPEmailProvider();
    this.whatsappProvider = new TwilioWhatsAppProvider();
  }

  /**
   * Envoie une notification d'expiration imminente
   */
  async sendExpirationReminder(
    instanceId: string,
    recipientEmail: string,
    recipientPhone?: string,
    channel: NotificationChannel = 'both'
  ): Promise<void> {
    const template = this.getTemplate('expiration_reminder', channel);

    const notification = await prisma.notification.create({
      data: {
        instanceId,
        recipientEmail,
        recipientPhone,
        type: 'expiration_reminder',
        subject: template.subject,
        message: template.template,
        channel,
        status: 'pending',
      },
    });

    await this.sendNotification(notification);
  }

  /**
   * Envoie une notification d'échec de paiement
   */
  async sendPaymentFailedNotification(
    instanceId: string,
    recipientEmail: string,
    recipientPhone?: string,
    attempts?: number
  ): Promise<void> {
    const template = this.getTemplate('payment_failed', 'both');
    const message = template.template.replace(
      '{{attempts}}',
      (attempts || 1).toString()
    );

    const notification = await prisma.notification.create({
      data: {
        instanceId,
        recipientEmail,
        recipientPhone,
        type: 'payment_failed',
        subject: template.subject,
        message,
        channel: 'both',
        status: 'pending',
      },
    });

    await this.sendNotification(notification);
  }

  /**
   * Envoie une notification promo
   */
  async sendPromoNotification(
    recipientEmail: string,
    recipientPhone?: string,
    subject: string,
    message: string,
    channel: NotificationChannel = 'email'
  ): Promise<void> {
    const notification = await prisma.notification.create({
      data: {
        recipientEmail,
        recipientPhone,
        type: 'promo',
        subject,
        message,
        channel,
        status: 'pending',
      },
    });

    await this.sendNotification(notification);
  }

  /**
   * Envoie une notification à plusieurs destinataires
   */
  async broadcastNotification(
    instances: string[],
    emails: string[],
    subject: string,
    message: string,
    channel: NotificationChannel = 'email'
  ): Promise<void> {
    for (const email of emails) {
      const notification = await prisma.notification.create({
        data: {
          recipientEmail: email,
          type: 'new_feature',
          subject,
          message,
          channel,
          status: 'pending',
        },
      });

      await this.sendNotification(notification);
    }
  }

  /**
   * Envoie une notification
   */
  private async sendNotification(notification: Notification): Promise<void> {
    try {
      let emailSent = false;
      let whatsappSent = false;

      if (notification.channel === 'email' || notification.channel === 'both') {
        emailSent = await this.emailProvider.send(
          notification.recipientEmail,
          notification.subject,
          this.formatEmailHtml(notification.message)
        );
      }

      if (
        notification.channel === 'whatsapp' ||
        (notification.channel === 'both' && notification.recipientPhone)
      ) {
        whatsappSent = await this.whatsappProvider.send(
          notification.recipientPhone!,
          notification.message
        );
      }

      const success = emailSent || whatsappSent;

      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: success ? 'sent' : 'failed',
          sentAt: success ? new Date() : null,
          failureReason: success ? null : 'Failed to send via configured channels',
        },
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: 'failed',
          failureReason: `${error}`,
        },
      });
    }
  }

  /**
   * Envoie les rappels d'expiration en attente
   */
  async sendPendingExpirationReminders(): Promise<void> {
    // TODO: Intégrer avec subscriptionService
    console.log('Sending pending expiration reminders...');
  }

  /**
   * Envoie les notifications d'échec de paiement en attente
   */
  async sendPendingPaymentFailureNotifications(): Promise<void> {
    // TODO: Intégrer avec subscriptionService
    console.log('Sending pending payment failure notifications...');
  }

  /**
   * Récupère le template d'une notification
   */
  private getTemplate(
    type: string,
    channel: NotificationChannel
  ): NotificationTemplate {
    const templates: Record<string, Record<NotificationChannel, NotificationTemplate>> = {
      expiration_reminder: {
        email: {
          type: 'expiration_reminder',
          channel: 'email',
          subject: '⚠️ Votre abonnement PharmaSuite expire bientôt',
          template: `
            <h2>Rappel d'expiration d'abonnement</h2>
            <p>Bonjour,</p>
            <p>Nous vous rappelons que votre abonnement PharmaSuite expire dans 2 jours.</p>
            <p>Pour continuer sans interruption, veuillez renouveler votre abonnement:</p>
            <a href="{{renewal_url}}" style="background: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Renouveler maintenant
            </a>
            <p>Si vous avez des questions, contactez notre support.</p>
          `,
        },
        whatsapp: {
          type: 'expiration_reminder',
          channel: 'whatsapp',
          subject: 'Rappel abonnement',
          template:
            'Bonjour! Votre abonnement PharmaSuite expire dans 2 jours. Cliquez ici pour renouveler: {{renewal_url}}',
        },
        both: {
          type: 'expiration_reminder',
          channel: 'both',
          subject: '⚠️ Votre abonnement PharmaSuite expire bientôt',
          template: 'Votre abonnement expire bientôt. Veuillez renouveler.',
        },
      },
      payment_failed: {
        email: {
          type: 'payment_failed',
          channel: 'email',
          subject: '❌ Echec du paiement - Action requise',
          template: `
            <h2>Echec du paiement</h2>
            <p>Bonjour,</p>
            <p>Nous n'avons pas pu traiter votre paiement pour votre abonnement PharmaSuite (tentative {{attempts}}/3).</p>
            <p>Veuillez mettre à jour vos informations de paiement:</p>
            <a href="{{payment_url}}" style="background: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Réessayer le paiement
            </a>
            <p>Si vous avez des difficultés, contactez notre support immédiatement.</p>
          `,
        },
        whatsapp: {
          type: 'payment_failed',
          channel: 'whatsapp',
          subject: 'Echec de paiement',
          template:
            'Echec du paiement pour votre abonnement (tentative {{attempts}}/3). Cliquez ici pour réessayer: {{payment_url}}',
        },
        both: {
          type: 'payment_failed',
          channel: 'both',
          subject: '❌ Echec du paiement',
          template: 'Votre paiement a échoué. Veuillez réessayer.',
        },
      },
      new_feature: {
        email: {
          type: 'new_feature',
          channel: 'email',
          subject: '🎉 Nouvelle fonctionnalité disponible',
          template: `
            <h2>Nouvelle fonctionnalité!</h2>
            <p>Nous avons ajouté une nouvelle fonctionnalité à PharmaSuite:</p>
            <p>{{feature_description}}</p>
            <p>Découvrez-la maintenant dans votre tableau de bord.</p>
          `,
        },
        whatsapp: {
          type: 'new_feature',
          channel: 'whatsapp',
          subject: 'Nouvelle fonctionnalité',
          template: '🎉 Nouvelle fonctionnalité disponible dans PharmaSuite: {{feature_description}}',
        },
        both: {
          type: 'new_feature',
          channel: 'both',
          subject: '🎉 Nouvelle fonctionnalité',
          template: 'Découvrez notre nouvelle fonctionnalité!',
        },
      },
    };

    return (
      templates[type]?.[channel] || {
        type,
        channel,
        subject: 'Notification PharmaSuite',
        template: 'Vous avez une nouvelle notification.',
      }
    );
  }

  /**
   * Formate un message en HTML d'email
   */
  private formatEmailHtml(message: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3B82F6; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background: #f9fafb; padding: 20px; border-radius: 0 0 5px 5px; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>PharmaSuite</h1>
            </div>
            <div class="content">
              ${message}
            </div>
            <div class="footer">
              <p>© 2024 AfrikaCash Pharma. Tous droits réservés.</p>
              <p>Cette notification a été générée automatiquement. Veuillez ne pas répondre à cet email.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

export const notificationService = new NotificationService();
