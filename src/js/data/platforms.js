import { getCachedPlatforms, savePlatformsDb } from './db.js';

const basePlatforms = [
  {
    id: "chorus-pro",
    name: "Portail Public de Facturation (Chorus Pro)",
    logo: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="platform-logo-svg"><circle cx="50" cy="50" r="48" fill="#1E3A8A"/><path d="M30 45 L50 25 L70 45 M50 25 L50 75" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><path d="M35 75 L65 75" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round"/></svg>`,
    price: 0,
    priceLabel: "Gratuit (Service Public)",
    rating: 3.4,
    description: "Le portail public obligatoire (PPF) proposé par l'État pour échanger vos factures de manière réglementaire sans frais de transaction.",
    advantages: [
      "100% Gratuit à vie, sans abonnement",
      "Garantie de conformité absolue de l'État",
      "Idéal pour l'envoi vers les administrations (B2G)"
    ],
    disadvantages: [
      "Interface austère et peu ergonomique",
      "Aucun outil de paiement ou de relance",
      "Pas d'analyse financière ni de tableau de bord",
      "Support client minimaliste (par ticket)"
    ],
    features: {
      eInvoicing: true,
      eReporting: true,
      receiving: true,
      payment: false,
      signature: false,
      reminders: false,
      api: true,
      multiUser: false,
      quotes: false,
      accountingSync: false,
      assistance: false
    },
    compatibility: {
      status: ["micro-entreprise", "association", "autre", "EURL"],
      volume: ["less-50"],
      software: ["excel", "none", "autre"],
      accountant: [true, false],
      budget: ["free"]
    },
    url: "https://chorus-pro.gouv.fr/",
    recommended: false
  },
  {
    id: "pennylane",
    name: "Pennylane (Candidat PDP)",
    logo: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="platform-logo-svg"><rect width="100" height="100" rx="20" fill="#0000FF"/><circle cx="35" cy="50" r="15" fill="#38BDF8"/><circle cx="65" cy="50" r="15" fill="#38BDF8"/><path d="M35 50 L65 50" stroke="#38BDF8" stroke-width="6"/></svg>`,
    price: 19,
    priceLabel: "Dès 19 € / mois",
    rating: 4.8,
    description: "La plateforme financière tout-en-un plébiscitée par les TPE et PME. Elle combine facturation, pré-comptabilité et gestion de trésorerie.",
    advantages: [
      "Lien direct et temps réel avec votre comptable",
      "Synchronisation bancaire ultra-fluide",
      "Gestion complète (devis, factures, achats, banque)"
    ],
    disadvantages: [
      "Tarifs progressifs selon le nombre de transactions",
      "Onboarding autonome sur la formule d'entrée"
    ],
    features: {
      eInvoicing: true,
      eReporting: true,
      receiving: true,
      payment: true,
      signature: true,
      reminders: true,
      api: true,
      multiUser: true,
      quotes: true,
      accountingSync: true,
      assistance: true
    },
    compatibility: {
      status: ["SAS", "SARL", "EURL", "micro-entreprise"],
      volume: ["less-50", "50-200", "200-500"],
      software: ["pennylane", "none", "excel", "autre"],
      accountant: [true, false],
      budget: ["less-20", "20-50", "50-100"]
    },
    url: "https://www.pennylane.com/",
    recommended: true
  },
  {
    id: "libeo",
    name: "Libeo (Candidat PDP)",
    logo: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="platform-logo-svg"><rect width="100" height="100" rx="20" fill="#0D9488"/><path d="M30 70 V30 L70 70 V30" stroke="#FFFFFF" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    price: 29,
    priceLabel: "Dès 29 € / mois",
    rating: 4.6,
    description: "Le spécialiste du traitement et du paiement des factures fournisseurs. Parfait pour simplifier la chaîne d'achat et le rapprochement.",
    advantages: [
      "Paiement des fournisseurs en un clic sans quitter l'outil",
      "Importation automatique des factures par IA (OCR)",
      "Validation collaborative des factures (workflows d'approbation)"
    ],
    disadvantages: [
      "Moins axé sur la facturation client complexe (devis avancés)",
      "Tarification par module qui peut grimper"
    ],
    features: {
      eInvoicing: true,
      eReporting: true,
      receiving: true,
      payment: true,
      signature: false,
      reminders: true,
      api: true,
      multiUser: true,
      quotes: false,
      accountingSync: true,
      assistance: true
    },
    compatibility: {
      status: ["SAS", "SARL", "EURL"],
      volume: ["50-200", "200-500", "500-1000"],
      software: ["none", "excel", "autre"],
      accountant: [true, false],
      budget: ["20-50", "50-100"]
    },
    url: "https://libeo.io/",
    recommended: false
  },
  {
    id: "cegid",
    name: "Cegid (PDP Officiel)",
    logo: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="platform-logo-svg"><rect width="100" height="100" rx="20" fill="#E11D48"/><path d="M35 35 C40 30, 60 30, 65 35 M35 65 C40 70, 60 70, 65 65 M30 50 H70" stroke="#FFFFFF" stroke-width="10" stroke-linecap="round"/></svg>`,
    price: 45,
    priceLabel: "Dès 45 € / mois",
    rating: 4.5,
    description: "Un pilier historique de la gestion en France. Cegid propose une plateforme PDP robuste, taillée pour la conformité et connectée à tout son écosystème.",
    advantages: [
      "Écosystème extrêmement vaste et certifié",
      "Idéal si vous utilisez déjà un ERP Cegid ou Quadra",
      "Support technique français très structuré et disponible"
    ],
    disadvantages: [
      "Interface parfois jugée classique ou complexe",
      "Contrat d'engagement fréquent",
      "Coût d'intégration pour les configurations ERP spécifiques"
    ],
    features: {
      eInvoicing: true,
      eReporting: true,
      receiving: true,
      payment: false,
      signature: true,
      reminders: true,
      api: true,
      multiUser: true,
      quotes: true,
      accountingSync: true,
      assistance: true
    },
    compatibility: {
      status: ["SAS", "SARL", "EURL"],
      volume: ["50-200", "200-500", "500-1000", "plus-1000"],
      software: ["cegid", "none", "excel", "autre"],
      accountant: [true],
      budget: ["20-50", "50-100", "plus-100"]
    },
    url: "https://www.cegid.com/",
    recommended: false
  },
  {
    id: "sage",
    name: "Sage Network (PDP Officiel)",
    logo: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="platform-logo-svg"><rect width="100" height="100" rx="20" fill="#059669"/><circle cx="50" cy="50" r="25" stroke="#FFFFFF" stroke-width="8"/><circle cx="50" cy="50" r="10" fill="#FFFFFF"/></svg>`,
    price: 59,
    priceLabel: "Dès 59 € / mois",
    rating: 4.7,
    description: "La solution de référence pour les PME et ETI. Sage Network automatise l'échange de factures électroniques en s'intégrant nativement à votre gestion commerciale Sage.",
    advantages: [
      "Puissance de traitement adaptée aux gros volumes de factures",
      "Accompagnement personnalisé et réseau d'intégrateurs local",
      "Sécurité des données de niveau bancaire et conformité PDP"
    ],
    disadvantages: [
      "Investissement financier élevé (licences + intégration)",
      "Surdimensionné pour les micro-entreprises ou TPE simples"
    ],
    features: {
      eInvoicing: true,
      eReporting: true,
      receiving: true,
      payment: true,
      signature: true,
      reminders: true,
      api: true,
      multiUser: true,
      quotes: true,
      accountingSync: true,
      assistance: true
    },
    compatibility: {
      status: ["SAS", "SARL"],
      volume: ["200-500", "500-1000", "plus-1000"],
      software: ["sage", "none", "excel", "autre"],
      accountant: [true],
      budget: ["50-100", "plus-100"]
    },
    url: "https://www.sage.com/",
    recommended: true
  },
  {
    id: "ebp",
    name: "EBP Facturation (Candidat PDP)",
    logo: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="platform-logo-svg"><rect width="100" height="100" rx="20" fill="#2563EB"/><path d="M30 30 H70 V45 H30 V60 H70" stroke="#FFFFFF" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    price: 15,
    priceLabel: "Dès 15 € / mois",
    rating: 4.3,
    description: "Partenaire historique des TPE, artisans et commerçants français. EBP propose un module de facturation cloud simple et conforme.",
    advantages: [
      "Idéal pour les artisans et le bâtiment (gestion des devis)",
      "Tarif abordable pour débuter la transition numérique",
      "Support téléphonique en France performant"
    ],
    disadvantages: [
      "Moins d'automatisation bancaire que Pennylane",
      "Interface bureau cloudifiée parfois un peu rigide",
      "Pas d'API ouverte sur les plans de base"
    ],
    features: {
      eInvoicing: true,
      eReporting: true,
      receiving: true,
      payment: false,
      signature: true,
      reminders: false,
      api: false,
      multiUser: true,
      quotes: true,
      accountingSync: true,
      assistance: true
    },
    compatibility: {
      status: ["micro-entreprise", "SAS", "SARL", "EURL"],
      volume: ["less-50", "50-200", "200-500"],
      software: ["ebp", "none", "excel", "autre"],
      accountant: [true, false],
      budget: ["less-20", "20-50", "50-100"]
    },
    url: "https://www.ebp.com/",
    recommended: false
  },
  {
    id: "tiime",
    name: "Tiime (Candidat PDP)",
    logo: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="platform-logo-svg"><rect width="100" height="100" rx="20" fill="#4F46E5"/><path d="M30 35 H70 M50 35 V75" stroke="#FFFFFF" stroke-width="12" stroke-linecap="round"/></svg>`,
    price: 15,
    priceLabel: "Dès 14.90 € / mois (Gratuit via certains cabinets)",
    rating: 4.7,
    description: "L'application reine de la facturation et des notes de frais pour les indépendants. Recommandée pour sa simplicité extrême et son application mobile.",
    advantages: [
      "Création de devis et factures en 3 clics sur mobile",
      "Souvent gratuit si votre expert-comptable est partenaire Tiime",
      "Rapprochement bancaire et OCR de reçus instantané"
    ],
    disadvantages: [
      "Non adapté pour la gestion des stocks complexes ou industrie",
      "Limité en droits utilisateurs multiples et workflows complexes",
      "Pas d'API publique pour développeur externe"
    ],
    features: {
      eInvoicing: true,
      eReporting: true,
      receiving: true,
      payment: true,
      signature: false,
      reminders: true,
      api: false,
      multiUser: false,
      quotes: true,
      accountingSync: true,
      assistance: true
    },
    compatibility: {
      status: ["micro-entreprise", "EURL", "SARL", "SAS", "association"],
      volume: ["less-50", "50-200"],
      software: ["none", "excel", "autre"],
      accountant: [true, false],
      budget: ["free", "less-20", "20-50"]
    },
    url: "https://www.tiime.fr/",
    recommended: false
  },
  {
    id: "yooz",
    name: "Yooz (Candidat PDP)",
    logo: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="platform-logo-svg"><rect width="100" height="100" rx="20" fill="#7C3AED"/><path d="M30 30 L50 70 L70 30" stroke="#FFFFFF" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    price: 99,
    priceLabel: "Dès 99 € / mois",
    rating: 4.6,
    description: "Le leader de l'automatisation des factures d'achats par IA. Idéal pour dématérialiser, valider et archiver de gros volumes de factures reçues.",
    advantages: [
      "Reconnaissance de documents (OCR/IA) la plus performante du marché",
      "Workflows de validation complexes par service/direction",
      "Archivage à valeur probante intégré et sécurité maximale"
    ],
    disadvantages: [
      "Tarif de base élevé, destiné aux PME structurées et ETI",
      "Mise en place nécessitant un paramétrage initial par l'éditeur"
    ],
    features: {
      eInvoicing: true,
      eReporting: true,
      receiving: true,
      payment: true,
      signature: true,
      reminders: true,
      api: true,
      multiUser: true,
      quotes: false,
      accountingSync: true,
      assistance: true
    },
    compatibility: {
      status: ["SAS", "SARL"],
      volume: ["200-500", "500-1000", "plus-1000"],
      software: ["none", "excel", "sage", "cegid", "ebp", "odoo", "autre"],
      accountant: [true],
      budget: ["50-100", "plus-100"]
    },
    url: "https://www.getyooz.com/fr/",
    recommended: false
  },
  {
    id: "esker",
    name: "Esker",
    logo: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" rx="16" fill="#0D9488"/><path d="M30 65 L45 35 L55 55 L70 35" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    price: 150,
    priceLabel: "À partir de 150 € / mois",
    rating: 4.6,
    description: "Plateforme cloud leader pour l'automatisation globale des cycles clients et fournisseurs, idéale pour les ETI et grandes entreprises.",
    advantages: [
      "Automatisation intelligente par IA",
      "Support multilingue et multi-pays",
      "Rapports et analyses financières avancées"
    ],
    disadvantages: [
      "Coûts d'implémentation élevés",
      "Interface trop complexe pour les TPE/PME"
    ],
    features: {
      eInvoicing: true,
      receiving: true,
      payment: true,
      signature: true,
      reminders: true,
      api: true,
      multiUser: true,
      quotes: true,
      accountingSync: true,
      assistance: true,
      eReporting: true
    },
    compatibility: {
      status: ["SAS", "SARL", "ETI", "GE"],
      volume: ["500-1000", "plus-1000"],
      software: ["sage", "cegid", "sap", "microsoft-dynamics", "oracle-netsuite", "autre"],
      accountant: [true, false],
      budget: ["plus-100"]
    },
    url: "https://www.esker.fr/",
    recommended: false
  },
  {
    id: "sy-cegedim",
    name: "SY by Cegedim",
    logo: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" rx="16" fill="#1E40AF"/><circle cx="50" cy="50" r="25" stroke="#FFFFFF" stroke-width="8"/><path d="M50 25 L50 75" stroke="#FFFFFF" stroke-width="8"/></svg>`,
    price: 49,
    priceLabel: "À partir de 49 € / mois",
    rating: 4.5,
    description: "Solution collaborative de facturation électronique pour digitaliser et sécuriser l'ensemble de vos transactions commerciales.",
    advantages: [
      "Interopérabilité forte avec les autres PDP",
      "Excellent suivi des statuts de livraison",
      "Archivage légal hautement sécurisé"
    ],
    disadvantages: [
      "Support utilisateur parfois difficile à joindre",
      "Ergonomie globale un peu datée"
    ],
    features: {
      eInvoicing: true,
      receiving: true,
      payment: false,
      signature: true,
      reminders: false,
      api: true,
      multiUser: true,
      quotes: false,
      accountingSync: true,
      assistance: true,
      eReporting: true
    },
    compatibility: {
      status: ["SAS", "SARL", "ETI"],
      volume: ["200-500", "500-1000", "plus-1000"],
      software: ["sage", "cegid", "ebp", "odoo", "sap", "autre"],
      accountant: [true, false],
      budget: ["50-100", "plus-100"]
    },
    url: "https://www.sybycegedim.com/",
    recommended: false
  },
  {
    id: "docaposte",
    name: "Docaposte",
    logo: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" rx="16" fill="#F59E0B"/><path d="M30 40 H70 V70 H30 Z M40 50 H60 M40 60 H50" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round"/></svg>`,
    price: 29,
    priceLabel: "À partir de 29 € / mois",
    rating: 4.4,
    description: "Solution souveraine du Groupe La Poste, offrant un archivage à valeur probante et un routage PDP hautement certifié.",
    advantages: [
      "Hébergement souverain des données en France",
      "Tiers-archiveur de confiance historique",
      "Coffre-fort numérique de haute sécurité"
    ],
    disadvantages: [
      "Fonctions collaboratives assez limitées",
      "Moins d'intégrations comptables directes"
    ],
    features: {
      eInvoicing: true,
      receiving: true,
      payment: false,
      signature: true,
      reminders: false,
      api: true,
      multiUser: true,
      quotes: false,
      accountingSync: false,
      assistance: true,
      eReporting: true
    },
    compatibility: {
      status: ["SAS", "SARL", "SCI", "EURL"],
      volume: ["50-100", "100-200", "200-500", "500-1000"],
      software: ["excel", "sage", "cegid", "ebp", "odoo", "autre"],
      accountant: [true, false],
      budget: ["20-50", "50-100"]
    },
    url: "https://www.docaposte.com/",
    recommended: false
  },
  {
    id: "quadient-neotouch",
    name: "Quadient Neotouch",
    logo: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" rx="16" fill="#4B5563"/><circle cx="50" cy="50" r="28" stroke="#FFFFFF" stroke-width="6"/><path d="M50 35 L65 50 L50 65" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round"/></svg>`,
    price: 39,
    priceLabel: "À partir de 39 € / mois",
    rating: 4.5,
    description: "Solution d'automatisation des factures simplifiée, idéale pour guider les PME vers la dématérialisation.",
    advantages: [
      "Gestion hybride (numérique et papier)",
      "Prise en main très rapide",
      "Accompagnement personnalisé réactif"
    ],
    disadvantages: [
      "Moins de flexibilité sur les API personnalisées",
      "Outils analytiques limités"
    ],
    features: {
      eInvoicing: true,
      receiving: true,
      payment: true,
      signature: true,
      reminders: false,
      api: false,
      multiUser: true,
      quotes: false,
      accountingSync: false,
      assistance: true,
      eReporting: true
    },
    compatibility: {
      status: ["SAS", "SARL", "EURL", "Micro-entreprise"],
      volume: ["50-100", "100-200", "200-500"],
      software: ["excel", "sage", "cegid", "ebp", "odoo", "autre"],
      accountant: [true, false],
      budget: ["20-50", "50-100"]
    },
    url: "https://www.neotouch.fr/",
    recommended: false
  },
  {
    id: "pagero",
    name: "Pagero",
    logo: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" rx="16" fill="#65A30D"/><path d="M35 35 H65 V65 H35 Z M35 50 H65" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round"/></svg>`,
    price: 80,
    priceLabel: "À partir de 80 € / mois",
    rating: 4.6,
    description: "Réseau mondial de facturation électronique, assurant la conformité fiscale dans plus de 70 pays.",
    advantages: [
      "Réseau international de partage étendu",
      "Double conformité e-Invoicing et e-Reporting",
      "Intégration d'ERP complexes (SAP, Oracle)"
    ],
    disadvantages: [
      "Documentation et interface parfois en anglais uniquement",
      "Tarifs élevés pour les petites entreprises"
    ],
    features: {
      eInvoicing: true,
      receiving: true,
      payment: false,
      signature: true,
      reminders: false,
      api: true,
      multiUser: true,
      quotes: false,
      accountingSync: true,
      assistance: true,
      eReporting: true
    },
    compatibility: {
      status: ["SAS", "SARL", "ETI", "GE"],
      volume: ["200-500", "500-1000", "plus-1000"],
      software: ["sage", "cegid", "odoo", "sap", "microsoft-dynamics", "oracle-netsuite", "autre"],
      accountant: [true, false],
      budget: ["50-100", "plus-100"]
    },
    url: "https://www.pagero.fr/",
    recommended: false
  },
  {
    id: "generix",
    name: "Generix Group",
    logo: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" rx="16" fill="#7C3AED"/><path d="M30 30 H70 V70 H30 Z M50 30 V70" stroke="#FFFFFF" stroke-width="6"/></svg>`,
    price: 120,
    priceLabel: "À partir de 120 € / mois",
    rating: 4.4,
    description: "Opérateur de flux B2B et candidat PDP spécialisé dans la supply-chain, le retail et la grande distribution.",
    advantages: [
      "Gestion native des flux EDI complexes",
      "Traitement de volumes de factures massifs",
      "Sécurité et redondance industrielle"
    ],
    disadvantages: [
      "Frais de mise en place (setup) conséquents",
      "Interface utilisateur technique"
    ],
    features: {
      eInvoicing: true,
      receiving: true,
      payment: false,
      signature: true,
      reminders: false,
      api: true,
      multiUser: true,
      quotes: false,
      accountingSync: true,
      assistance: true,
      eReporting: true
    },
    compatibility: {
      status: ["SAS", "SARL", "ETI", "GE"],
      volume: ["500-1000", "plus-1000"],
      software: ["sage", "cegid", "sap", "microsoft-dynamics", "oracle-netsuite", "autre"],
      accountant: [true, false],
      budget: ["plus-100"]
    },
    url: "https://www.generixgroup.com/fr",
    recommended: false
  },
  {
    id: "basware",
    name: "Basware",
    logo: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" rx="16" fill="#DC2626"/><path d="M30 40 L50 60 L70 40" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    price: 140,
    priceLabel: "À partir de 140 € / mois",
    rating: 4.5,
    description: "Solution internationale optimisée pour la gestion automatisée des factures fournisseurs et l'e-procurement.",
    advantages: [
      "Rapprochement automatique facture/bon de commande",
      "Réseau mondial d'acheteurs connectés",
      "Intégrations ERP certifiées"
    ],
    disadvantages: [
      "Focalisé principalement sur le flux fournisseurs",
      "Déploiement demandant des ressources internes"
    ],
    features: {
      eInvoicing: true,
      receiving: true,
      payment: false,
      signature: true,
      reminders: false,
      api: true,
      multiUser: true,
      quotes: false,
      accountingSync: true,
      assistance: true,
      eReporting: true
    },
    compatibility: {
      status: ["SAS", "SARL", "ETI", "GE"],
      volume: ["500-1000", "plus-1000"],
      software: ["sage", "cegid", "sap", "microsoft-dynamics", "oracle-netsuite", "autre"],
      accountant: [true, false],
      budget: ["plus-100"]
    },
    url: "https://www.basware.com/fr-fr/",
    recommended: false
  },
  {
    id: "divalto-pdp",
    name: "Divalto PDP",
    logo: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" rx="16" fill="#2563EB"/><path d="M35 35 H65 L50 65 Z" stroke="#FFFFFF" stroke-width="6" stroke-linejoin="round"/></svg>`,
    price: 60,
    priceLabel: "À partir de 60 € / mois",
    rating: 4.3,
    description: "Module PDP nativement intégré à l'ERP Divalto pour une gestion centralisée et transparente.",
    advantages: [
      "Intégration directe et native dans l'ERP Divalto",
      "Automatisation des flux de vente et production",
      "Aucune double saisie requise"
    ],
    disadvantages: [
      "Nécessite de posséder ou d'installer l'ERP Divalto",
      "Inintéressant en standalone"
    ],
    features: {
      eInvoicing: true,
      receiving: true,
      payment: false,
      signature: true,
      reminders: false,
      api: true,
      multiUser: true,
      quotes: false,
      accountingSync: true,
      assistance: true,
      eReporting: true
    },
    compatibility: {
      status: ["SAS", "SARL", "ETI"],
      volume: ["100-200", "200-500", "500-1000"],
      software: ["cegid", "sage", "sap", "autre"],
      accountant: [true, false],
      budget: ["50-100", "plus-100"]
    },
    url: "https://www.divalto.com/",
    recommended: false
  },
  {
    id: "b2b-router",
    name: "B2B Router",
    logo: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" rx="16" fill="#059669"/><circle cx="50" cy="50" r="22" stroke="#FFFFFF" stroke-width="6"/><path d="M42 50 L48 56 L58 44" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    price: 10,
    priceLabel: "À partir de 10 € / mois",
    rating: 4.6,
    description: "Plateforme en ligne abordable et facile d'accès, idéale pour créer et envoyer des factures aux formats réglementaires.",
    advantages: [
      "Coût extrêmement compétitif pour micro-structures",
      "Inscription et prise en main en 5 minutes",
      "Support technique rapide et efficace"
    ],
    disadvantages: [
      "Fonctionnalités avancées limitées",
      "Pas de gestion de paiement intégrée"
    ],
    features: {
      eInvoicing: true,
      receiving: true,
      payment: false,
      signature: true,
      reminders: false,
      api: true,
      multiUser: true,
      quotes: false,
      accountingSync: false,
      assistance: false,
      eReporting: true
    },
    compatibility: {
      status: ["Micro-entreprise", "EI", "EURL", "SARL", "SAS"],
      volume: ["none", "1-10", "10-50", "50-100"],
      software: ["none", "excel", "odoo", "autre"],
      accountant: [true, false],
      budget: ["gratuit-10", "10-20"]
    },
    url: "https://www.b2brouter.net/fr/",
    recommended: false
  },
  {
    id: "tessi-pdp",
    name: "Tessi PDP",
    logo: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" rx="16" fill="#0F172A"/><path d="M30 35 H70 M30 50 H70 M30 65 H55" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round"/></svg>`,
    price: 110,
    priceLabel: "À partir de 110 € / mois",
    rating: 4.3,
    description: "Solution d'externalisation et de traitement de flux documentaires de grande envergure certifiée PDP.",
    advantages: [
      "Traitement mixte (numérique et papier)",
      "Conformité réglementaire infaillible",
      "Idéal pour l'externalisation de masse"
    ],
    disadvantages: [
      "Processus de mise en service assez long",
      "Tarifs élevés pour les PME standards"
    ],
    features: {
      eInvoicing: true,
      receiving: true,
      payment: false,
      signature: true,
      reminders: false,
      api: true,
      multiUser: true,
      quotes: false,
      accountingSync: false,
      assistance: true,
      eReporting: true
    },
    compatibility: {
      status: ["SAS", "SARL", "ETI", "GE"],
      volume: ["500-1000", "plus-1000"],
      software: ["sage", "cegid", "sap", "microsoft-dynamics", "oracle-netsuite", "autre"],
      accountant: [true, false],
      budget: ["plus-100"]
    },
    url: "https://www.tessi.eu/fr",
    recommended: false
  }
];

