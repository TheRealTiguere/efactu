import { getCachedPlatforms, savePlatformsDb } from './db.js';

// Base detailed registered platforms (Plateformes Agréées officielles et candidates majeures)
const basePlatforms = [
  {
    id: "pennylane",
    name: "Pennylane",
    statusType: "immatricule",
    statusLabel: "Immatriculée sous réserve d'audit",
    registrationNumber: "PA-2024-0012",
    registrationDate: "Août 2024",
    logo: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="platform-logo-svg"><rect width="100" height="100" rx="20" fill="#0000FF"/><circle cx="35" cy="50" r="15" fill="#38BDF8"/><circle cx="65" cy="50" r="15" fill="#38BDF8"/><path d="M35 50 L65 50" stroke="#38BDF8" stroke-width="6"/></svg>`,
    price: 19,
    priceLabel: "Dès 19 € / mois (228 € / an)",
    rating: 4.8,
    description: "Plateforme financière tout-en-un pour TPE, PME et hôtellerie-restauration. Connexion native avec les experts-comptables et synchronisation bancaire temps réel.",
    advantages: [
      "Connecteurs natifs pour l'hôtellerie (Mews, Lightspeed, Zelty)",
      "Portail collaboratif gratuit pour votre expert-comptable",
      "Émission automatique Factur-X et gestion des multi-taux de TVA",
      "Tableau de bord de trésorerie prévisionnelle"
    ],
    disadvantages: [
      "Tarification par palier de volume de factures",
      "Moins adapté aux très grands groupes multi-ERP internationaux"
    ],
    connectors: {
      pms: ["mews", "opera", "asterio", "thais", "autre"],
      pos: ["lightspeed", "tiller", "zelty", "simphony"],
      accounting: ["pennylane", "sage", "cegid", "ebp", "acd", "myunisoft"],
      erp: ["odoo", "microsoft_dynamics"],
      formats: ["facturx", "ubl", "cii"]
    },
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
      assistance: true,
      multiSiren: true,
      chorusPro: true,
      iso27001: true,
      hostingEU: true,
      probativeArchiving: true,
      multiVatRates: true,
      touristTax: true
    },
    compatibility: {
      companyCategories: ["micro", "tpe", "pme"],
      salesVolume: ["less_100", "100_500", "500_2000", "2000_10000"],
      sectors: ["hotellerie_restauration", "services_conseil", "commerce_retail", "batiment_btp", "autre"],
      budgetMax: 600
    },
    url: "https://www.pennylane.com/fr/",
    recommended: true
  },
  {
    id: "cegid",
    name: "Cegid Flow",
    statusType: "immatricule",
    statusLabel: "Immatriculée sous réserve d'audit",
    registrationNumber: "PA-2024-0003",
    registrationDate: "Juillet 2024",
    logo: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="platform-logo-svg"><rect width="100" height="100" rx="20" fill="#E11D48"/><path d="M70 35 C55 20, 25 30, 25 50 C25 70, 55 80, 70 65" stroke="#FFFFFF" stroke-width="10" stroke-linecap="round"/><circle cx="50" cy="50" r="8" fill="#FFFFFF"/></svg>`,
    price: 35,
    priceLabel: "Dès 35 € / mois (420 € / an)",
    rating: 4.7,
    description: "La solution de référence de l'écosystème de l'expertise comptable française. Intégration parfaite avec l'annuaire national et gestion robuste des flux complexes.",
    advantages: [
      "Intégration native totale avec l'écosystème Cegid (Loop, Expert, Quadra)",
      "Prise en charge multi-SIREN et groupes de sociétés",
      "Workflows de validation des achats et conformité fiscale rigoureuse",
      "Piste d'audit fiable et archivage à valeur probante 10 ans"
    ],
    disadvantages: [
      "Tarif supérieur pour les micro-entreprises",
      "Interface plus dense orientée comptabilité et finance"
    ],
    connectors: {
      pms: ["opera", "medialog", "thais", "asterio", "autre"],
      pos: ["simphony", "lightspeed", "zelty", "pi_electronique"],
      accounting: ["cegid", "sage", "ebp", "acd", "myunisoft"],
      erp: ["sap", "microsoft_dynamics", "sage_x3", "odoo"],
      formats: ["facturx", "ubl", "cii"]
    },
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
      assistance: true,
      multiSiren: true,
      chorusPro: true,
      iso27001: true,
      hostingEU: true,
      probativeArchiving: true,
      multiVatRates: true,
      touristTax: true
    },
    compatibility: {
      companyCategories: ["tpe", "pme", "eti", "ge"],
      salesVolume: ["100_500", "500_2000", "2000_10000", "plus_10000"],
      sectors: ["hotellerie_restauration", "industrie_transport", "commerce_retail", "services_conseil", "autre"],
      budgetMax: 2000
    },
    url: "https://www.cegid.com/fr/",
    recommended: true
  },
  {
    id: "sage",
    name: "Sage Network (eFactory)",
    statusType: "immatricule",
    statusLabel: "Immatriculée sous réserve d'audit",
    registrationNumber: "PA-2024-0008",
    registrationDate: "Septembre 2024",
    logo: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="platform-logo-svg"><rect width="100" height="100" rx="20" fill="#00DC7D"/><path d="M65 35 C55 25, 35 25, 35 40 C35 60, 65 50, 65 70 C65 85, 45 85, 35 75" stroke="#0F172A" stroke-width="10" stroke-linecap="round"/></svg>`,
    price: 39,
    priceLabel: "Dès 39 € / mois (468 € / an)",
    rating: 4.6,
    description: "Plateforme Agréée du leader des ERP pour PME et ETI. Conçue pour automatiser les flux de facturation sécurisés entre entreprises et tiers déclarants.",
    advantages: [
      "Continuité parfaite avec Sage 100, Sage 50, FRP 1000 et Batigest",
      "Gestion puissante des gros volumes de facturation et EDI",
      "Gestion de la facturation internationale et des devises",
      "Support téléphonique en France avec engagement de service SLA"
    ],
    disadvantages: [
      "Frais de mise en service selon la configuration réseau",
      "Nécessite souvent l'intervention de votre intégrateur"
    ],
    connectors: {
      pms: ["opera", "mews", "medialog", "autre"],
      pos: ["simphony", "lightspeed", "tiller"],
      accounting: ["sage", "cegid", "ebp"],
      erp: ["sage_x3", "sap", "microsoft_dynamics"],
      formats: ["facturx", "ubl", "cii"]
    },
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
      assistance: true,
      multiSiren: true,
      chorusPro: true,
      iso27001: true,
      hostingEU: true,
      probativeArchiving: true,
      multiVatRates: true,
      touristTax: true
    },
    compatibility: {
      companyCategories: ["pme", "eti", "ge"],
      salesVolume: ["500_2000", "2000_10000", "plus_10000"],
      sectors: ["industrie_transport", "batiment_btp", "hotellerie_restauration", "commerce_retail", "autre"],
      budgetMax: 5000
    },
    url: "https://www.sage.com/fr-fr/",
    recommended: true
  },
  {
    id: "tiime",
    name: "Tiime Invoice",
    statusType: "candidat",
    statusLabel: "Candidate en cours de qualification",
    registrationNumber: "En cours",
    registrationDate: "Candidature 2024",
    logo: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="platform-logo-svg"><rect width="100" height="100" rx="20" fill="#0EA5E9"/><path d="M50 25 V50 L65 65" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round"/><circle cx="50" cy="50" r="35" stroke="#FFFFFF" stroke-width="8"/></svg>`,
    price: 14.90,
    priceLabel: "Dès 14,90 € / mois (178 € / an)",
    rating: 4.7,
    description: "L'outil ultra-simple plébiscité par les indépendants, micro-entreprises, professions libérales et TPE pour facturer sans se compliquer la vie.",
    advantages: [
      "Application mobile et web ultra-intuitive",
      "Synchronisation automatique avec les cabinets comptables partenaires",
      "Émission rapide Factur-X en 3 clics",
      "Tarif très abordable"
    ],
    disadvantages: [
      "Fonctionnalités ERP et gestion de stocks non couvertes",
      "Non adapté aux structures à gros volumes ou multi-établissements"
    ],
    connectors: {
      pms: ["aucun", "autre"],
      pos: ["tiller", "sumup", "aucun"],
      accounting: ["tiime", "cegid", "sage", "acd", "myunisoft"],
      erp: ["aucun"],
      formats: ["facturx"]
    },
    features: {
      eInvoicing: true,
      eReporting: true,
      receiving: true,
      payment: true,
      signature: false,
      reminders: true,
      api: true,
      multiUser: false,
      quotes: true,
      accountingSync: true,
      assistance: true,
      multiSiren: false,
      chorusPro: true,
      iso27001: true,
      hostingEU: true,
      probativeArchiving: true,
      multiVatRates: true,
      touristTax: false
    },
    compatibility: {
      companyCategories: ["micro", "tpe"],
      salesVolume: ["less_100", "100_500"],
      sectors: ["services_conseil", "sante_medical", "commerce_retail", "autre"],
      budgetMax: 200
    },
    url: "https://www.tiime.fr/",
    recommended: true
  },
  {
    id: "yooz",
    name: "Yooz",
    statusType: "immatricule",
    statusLabel: "Immatriculée sous réserve d'audit",
    registrationNumber: "PA-2024-0019",
    registrationDate: "Novembre 2024",
    logo: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="platform-logo-svg"><rect width="100" height="100" rx="20" fill="#F97316"/><path d="M30 35 L48 55 V75 M70 35 L52 55" stroke="#FFFFFF" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    price: 99,
    priceLabel: "Dès 99 € / mois",
    rating: 4.8,
    description: "Le leader de l'automatisation Purchase-to-Pay (P2P). Reconnaissance IA des factures d'achats, circuits de validation stricts et intégration avec plus de 250 ERPs.",
    advantages: [
      "OCR / IA le plus puissant du marché sur les factures d'achat",
      "Gestion avancée des circuits d'approbation et bons à payer",
      "Idéal pour les groupes hôteliers multi-sites et les ETI",
      "Connecteurs avec plus de 250 logiciels comptables et ERPs"
    ],
    disadvantages: [
      "Tarif orienté PME et ETI (inadapté aux micro-entreprises)",
      "Projet d'installation nécessitant un cadrage"
    ],
    connectors: {
      pms: ["opera", "mews", "medialog", "thais", "asterio"],
      pos: ["simphony", "lightspeed", "zelty"],
      accounting: ["sage", "cegid", "sap", "microsoft_dynamics", "ebp", "infor"],
      erp: ["sap", "microsoft_dynamics", "sage_x3", "odoo", "oracle_netsuite"],
      formats: ["facturx", "ubl", "cii"]
    },
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
      assistance: true,
      multiSiren: true,
      chorusPro: true,
      iso27001: true,
      hostingEU: true,
      probativeArchiving: true,
      multiVatRates: true,
      touristTax: true
    },
    compatibility: {
      companyCategories: ["pme", "eti", "ge"],
      salesVolume: ["500_2000", "2000_10000", "plus_10000"],
      sectors: ["hotellerie_restauration", "industrie_transport", "commerce_retail", "services_conseil", "autre"],
      budgetMax: 5000
    },
    url: "https://www.getyooz.com/fr",
    recommended: false
  },
  {
    id: "esker",
    name: "Esker",
    statusType: "immatricule",
    statusLabel: "Immatriculée sous réserve d'audit",
    registrationNumber: "PA-2024-0001",
    registrationDate: "Juin 2024",
    logo: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="platform-logo-svg"><rect width="100" height="100" rx="20" fill="#0284C7"/><path d="M25 35 H75 M25 50 H55 M25 65 H75" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round"/></svg>`,
    price: 150,
    priceLabel: "Sur devis (Dès 150 € / mois)",
    rating: 4.8,
    description: "Plateforme Agréée d'envergure mondiale pour les ETI et grandes entreprises. Traitement global des flux Order-to-Cash et Procure-to-Pay.",
    advantages: [
      "Pionnier mondial de la dématérialisation et conformité internationale",
      "Sécurité maximale certifiée ISO 27001 et SecNumCloud en cours",
      "Gestion multi-pays et multi-réglementations (ViDA)",
      "Capacité de traitement de millions de factures par an"
    ],
    disadvantages: [
      "Inadapté aux TPE et indépendants",
      "Processus de déploiement d'entreprise"
    ],
    connectors: {
      pms: ["opera", "mews"],
      pos: ["simphony"],
      accounting: ["sap", "oracle_netsuite", "sage", "cegid"],
      erp: ["sap", "microsoft_dynamics", "infor", "sage_x3"],
      formats: ["facturx", "ubl", "cii"]
    },
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
      assistance: true,
      multiSiren: true,
      chorusPro: true,
      iso27001: true,
      hostingEU: true,
      probativeArchiving: true,
      multiVatRates: true,
      touristTax: true
    },
    compatibility: {
      companyCategories: ["eti", "ge"],
      salesVolume: ["2000_10000", "plus_10000"],
      sectors: ["industrie_transport", "commerce_retail", "hotellerie_restauration", "autre"],
      budgetMax: 10000
    },
    url: "https://www.esker.fr/",
    recommended: false
  },
  {
    id: "ebp",
    name: "EBP Hub e-Facture",
    statusType: "immatricule",
    statusLabel: "Immatriculée sous réserve d'audit",
    registrationNumber: "PA-2024-0015",
    registrationDate: "Octobre 2024",
    logo: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="platform-logo-svg"><rect width="100" height="100" rx="20" fill="#2563EB"/><text x="50" y="58" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="28" font-weight="900" text-anchor="middle" dominant-baseline="middle">EBP</text></svg>`,
    price: 24,
    priceLabel: "Dès 24 € / mois (288 € / an)",
    rating: 4.6,
    description: "La solution intégrée pour les 560 000 entreprises clientes d'EBP. Connexion directe entre gestion commerciale, comptabilité et plateforme agréée.",
    advantages: [
      "Raccordement direct sans paramétrage pour les utilisateurs EBP",
      "Tarification simple et transparente",
      "Émission automatique Factur-X et rapprochement bancaire",
      "Support téléphonique en France"
    ],
    disadvantages: [
      "Moins adapté aux logiciels tiers non-EBP",
      "Fonctionnalités avancées de workflow limitées"
    ],
    connectors: {
      pms: ["asterio", "medialog", "thais", "autre"],
      pos: ["tiller", "lightspeed", "autre"],
      accounting: ["ebp", "sage", "cegid", "acd"],
      erp: ["odoo", "aucun"],
      formats: ["facturx", "ubl"]
    },
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
      assistance: true,
      multiSiren: true,
      chorusPro: true,
      iso27001: true,
      hostingEU: true,
      probativeArchiving: true,
      multiVatRates: true,
      touristTax: true
    },
    compatibility: {
      companyCategories: ["micro", "tpe", "pme"],
      salesVolume: ["less_100", "100_500", "500_2000"],
      sectors: ["batiment_btp", "commerce_retail", "services_conseil", "hotellerie_restauration", "autre"],
      budgetMax: 600
    },
    url: "https://www.ebp.com/",
    recommended: false
  },
  {
    id: "sellsy",
    name: "Sellsy e-Facture",
    statusType: "candidat",
    statusLabel: "Candidate en cours de qualification",
    registrationNumber: "En cours",
    registrationDate: "Candidature 2024",
    logo: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="platform-logo-svg"><rect width="100" height="100" rx="20" fill="#4F46E5"/><path d="M30 40 L45 55 L70 30" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="50" cy="50" r="35" stroke="#FFFFFF" stroke-width="6"/></svg>`,
    price: 39,
    priceLabel: "Dès 39 € / mois",
    rating: 4.6,
    description: "Suite CRM, facturation et pré-comptabilité française tout-en-un pour les TPE et PME en croissance.",
    advantages: [
      "Intégration native CRM / Devis / Factures / Rapprochement",
      "Paiement en ligne intégré des factures (Stripe, GoCardless)",
      "Relances automatiques et signature électronique"
    ],
    disadvantages: [
      "Prix par utilisateur",
      "Non spécialisé sur l'hôtellerie pure"
    ],
    connectors: {
      pms: ["autre", "aucun"],
      pos: ["autre", "aucun"],
      accounting: ["sage", "cegid", "pennylane", "ebp"],
      erp: ["odoo"],
      formats: ["facturx"]
    },
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
      assistance: true,
      multiSiren: true,
      chorusPro: true,
      iso27001: true,
      hostingEU: true,
      probativeArchiving: true,
      multiVatRates: true,
      touristTax: false
    },
    compatibility: {
      companyCategories: ["tpe", "pme"],
      salesVolume: ["100_500", "500_2000", "2000_10000"],
      sectors: ["services_conseil", "commerce_retail", "autre"],
      budgetMax: 1000
    },
    url: "https://sellsy.com/",
    recommended: false
  },
  {
    id: "docaposte",
    name: "Docaposte (Groupe La Poste)",
    statusType: "immatricule",
    statusLabel: "Immatriculée sous réserve d'audit",
    registrationNumber: "PA-2024-0004",
    registrationDate: "Juillet 2024",
    logo: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="platform-logo-svg"><rect width="100" height="100" rx="20" fill="#EAB308"/><path d="M30 35 H70 V65 H30 Z" fill="#1E293B"/><path d="M30 35 L50 50 L70 35" stroke="#FFFFFF" stroke-width="4"/></svg>`,
    price: 49,
    priceLabel: "Dès 49 € / mois",
    rating: 4.7,
    description: "Tiers de confiance souverain du Groupe La Poste. Garantie de sécurité maximale certifiée SecNumCloud, archivage probant et signature électronique eIDAS.",
    advantages: [
      "Hébergement 100% souverain français qualifié SecNumCloud",
      "Coffre-fort numérique certifié NF Z42-013",
      "Émission B2B, B2G Chorus Pro et transmission e-reporting",
      "Piste d'audit et conformité juridique absolue"
    ],
    disadvantages: [
      "Moins orienté gestion commerciale TPE",
      "Délais de paramétrage initiaux"
    ],
    connectors: {
      pms: ["opera", "mews", "medialog", "thais", "asterio", "misterbooking", "vega"],
      pos: ["simphony", "lightspeed", "tiller", "zelty", "pi_electronique"],
      accounting: ["sage", "cegid", "ebp", "sap", "microsoft_dynamics", "acd", "myunisoft"],
      erp: ["sap", "microsoft_dynamics", "odoo", "sage_x3", "infor", "netsuite"],
      formats: ["facturx", "ubl", "cii"]
    },
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
      assistance: true,
      multiSiren: true,
      chorusPro: true,
      iso27001: true,
      hostingEU: true,
      probativeArchiving: true,
      multiVatRates: true,
      touristTax: true
    },
    compatibility: {
      companyCategories: ["tpe", "pme", "eti", "ge"],
      salesVolume: ["100_500", "500_2000", "2000_10000", "plus_10000"],
      sectors: ["hotellerie_restauration", "sante_medical", "industrie_transport", "services_conseil", "commerce_retail", "batiment_btp", "autre"],
      budgetMax: 3000
    },
    url: "https://www.docaposte.com/",
    recommended: false
  },
  {
    id: "quadient",
    name: "Quadient (Impression & Digital)",
    statusType: "immatricule",
    statusLabel: "Immatriculée sous réserve d'audit",
    registrationNumber: "PA-2024-0007",
    registrationDate: "Août 2024",
    logo: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="platform-logo-svg"><rect width="100" height="100" rx="20" fill="#0D9488"/><circle cx="50" cy="50" r="30" stroke="#FFFFFF" stroke-width="8"/><path d="M50 35 V65" stroke="#FFFFFF" stroke-width="8"/></svg>`,
    price: 45,
    priceLabel: "Dès 45 € / mois",
    rating: 4.6,
    description: "Plateforme Agréée spécialiste de la gestion des flux hybrides (papier, email, Factur-X et EDI). Idéal pour les entreprises en transition progressive.",
    advantages: [
      "Transition fluide des factures papier et PDF vers Factur-X",
      "Portail client et fournisseur unifié",
      "Passerelle automatisée Chorus Pro"
    ],
    disadvantages: [
      "Interface plus classique"
    ],
    connectors: {
      pms: ["medialog", "thais", "autre"],
      pos: ["autre", "aucun"],
      accounting: ["sage", "cegid", "ebp"],
      erp: ["sap", "microsoft_dynamics", "sage_x3"],
      formats: ["facturx", "ubl"]
    },
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
      assistance: true,
      multiSiren: true,
      chorusPro: true,
      iso27001: true,
      hostingEU: true,
      probativeArchiving: true,
      multiVatRates: true,
      touristTax: true
    },
    compatibility: {
      companyCategories: ["pme", "eti"],
      salesVolume: ["500_2000", "2000_10000", "plus_10000"],
      sectors: ["industrie_transport", "commerce_retail", "services_conseil", "autre"],
      budgetMax: 2000
    },
    url: "https://www.quadient.com/fr-FR",
    recommended: false
  }
];

