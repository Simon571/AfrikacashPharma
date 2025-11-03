import React from 'react';

// Configuration dynamique pour l'application générique de pharmacie
export interface PharmacyConfig {
  id: string;
  name: string;
  shortName: string;
  logo?: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
  };
  contact: {
    address: string;
    phone: string;
    email: string;
    website?: string;
  };
  features: {
    inventory: boolean;
    sales: boolean;
    clients: boolean;
    reports: boolean;
    multiLocation: boolean;
    prescriptions: boolean;
  };
  locale: {
    language: string;
    currency: string;
    timezone: string;
    dateFormat: string;
  };
  business: {
    taxRate: number;
    pharmacistLicense: string;
    openingHours: {
      [key: string]: { open: string; close: string; closed?: boolean };
    };
  };
}

export interface AppConfig {
  appName: string;
  version: string;
  isConfigured: boolean;
  defaultPharmacy?: string;
  pharmacies: PharmacyConfig[];
  superAdmin: {
    maxPharmacies: number;
    allowMultiTenant: boolean;
  };
}

// Configuration par défaut
export const defaultConfig: AppConfig = {
  appName: 'PharmaSuite',
  version: '1.0.0',
  isConfigured: false,
  pharmacies: [],
  superAdmin: {
    maxPharmacies: 10,
    allowMultiTenant: true,
  },
};

// Template de configuration pour nouvelle pharmacie
export const defaultPharmacyTemplate: Omit<PharmacyConfig, 'id'> = {
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

// Gestionnaire de configuration
class ConfigManager {
  private config: AppConfig;
  private configPath = process.env.CONFIG_PATH || './config/app-config.json';

  constructor() {
    this.config = { ...defaultConfig };
    this.loadConfig();
  }

  private async loadConfig(): Promise<void> {
    try {
      // En production, charger depuis la base de données ou fichier
      // Pour le développement, utiliser une configuration par défaut
      if (typeof window === 'undefined') {
        // Côté serveur
        const fs = await import('fs').then(m => m.promises);
        const path = await import('path');
        
        try {
          const configFile = path.resolve(this.configPath);
          const configData = await fs.readFile(configFile, 'utf-8');
          this.config = { ...defaultConfig, ...JSON.parse(configData) };
        } catch (error) {
          // Si le fichier n'existe pas, utiliser la configuration par défaut
          console.log('Aucun fichier de configuration trouvé, utilisation des valeurs par défaut');
        }
      } else {
        // Côté client
        try {
          const response = await fetch('/api/config');
          if (response.ok) {
            const configData = await response.json();
            this.config = { ...defaultConfig, ...configData };
          }
        } catch (error) {
          console.log('Impossible de charger la configuration depuis l\'API');
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration:', error);
    }
  }

  public async saveConfig(newConfig: Partial<AppConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig };

    try {
      if (typeof window === 'undefined') {
        // Côté serveur: écrire directement dans le fichier de configuration
        const fs = await import('fs').then(m => m.promises);
        const path = await import('path');
        const configFile = path.resolve(this.configPath);
        const dir = path.dirname(configFile);
        try {
          await fs.mkdir(dir, { recursive: true });
        } catch {
          // ignore
        }
        await fs.writeFile(configFile, JSON.stringify(this.config, null, 2), 'utf-8');
      } else {
        // Côté client: passer par l'API
        const response = await fetch('/api/config', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.config),
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la sauvegarde de la configuration');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      throw error;
    }
  }

  public getConfig(): AppConfig {
    return { ...this.config };
  }

  public getPharmacy(pharmacyId: string): PharmacyConfig | undefined {
    return this.config.pharmacies.find(p => p.id === pharmacyId);
  }

  public addPharmacy(pharmacy: Omit<PharmacyConfig, 'id'>): string {
    const id = `pharmacy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newPharmacy: PharmacyConfig = { ...pharmacy, id };
    
    this.config.pharmacies.push(newPharmacy);
    
    if (!this.config.defaultPharmacy) {
      this.config.defaultPharmacy = id;
    }
    
    return id;
  }

  public updatePharmacy(pharmacyId: string, updates: Partial<PharmacyConfig>): boolean {
    const index = this.config.pharmacies.findIndex(p => p.id === pharmacyId);
    if (index !== -1) {
      this.config.pharmacies[index] = { ...this.config.pharmacies[index], ...updates };
      return true;
    }
    return false;
  }

  public removePharmacy(pharmacyId: string): boolean {
    const index = this.config.pharmacies.findIndex(p => p.id === pharmacyId);
    if (index !== -1) {
      this.config.pharmacies.splice(index, 1);
      
      // Si c'était la pharmacie par défaut, choisir une autre
      if (this.config.defaultPharmacy === pharmacyId) {
        this.config.defaultPharmacy = this.config.pharmacies[0]?.id;
      }
      
      return true;
    }
    return false;
  }

  public isConfigured(): boolean {
    return this.config.isConfigured && this.config.pharmacies.length > 0;
  }

  public markAsConfigured(): void {
    this.config.isConfigured = true;
  }
}

// Instance singleton
export const configManager = new ConfigManager();

// Hook React pour utiliser la configuration
export function useConfig() {
  const [config, setConfig] = React.useState<AppConfig>(defaultConfig);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadConfig = async () => {
      try {
        const currentConfig = configManager.getConfig();
        setConfig(currentConfig);
      } catch (error) {
        console.error('Erreur lors du chargement de la configuration:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  const updateConfig = async (newConfig: Partial<AppConfig>) => {
    try {
      await configManager.saveConfig(newConfig);
      setConfig(configManager.getConfig());
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la configuration:', error);
      throw error;
    }
  };

  return {
    config,
    loading,
    updateConfig,
    isConfigured: configManager.isConfigured(),
  };
}

// Utilitaires pour la configuration
export function generatePharmacyId(): string {
  return `pharmacy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function validatePharmacyConfig(config: Partial<PharmacyConfig>): string[] {
  const errors: string[] = [];

  if (!config.name?.trim()) {
    errors.push('Le nom de la pharmacie est requis');
  }

  if (!config.contact?.email?.includes('@')) {
    errors.push('Une adresse email valide est requise');
  }

  if (!config.contact?.phone?.trim()) {
    errors.push('Un numéro de téléphone est requis');
  }

  if (!config.contact?.address?.trim()) {
    errors.push('Une adresse est requise');
  }

  return errors;
}