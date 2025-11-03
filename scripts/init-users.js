const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function initUsers() {
  try {
    console.log('🔄 Initializing default users...\n');

    // Define default users
    const users = [
      {
        username: 'superadmin',
        password: 'SuperAdmin123!',
        role: 'superadmin'
      },
      {
        username: 'admin',
        password: 'Admin123!',
        role: 'admin'
      },
      {
        username: 'vendeur',
        password: 'Vendeur123!',
        role: 'vendeur'
      }
    ];

    for (const userData of users) {
      console.log(`📝 Creating ${userData.username}...`);

      // Check if user exists
      const existing = await prisma.user.findUnique({
        where: { username: userData.username }
      });

      if (existing) {
        console.log(`   ⚠️  ${userData.username} already exists`);
        continue;
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(userData.password, salt);

      // Create user
      const user = await prisma.user.create({
        data: {
          username: userData.username,
          passwordHash: hash,
          role: userData.role
        }
      });

      console.log(`   ✅ ${userData.username} created`);
      console.log(`      ID: ${user.id}`);
      console.log(`      Role: ${user.role}`);
      console.log(`      Hash: ${hash.substring(0, 20)}...\n`);
    }

    console.log('✅ All users initialized successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

initUsers();
