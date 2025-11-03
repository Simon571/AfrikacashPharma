const fetch = require('node-fetch');

async function testAuth() {
  try {
    console.log('\n=== TEST DE L\'API NEXTAUTH ===\n');
    
    // Test 1: Accès à la session
    console.log('📋 Test 1: Vérifier que l\'API NextAuth répond');
    const sessionResponse = await fetch('http://localhost:3001/api/auth/session', {
      headers: {
        'Cookie': 'next-auth.session-token=test'
      }
    });
    
    console.log(`Status: ${sessionResponse.status}`);
    if (sessionResponse.ok) {
      console.log('✅ L\'API NextAuth répond');
    } else {
      console.log('⚠️ Status non 200:', sessionResponse.status);
    }
    
    // Test 2: Vérifier les providers
    console.log('\n📋 Test 2: Vérifier les providers disponibles');
    const providersResponse = await fetch('http://localhost:3001/api/auth/providers');
    console.log(`Status: ${providersResponse.status}`);
    
    if (providersResponse.ok) {
      const providers = await providersResponse.json();
      console.log('Providers disponibles:', Object.keys(providers));
      console.log('✅ Providers OK');
    }
    
    // Test 3: Vérifier les pages
    console.log('\n📋 Test 3: Vérifier les pages de login');
    const loginResponse = await fetch('http://localhost:3001/login');
    console.log(`Status /login: ${loginResponse.status}`);
    
    if (loginResponse.status === 200) {
      console.log('✅ Page /login accessible');
    }
    
    console.log('\n✅ Tests complétés');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testAuth();
