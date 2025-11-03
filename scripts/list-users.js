const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

(async () => {
  try {
    // Find all users
    const users = await prisma.user.findMany();
    console.log('All users in database:');
    users.forEach(u => {
      console.log(`  - ${u.username} (${u.role}): ${u.id}`);
    });
    
    // Find superadmin specifically
    console.log('\nSearching for superadmin...');
    const superadmin = await prisma.user.findUnique({
      where: { username: 'superadmin' }
    });
    
    if (superadmin) {
      console.log('✅ Found:');
      console.log('  Username:', superadmin.username);
      console.log('  Role:', superadmin.role);
      console.log('  Hash:', superadmin.passwordHash);
      console.log('  ID:', superadmin.id);
    } else {
      console.log('❌ Not found');
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
})();
