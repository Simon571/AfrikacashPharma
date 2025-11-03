import { NextRequest, NextResponse } from 'next/server';
import { configManager, validatePharmacyConfig } from '../../../../lib/config';

// GET - Récupérer une pharmacie spécifique
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const pharmacy = configManager.getPharmacy(params.id);
    
    if (!pharmacy) {
      return NextResponse.json(
        { error: 'Pharmacie non trouvée' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(pharmacy);
  } catch (error) {
    console.error('Erreur lors de la récupération de la pharmacie:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la pharmacie' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour une pharmacie
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
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

    // Mettre à jour la pharmacie
    const success = configManager.updatePharmacy(params.id, pharmacyData);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Pharmacie non trouvée' },
        { status: 404 }
      );
    }
    
    // Sauvegarder la configuration mise à jour
    await configManager.saveConfig(configManager.getConfig());
    
    return NextResponse.json({ 
      success: true, 
      message: 'Pharmacie mise à jour avec succès' 
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la pharmacie:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la pharmacie' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une pharmacie
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const success = configManager.removePharmacy(params.id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Pharmacie non trouvée' },
        { status: 404 }
      );
    }
    
    // Sauvegarder la configuration mise à jour
    await configManager.saveConfig(configManager.getConfig());
    
    return NextResponse.json({ 
      success: true, 
      message: 'Pharmacie supprimée avec succès' 
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la pharmacie:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la pharmacie' },
      { status: 500 }
    );
  }
}