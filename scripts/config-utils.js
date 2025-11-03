#!/usr/bin/env node

/**
 * Scripts utilitaires pour PharmaSuite
 * Usage: node scripts/config-utils.js [command]
 */

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '..', 'config', 'app-config.json');

// Configuration par défaut
const DEFAULT_CONFIG = {
  appName: 'PharmaSuite',
  version: '1.0.0',
  isConfigured: false,
  pharmacies: [],
  superAdmin: {
    maxPharmacies: 10,
    allowMultiTenant: true,
  },
};

// Template de pharmacie par défaut
const PHARMACY_TEMPLATE = {
  name: '',
  shortName: '',
  theme: {
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    backgroundColor: '#F9FAFB',
    textColor: '#1F2937',
  },
  contact: {
    address: '',
    phone: '',
    email: '',
  },
  features: {
    inventory: true,
    sales: true,
    clients: true,
    reports: true,
    multiLocation: false,
    prescriptions: true,
  },
  locale: {
    language: 'fr',
    currency: 'EUR',
    timezone: 'Europe/Paris',
    dateFormat: 'dd/MM/yyyy',
  },
  business: {
    taxRate: 20,
    pharmacistLicense: '',
    openingHours: {
      monday: { open: '08:00', close: '19:00' },
      tuesday: { open: '08:00', close: '19:00' },
      wednesday: { open: '08:00', close: '19:00' },
      thursday: { open: '08:00', close: '19:00' },
      friday: { open: '08:00', close: '19:00' },
      saturday: { open: '08:00', close: '18:00' },
      sunday: { open: '09:00', close: '13:00' },
    },
  },
};

class ConfigManager {
  constructor() {
    this.ensureConfigDir();
  }

  ensureConfigDir() {
    const configDir = path.dirname(CONFIG_PATH);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
  }

  loadConfig() {
    try {
      if (fs.existsSync(CONFIG_PATH)) {
        const configData = fs.readFileSync(CONFIG_PATH, 'utf8');
        return { ...DEFAULT_CONFIG, ...JSON.parse(configData) };
      }
      return DEFAULT_CONFIG;
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration:', error.message);
      return DEFAULT_CONFIG;
    }
  }