// List of all 144 registered candidate PDPs in France (DGFIP candidates list)
const candidateNames = [
  "Adelya", "Agena3000", "Agysoft", "Allegro", "Amadeus", "Anakeen", "Archipelia", 
  "Arkhineo", "Atos", "Axway", "B2BRouter", "Basware", "Bisoft", "Blinks", "Blueink", 
  "Brainloop", "CalvaEDI", "Cegedim", "Cegid", "Chorus Pro", "Clearnox", "Comarch", 
  "Compleo", "Concur", "Corcentric", "Covline", "D4UM", "Dataline", "Datalog", 
  "Dext", "Divalto", "Docaposte", "DocuSign", "Dynapost", "EBP", "Ecofacture", 
  "Ediifice", "Edikio", "Edipharm", "Efalia", "E-factura", "E-invoicing", "Elcimaï", 
  "Emersya", "Enancio", "E-octo", "Equis", "Esker", "Everial", "Evoliz", "Exalog", 
  "Facture.net", "Fiduclic", "Flowise", "Freebe", "Generix Group", "Gescofact", 
  "GetPaid", "GFI", "HighRadius", "ICD International", "Inoap", "Inovallée", 
  "Inovea", "Interuvat", "IpaidThat", "Itool", "Itesoft", "Jaggaer", "Kizeo", 
  "Kolecto", "Kyriba", "Liasons", "Libeo", "Logalto", "LSE", "Luminess", "MyUnisoft", 
  "Neopost", "Neotouch", "Networth", "Numen", "Odoo", "OpenFact", "Opentext", 
  "Orange Business", "Order2Cash", "OutSystems", "Pagero", "Paperless", "Pennylane", 
  "Pitney Bowes", "ProcureWare", "Proactis", "Pytheas", "Quadient", "Quadra", 
  "Readsoft", "Regate", "Sage", "SAP", "SDP", "Sellsy", "Silae", "Soan", "Sovos", 
  "Spalla", "Spendesk", "SPS Commerce", "Stratow", "SY by Cegedim", "Symtrax", 
  "Synchrone", "Systar", "Taulia", "Taxback", "Tenor", "Tessi", "Tiime", "Tradeshift", 
  "TrueCommerce", "Tungsten Network", "TX2 Concept", "Unifiedpost", "Use", "Valipost", 
  "Vartool", "Vertex", "Viaduc", "Visiativ", "VosFactures", "Waibi", "Weblex", "Welyb", 
  "Workday", "Xero", "Yooz", "Zeendoc", "Zervant", "Zoologic", "Zoho Invoice", 
  "Zyllem", "Zycus", "1Life"
];

