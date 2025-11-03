const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedUsers() {
  try {
    console.log('🌱 Seeding default users...');

    // Hash des mots de passe
    const superAdminPassword = await bcrypt.hash('SuperAdmin123!', 10);
    const adminPassword = await bcrypt.hash('Admin123!', 10);
    const vendeurPassword = await bcrypt.hash('Vendeur123!', 10);

    // Super Admin
    const superAdmin = await prisma.user.upsert({
      where: { username: 'superadmin' },
      update: {},
      create: {
        username: 'superadmin',
        passwordHash: superAdminPassword,
        role: 'super-admin',
        totpEnabled: false,
      },
    });
    console.log('✅ Super Admin créé:', superAdmin.username);

    // Admin
    const admin = await prisma.user.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        passwordHash: adminPassword,
        role: 'admin',
        totpEnabled: false,
      },
    });
    console.log('✅ Admin créé:', admin.username);

    // Vendeur
    const vendeur = await prisma.user.upsert({
      where: { username: 'vendeur' },
      update: {},
      create: {
        username: 'vendeur',
        passwordHash: vendeurPassword,
        role: 'vendeur',
        totpEnabled: false,
      },
    });
    console.log('✅ Vendeur créé:', vendeur.username);

    console.log('\n📋 Identifiants par défaut:');
    console.log('================================');
    console.log('Super Admin:');
    console.log('  Username: superadmin');
    console.log('  Password: SuperAdmin123!');
    console.log('================================');
    console.log('Admin:');
    console.log('  Username: admin');
    console.log('  Password: Admin123!');
    console.log('================================');
    console.log('Vendeur:');
    console.log('  Username: vendeur');
    console.log('  Password: Vendeur123!');
    console.log('================================\n');
  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedUsers();
