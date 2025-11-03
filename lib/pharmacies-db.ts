// Shared in-memory storage for pharmacies
// This is temporary until Prisma is fully integrated
export let pharmaciesDatabase: any[] = [];

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