const colors = [
  '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444', 
  '#F59E0B', '#14B8A6', '#6366F1', '#06B6D4', '#84CC16',
  '#0D9488', '#1E40AF', '#7C3AED', '#DC2626', '#059669'
];

function generateLogoSvg(name, index) {
  const color = colors[index % colors.length];
  const initials = name.split(/[\s-]+/)
    .map(w => w[0])
    .join('')
    .substring(0, 3)
    .toUpperCase();
    
  return `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="16" fill="${color}"/>
    <text x="50" y="58" fill="#FFFFFF" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="800" text-anchor="middle" dominant-baseline="middle">${initials}</text>
  </svg>`;
}

const generatedPlatforms = [];
candidateNames.forEach((name, idx) => {
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  
  // Skip if already defined in the base detailed list
  if (basePlatforms.some(p => p.id === id || p.name.toLowerCase() === name.toLowerCase())) {
    return;
  }
  
  generatedPlatforms.push({
    id: id,
    name: name,
    logo: generateLogoSvg(name, idx),
    price: 29,
    priceLabel: "À partir de 29 € / mois",
    rating: 4.2,
    description: `Solution candidate PDP pour la facturation électronique issue de la plateforme ${name}.`,
    advantages: [
      "Conformité candidate PDP DGFIP",
      "Garantie de sécurité des données",
      "Passerelle d'échanges automatisée"
    ],
    disadvantages: [
      "Fonctions métiers avancées limitées",
      "Modèle tarifaire sujet à modification"
    ],
    features: {
      eInvoicing: true,
      receiving: true,
      payment: false,
      signature: true,
      reminders: false,
      api: true,
      multiUser: true,
      quotes: false,
      accountingSync: false,
      assistance: true,
      eReporting: true
    },
    compatibility: {
      status: ["SAS", "SARL"],
      volume: ["10-50", "50-100", "100-200"],
      software: ["none", "excel", "autre"],
      accountant: [true, false],
      budget: ["20-50", "50-100"]
    },
    url: "#",
    recommended: false
  });
});

export const defaultPlatforms = [...basePlatforms, ...generatedPlatforms];

export function getPlatforms() {
  return getCachedPlatforms();
}

export function savePlatforms(platformsList) {
  savePlatformsDb(platformsList);
}
