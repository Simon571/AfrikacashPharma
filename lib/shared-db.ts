// Shared in-memory storage for users and pharmacies
export let usersDatabase: any[] = [];
export let pharmaciesDatabase: any[] = [];

export function initializeUsers() {
  if (usersDatabase.length > 0) {
    console.log('✅ Users already initialized');
    return;
  }

  const bcryptSync = require('bcryptjs');
  
  const users = [
    { username: 'superadmin', password: 'SuperAdmin123!', role: 'super-admin' },
    { username: 'admin', password: 'Admin123!', role: 'admin' },
    { username: 'vendeur', password: 'vendeur123', role: 'seller' }
  ];

  users.forEach((user) => {
    const salt = bcryptSync.genSaltSync(10);
    const hash = bcryptSync.hashSync(user.password, salt);
    usersDatabase.push({
      id: 'user_' + Date.now() + Math.random(),
      username: user.username,
      passwordHash: hash,
      role: user.role,
      createdAt: new Date().toISOString()
    });
  });

  console.log('✅ Default users initialized:', usersDatabase.map(u => u.username));
}

// Users functions
export function findUserByUsername(username: string) {
  return usersDatabase.find(u => u.username === username);
}

export function addUser(user: any) {
  usersDatabase.push(user);
  return user;
}

// Pharmacies functions
export function getPharmacies() {
  return pharmaciesDatabase;
}

export function addPharmacy(pharmacy: any) {
  pharmaciesDatabase.push(pharmacy);
  return pharmacy;
}

export function updatePharmacy(id: string, updates: any) {
  const index = pharmaciesDatabase.findIndex(p => p.id === id);
  if (index === -1) return null;
  
  pharmaciesDatabase[index] = {
    ...pharmaciesDatabase[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  return pharmaciesDatabase[index];
}

export function deletePharmacy(id: string) {
  const index = pharmaciesDatabase.findIndex(p => p.id === id);
  if (index === -1) return null;
  
  const deleted = pharmaciesDatabase.splice(index, 1);
  return deleted[0];
}

export function findPharmacyByEmail(email: string) {
  return pharmaciesDatabase.find(p => p.email === email);
}

export function findPharmacyById(id: string) {
  return pharmaciesDatabase.find(p => p.id === id);
}
