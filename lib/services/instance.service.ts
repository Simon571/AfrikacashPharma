/**
 * Service de gestion des instances
 * Responsable de la création, mise à jour, suppression et suivi des instances
 */

import { prisma } from '@/lib/prisma';
import { CreateInstanceRequest, UpdateInstanceRequest, Instance } from '@/types/multi-tenant';
import { VercelService } from './vercel.service';
import { SubscriptionService } from './subscription.service';

export class InstanceService {
  private vercelService: VercelService;
  private subscriptionService: SubscriptionService;

  constructor() {
    this.vercelService = new VercelService();
    this.subscriptionService = new SubscriptionService();
  }

  /**
   * Crée une nouvelle instance
   */
  async createInstance(request: CreateInstanceRequest): Promise<Instance> {
    // Vérifier que le subdomain n'existe pas
    const existing = await prisma.instance.findUnique({
      where: { subdomain: request.subdomain },
    });

    if (existing) {
      throw new Error(`Le subdomain "${request.subdomain}" est déjà utilisé`);
    }

    // Créer l'abonnement
    const subscription = await this.subscriptionService.createSubscription({
      planType: request.planType,
      planDuration: request.planDuration,
    });

    // Déployer sur Vercel
    const vercelDeployment = await this.vercelService.deployInstance({
      name: request.name,
      subdomain: request.subdomain,
      primaryColor: request.primaryColor || '#3B82F6',
      secondaryColor: request.secondaryColor || '#10B981',
      logo: request.logo,
      apiKey: this.generateApiKey(),
    });

    // Créer l'instance en base de données
    const instance = await prisma.instance.create({
      data: {
        name: request.name,
        subdomain: request.subdomain,
        ownerName: request.ownerName,
        ownerEmail: request.ownerEmail,
        ownerPhone: request.ownerPhone,
        logo: request.logo,
        primaryColor: request.primaryColor || '#3B82F6',
        secondaryColor: request.secondaryColor || '#10B981',
        subscriptionId: subscription.id,
        vercelProjectId: vercelDeployment.projectId,
        vercelDeploymentUrl: vercelDeployment.deploymentUrl,
        vercelEnvironmentId: vercelDeployment.environmentId,
        apiKey: vercelDeployment.variables['API_KEY'],
        databaseUrl: vercelDeployment.variables['DATABASE_URL'],
        status: 'pending', // en attente de vérification du déploiement
        settings: {
          create: {
            appName: request.name,
            paymentProviders: ['avadapay', 'strowallet'],
          },
        },
      },
      include: {
        subscription: true,
        settings: true,
      },
    });

    // Logger l'action
    await this.logAudit(instance.id, 'create', {
      vercelProjectId: vercelDeployment.projectId,
      subscriptionId: subscription.id,
    });

    return instance as Instance;
  }

  /**
   * Met à jour une instance
   */
  async updateInstance(
    instanceId: string,
    request: UpdateInstanceRequest
  ): Promise<Instance> {
    const instance = await prisma.instance.findUnique({
      where: { id: instanceId },
    });

    if (!instance) {
      throw new Error('Instance not found');
    }

    // Si changement de domaine personnalisé, le vérifier
    if (request.customDomain && request.customDomain !== instance.customDomain) {
      // TODO: Vérifier la propriété du domaine avec DNS
      const verified = await this.verifyCustomDomain(request.customDomain);
      if (!verified) {
        throw new Error('Impossible de vérifier le domaine');
      }
    }

    const updated = await prisma.instance.update({
      where: { id: instanceId },
      data: {
        name: request.name,
        status: request.status,
        logo: request.logo,
        primaryColor: request.primaryColor,
        secondaryColor: request.secondaryColor,
        customDomain: request.customDomain,
        domainVerified: request.customDomain ? true : instance.domainVerified,
      },
      include: {
        subscription: true,
        settings: true,
      },
    });

    // Mettre à jour les variables d'environnement Vercel si nécessaire
    if (instance.vercelProjectId && instance.vercelEnvironmentId) {
      await this.vercelService.updateEnvironmentVariables(
        instance.vercelProjectId,
        instance.vercelEnvironmentId,
        {
          APP_NAME: request.name || instance.name,
          PRIMARY_COLOR: request.primaryColor || instance.primaryColor,
          SECONDARY_COLOR: request.secondaryColor || instance.secondaryColor,
          LOGO_URL: request.logo || instance.logo || '',
        }
      );
    }

    // Logger l'action
    await this.logAudit(instanceId, 'update', request);

    return updated as Instance;
  }