  saveConfig(config) {
    try {
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
      console.log('✅ Configuration sauvegardée avec succès');
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error.message);
      return false;
    }
  }

  resetConfig() {
    console.log('🔄 Réinitialisation de la configuration...');
    return this.saveConfig(DEFAULT_CONFIG);
  }

  validateConfig() {
    const config = this.loadConfig();
    const errors = [];

    // Validation basique
    if (!config.appName) errors.push('Nom de l\'application manquant');
    if (!config.version) errors.push('Version manquante');
    
    // Validation des pharmacies
    config.pharmacies.forEach((pharmacy, index) => {
      if (!pharmacy.name) errors.push(`Pharmacie ${index + 1}: nom manquant`);
      if (!pharmacy.contact?.email) errors.push(`Pharmacie ${index + 1}: email manquant`);
      if (!pharmacy.contact?.phone) errors.push(`Pharmacie ${index + 1}: téléphone manquant`);
    });

    if (errors.length === 0) {
      console.log('✅ Configuration valide');
      return true;
    } else {
      console.log('❌ Erreurs de configuration:');
      errors.forEach(error => console.log(`  - ${error}`));
      return false;
    }
  }

  createPharmacyTemplate(name, shortName, email) {
    const pharmacy = {
      ...PHARMACY_TEMPLATE,
      id: `pharmacy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name || 'Nouvelle Pharmacie',
      shortName: shortName || 'Nouvelle',
      contact: {
        ...PHARMACY_TEMPLATE.contact,
        email: email || 'contact@pharmacie.fr',
      },
    };

    const config = this.loadConfig();
    config.pharmacies.push(pharmacy);
    
    if (!config.defaultPharmacy) {
      config.defaultPharmacy = pharmacy.id;
    }

    if (this.saveConfig(config)) {
      console.log(`✅ Pharmacie "${name}" créée avec l'ID: ${pharmacy.id}`);
      return pharmacy.id;
    }
    return null;
  }

  listPharmacies() {
    const config = this.loadConfig();
    
    if (config.pharmacies.length === 0) {
      console.log('ℹ️  Aucune pharmacie configurée');
      return;
    }

    console.log(`📋 Pharmacies configurées (${config.pharmacies.length}):`);
    config.pharmacies.forEach((pharmacy, index) => {
      const isDefault = config.defaultPharmacy === pharmacy.id;
      console.log(`  ${index + 1}. ${pharmacy.name} (${pharmacy.shortName})${isDefault ? ' [PAR DÉFAUT]' : ''}`);
      console.log(`     ID: ${pharmacy.id}`);
      console.log(`     Email: ${pharmacy.contact.email}`);
      console.log(`     Téléphone: ${pharmacy.contact.phone}`);
      console.log('');
    });
  }

  exportConfig(filename) {
    const config = this.loadConfig();
    const exportPath = filename || `pharma-config-${Date.now()}.json`;
    
    try {
      fs.writeFileSync(exportPath, JSON.stringify(config, null, 2));
      console.log(`✅ Configuration exportée vers: ${exportPath}`);
    } catch (error) {
      console.error('❌ Erreur lors de l\'export:', error.message);
    }
  }

  importConfig(filename) {
    if (!fs.existsSync(filename)) {
      console.error(`❌ Fichier non trouvé: ${filename}`);
      return;
    }

    try {
      const importedData = fs.readFileSync(filename, 'utf8');
      const importedConfig = JSON.parse(importedData);
      
      // Validation basique
      if (!importedConfig.appName || !importedConfig.version) {
        console.error('❌ Fichier de configuration invalide');
        return;
      }

      if (this.saveConfig(importedConfig)) {
        console.log(`✅ Configuration importée depuis: ${filename}`);
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'import:', error.message);
    }
  }

  showStatus() {
    const config = this.loadConfig();
    
    console.log('📊 État de la configuration:');
    console.log(`  Application: ${config.appName} v${config.version}`);
    console.log(`  Configurée: ${config.isConfigured ? '✅ Oui' : '❌ Non'}`);
    console.log(`  Pharmacies: ${config.pharmacies.length}`);
    console.log(`  Pharmacie par défaut: ${config.defaultPharmacy || 'Aucune'}`);
    console.log(`  Multi-tenant: ${config.superAdmin?.allowMultiTenant ? '✅ Activé' : '❌ Désactivé'}`);
    console.log(`  Max pharmacies: ${config.superAdmin?.maxPharmacies || 'Illimité'}`);
  }

  cleanupOldReferences() {
    console.log('🧹 Nettoyage des anciennes références...');
    const config = this.loadConfig();
    let changed = false;

    // Nettoyer les références à Pajo-Pharma
    if (config.appName === 'Pajo-Pharma' || config.appName === 'pajo-pharma') {
      config.appName = 'PharmaSuite';
      changed = true;
    }

    config.pharmacies.forEach(pharmacy => {
      if (pharmacy.name.includes('Pajo') || pharmacy.name.includes('pajo')) {
        console.log(`⚠️  Pharmacie avec référence détectée: ${pharmacy.name}`);
        console.log('   Veuillez la renommer manuellement');
      }
    });

    if (changed) {
      this.saveConfig(config);
      console.log('✅ Références nettoyées');
    } else {
      console.log('✅ Aucune référence à nettoyer');
    }
  }
}

// CLI
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const manager = new ConfigManager();

  switch (command) {
    case 'reset':
      manager.resetConfig();
      break;

    case 'validate':
      manager.validateConfig();
      break;

    case 'status':
      manager.showStatus();
      break;

    case 'list':
      manager.listPharmacies();
      break;

    case 'create':
      const name = args[1];
      const shortName = args[2];
      const email = args[3];
      if (!name) {
        console.error('Usage: node config-utils.js create <nom> [nom-court] [email]');
        process.exit(1);
      }
      manager.createPharmacyTemplate(name, shortName, email);
      break;

    case 'export':
      manager.exportConfig(args[1]);
      break;

    case 'import':
      if (!args[1]) {
        console.error('Usage: node config-utils.js import <fichier>');
        process.exit(1);
      }
      manager.importConfig(args[1]);
      break;

    case 'cleanup':
      manager.cleanupOldReferences();
      break;

    default:
      console.log('🔧 PharmaSuite - Utilitaires de Configuration');
      console.log('');
      console.log('Usage: node scripts/config-utils.js <commande>');
      console.log('');
      console.log('Commandes disponibles:');
      console.log('  reset      - Réinitialiser la configuration');
      console.log('  validate   - Valider la configuration');
      console.log('  status     - Afficher l\'état de la configuration');
      console.log('  list       - Lister les pharmacies configurées');
      console.log('  create     - Créer une nouvelle pharmacie');
      console.log('  export     - Exporter la configuration');
      console.log('  import     - Importer une configuration');
      console.log('  cleanup    - Nettoyer les anciennes références');
      console.log('');
      console.log('Exemples:');
      console.log('  node scripts/config-utils.js create "Pharmacie Centrale" "Centrale" "contact@centrale.fr"');
      console.log('  node scripts/config-utils.js export backup.json');
      console.log('  node scripts/config-utils.js import backup.json');
  }
}

if (require.main === module) {
  main();
}

module.exports = { ConfigManager, DEFAULT_CONFIG, PHARMACY_TEMPLATE };