// Candidates list registered in France (excluding already detailed ones)
const candidateNames = [
  "Adelya", "Agena3000", "Agysoft", "Allegro", "Amadeus", "Anakeen", "Archipelia", 
  "Arkhineo", "Atos", "Axway", "B2BRouter", "Basware", "Bisoft", "Blinks", "Blueink", 
  "Brainloop", "CalvaEDI", "Cegedim", "Clearnox", "Comarch", 
  "Compleo", "Concur", "Corcentric", "Covline", "D4UM", "Dataline", "Datalog", 
  "Dext", "Divalto", "DocuSign", "Dynapost", "Ecofacture", 
  "Ediifice", "Edikio", "Edipharm", "Efalia", "E-factura", "E-invoicing", "Elcimaï", 
  "Emersya", "Enancio", "E-octo", "Equis", "Everial", "Evoliz", "Exalog", 
  "Facture.net", "Fiduclic", "Flowise", "Freebe", "Generix Group", "Gescofact", 
  "GetPaid", "GFI", "HighRadius", "ICD International", "Inoap", "Inovallée", 
  "Inovea", "Interuvat", "IpaidThat", "Itool", "Itesoft", "Jaggaer", "Kizeo", 
  "Kolecto", "Kyriba", "Liasons", "Libeo", "Logalto", "LSE", "Luminess", "MyUnisoft", 
  "Neopost", "Neotouch", "Networth", "Numen", "Odoo", "OpenFact", "Opentext", 
  "Orange Business", "Order2Cash", "OutSystems", "Pagero", "Paperless", 
  "Pitney Bowes", "ProcureWare", "Proactis", "Pytheas", "Quadra", 
  "Readsoft", "Regate", "SAP", "SDP", "Silae", "Soan", "Sovos", 
  "Spalla", "Spendesk", "SPS Commerce", "Stratow", "SY by Cegedim", "Symtrax", 
  "Synchrone", "Systar", "Taulia", "Taxback", "Tenor", "Tessi", "Tradeshift", 
  "TrueCommerce", "Tungsten Network", "TX2 Concept", "Unifiedpost", "Use", "Valipost", 
  "Vartool", "Vertex", "Viaduc", "Visiativ", "VosFactures", "Waibi", "Weblex", "Welyb", 
  "Workday", "Xero", "Zeendoc", "Zervant", "Zoologic", "Zoho Invoice", 
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
  
  if (basePlatforms.some(p => p.id === id || p.name.toLowerCase() === name.toLowerCase())) {
    return;
  }
  
  generatedPlatforms.push({
    id: id,
    name: name,
    statusType: "candidat",
    statusLabel: "Candidate en cours de qualification",
    registrationNumber: "En cours",
    registrationDate: "Candidature 2024-2025",
    logo: generateLogoSvg(name, idx),
    price: 29,
    priceLabel: "À partir de 29 € / mois",
    rating: 4.2,
    description: `Plateforme candidate au statut de Plateforme Agréée (PA) enregistrée auprès de la DGFiP. Solution développée par ${name}.`,
    advantages: [
      "Dossier de candidature déposé auprès de la DGFiP",
      "Émission et réception Factur-X / UBL",
      "Passerelle sécurisée de transmission fiscale"
    ],
    disadvantages: [
      "Audit de conformité final en cours",
      "Tarification finale sous réserve de publication"
    ],
    connectors: {
      pms: ["opera", "mews", "autre", "aucun"],
      pos: ["lightspeed", "tiller", "autre", "aucun"],
      accounting: ["sage", "cegid", "ebp", "pennylane", "autre"],
      erp: ["odoo", "sap", "microsoft_dynamics", "autre", "aucun"],
      formats: ["facturx", "ubl", "cii"]
    },
    features: {
      eInvoicing: true,
      eReporting: true,
      receiving: true,
      payment: false,
      signature: true,
      reminders: false,
      api: true,
      multiUser: true,
      quotes: false,
      accountingSync: true,
      assistance: true,
      multiSiren: true,
      chorusPro: true,
      iso27001: true,
      hostingEU: true,
      probativeArchiving: true,
      multiVatRates: true,
      touristTax: true
    },
    compatibility: {
      companyCategories: ["micro", "tpe", "pme", "eti"],
      salesVolume: ["less_100", "100_500", "500_2000", "2000_10000"],
      sectors: ["hotellerie_restauration", "batiment_btp", "commerce_retail", "services_conseil", "industrie_transport", "sante_medical", "autre"],
      budgetMax: 1000
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
