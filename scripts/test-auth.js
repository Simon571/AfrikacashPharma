const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testAuth() {
  try {
    console.log('🔐 Test d\'authentification\n');

    const testCases = [
      { username: 'superadmin', password: 'SuperAdmin123!', expected: true },
      { username: 'admin', password: 'Admin123!', expected: true },
      { username: 'vendeur', password: 'Vendeur123!', expected: true },
      { username: 'superadmin', password: 'wrongpassword', expected: false },
    ];

    for (const testCase of testCases) {
      console.log(`Testing: ${testCase.username} with password ${testCase.password}`);
      
      const user = await prisma.user.findUnique({ 
        where: { username: testCase.username }
      });

      if (!user) {
        console.log(`  ❌ User not found\n`);
        continue;
      }

      const passwordOk = await bcrypt.compare(testCase.password, user.passwordHash);
      
      console.log(`  User found: ${user.username}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Password match: ${passwordOk ? '✅ YES' : '❌ NO'}`);
      console.log(`  Expected: ${testCase.expected ? '✅ YES' : '❌ NO'}`);
      console.log(`  Result: ${passwordOk === testCase.expected ? '✅ PASS' : '❌ FAIL'}\n`);
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testAuth();
