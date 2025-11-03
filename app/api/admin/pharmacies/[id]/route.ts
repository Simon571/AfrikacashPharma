import { NextRequest, NextResponse } from 'next/server';
import { findPharmacyById, updatePharmacy, deletePharmacy, findPharmacyByEmail } from '../../../../../lib/pharmacies-db';

// GET: Retrieve single pharmacy
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    console.log(`📌 GET /api/admin/pharmacies/${params.id}`);
    const pharmacy = findPharmacyById(params.id);
    
    if (!pharmacy) {
      return NextResponse.json({ error: 'Pharmacie non trouvée' }, { status: 404 });
    }
    
    return NextResponse.json(pharmacy);
  } catch (error) {
    console.error('❌ Erreur GET:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT: Update pharmacy
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    console.log(`📌 PUT /api/admin/pharmacies/${params.id}`);
    const body = await req.json();
    
    const pharmacy = findPharmacyById(params.id);
    if (!pharmacy) {
      return NextResponse.json({ error: 'Pharmacie non trouvée' }, { status: 404 });
    }
    
    // Check if new email is not already used by another pharmacy
    if (body.email && body.email !== pharmacy.email) {
      const emailExists = findPharmacyByEmail(body.email);
      if (emailExists) {
        return NextResponse.json({ error: 'Email déjà utilisé' }, { status: 409 });
      }
    }
    
    const updated = updatePharmacy(params.id, body);
    console.log('✅ Pharmacie mise à jour:', params.id);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('❌ Erreur PUT:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE: Delete pharmacy
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    console.log(`📌 DELETE /api/admin/pharmacies/${params.id}`);
    
    const deleted = deletePharmacy(params.id);
    if (!deleted) {
      return NextResponse.json({ error: 'Pharmacie non trouvée' }, { status: 404 });
    }
    
    console.log('✅ Pharmacie supprimée:', params.id);
    return NextResponse.json({ message: 'Deleted', pharmacy: deleted });
  } catch (error) {
    console.error('❌ Erreur DELETE:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