  /**
   * Récupère une instance
   */
  async getInstance(instanceId: string): Promise<Instance | null> {
    const instance = await prisma.instance.findUnique({
      where: { id: instanceId },
      include: {
        subscription: true,
        settings: true,
      },
    });
    return instance as Instance | null;
  }

  /**
   * Récupère une instance par subdomain
   */
  async getInstanceBySubdomain(subdomain: string): Promise<Instance | null> {
    const instance = await prisma.instance.findUnique({
      where: { subdomain },
      include: {
        subscription: true,
        settings: true,
      },
    });
    return instance as Instance | null;
  }

  /**
   * Liste toutes les instances avec filtres
   */
  async listInstances(options?: {
    status?: string;
    planType?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ instances: Instance[]; total: number }> {
    const where: any = {};

    if (options?.status) {
      where.status = options.status;
    }

    if (options?.planType) {
      where.subscription = {
        planType: options.planType,
      };
    }

    const [instances, total] = await Promise.all([
      prisma.instance.findMany({
        where,
        include: {
          subscription: true,
          settings: true,
        },
        take: options?.limit || 50,
        skip: options?.offset || 0,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.instance.count({ where }),
    ]);

    return { instances: instances as Instance[], total };
  }

  /**
   * Suspend une instance
   */
  async suspendInstance(instanceId: string, reason?: string): Promise<Instance> {
    const instance = await prisma.instance.update({
      where: { id: instanceId },
      data: { status: 'suspended' },
      include: {
        subscription: true,
        settings: true,
      },
    });

    // Logger l'action
    await this.logAudit(instanceId, 'suspend', { reason });

    // Envoyer une notification
    // TODO: Implémenter

    return instance as Instance;
  }

  /**
   * Réactive une instance suspendue
   */
  async reactivateInstance(instanceId: string): Promise<Instance> {
    const instance = await prisma.instance.update({
      where: { id: instanceId },
      data: { status: 'active' },
      include: {
        subscription: true,
        settings: true,
      },
    });

    // Logger l'action
    await this.logAudit(instanceId, 'reactivate', {});

    return instance as Instance;
  }

  /**
   * Supprime une instance
   */
  async deleteInstance(instanceId: string): Promise<void> {
    const instance = await prisma.instance.findUnique({
      where: { id: instanceId },
    });

    if (!instance) {
      throw new Error('Instance not found');
    }

    // Supprimer le projet Vercel
    if (instance.vercelProjectId) {
      await this.vercelService.deleteProject(instance.vercelProjectId);
    }

    // Supprimer l'abonnement
    await this.subscriptionService.cancelSubscription(instance.subscriptionId);

    // Supprimer l'instance
    await prisma.instance.delete({
      where: { id: instanceId },
    });

    // Logger l'action
    await this.logAudit(instanceId, 'delete', {});
  }

  /**
   * Met à jour les statistiques d'une instance
   */
  async updateInstanceStats(
    instanceId: string,
    stats: {
      activeUsers?: number;
      totalOrders?: number;
      monthlyRevenue?: number;
    }
  ): Promise<void> {
    await prisma.instance.update({
      where: { id: instanceId },
      data: {
        activeUsers: stats.activeUsers,
        totalOrders: stats.totalOrders,
        monthlyRevenue: stats.monthlyRevenue,
        lastActivityAt: new Date(),
      },
    });
  }

  /**
   * Génère une clé API unique
   */
  private generateApiKey(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${random}`;
  }

  /**
   * Vérifie un domaine personnalisé
   */
  private async verifyCustomDomain(domain: string): Promise<boolean> {
    // TODO: Implémenter la vérification DNS/CNAME
    return true;
  }

  /**
   * Log une action d'audit
   */
  private async logAudit(
    instanceId: string,
    action: string,
    changes?: any
  ): Promise<void> {
    await prisma.instanceAuditLog.create({
      data: {
        instanceId,
        action,
        userId: 'super-admin', // À récupérer du contexte utilisateur
        changes: changes || {},
      },
    });
  }
}

export const instanceService = new InstanceService();
