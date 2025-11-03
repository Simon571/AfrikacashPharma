import { NextRequest, NextResponse } from 'next/server';
import { configManager, validatePharmacyConfig } from '../../../lib/config';

// GET - Récupérer toutes les pharmacies
export async function GET() {
  try {
    const config = configManager.getConfig();
    return NextResponse.json({
      pharmacies: config.pharmacies,
      defaultPharmacy: config.defaultPharmacy,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des pharmacies:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des pharmacies' },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle pharmacie
export async function POST(request: NextRequest) {
  try {
    const pharmacyData = await request.json();
    
    // Valider les données
    const validationErrors = validatePharmacyConfig(pharmacyData);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          error: 'Données invalides', 
          details: validationErrors 
        },
        { status: 400 }
      );
    }

    // Ajouter la pharmacie
    const pharmacyId = configManager.addPharmacy(pharmacyData);
    
    // Sauvegarder la configuration mise à jour
    await configManager.saveConfig(configManager.getConfig());
    
    return NextResponse.json({ 
      success: true, 
      pharmacyId,
      message: 'Pharmacie créée avec succès' 
    });
  } catch (error: any) {
    console.error('Erreur lors de la création de la pharmacie:', error);
    const message = error?.message || 'Erreur lors de la création de la pharmacie';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}