const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testNextAuthCredentials() {
  try {
    console.log('🔐 Test des credentials NextAuth\n');

    // Simulation de ce que NextAuth va faire
    const credentials = {
      username: 'superadmin',
      password: 'SuperAdmin123!'
    };

    console.log(`Testing login with: ${credentials.username}\n`);

    const user = await prisma.user.findUnique({ 
      where: { username: credentials.username }
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('✅ User found:');
    console.log(`  ID: ${user.id}`);
    console.log(`  Username: ${user.username}`);
    console.log(`  Role: ${user.role}`);
    console.log(`  Password Hash: ${user.passwordHash.substring(0, 20)}...`);

    const passwordOk = await bcrypt.compare(credentials.password, user.passwordHash);
    console.log(`\n✅ Password valid: ${passwordOk}`);

    if (passwordOk) {
      console.log('\n✅ NextAuth should return:');
      console.log(JSON.stringify({ 
        id: user.id, 
        name: user.username, 
        role: user.role 
      }, null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testNextAuthCredentials();
