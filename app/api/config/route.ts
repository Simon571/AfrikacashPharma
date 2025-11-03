import { NextRequest, NextResponse } from 'next/server';
import { configManager, AppConfig } from '../../../lib/config';
import fs from 'fs/promises';
import path from 'path';

// GET - Récupérer la configuration actuelle
export async function GET() {
  try {
    const config = configManager.getConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error('Erreur lors de la récupération de la configuration:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la configuration' },
      { status: 500 }
    );
  }
}

// POST - Sauvegarder la configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Valider les données reçues
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Données de configuration invalides' },
        { status: 400 }
      );
    }

    // Sauvegarder la configuration
    await configManager.saveConfig(body as Partial<AppConfig>);
    
    // Sauvegarder aussi dans un fichier pour la persistance
    const configPath = path.resolve('./config/app-config.json');
    const configDir = path.dirname(configPath);
    
    // Créer le dossier s'il n'existe pas
    try {
      await fs.access(configDir);
    } catch {
      await fs.mkdir(configDir, { recursive: true });
    }
    
    // Écrire le fichier de configuration
    await fs.writeFile(configPath, JSON.stringify(body, null, 2));
    
    return NextResponse.json({ 
      success: true, 
      message: 'Configuration sauvegardée avec succès' 
    });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la configuration:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde de la configuration' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour une partie de la configuration
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const currentConfig = configManager.getConfig();
    
    // Merger les configurations
    const updatedConfig = {
      ...currentConfig,
      ...body,
      pharmacies: body.pharmacies || currentConfig.pharmacies,
    };
    
    await configManager.saveConfig(updatedConfig);
    
    return NextResponse.json({ 
      success: true, 
      config: configManager.getConfig() 
    });
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour de la configuration:', error);
    return NextResponse.json(
      { error: error?.message || 'Erreur lors de la mise à jour de la configuration' },
      { status: 500 }
    );
  }
}