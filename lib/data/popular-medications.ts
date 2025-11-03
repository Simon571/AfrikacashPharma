export interface PopularMedication {
  name: string;
  indication: string;
  forms: string;
  note: string;
}

export const popularMedications: PopularMedication[] = [
  {
    name: 'Paracétamol',
    indication: 'Antalgique et antipyrétique de référence',
    forms: 'Comprimé, Sirop, Suppositoire',
    note: "Utilisé pour traiter la fièvre et les douleurs modérées chez l’adulte et l’enfant."
  },
  {
    name: 'Ibuprofène',
    indication: 'Anti-inflammatoire non stéroïdien (AINS)',
    forms: 'Comprimé, Gélule, Suspension orale',
    note: 'Soulage les douleurs d’origine inflammatoire et les états fébriles.'
  },
  {
    name: 'Amoxicilline',
    indication: 'Antibiotique de la famille des pénicillines',
    forms: 'Comprimé, Sirop, Injection',
    note: 'Traitement de première intention pour de nombreuses infections bactériennes courantes.'
  },
  {
    name: 'Oméprazole',
    indication: 'Inhibiteur de la pompe à protons',
    forms: 'Gélule gastro-résistante, Sachet',
    note: 'Recommandé pour le reflux gastro-œsophagien et les ulcères gastriques.'
  },
  {
    name: 'Metformine',
    indication: 'Antidiabétique oral de première ligne',
    forms: 'Comprimé, Comprimé LP',
    note: 'Contrôle la glycémie chez les patients atteints de diabète de type 2.'
  },
  {
    name: 'Salbutamol',
    indication: 'Bronchodilatateur à action rapide',
    forms: 'Inhalateur, Sirop, Nébulisation',
    note: 'Soulage les crises d’asthme et les bronchospasmes liés aux bronchites aiguës.'
  },
  {
    name: 'Ceftriaxone',
    indication: 'Antibiotique céphalosporine de 3e génération',
    forms: 'Injection IV/IM',
    note: 'Couverture large spectre pour les infections sévères hospitalières ou communautaires.'
  },
  {
    name: 'Smecta (Diosmectite)',
    indication: 'Pansement digestif',
    forms: 'Sachet à reconstituer',
    note: 'Traitement adjuvant des diarrhées aiguës et chroniques chez l’adulte et l’enfant.'
  }
];
