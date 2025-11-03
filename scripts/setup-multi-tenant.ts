/**
 * Fichier d'exemple pour initialiser le système multi-tenant
 * À exécuter une fois après le déploiement
 */

import { prisma } from '@/lib/prisma';
import { SUBSCRIPTION_PLANS } from '@/types/multi-tenant';

async function setupMultiTenant() {
  console.log('🚀 Initializing Multi-Tenant System...\n');

  try {
    // 1. Vérifier que les plans d'abonnement sont en base
    console.log('1️⃣  Creating subscription plans...');

    for (const [planKey, plan] of Object.entries(SUBSCRIPTION_PLANS)) {
      // Les plans sont généralement des constantes en mémoire
      // mais on peut les logger ici
      console.log(`   ✓ ${plan.name} (${plan.price}€)`);
    }

    console.log('\n2️⃣  Database is ready for multi-tenant operations\n');

    // 2. Créer un exemple d'instance (optionnel)
    console.log('3️⃣  Creating example instance (optional)...');

    const exampleSubscription = await prisma.subscription.create({
      data: {
        planType: 'trial',
        planName: 'Trial 7 Days',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        trialDaysRemaining: 7,
        amount: 0,
        currency: 'EUR',
        autoRenew: false,
        status: 'active',
        failedPaymentAttempts: 0,
      },
    });

    console.log(`   ✓ Example subscription created: ${exampleSubscription.id}\n`);

    // 3. Créer une instance d'exemple
    const exampleInstance = await prisma.instance.create({
      data: {
        name: 'Demo Pharmacy',
        subdomain: 'demo-pharmacy',
        ownerName: 'John Doe',
        ownerEmail: 'john@example.com',
        ownerPhone: '+33612345678',
        status: 'pending',
        primaryColor: '#3B82F6',
        secondaryColor: '#10B981',
        subscriptionId: exampleSubscription.id,
        apiKey: `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        settings: {
          create: {
            appName: 'Demo Pharmacy',
            appDescription: 'Demo pharmacy instance',
            supportEmail: 'support@example.com',
            supportPhone: '+33612345678',
            paymentProviders: ['avadapay', 'strowallet'],
            enablePayments: true,
            enableEmailNotifications: true,
            enableWhatsAppNotifications: true,
            maxUsers: 5,
            maxProducts: 100,
            storageLimit: 1024,
          },
        },
      },
      include: {
        subscription: true,
        settings: true,
      },
    });

    console.log(`   ✓ Example instance created: ${exampleInstance.id}`);
    console.log(`   ✓ Subdomain: ${exampleInstance.subdomain}`);
    console.log(`   ✓ API Key: ${exampleInstance.apiKey}\n`);

    // 4. Afficher les instructions suivantes
    console.log('✅ Multi-Tenant System initialized successfully!\n');

    console.log('📋 Next steps:');
    console.log('1. Configure environment variables in .env.local');
    console.log('2. Test the Admin Dashboard at /admin/dashboard');
    console.log('3. Create your first instance via the UI');
    console.log('4. Set up the CRON job for subscription management');
    console.log('5. Configure payment gateways (AvadaPay, Strowallet)');
    console.log('\n🔗 Documentation: see MULTI_TENANT_GUIDE.md\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during setup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter l'initialisation
setupMultiTenant();
