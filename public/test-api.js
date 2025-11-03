// Test direct de l'API NextAuth
const testLogin = async () => {
  try {
    console.log('📨 Test direct de POST /api/auth/callback/credentials');
    
    const response = await fetch('/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'superadmin',
        password: 'SuperAdmin123!'
      })
    });

    console.log('Response status:', response.status);
    console.log('Response body:', await response.text());
  } catch (error) {
    console.error('Error:', error);
  }
};

// Copier-coller cette fonction dans la console du navigateur (F12)
// et exécutez testLogin()
console.log('Fonction testLogin() disponible. Exécutez testLogin() pour tester.');
