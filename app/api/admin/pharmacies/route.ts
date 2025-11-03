import { NextRequest, NextResponse } from 'next/server';
import { getPharmacies, addPharmacy, findPharmacyByEmail } from '../../../../lib/pharmacies-db';

// GET: List all pharmacies
export async function GET(req: NextRequest) {
  try {
    console.log('📌 GET /api/admin/pharmacies');
    const pharmacies = getPharmacies();
    console.log('✅ Pharmacies retournées:', pharmacies.length);
    return NextResponse.json(pharmacies);
  } catch (error) {
    console.error('❌ Erreur GET:', error);
    return NextResponse.json({ error: 'Erreur serveur', details: (error as any).message }, { status: 500 });
  }
}

// POST: Create new pharmacy
export async function POST(req: NextRequest) {
  try {
    console.log('📌 POST /api/admin/pharmacies');
    const body = await req.json();
    console.log('📝 Données reçues:', body);
    
    const { name, email, phone, address, status, trialDaysRemaining } = body;

    if (!name || !email) {
      console.log('❌ Validation: nom ou email manquant');
      return NextResponse.json({ error: 'Nom et email requis' }, { status: 400 });
    }

    // Check if email already exists
    const existing = findPharmacyByEmail(email);
    if (existing) {
      console.log('❌ Email déjà utilisé:', email);
      return NextResponse.json({ error: 'Email déjà utilisé' }, { status: 409 });
    }

    const pharmacy = {
      id: 'pharmacy_' + Date.now(),
      name,
      email,
      phone: phone || '',
      address: address || '',
      status: status || 'trial',
      trialDaysRemaining: trialDaysRemaining || 30,
      createdAt: new Date().toISOString()
    };

    addPharmacy(pharmacy);
    console.log('✅ Pharmacie créée:', pharmacy.id);
    return NextResponse.json(pharmacy, { status: 201 });
  } catch (error) {
    console.error('❌ Erreur POST:', error);
    return NextResponse.json({ error: 'Erreur serveur', details: (error as any).message }, { status: 500 });
  }
}
