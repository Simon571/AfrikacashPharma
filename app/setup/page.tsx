'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PharmacyConfig, defaultPharmacyTemplate, validatePharmacyConfig } from '../../lib/config';
import { 
  Building2, MapPin, Phone, Mail, Clock, CreditCard, Settings, CheckCircle,
  ChevronLeft, ChevronRight, Loader2, Info, Palette, Globe, Link2
} from 'lucide-react';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
}

const setupSteps: SetupStep[] = [
  {
    id: 'basic',
    title: 'Informations de base',
    description: 'Nom et identité de votre pharmacie',
    icon: Building2,
  },
  {
    id: 'contact',
    title: 'Coordonnées',
    description: 'Adresse et informations de contact',
    icon: MapPin,
  },
  {
    id: 'business',
    title: 'Configuration métier',
    description: 'Horaires et paramètres commerciaux',
    icon: Clock,
  },
  {
    id: 'features',
    title: 'Fonctionnalités',
    description: 'Modules à activer pour votre pharmacie',
    icon: Settings,
  },
  {
    id: 'complete',
    title: 'Finalisation',
    description: 'Vérification et validation',
    icon: CheckCircle,
  },
];

const SetupWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [pharmacyData, setPharmacyData] = useState<Omit<PharmacyConfig, 'id'>>({
    ...defaultPharmacyTemplate,
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const progressPct = Math.round((currentStep / (setupSteps.length - 1)) * 100);

  const updatePharmacyData = (updates: Partial<PharmacyConfig>) => {
    setPharmacyData(prev => ({ ...prev, ...updates }));
    setErrors([]);
  };

  const validateCurrentStep = (): boolean => {
    const stepErrors: string[] = [];

    switch (setupSteps[currentStep].id) {
      case 'basic':
        if (!pharmacyData.name?.trim()) stepErrors.push('Le nom de la pharmacie est requis');
        if (!pharmacyData.shortName?.trim()) stepErrors.push('Le nom court est requis');
        break;

      case 'contact':
        if (!pharmacyData.contact.address?.trim()) stepErrors.push('L\'adresse est requise');
        if (!pharmacyData.contact.phone?.trim()) stepErrors.push('Le téléphone est requis');
        if (!pharmacyData.contact.email?.includes('@')) stepErrors.push('L\'email est invalide');
        break;

      case 'business':
        if (!pharmacyData.business.pharmacistLicense?.trim()) {
          stepErrors.push('Le numéro de licence pharmacien est requis');
        }
        break;
    }

    setErrors(stepErrors);
    return stepErrors.length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep() && currentStep < setupSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    
    try {
      // Valider toutes les données
      const allErrors = validatePharmacyConfig(pharmacyData);
      if (allErrors.length > 0) {
        setErrors(allErrors);
        setIsLoading(false);
        return;
      }

      // Créer la pharmacie
      console.log('Envoi des données de pharmacie:', pharmacyData);
      const response = await fetch('/api/pharmacies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pharmacyData),
      });

      console.log('Réponse de l\'API pharmacies:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Erreur API pharmacies:', errorData);
        throw new Error(`Erreur lors de la création de la pharmacie: ${response.status} - ${errorData}`);
      }

      const result = await response.json();
      console.log('Résultat de la création de pharmacie:', result);

      // Marquer l'application comme configurée
      console.log('Mise à jour de la configuration...');
      const configResponse = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          isConfigured: true,
          defaultPharmacy: result.pharmacyId,
        }),
      });

      console.log('Réponse de l\'API config:', configResponse.status, configResponse.statusText);

      if (!configResponse.ok) {
        const configErrorData = await configResponse.text();
        console.error('Erreur API config:', configErrorData);
        throw new Error(`Erreur lors de la mise à jour de la configuration: ${configResponse.status} - ${configErrorData}`);
      }

      // Rediriger vers le dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Erreur lors de la configuration:', error);
      
      // Gestion d'erreur plus détaillée
      let errorMessage = 'Erreur lors de la configuration. Veuillez réessayer.';
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Impossible de contacter le serveur. Vérifiez que l\'application est bien démarrée.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setErrors([errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    const step = setupSteps[currentStep];

    switch (step.id) {
      case 'basic':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#e2e8f0', marginBottom: '8px' }}>
                Nom de la pharmacie *
              </label>
              <input
                type="text"
                value={pharmacyData.name}
                onChange={(e) => updatePharmacyData({ name: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #334155', borderRadius: '8px', backgroundColor: 'rgba(15,23,42,0.8)', color: '#e2e8f0', fontSize: '14px', outline: 'none', transition: 'all 0.3s' }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#4ade80'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#334155'}
                placeholder="Ex: Pharmacie Centrale"
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#e2e8f0', marginBottom: '8px' }}>
                Nom court (pour l'affichage) *
              </label>
              <input
                type="text"
                value={pharmacyData.shortName}
                onChange={(e) => updatePharmacyData({ shortName: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #334155', borderRadius: '8px', backgroundColor: 'rgba(15,23,42,0.8)', color: '#e2e8f0', fontSize: '14px', outline: 'none', transition: 'all 0.3s' }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#4ade80'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#334155'}
                placeholder="Ex: Centrale"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#e2e8f0', marginBottom: '8px' }}>
                Couleur principale du thème
              </label>
              <input
                type="color"
                value={pharmacyData.theme.primaryColor}
                onChange={(e) => updatePharmacyData({ 
                  theme: { ...pharmacyData.theme, primaryColor: e.target.value }
                })}
                style={{ width: '80px', height: '40px', border: '1px solid #334155', borderRadius: '8px', cursor: 'pointer' }}
              />
            </div>
          </div>
        );

      case 'contact':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: 500, color: '#e2e8f0', marginBottom: '8px' }}>
                <MapPin className="inline w-4 h-4 mr-1" style={{ color: '#4ade80' }} />
                Adresse complète *
              </label>
              <textarea
                value={pharmacyData.contact.address}
                onChange={(e) => updatePharmacyData({ 
                  contact: { ...pharmacyData.contact, address: e.target.value }
                })}
                rows={3}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #334155', borderRadius: '8px', backgroundColor: 'rgba(15,23,42,0.8)', color: '#e2e8f0', fontSize: '14px', outline: 'none', fontFamily: 'inherit', transition: 'all 0.3s' }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#4ade80'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#334155'}
                placeholder="Adresse complète de la pharmacie"
              />
            </div>
            
            <div>
              <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: 500, color: '#e2e8f0', marginBottom: '8px' }}>
                <Phone className="inline w-4 h-4 mr-1" style={{ color: '#4ade80' }} />
                Téléphone *
              </label>
              <input
                type="tel"
                value={pharmacyData.contact.phone}
                onChange={(e) => updatePharmacyData({ 
                  contact: { ...pharmacyData.contact, phone: e.target.value }
                })}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #334155', borderRadius: '8px', backgroundColor: 'rgba(15,23,42,0.8)', color: '#e2e8f0', fontSize: '14px', outline: 'none', transition: 'all 0.3s' }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#4ade80'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#334155'}
                placeholder="Ex: +33 1 23 45 67 89"
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: 500, color: '#e2e8f0', marginBottom: '8px' }}>
                <Mail className="inline w-4 h-4 mr-1" style={{ color: '#4ade80' }} />
                Email *
              </label>
              <input
                type="email"
                value={pharmacyData.contact.email}
                onChange={(e) => updatePharmacyData({ 
                  contact: { ...pharmacyData.contact, email: e.target.value }
                })}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #334155', borderRadius: '8px', backgroundColor: 'rgba(15,23,42,0.8)', color: '#e2e8f0', fontSize: '14px', outline: 'none', transition: 'all 0.3s' }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#4ade80'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#334155'}
                placeholder="contact@pharmacie.fr"
              />
            </div>

            <div>
              <label style={{ fontSize: '14px', fontWeight: 500, color: '#e2e8f0', marginBottom: '8px', display: 'block' }}>
                Site web (optionnel)
              </label>
              <input
                type="url"
                value={pharmacyData.contact.website || ''}
                onChange={(e) => updatePharmacyData({ 
                  contact: { ...pharmacyData.contact, website: e.target.value }
                })}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #334155', borderRadius: '8px', backgroundColor: 'rgba(15,23,42,0.8)', color: '#e2e8f0', fontSize: '14px', outline: 'none', transition: 'all 0.3s' }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#4ade80'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#334155'}
                placeholder="https://www.pharmacie.fr"
              />
            </div>
          </div>
        );

      case 'business':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#e2e8f0', marginBottom: '8px' }}>
                Numéro de licence pharmacien *
              </label>
              <input
                type="text"
                value={pharmacyData.business.pharmacistLicense}
                onChange={(e) => updatePharmacyData({ 
                  business: { ...pharmacyData.business, pharmacistLicense: e.target.value }
                })}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #334155', borderRadius: '8px', backgroundColor: 'rgba(15,23,42,0.8)', color: '#e2e8f0', fontSize: '14px', outline: 'none', transition: 'all 0.3s' }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#4ade80'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#334155'}
                placeholder="Numéro de licence"
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: 500, color: '#e2e8f0', marginBottom: '8px' }}>
                <CreditCard className="inline w-4 h-4 mr-1" style={{ color: '#4ade80' }} />
                Taux de TVA (%)
              </label>
              <input
                type="number"
                min="0"
                max="50"
                step="0.1"
                value={pharmacyData.business.taxRate}
                onChange={(e) => updatePharmacyData({ 
                  business: { ...pharmacyData.business, taxRate: parseFloat(e.target.value) || 0 }
                })}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #334155', borderRadius: '8px', backgroundColor: 'rgba(15,23,42,0.8)', color: '#e2e8f0', fontSize: '14px', outline: 'none', transition: 'all 0.3s' }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#4ade80'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#334155'}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#e2e8f0', marginBottom: '8px' }}>
                Devise
              </label>
              <select
                value={pharmacyData.locale.currency}
                onChange={(e) => updatePharmacyData({ 
                  locale: { ...pharmacyData.locale, currency: e.target.value }
                })}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #334155', borderRadius: '8px', backgroundColor: 'rgba(15,23,42,0.8)', color: '#e2e8f0', fontSize: '14px', outline: 'none', transition: 'all 0.3s' }}
              >
                <option value="EUR">Euro (EUR)</option>
                <option value="USD">Dollar US (USD)</option>
                <option value="GBP">Livre Sterling (GBP)</option>
                <option value="CHF">Franc Suisse (CHF)</option>
                <option value="CDF">Franc Congolais (CDF)</option>
              </select>
            </div>
          </div>
        );

      case 'features':
        return (
          <div>
            <p style={{ color: '#cbd5e1', marginBottom: '16px' }}>
              Sélectionnez les fonctionnalités que vous souhaitez activer :
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {Object.entries({
                inventory: 'Gestion des stocks',
                sales: 'Gestion des ventes',
                clients: 'Gestion des clients',
                reports: 'Rapports et statistiques',
                prescriptions: 'Gestion des ordonnances',
                multiLocation: 'Multi-emplacements',
              }).map(([key, label]) => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid #334155', borderRadius: '8px', backgroundColor: 'rgba(15,23,42,0.5)', cursor: 'pointer', transition: 'all 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(74,222,128,0.5)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#334155'}>
                  <input
                    type="checkbox"
                    checked={pharmacyData.features[key as keyof typeof pharmacyData.features]}
                    onChange={(e) => updatePharmacyData({
                      features: {
                        ...pharmacyData.features,
                        [key]: e.target.checked,
                      }
                    })}
                    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#4ade80' }}
                  />
                  <span style={{ color: '#e2e8f0' }}>{label}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'complete':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ textAlign: 'center' }}>
              <CheckCircle className="w-16 h-16" style={{ color: '#10b981', margin: '0 auto 16px', display: 'block' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#e2e8f0', marginBottom: '8px' }}>
                Configuration terminée !
              </h3>
              <p style={{ color: '#cbd5e1' }}>
                Votre pharmacie "{pharmacyData.name}" est prête à être utilisée.
              </p>
            </div>

            <div style={{ backgroundColor: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', padding: '16px', borderRadius: '8px' }}>
              <h4 style={{ fontWeight: 600, color: '#e2e8f0', marginBottom: '8px' }}>Résumé de votre configuration :</h4>
              <ul style={{ fontSize: '14px', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li>• Nom : {pharmacyData.name}</li>
                <li>• Adresse : {pharmacyData.contact.address}</li>
                <li>• Email : {pharmacyData.contact.email}</li>
                <li>• Fonctionnalités activées : {Object.entries(pharmacyData.features).filter(([_, enabled]) => enabled).length}</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', overflow: 'hidden', backgroundColor: '#000' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: -10, background: 'linear-gradient(to bottom, #0f172a 0%, #0f172a 50%, #000 100%)' }} />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(to right, rgba(16,185,129,0.2), rgba(20,184,166,0.2))', borderBottom: '1px solid rgba(16,185,129,0.3)' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '32px 16px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#e2e8f0' }}>Configuration initiale</h1>
          <p style={{ marginTop: '8px', color: '#cbd5e1' }}>Configurez votre pharmacie en quelques étapes simples</p>
          <div style={{ marginTop: '16px', height: '8px', width: '100%', backgroundColor: 'rgba(74,222,128,0.2)', borderRadius: '9999px', overflow: 'hidden' }}>
            <div style={{ height: '8px', backgroundColor: '#4ade80', borderRadius: '9999px', transition: 'all 0.3s ease', width: `${progressPct}%` }} />
          </div>
          <p style={{ marginTop: '8px', fontSize: '12px', color: '#94a3b8' }}>{progressPct}% complété</p>
        </div>
      </div>

      {/* Main */}
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
          {/* Sidebar steps */}
          <aside>
            <div style={{ background: 'linear-gradient(to br, rgba(30,41,59,0.8), rgba(15,23,42,0.8))', border: '1px solid #334155', borderRadius: '16px', padding: '24px', position: 'sticky', top: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0' }}>Étapes</h3>
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {setupSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = index === currentStep;
                  const isCompleted = index < currentStep;
                  return (
                    <div key={step.id} style={{ display: 'flex', gap: '12px', padding: '12px', borderRadius: '8px', border: isActive ? '1px solid rgba(74,222,128,0.5)' : isCompleted ? '1px solid #10b981' : '1px solid #334155', backgroundColor: isActive ? 'rgba(74,222,128,0.1)' : isCompleted ? 'rgba(16,185,129,0.1)' : 'transparent', transition: 'all 0.3s' }}>
                      <div style={{ marginTop: '4px', display: 'flex', height: '32px', width: '32px', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', backgroundColor: isActive ? '#10b981' : isCompleted ? '#10b981' : '#334155', color: isActive || isCompleted ? 'white' : '#94a3b8' }}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: 500, color: isActive ? '#4ade80' : '#e2e8f0' }}>{step.title}</p>
                        <p style={{ fontSize: '12px', color: '#94a3b8' }}>{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Content card */}
          <section>
            <div style={{ background: 'linear-gradient(to br, rgba(30,41,59,0.8), rgba(15,23,42,0.8))', border: '1px solid #334155', borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ padding: '24px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#e2e8f0' }}>{setupSteps[currentStep].title}</h2>
                  <p style={{ fontSize: '14px', color: '#94a3b8' }}>{setupSteps[currentStep].description}</p>
                </div>
                {currentStep > 0 && (
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Étape {currentStep + 1} / {setupSteps.length}</span>
                )}
              </div>

              <div style={{ padding: '24px' }}>
                {errors.length > 0 && (
                  <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.5)', backgroundColor: 'rgba(239,68,68,0.1)', padding: '16px' }}>
                    <Info className="h-5 w-5" style={{ color: '#ef4444', marginTop: '2px' }} />
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 500, color: '#fca5a5' }}>Veuillez corriger les éléments suivants :</p>
                      <ul style={{ marginTop: '8px', paddingLeft: '16px', fontSize: '14px', color: '#fca5a5', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {errors.map((error, idx) => (
                          <li key={idx}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {renderStepContent()}
              </div>

              <div style={{ padding: '16px 24px', borderTop: '1px solid #334155', backgroundColor: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 0 || isLoading}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', borderRadius: '8px', padding: '10px 16px', fontSize: '14px', fontWeight: 500, transition: 'all 0.3s', backgroundColor: currentStep === 0 || isLoading ? '#334155' : 'transparent', color: currentStep === 0 || isLoading ? '#64748b' : '#e2e8f0', border: currentStep === 0 || isLoading ? 'none' : '1px solid #475569', cursor: currentStep === 0 || isLoading ? 'not-allowed' : 'pointer' }}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Précédent
                </button>

                <div style={{ display: 'flex', gap: '12px' }}>
                  {currentStep === setupSteps.length - 1 && (
                    <button
                      onClick={async () => {
                        try {
                          await fetch('/api/auth/signout', { method: 'POST' });
                          router.push('/login');
                        } catch (error) {
                          console.error('Erreur lors de la déconnexion:', error);
                        }
                      }}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: 600, color: '#e2e8f0', border: '1px solid #475569', backgroundColor: 'transparent', transition: 'all 0.3s', cursor: 'pointer' }}
                    >
                      Se déconnecter
                    </button>
                  )}
                  {currentStep === setupSteps.length - 1 ? (
                    <button
                      onClick={handleComplete}
                      disabled={isLoading}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: 600, color: 'white', transition: 'all 0.3s', background: 'linear-gradient(to right, #059669, #0d9488)', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1 }}
                    >
                      {isLoading && <Loader2 className="h-4 w-4" style={{ animation: 'spin 1s linear infinite' }} />}
                      {isLoading ? 'Configuration…' : 'Terminer la configuration'}
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      disabled={isLoading}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: 600, color: 'white', background: 'linear-gradient(to right, #059669, #0d9488)', transition: 'all 0.3s', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1 }}
                    >
                      Suivant
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SetupWizard;