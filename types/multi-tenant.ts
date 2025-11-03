/**
 * Types pour le système multi-instance et multi-abonnement
 */

// ============= INSTANCES =============

export type InstanceStatus = 'pending' | 'active' | 'suspended' | 'deleted';

export type PaymentProvider = 'avadapay' | 'strowallet' | 'stripe' | 'manual';

export type PlanType = 'trial' | 'monthly' | 'quarterly' | 'annual' | 'lifetime';

export type NotificationChannel = 'email' | 'whatsapp' | 'both';

export interface Instance {
  id: string;
  name: string;
  subdomain: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string;
  status: InstanceStatus;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  customDomain?: string;
  domainVerified: boolean;
  vercelProjectId?: string;
  vercelDeploymentUrl?: string;
  vercelEnvironmentId?: string;
  subscriptionId: string;
  databaseUrl?: string;
  apiKey: string;
  activeUsers: number;
  totalOrders: number;
  monthlyRevenue: number;
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt: Date;
}

export interface InstanceSettings {
  id: string;
  instanceId: string;
  appName: string;
  appDescription?: string;
  supportEmail?: string;
  supportPhone?: string;
  supportWhatsApp?: string;
  enablePayments: boolean;
  paymentProviders: PaymentProvider[];
  enableEmailNotifications: boolean;
  enableWhatsAppNotifications: boolean;
  maxUsers: number;
  maxProducts: number;
  storageLimit: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInstanceRequest {
  name: string;
  subdomain: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  planType: PlanType;
  planDuration?: number; // jours pour essai, null pour illimité
}

export interface UpdateInstanceRequest {
  name?: string;
  status?: InstanceStatus;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  customDomain?: string;
}

// ============= ABONNEMENTS =============

export interface Subscription {
  id: string;
  instanceId: string;
  planType: PlanType;
  planName: string;
  startDate: Date;
  endDate?: Date;
  trialDaysRemaining: number;
  amount: number;
  currency: string;
  billingCycle?: 'monthly' | 'quarterly' | 'annual';
  autoRenew: boolean;
  status: 'active' | 'expired' | 'suspended' | 'cancelled' | 'pending_payment';
  paymentMethod?: PaymentProvider;
  lastPaymentId?: string;
  nextBillingDate?: Date;
  failedPaymentAttempts: number;
  expireReminderSentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  type: PlanType;
  description: string;
  price: number;
  currency: string;
  billingCycle?: string;
  features: {
    maxUsers: number;
    maxProducts: number;
    storageLimit: number;
    enablePayments: boolean;
    supportLevel: 'basic' | 'standard' | 'premium';
  };
  isActive: boolean;
}

export const SUBSCRIPTION_PLANS: Record<PlanType, SubscriptionPlan> = {
  trial: {
    id: 'plan_trial_7',
    name: 'Trial 7 Days',
    type: 'trial',
    description: 'Essai gratuit pendant 7 jours',
    price: 0,
    currency: 'EUR',
    features: {
      maxUsers: 5,
      maxProducts: 100,
      storageLimit: 1024,
      enablePayments: false,
      supportLevel: 'basic',
    },
    isActive: true,
  },
  monthly: {
    id: 'plan_monthly',
    name: 'Professional Monthly',
    type: 'monthly',
    description: 'Plan mensuel professionnel',
    price: 49.99,
    currency: 'EUR',
    billingCycle: 'monthly',
    features: {
      maxUsers: 25,
      maxProducts: 5000,
      storageLimit: 10240,
      enablePayments: true,
      supportLevel: 'standard',
    },
    isActive: true,
  },
  quarterly: {
    id: 'plan_quarterly',
    name: 'Enterprise Quarterly',
    type: 'quarterly',
    description: 'Plan trimestriel entreprise',
    price: 129.99,
    currency: 'EUR',
    billingCycle: 'quarterly',
    features: {
      maxUsers: 50,
      maxProducts: 10000,
      storageLimit: 51200,
      enablePayments: true,
      supportLevel: 'premium',
    },
    isActive: true,
  },
  annual: {
    id: 'plan_annual',
    name: 'Enterprise Annual',
    type: 'annual',
    description: 'Plan annuel entreprise',
    price: 449.99,
    currency: 'EUR',
    billingCycle: 'annual',
    features: {
      maxUsers: 100,
      maxProducts: 50000,
      storageLimit: 102400,
      enablePayments: true,
      supportLevel: 'premium',
    },
    isActive: true,
  },
  lifetime: {
    id: 'plan_lifetime',
    name: 'Lifetime License',
    type: 'lifetime',
    description: 'Licence à vie permanente',
    price: 999.99,
    currency: 'EUR',
    features: {
      maxUsers: 500,
      maxProducts: 999999,
      storageLimit: 1048576,
      enablePayments: true,
      supportLevel: 'premium',
    },
    isActive: true,
  },
};

// ============= PAIEMENTS =============

export interface Payment {
  id: string;
  subscriptionId?: string;
  instanceId?: string;
  amount: number;
  currency: string;
  status: 'received' | 'pending' | 'failed' | 'refunded';
  paymentMethod: PaymentProvider;
  transactionReference?: string;
  initiatedAt: Date;
  paidAt?: Date;
  receiptUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentRequest {
  instanceId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentProvider;
  metadata?: Record<string, unknown>;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  redirectUrl?: string;
  error?: string;
  metadata?: Record<string, unknown>;
}

// ============= DÉPLOIEMENT =============

export interface DeploymentLog {
  id: string;
  instanceId: string;
  action: 'create' | 'update' | 'deploy' | 'rollback' | 'delete';
  status: 'pending' | 'in_progress' | 'success' | 'failed';
  details?: Record<string, unknown>;
  errorMessage?: string;
  createdAt: Date;
}

export interface VercelDeployment {
  projectId: string;
  projectName: string;
  environmentId: string;
  deploymentUrl: string;
  variables: Record<string, string>;
}

export interface VercelEnvironmentVariable {
  key: string;
  value: string;
  type: 'plain' | 'secret';
}

// ============= NOTIFICATIONS =============

export interface Notification {
  id: string;
  instanceId?: string;
  recipientEmail: string;
  recipientPhone?: string;
  type: 'expiration_reminder' | 'payment_failed' | 'new_feature' | 'promo';
  subject: string;
  message: string;
  channel: NotificationChannel;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: Date;
  failureReason?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationTemplate {
  type: string;
  channel: NotificationChannel;
  subject: string;
  template: string; // Template avec variables {{variable}}
}

// ============= FACTURATION =============

export interface Invoice {
  id: string;
  instanceId: string;
  invoiceNumber: string;
  description: string;
  amount: number;
  currency: string;
  issueDate: Date;
  dueDate: Date;
  paidDate?: Date;
  status: 'paid' | 'unpaid' | 'overdue' | 'cancelled';
  pdfUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============= AUDIT =============

export interface InstanceAuditLog {
  id: string;
  instanceId: string;
  action: string;
  userId: string;
  changes?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: Date;
}

// ============= TABLEAU DE BORD =============

export interface DashboardStats {
  totalInstances: number;
  activeInstances: number;
  suspendedInstances: number;
  trialInstances: number;
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  totalUsers: number;
  totalOrders: number;
  churnRate: number;
  averageOrderValue: number;
}

export interface InstanceStats {
  id: string;
  name: string;
  activeUsers: number;
  totalOrders: number;
  monthlyRevenue: number;
  lastActivityAt: Date;
  subscriptionStatus: string;
  planType: PlanType;
}

export interface InstanceListItem extends Instance {
  subscription: Subscription;
  settings: InstanceSettings;
  lastPayment?: Payment;
}

// ============= CONFIGURATIONS VERCEL =============

export const VERCEL_CONFIG = {
  PROJECT_PREFIX: 'pharma-',
  ENVIRONMENT_VARIABLES: {
    APP_NAME: 'APP_NAME',
    APP_COLOR_PRIMARY: 'PRIMARY_COLOR',
    APP_COLOR_SECONDARY: 'SECONDARY_COLOR',
    APP_LOGO_URL: 'LOGO_URL',
    DATABASE_URL: 'DATABASE_URL',
    API_KEY: 'API_KEY',
    PLAN_TYPE: 'PLAN_TYPE',
    TRIAL_EXPIRE_AT: 'TRIAL_EXPIRE_AT',
    SUBSCRIPTION_STATUS: 'SUBSCRIPTION_STATUS',
  },
};

// ============= UTILITAIRES =============

export function getDaysUntilExpiration(endDate?: Date): number {
  if (!endDate) return -1;
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function isSubscriptionActive(subscription: Subscription): boolean {
  if (subscription.status !== 'active') return false;
  if (subscription.endDate && new Date() > subscription.endDate) return false;
  return true;
}

export function shouldSendExpirationReminder(
  subscription: Subscription,
  daysBeforeExpiration: number = 2
): boolean {
  if (!subscription.endDate || subscription.expireReminderSentAt) return false;
  const daysUntil = getDaysUntilExpiration(subscription.endDate);
  return daysUntil > 0 && daysUntil <= daysBeforeExpiration;
}
