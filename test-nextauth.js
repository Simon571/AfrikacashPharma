#!/usr/bin/env node

/**
 * Script de test NextAuth avec credentials
 * Teste la route /api/auth/callback/credentials
 */

const http = require('http');

async function testAuth() {
  const testCases = [
    { username: 'admin', password: 'Admin123!', expected: true },
    { username: 'vendeur', password: 'vendeur123', expected: true },
    { username: 'superadmin', password: 'SuperAdmin123!', expected: true },
    { username: 'admin', password: 'WrongPassword', expected: false },
  ];

  for (const test of testCases) {
    console.log(`\n🧪 Test: ${test.username}/${test.password}...`);
    
    try {
      const body = JSON.stringify(test);
      
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/callback/credentials',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      };

      const result = await new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            resolve({
              statusCode: res.statusCode,
              body: data,
              headers: res.headers
            });
          });
        });
        
        req.on('error', reject);
        req.write(body);
        req.end();
      });

      console.log(`📊 Status: ${result.statusCode}`);
      console.log(`📋 Headers:`, JSON.stringify(result.headers, null, 2).split('\n').slice(0, 10).join('\n'));
      
      if (result.body) {
        try {
          const parsed = JSON.parse(result.body);
          console.log(`💾 Response:`, JSON.stringify(parsed, null, 2).split('\n').slice(0, 5).join('\n'));
        } catch {
          console.log(`💾 Response (raw):`, result.body.substring(0, 100));
        }
      }
    } catch (error) {
      console.error(`❌ Erreur:`, error.message);
    }
  }
}

testAuth().catch(console.error);
