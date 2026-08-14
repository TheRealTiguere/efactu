import { getCachedQuestions, saveQuestionsDb } from './db.js';

export const questionnaireSections = [
  {
    id: "A",
    title: "Section A · Périmètre de l'entreprise",
    description: "Identifions la structure juridique et la taille de votre organisation pour définir vos obligations calendaires et multi-entités.",
    questions: [
      {
        number: 1,
        id: "company_category",
        isCore: true,
        role: "filtre",
        roleLabel: "Filtre échéance",
        title: "Catégorie de l'entreprise au sens de la réforme",
        subtitle: "Détermine votre calendrier d'obligation d'émission (2026 ou 2027).",
        type: "single",
        required: true,
        options: [
          { value: "micro", label: "Micro-entreprise / Auto-entrepreneur", desc: "Chiffre d'affaires selon seuils du régime micro" },
          { value: "tpe", label: "Très Petite Entreprise (TPE)", desc: "< 10 salariés et CA / bilan < 2 M€" },
          { value: "pme", label: "Petite ou Moyenne Entreprise (PME)", desc: "< 250 salariés et CA < 50 M€" },
          { value: "eti", label: "Entreprise de Taille Intermédiaire (ETI)", desc: "250 à 4 999 salariés ou CA < 1,5 Md€" },
          { value: "ge", label: "Grande Entreprise (GE)", desc: "≥ 5 000 salariés ou CA > 1,5 Md€" }
        ]
      },
      {
        number: 2,
        id: "headcount",
        isCore: true,
        role: "ponderation",
        roleLabel: "Pondération",
        title: "Effectif de l'entreprise",
        subtitle: "Nombre de collaborateurs au sein de votre structure.",
        type: "single",
        required: true,
        options: [
          { value: "less_10", label: "Moins de 10 salariés" },
          { value: "10_49", label: "10 à 49 salariés" },
          { value: "50_249", label: "50 à 249 salariés" },
          { value: "250_4999", label: "250 à 4 999 salariés" },
          { value: "plus_5000", label: "5 000 salariés ou plus" }
        ]
      },
      {
        number: 3,
        id: "annual_revenue",
        isCore: true,
        role: "ponderation",
        roleLabel: "Pondération",
        title: "Chiffre d'affaires annuel",
        subtitle: "Montant annuel approximatif du chiffre d'affaires hors taxes.",
        type: "single",
        required: true,
        options: [
          { value: "less_2m", label: "Moins de 2 M€" },
          { value: "2m_10m", label: "2 à 10 M€" },
          { value: "10m_50m", label: "10 à 50 M€" },
          { value: "plus_50m", label: "Plus de 50 M€" }
        ]
      },
      {
        number: 4,
        id: "company_structure",
        isCore: true,
        role: "filtre",
        roleLabel: "Filtre multi-entités",
        title: "Structure de l'entreprise",
        subtitle: "Votre entité comporte-t-elle plusieurs établissements ou sociétés ?",
        type: "single",
        required: true,
        options: [
          { value: "mono", label: "Mono-établissement (Une seule structure / un seul site)" },
          { value: "multi_etab", label: "Plusieurs établissements (Une seule société avec plusieurs SIRET)" },
          { value: "multi_siren", label: "Groupe de plusieurs sociétés (Plusieurs SIREN distincts)" }
        ]
      },
      {
        number: 5,
        id: "siren_count",
        isCore: false,
        role: "filtre",
        roleLabel: "Filtre",
        title: "Nombre de sociétés françaises (numéros SIREN distincts)",
        subtitle: "Indiquez le nombre de filiales ou entités juridiques à interconnecter.",
        type: "number",
        placeholder: "Ex: 3",
        min: 1,
        condition: { field: "company_structure", value: "multi_siren" }
      },
      {
        number: 6,
        id: "etab_count",
        isCore: false,
        role: "ponderation",
        roleLabel: "Pondération",
        title: "Nombre total d'établissements (SIRET)",
        subtitle: "Nombre total de sites ou points de vente secondaires.",
        type: "number",
        placeholder: "Ex: 5",
        min: 1,
        condition: { field: "company_structure", in: ["multi_etab", "multi_siren"] }
      },
      {
        number: 7,
        id: "vat_group",
        isCore: true,
        role: "filtre",
        roleLabel: "Filtre échéance",
        title: "Société membre d'un assujetti unique (Groupe TVA)",
        subtitle: "L'assujetti unique impose la mise en conformité dès le 1er septembre 2026.",
        type: "single",
        required: true,
        options: [
          { value: "oui", label: "Oui (Membre d'un assujetti unique / Groupe TVA)" },
          { value: "non", label: "Non" },
          { value: "je_ne_sais_pas", label: "Je ne sais pas" }
        ]
      },
      {
        number: 8,
        id: "foreign_branches",
        isCore: false,
        role: "ponderation",
        roleLabel: "Pondération",
        title: "Établissements situés hors de France",
        subtitle: "Disposez-vous de succursales ou filiales à l'international ?",
        type: "single",
        condition: { field: "company_structure", in: ["multi_etab", "multi_siren"] },
        options: [
          { value: "oui", label: "Oui" },
          { value: "non", label: "Non" }
        ]
      },
      {
        number: 9,
        id: "target_date",
        isCore: true,
        role: "filtre",
        roleLabel: "Filtre délai",
        title: "Date cible de mise en conformité",
        subtitle: "Votre horizon souhaité de bascule et d'opérationnalité.",
        type: "single",
        required: true,
        options: [
          { value: "sept_2026", label: "Septembre 2026 (Obligation légale de réception & émission GE/ETI)" },
          { value: "sept_2027", label: "Septembre 2027 (Échéance finale d'émission TPE/PME)" },
          { value: "asap", label: "Le plus tôt possible (Phase pilote / anticipation)" }
        ]
      }
    ]
  },
  {
    id: "B",
    title: "Section B · Activité et nature des flux",
    description: "Analysons vos flux de facturation (B2B, B2C, B2G, international) et vos volumes annuels.",
    questions: [
      {
        number: 10,
        id: "sector",
        isCore: true,
        role: "filtre",
        roleLabel: "Filtre section H",
        title: "Secteur d'activité principal",
        subtitle: "Certains secteurs (ex: hôtellerie-restauration) possèdent des contraintes métiers fortes.",
        type: "select",
        required: true,
        options: [
          { value: "hotellerie_restauration", label: "Hôtellerie - Restauration & Hébergement" },
          { value: "batiment_btp", label: "Bâtiment, BTP & Artisans" },
          { value: "commerce_retail", label: "Commerce de détail, E-commerce & Distribution" },
          { value: "services_conseil", label: "Services, Conseil & Prestations intellectuelles" },
          { value: "industrie_transport", label: "Industrie, Logistique & Transport" },
          { value: "sante_medical", label: "Santé, Pharmacie & Professions libérales" },
          { value: "autre", label: "Autre secteur d'activité" }
        ]
      },
      {
        number: 11,
        id: "client_types",
        isCore: true,
        role: "filtre",
        roleLabel: "Filtre circuits",
        title: "Typologie de clientèle",
        subtitle: "Sélectionnez tous les types de clients que vous facturez (e-invoicing et/ou e-reporting).",
        type: "multiple",
        required: true,
        options: [
          { value: "b2b", label: "Entreprises privées françaises (B2B domestique - Assujettis TVA)" },
          { value: "b2c", label: "Particuliers / Consommateurs finals (B2C - e-Reporting)" },
          { value: "b2g", label: "Secteur public, État & Collectivités territoriales (B2G - Chorus Pro)" },
          { value: "international", label: "Clients étrangers (Union Européenne ou grand export)" }
        ]
      },
      {
        number: 12,
        id: "b2c_share",
        isCore: false,
        role: "ponderation",
        roleLabel: "Pondération",
        title: "Part du chiffre d'affaires réalisée avec des particuliers (B2C)",
        subtitle: "Impacte le volume des données de transaction soumises à l'e-reporting périodique.",
        type: "single",
        condition: { field: "client_types", contains: "b2c" },
        options: [
          { value: "less_10", label: "Moins de 10 % du CA" },
          { value: "10_50", label: "10 à 50 % du CA" },
          { value: "plus_50", label: "Plus de 50 % du CA (Activité à dominante B2C)" }
        ]
      },
      {
        number: 13,
        id: "b2g_public",
        isCore: false,
        role: "filtre",
        roleLabel: "Filtre Chorus Pro",
        title: "Facturation auprès du secteur public ou de collectivités",
        subtitle: "Nécessite une passerelle d'adressage transparente avec le portail Chorus Pro de l'État.",
        type: "single",
        condition: { field: "client_types", contains: "b2g" },
        options: [
          { value: "oui", label: "Oui (Émission régulière vers le secteur public)" },
          { value: "non", label: "Non" }
        ]
      },
      {
        number: 14,
        id: "foreign_clients_scope",
        isCore: false,
        role: "filtre",
        roleLabel: "Filtre données",
        title: "Localisation de vos clients internationaux",
        subtitle: "Détermine les règles d'e-reporting international (acquisitions intracommunautaires / export).",
        type: "single",
        condition: { field: "client_types", contains: "international" },
        options: [
          { value: "ue", label: "Clients situés dans l'Union Européenne" },
          { value: "hors_ue", label: "Clients hors Union Européenne (Grand export)" },
          { value: "les_deux", label: "Les deux (UE et hors UE)" }
        ]
      },
      {
        number: 15,
        id: "sales_volume",
        isCore: true,
        role: "filtre",
        roleLabel: "Filtre tarif au flux",
        title: "Volume annuel de factures de vente émises (Clients)",
        subtitle: "Nombre total de factures clients établies par an.",
        type: "single",
        required: true,
        options: [
          { value: "less_100", label: "Moins de 100 factures / an" },
          { value: "100_500", label: "100 à 500 factures / an" },
          { value: "500_2000", label: "500 à 2 000 factures / an" },
          { value: "2000_10000", label: "2 000 à 10 000 factures / an" },
          { value: "plus_10000", label: "Plus de 10 000 factures / an" }
        ]
      },
      {
        number: 16,
        id: "purchase_volume",
        isCore: true,
        role: "filtre",
        roleLabel: "Filtre tarif au flux",
        title: "Volume annuel de factures d'achat reçues (Fournisseurs)",
        subtitle: "Nombre total de factures fournisseurs à réceptionner et intégrer par an.",
        type: "single",
        required: true,
        options: [
          { value: "less_100", label: "Moins de 100 factures / an" },
          { value: "100_500", label: "100 à 500 factures / an" },
          { value: "500_2000", label: "500 à 2 000 factures / an" },
          { value: "2000_10000", label: "2 000 à 10 000 factures / an" },
          { value: "plus_10000", label: "Plus de 10 000 factures / an" }
        ]
      },
      {
        number: 17,
        id: "vat_regime",
        isCore: false,
        role: "information",
        roleLabel: "Information",
        title: "Régime fiscal de TVA applicable",
        subtitle: "Information utile pour le paramétrage de l'e-reporting fiscal.",
        type: "single",
        options: [
          { value: "reel_normal", label: "Régime réel normal" },
          { value: "reel_simplifie", label: "Régime réel simplifié" },
          { value: "franchise_base", label: "Franchise en base de TVA (non assujetti)" }
        ]
      },
      {
        number: 18,
        id: "vat_payment_data",
        isCore: false,
        role: "filtre",
        roleLabel: "Filtre données de paiement",
        title: "Prestations de services avec exigibilité de la TVA à l'encaissement",
        subtitle: "L'État exige la transmission du statut de paiement pour les prestations de services.",
        type: "single",
        options: [
          { value: "oui", label: "Oui (TVA exigible lors du règlement client)" },
          { value: "non", label: "Non (Livraisons de biens ou TVA sur les débits)" },
          { value: "option_debits", label: "Option expresse pour le paiement d'après les débits" }
        ]
      },
      {
        number: 19,
        id: "billing_mandate",
        isCore: false,
        role: "filtre",
        roleLabel: "Filtre mandat",
        title: "Facturation au nom et pour le compte de tiers (Mandat d'autofacturation)",
        subtitle: "Émettez-vous ou recevez-vous des factures en sous-traitance / mandataire ?",
        type: "single",
        options: [
          { value: "oui", label: "Oui (Mandat de facturation à gérer)" },
          { value: "non", label: "Non" }
        ]
      }
    ]
  },
  {
    id: "C",
    title: "Section C · Environnement logiciel",
    description: "Vérifions la compatibilité de vos outils actuels (outils de facturation, comptabilité, ERP, caisse).",
    questions: [
      {
        number: 20,
        id: "tool_count",
        isCore: true,
        role: "ponderation",
        roleLabel: "Pondération intégration",
        title: "Nombre d'outils intervenant dans le cycle de facturation",
        subtitle: "Combien d'applications distinctes génèrent ou traitent des factures chez vous ?",
        type: "single",
        required: true,
        options: [
          { value: "one", label: "Un seul outil intégré" },
          { value: "two_three", label: "2 à 3 outils distincts (ex: Caisse + Facturation + Compta)" },
          { value: "more_three", label: "Plus de 3 outils (Architecture complexe / multi-logiciels)" }
        ]
      },
      {
        number: 21,
        id: "current_billing_software",
        isCore: true,
        role: "filtre",
        roleLabel: "Filtre connecteur",
        title: "Logiciel de facturation ou logiciel métier actuel",
        subtitle: "L'outil dans lequel vous saisissez vos devis et factures de vente.",
        type: "search-select",
        required: true,
        options: [
          { value: "sage", label: "Sage (100, 50, Batigest, FRP 1000...)" },
          { value: "pennylane", label: "Pennylane" },
          { value: "cegid", label: "Cegid (Loop, Quadra, XRP Sprint...)" },
          { value: "ebp", label: "EBP (Compta, Gestion commerciale...)" },
          { value: "tiime", label: "Tiime" },
          { value: "indy", label: "Indy (ex-Georges)" },
          { value: "sellsy", label: "Sellsy" },
          { value: "axonaut", label: "Axonaut" },
          { value: "odoo", label: "Odoo" },
          { value: "evoliz", label: "Evoliz" },
          { value: "ipaidthat", label: "Ipaidthat" },
          { value: "henrri", label: "Henrri" },
          { value: "vosfactures", label: "VosFactures" },
          { value: "myunisoft", label: "MyUnisoft" },
          { value: "acd", label: "ACD Groupe" },
          { value: "dougs", label: "Dougs" },
          { value: "excel", label: "Excel, Word ou papier" },
          { value: "aucun", label: "Aucun logiciel de facturation" },
          { value: "autre", label: "Autre logiciel métier spécialisé" }
        ]
      },
      {
        number: 22,
        id: "current_accounting_software",
        isCore: true,
        role: "filtre",
        roleLabel: "Filtre connecteur",
        title: "Logiciel comptable utilisé",
        subtitle: "L'outil utilisé par votre service comptabilité interne ou votre expert-comptable.",
        type: "search-select",
        required: true,
        options: [
          { value: "sage", label: "Sage (Sage 100 Génération Experts, FRP...)" },
          { value: "cegid", label: "Cegid (Cegid Expert, Quadra, Loop...)" },
          { value: "pennylane", label: "Pennylane" },
          { value: "ebp", label: "EBP Compta" },
          { value: "acd", label: "ACD Groupe (DiaCompta, i-Suite...)" },
          { value: "myunisoft", label: "MyUnisoft" },
          { value: "isagri", label: "Isagri / Agiris" },
          { value: "fidal", label: "Fiducial" },
          { value: "tiime", label: "Tiime" },
          { value: "autre", label: "Autre outil comptable" },
          { value: "ne_sait_pas", label: "Géré entièrement par l'expert-comptable" }
        ]
      },
      {
        number: 23,
        id: "erp_software",
        isCore: false,
        role: "filtre",
        roleLabel: "Filtre connecteur",
        title: "Progiciel de Gestion Intégré (ERP) éventuel",
        subtitle: "Si votre entreprise s'appuie sur un ERP centralisé.",
        type: "search-select",
        options: [
          { value: "aucun", label: "Aucun ERP" },
          { value: "sap", label: "SAP (S/4HANA, Business One...)" },
          { value: "microsoft_dynamics", label: "Microsoft Dynamics 365 / Navision" },
          { value: "odoo", label: "Odoo ERP" },
          { value: "sage_x3", label: "Sage X3" },
          { value: "infor", label: "Infor" },
          { value: "netsuite", label: "Oracle NetSuite" },
          { value: "autre", label: "Autre ERP" }
        ]
      },
      {
        number: 24,
        id: "structured_format",
        isCore: true,
        role: "filtre",
        roleLabel: "Filtre format",
        title: "Format structuré que votre système peut produire aujourd'hui",
        subtitle: "La norme franco-européenne impose l'un de ces formats socles standardisés.",
        type: "single",
        required: true,
        options: [
          { value: "facturx", label: "Factur-X (Format mixte : PDF lisible + XML structuré intégré)" },
          { value: "ubl", label: "UBL (Universal Business Language - XML pur)" },
          { value: "cii", label: "CII (Cross Industry Invoice - XML pur)" },
          { value: "aucun", label: "Aucun (Factures éditées en PDF simple ou papier)" },
          { value: "ne_sait_pas", label: "Je ne sais pas" }
        ]
      },
      {
        number: 25,
        id: "connection_mode",
        isCore: false,
        role: "filtre",
        roleLabel: "Filtre",
        title: "Mode de raccordement technique souhaité avec la plateforme",
        subtitle: "Comment souhaitez-vous échanger vos factures avec la Plateforme Agréée ?",
        type: "single",
        options: [
          { value: "api", label: "API REST / Webhook temps réel (Intégration transparente et automatique)" },
          { value: "edi", label: "EDI / SFTP / AS2 (Échanges de flux sécurisés par lots automatisés)" },
          { value: "depot", label: "Dépôt manuel de fichiers (Upload de PDF/Factur-X sur le portail)" },
          { value: "portail", label: "Saisie directe en ligne sur le portail web de la plateforme" }
        ]
      },
      {
        number: 26,
        id: "status_feedback",
        isCore: false,
        role: "ponderation",
        roleLabel: "Pondération",
        title: "Retour des statuts de cycle de vie dans votre outil métier",
        subtitle: "Remontée automatique des statuts légaux (Déposée, Rejetée, Refusée, Encaissée) dans votre logiciel.",
        type: "single",
        options: [
          { value: "indispensable", label: "Indispensable (Suivi temps réel direct sans changer d'écran)" },
          { value: "souhaitable", label: "Souhaitable mais non bloquant" },
          { value: "indifferent", label: "Indifférent (Consultation sur le portail de la plateforme)" }
        ]
      },
      {
        number: 27,
        id: "manual_reentry",
        isCore: false,
        role: "ponderation",
        roleLabel: "Pondération automatisation",
        title: "Volume de ressaisies manuelles constatées aujourd'hui",
        subtitle: "Objectif de réduction des erreurs et des temps de traitement administratif.",
        type: "single",
        options: [
          { value: "aucune", label: "Aucune ressaisie (Tout est déjà automatisé)" },
          { value: "quelques_unes", label: "Quelques-unes sur les factures d'achats ou les règlements" },
          { value: "nombreuses", label: "Nombreuses ressaisies manuelles (Fort besoin d'automatisation OCR/IA)" }
        ]
      }
    ]
  },
  {
    id: "D",
    title: "Section D · Besoins fonctionnels",
    description: "Définissons les fonctionnalités indispensables pour votre organisation administrative.",
    questions: [
      {
        number: 28,
        id: "platform_expectations",
        isCore: true,
        role: "filtre",
        roleLabel: "Filtre",
        title: "Besoins attendus de la Plateforme Agréée",
        subtitle: "Cochez l'ensemble des missions que vous souhaitez confier à la plateforme.",
        type: "multiple",
        required: true,
        options: [
          { value: "emission", label: "Émission et transmission réglementaire des factures de vente" },
          { value: "reception", label: "Réception centralisée et traitement des factures fournisseurs" },
          { value: "ereporting", label: "Transmission des données d'e-reporting à l'administration fiscale" },
          { value: "archivage", label: "Archivage électronique légal à valeur probante (10 ans)" }
        ]
      },
      {
        number: 29,
        id: "approval_workflow",
        isCore: false,
        role: "ponderation",
        roleLabel: "Pondération",
        title: "Circuit de validation / Bon à payer des factures d'achat",
        subtitle: "Besoin de paramétrer des workflows de validation hiérarchique avant mise en paiement.",
        type: "single",
        options: [
          { value: "oui", label: "Oui (Workflows multi-niveaux / bons à payer nécessaires)" },
          { value: "non", label: "Non (Validation simple)" }
        ]
      },
      {
        number: 30,
        id: "pre_validation_checks",
        isCore: false,
        role: "ponderation",
        roleLabel: "Pondération",
        title: "Contrôle automatisé des données avant émission",
        subtitle: "Vérification syntaxique, contrôle SIREN dans l'annuaire national et conformité des mentions légales.",
        type: "single",
        options: [
          { value: "indispensable", label: "Indispensable (Bloquer toute facture non conforme pour éviter les amendes)" },
          { value: "souhaitable", label: "Souhaitable" },
          { value: "indifferent", label: "Indifférent" }
        ]
      },
      {
        number: 31,
        id: "probative_archiving",
        isCore: false,
        role: "filtre",
        roleLabel: "Filtre",
        title: "Archivage à valeur probante (Norme NF Z42-013 / Coffre-fort numérique)",
        subtitle: "La plateforme doit-elle assurer la conservation légale scellée pendant 10 ans ?",
        type: "single",
        options: [
          { value: "a_couvrir", label: "À couvrir intégralement par la Plateforme Agréée" },
          { value: "deja_couvert", label: "Déjà couvert par un SAE / coffre-fort d'archivage existant" }
        ]
      },
      {
        number: 32,
        id: "analytics_dashboards",
        isCore: false,
        role: "ponderation",
        roleLabel: "Pondération",
        title: "Tableaux de bord de trésorerie et exports financiers",
        subtitle: "Visualisation des délais de paiement, alertes litiges et états de TVA prévisionnels.",
        type: "single",
        options: [
          { value: "indispensable", label: "Indispensable" },
          { value: "souhaitable", label: "Souhaitable" },
          { value: "indifferent", label: "Indifférent" }
        ]
      },
      {
        number: 33,
        id: "credit_notes_management",
        isCore: false,
        role: "ponderation",
        roleLabel: "Pondération",
        title: "Gestion automatisée des avoirs et factures rectificatives",
        subtitle: "Liaison stricte entre facture initiale et avoir de régularisation exigée par l'administration.",
        type: "single",
        options: [
          { value: "oui", label: "Oui (Émission régulière d'avoirs partiels ou totaux)" },
          { value: "non", label: "Non" }
        ]
      }
    ]
  },
  {
    id: "E",
    title: "Section E · Utilisateurs et sécurité",
    description: "Évaluons les accès d'équipe, les exigences de localisation et les certifications de sécurité.",
    questions: [
      {
        number: 34,
        id: "user_count",
        isCore: true,
        role: "filtre",
        roleLabel: "Filtre licences",
        title: "Nombre d'utilisateurs devant accéder à la plateforme",
        subtitle: "Collaborateurs amenés à consulter, valider ou émettre des factures.",
        type: "single",
        required: true,
        options: [
          { value: "1", label: "1 utilisateur unique (Dirigeant ou comptable unique)" },
          { value: "2_5", label: "2 à 5 utilisateurs" },
          { value: "6_20", label: "6 à 20 utilisateurs" },
          { value: "plus_20", label: "Plus de 20 utilisateurs (Grand compte / multi-sites)" }
        ]
      },
      {
        number: 35,
        id: "role_based_access",
        isCore: false,
        role: "filtre",
        roleLabel: "Filtre",
        title: "Droits d'accès différenciés par profil ou établissement",
        subtitle: "Gestion de rôles fins (administrateur, approbateur, lecteur, comptable, par site).",
        type: "single",
        condition: { field: "user_count", notIn: ["1"] },
        options: [
          { value: "oui", label: "Oui (Permissions personnalisées requises)" },
          { value: "non", label: "Non" }
        ]
      },
      {
        number: 36,
        id: "data_hosting_location",
        isCore: false,
        role: "filtre",
        roleLabel: "Filtre",
        title: "Hébergement des données en France ou dans l'Union Européenne",
        subtitle: "Garantie de souveraineté et non-soumission aux législations extraterritoriales (Cloud Act).",
        type: "single",
        options: [
          { value: "exige", label: "Exigé (Hébergement 100% en France ou UE)" },
          { value: "indifferent", label: "Indifférent" }
        ]
      },
      {
        number: 37,
        id: "security_certification",
        isCore: false,
        role: "filtre",
        roleLabel: "Filtre",
        title: "Certification de sécurité exigée (ISO 27001 ou SecNumCloud)",
        subtitle: "Normes internationales de sécurité des systèmes d'information et de cryptographie.",
        type: "single",
        options: [
          { value: "oui", label: "Oui (Certification formelle obligatoire dans notre cahier des charges)" },
          { value: "non", label: "Non" }
        ]
      },
      {
        number: 38,
        id: "reversibility_clause",
        isCore: false,
        role: "ponderation",
        roleLabel: "Pondération",
        title: "Garantie contractuelle de réversibilité des données",
        subtitle: "Capacité à récupérer l'intégralité de l'historique et des statuts sans frais en cas de changement de prestataire.",
        type: "single",
        options: [
          { value: "oui", label: "Oui (Clause de réversibilité indispensable)" },
          { value: "non", label: "Non" }
        ]
      }
    ]
  },
  {
    id: "F",
    title: "Section F · Expert-comptable",
    description: "Coordonnez les échanges avec votre cabinet d'expertise comptable.",
    questions: [
      {
        number: 39,
        id: "has_accountant",
        isCore: true,
        role: "ponderation",
        roleLabel: "Pondération",
        title: "Votre entreprise est-elle accompagnée par un cabinet d'expertise comptable ?",
        subtitle: "L'interconnexion fluide avec le cabinet évite les doubles saisies d'écritures.",
        type: "single",
        required: true,
        options: [
          { value: "oui", label: "Oui (Expert-comptable externe régulier)" },
          { value: "non", label: "Non (Comptabilité gérée 100% en interne)" },
          { value: "en_recherche", label: "En recherche d'un cabinet partenaire" }
        ]
      },
      {
        number: 40,
        id: "accountant_portal_access",
        isCore: false,
        role: "filtre",
        roleLabel: "Filtre",
        title: "Accès dédié gratuit ou portail collaboratif pour le cabinet",
        subtitle: "Permet à votre expert-comptable d'accéder directement aux factures et écritures.",
        type: "single",
        condition: { field: "has_accountant", value: "oui" },
        options: [
          { value: "indispensable", label: "Indispensable (Accès cabinet dédié requis)" },
          { value: "souhaitable", label: "Souhaitable" },
          { value: "non_necessaire", label: "Non nécessaire (Exports manuels mensuels)" }
        ]
      },
      {
        number: 41,
        id: "accountant_recommended_tool",
        isCore: false,
        role: "information",
        roleLabel: "Information",
        title: "Votre cabinet d'expertise comptable vous a-t-il déjà recommandé une plateforme ?",
        subtitle: "Facilite l'alignement avec les outils de production du cabinet.",
        type: "text",
        placeholder: "Nom de la plateforme recommandée (ou 'Non')",
        condition: { field: "has_accountant", value: "oui" }
      }
    ]
  },
  {
    id: "G",
    title: "Section G · Budget et accompagnement",
    description: "Définissez votre budget cible et le niveau de support technique souhaité.",
    questions: [
      {
        number: 42,
        id: "annual_budget",
        isCore: true,
        role: "filtre",
        roleLabel: "Filtre tarifaire",
        title: "Budget annuel d'abonnement envisagé pour la plateforme",
        subtitle: "Coût récurrent des licences et du traitement des flux.",
        type: "single",
        required: true,
        options: [
          { value: "less_200", label: "Moins de 200 € / an (< 17 €/mois)" },
          { value: "200_600", label: "200 à 600 € / an (17 à 50 €/mois)" },
          { value: "600_2000", label: "600 à 2 000 € / an (50 à 160 €/mois)" },
          { value: "plus_2000", label: "Plus de 2 000 € / an" },
          { value: "non_defini", label: "Budget non défini / recherche du meilleur rapport qualité-prix" }
        ]
      },
      {
        number: 43,
        id: "setup_budget",
        isCore: false,
        role: "ponderation",
        roleLabel: "Pondération",
        title: "Budget de mise en service, paramétrage et intégration initiale",
        subtitle: "Prestations d'installation, raccordement connecteurs et formation des équipes.",
        type: "single",
        options: [
          { value: "less_500", label: "Moins de 500 € (Auto-déploiement guidé)" },
          { value: "500_2000", label: "500 à 2 000 €" },
          { value: "plus_2000", label: "Plus de 2 000 € (Projet d'intégration sur-mesure)" },
          { value: "non_defini", label: "Non défini" }
        ]
      },
      {
        number: 44,
        id: "price_sensitivity",
        isCore: false,
        role: "ponderation",
        roleLabel: "Pondération globale",
        title: "Sensibilité au prix par rapport à la richesse fonctionnelle",
        subtitle: "Votre critère d'arbitrage prépondérant.",
        type: "single",
        options: [
          { value: "prix_prioritaire", label: "Prix prioritaire (Solution économique pour simple conformité)" },
          { value: "equilibre", label: "Équilibré (Bon rapport coût / fonctionnalités)" },
          { value: "fonctions_prioritaires", label: "Fonctionnalités et automatisation prioritaires (Gain de temps maximal)" }
        ]
      },
      {
        number: 45,
        id: "onboarding_need",
        isCore: true,
        role: "ponderation",
        roleLabel: "Pondération",
        title: "Besoin d'accompagnement au déploiement",
        subtitle: "Quel niveau d'aide humaine souhaitez-vous pour démarrer ?",
        type: "single",
        required: true,
        options: [
          { value: "autonome", label: "Autonome (Documentation en ligne, vidéos et tutoriels)" },
          { value: "demarrage", label: "Assistance au démarrage (Webinaire de prise en main & support)" },
          { value: "complet", label: "Accompagnement complet dédié (Chef de projet, formation équipe)" }
        ]
      },
      {
        number: 46,
        id: "french_support_sla",
        isCore: false,
        role: "ponderation",
        roleLabel: "Pondération",
        title: "Support client basé en France avec engagement de délai (SLA)",
        subtitle: "Garantie contractuelle de temps de réponse et assistance téléphonique en français.",
        type: "single",
        options: [
          { value: "exige", label: "Exigé (Support téléphonique réactif et SLA contractuel)" },
          { value: "souhaitable", label: "Souhaitable (Support par ticket / chat réactif)" },
          { value: "indifferent", label: "Indifférent" }
        ]
      },
      {
        number: 47,
        id: "testing_sandbox_phase",
        isCore: false,
        role: "ponderation",
        roleLabel: "Pondération",
        title: "Phase de tests / bac à sable (Sandbox) avant bascule définitive",
        subtitle: "Tester l'émission et la réception en environnement virtuel sans impact comptable.",
        type: "single",
        options: [
          { value: "exigee", label: "Exigée (Tester obligatoirement les connecteurs avant mise en prod)" },
          { value: "non_necessaire", label: "Non nécessaire" }
        ]
      }
    ]
  },
  {
    id: "H",
    title: "Section H · Spécificités Hôtellerie - Restauration",
    description: "Section dédiée aux établissements hôteliers, résidences et restaurants (PMS, caisses, multi-taux de TVA, arrhes et débours).",
    condition: { field: "sector", value: "hotellerie_restauration" },
    questions: [
      {
        number: 48,
        id: "pms_tool",
        isCore: true,
        role: "filtre",
        roleLabel: "Filtre connecteur",
        title: "Property Management System (PMS) utilisé",
        subtitle: "Votre logiciel central de gestion des chambres et des réservations.",
        type: "search-select",
        required: true,
        options: [
          { value: "opera", label: "Oracle Hospitality OPERA (Cloud / V5)" },
          { value: "mews", label: "Mews Hospitality PMS" },
          { value: "thais", label: "Thaïs PMS (Thaïs Soft)" },
          { value: "medialog", label: "Medialog Hôtel" },
          { value: "asterio", label: "Asterio (Sequoiasoft)" },
          { value: "misterbooking", label: "Misterbooking" },
          { value: "vega", label: "Vega PMS" },
          { value: "innsist", label: "Innsist / Amadeus" },
          { value: "autre", label: "Autre PMS hôtelier" },
          { value: "aucun", label: "Aucun PMS (Gestion manuelle)" }
        ]
      },
      {
        number: 49,
        id: "pms_multi_sites",
        isCore: true,
        role: "ponderation",
        roleLabel: "Pondération harmonisation",
        title: "Parc PMS de vos établissements",
        subtitle: "Utilisez-vous un outil unique ou des PMS hétérogènes selon vos établissements ?",
        type: "single",
        required: true,
        options: [
          { value: "unique", label: "PMS unique centralisé sur tous nos établissements" },
          { value: "differents", label: "PMS différents selon les sites (Besoin d'agrégation multi-connecteurs)" }
        ]
      },
      {
        number: 50,
        id: "pos_software",
        isCore: true,
        role: "filtre",
        roleLabel: "Filtre connecteur",
        title: "Logiciel de caisse / Point de Vente (POS)",
        subtitle: "Système d'encaissement pour le restaurant, bar, spa ou boutique.",
        type: "search-select",
        required: true,
        options: [
          { value: "simphony", label: "Oracle Simphony POS" },
          { value: "lightspeed", label: "Lightspeed Restaurant" },
          { value: "tiller", label: "Tiller / SumUp POS" },
          { value: "zelty", label: "Zelty" },
          { value: "pi_electronique", label: "Pi Électronique" },
          { value: "autre", label: "Autre logiciel de caisse" },
          { value: "aucun", label: "Aucun logiciel de caisse (Intégré au PMS ou hébergement pur)" }
        ]
      },
      {
        number: 51,
        id: "channel_manager",
        isCore: false,
        role: "ponderation",
        roleLabel: "Pondération",
        title: "Channel Manager & Moteur de réservation",
        subtitle: "Outil de synchronisation des canaux de distribution (D-Edge, SiteMinder, Availpro...).",
        type: "text",
        placeholder: "Ex: D-Edge, SiteMinder, Cubilis (ou 'Aucun')"
      },
      {
        number: 52,
        id: "billing_start_point",
        isCore: true,
        role: "filtre",
        roleLabel: "Filtre architecture",
        title: "Point de départ souhaité de la facturation",
        subtitle: "Où la facture officielle doit-elle être générée initialement ?",
        type: "single",
        required: true,
        options: [
          { value: "depuis_pms", label: "Depuis le PMS (Le PMS génère la facture et la transmet à la plateforme)" },
          { value: "depuis_compta", label: "Depuis la comptabilité (Centralisation des écritures avant émission)" },
          { value: "depuis_plateforme", label: "Directement depuis la Plateforme Agréée" }
        ]
      },
      {
        number: 53,
        id: "ota_revenue_share",
        isCore: true,
        role: "ponderation",
        roleLabel: "Pondération commissions",
        title: "Part du chiffre d'affaires réalisée via des OTA et intermédiaires (Booking, Expedia...)",
        subtitle: "Impacte la gestion de l'e-reporting et le retraitement des commissions d'agences.",
        type: "single",
        required: true,
        options: [
          { value: "aucune", label: "Aucune (100 % en direct)" },
          { value: "less_25", label: "Moins de 25 % du CA" },
          { value: "25_50", label: "25 à 50 % du CA" },
          { value: "plus_50", label: "Plus de 50 % du CA (Forte dépendance aux OTA)" }
        ]
      },
      {
        number: 54,
        id: "foreign_ota_vat_reverse",
        isCore: false,
        role: "ponderation",
        roleLabel: "Pondération",
        title: "Commissions d'intermédiaires étrangers avec autoliquidation de TVA",
        subtitle: "Traitement fiscal des factures de commissions reçues de Booking.com (Pays-Bas) ou Expedia.",
        type: "single",
        options: [
          { value: "oui", label: "Oui (Autoliquidation de TVA sur commissions étrangères à gérer)" },
          { value: "non", label: "Non" }
        ]
      },
      {
        number: 55,
        id: "group_seminars_billing",
        isCore: true,
        role: "ponderation",
        roleLabel: "Pondération",
        title: "Facturation de groupes, séminaires ou comptes débiteurs divers",
        subtitle: "Émission de factures globales B2B avec fractionnement de prestations.",
        type: "single",
        required: true,
        options: [
          { value: "oui", label: "Oui (Facturation fréquente de séminaires et groupes entreprises)" },
          { value: "non", label: "Non (Clientèle individuelle quasi-exclusive)" }
        ]
      },
      {
        number: 56,
        id: "employer_rebilling",
        isCore: true,
        role: "ponderation",
        roleLabel: "Pondération contrôle",
        title: "Refacturation d'un séjour à l'employeur du client (Société tierce)",
        subtitle: "Le client individuel demande une facture au nom de son entreprise avec mention du SIREN.",
        type: "single",
        required: true,
        options: [
          { value: "frequente", label: "Fréquente (Gestion des flux B2B au comptoir essentielle)" },
          { value: "occasionnelle", label: "Occasionnelle" },
          { value: "jamais", label: "Jamais" }
        ]
      },
      {
        number: 57,
        id: "deposits_no_show",
        isCore: true,
        role: "ponderation",
        roleLabel: "Pondération",
        title: "Gestion des arrhes, acomptes et indemnités de non-présentation (No-show)",
        subtitle: "Traitement des règles d'exigibilité de TVA spécifiques aux acomptes et pénalités.",
        type: "single",
        required: true,
        options: [
          { value: "oui", label: "Oui (Acomptes encaissés à la réservation et no-shows fréquents)" },
          { value: "non", label: "Non" }
        ]
      },
      {
        number: 58,
        id: "cancellations_frequency",
        isCore: false,
        role: "ponderation",
        roleLabel: "Pondération",
        title: "Fréquence des avoirs, remboursements et annulations",
        subtitle: "Nécessite une automatisation fluide de la chaîne d'avoirs réglementaires.",
        type: "single",
        options: [
          { value: "oui", label: "Fréquents (Remboursements et annulations réguliers)" },
          { value: "non", label: "Faibles" }
        ]
      },
      {
        number: 59,
        id: "multi_vat_rates",
        isCore: true,
        role: "ponderation",
        roleLabel: "Pondération ventilation",
        title: "Plusieurs taux de TVA sur une même facture",
        subtitle: "Hébergement (10%), Restauration (10%/20%), Boissons alcoolisées (20%), Petit-déjeuner (5.5%/10%).",
        type: "single",
        required: true,
        options: [
          { value: "oui", label: "Oui (Ventilation multi-taux sur facture unique indispensable)" },
          { value: "non", label: "Non (Taux unique)" }
        ]
      },
      {
        number: 60,
        id: "tourist_tax_on_invoice",
        isCore: false,
        role: "ponderation",
        roleLabel: "Pondération hors champ",
        title: "Taxe de séjour figurant sur la facture client",
        subtitle: "Ligne spécifique non assujettie à la TVA (hors champ fiscal).",
        type: "single",
        options: [
          { value: "oui", label: "Oui (Taxe de séjour gérée et ventilée hors TVA)" },
          { value: "non", label: "Non" }
        ]
      },
      {
        number: 61,
        id: "separate_bar_restaurant",
        isCore: false,
        role: "ponderation",
        roleLabel: "Pondération",
        title: "Restauration ou bar facturés séparément de l'hébergement",
        subtitle: "Transfert de notes de table (clôture POS) vers le folio chambre du PMS.",
        type: "single",
        options: [
          { value: "oui", label: "Oui (Interfaçage Caisse POS ➔ Folio PMS)" },
          { value: "non", label: "Non" }
        ]
      },
      {
        number: 62,
        id: "payment_methods",
        isCore: false,
        role: "ponderation",
        roleLabel: "Pondération donnée de paiement",
        title: "Modes d'encaissement utilisés",
        subtitle: "Sélectionnez vos différents canaux d'encaissement pour l'e-reporting des paiements.",
        type: "multiple",
        options: [
          { value: "tpe", label: "Terminal de paiement physique (TPE comptoir)" },
          { value: "pay_online", label: "Paiement sécurisé en ligne (VAD / Passerelle web)" },
          { value: "virtual_card", label: "Cartes de crédit virtuelles (VCC) / Prépaiement OTA" },
          { value: "virement", label: "Virement bancaire (Sociétés / Groupes)" }
        ]
      },
      {
        number: 63,
        id: "seasonal_staff",
        isCore: false,
        role: "ponderation",
        roleLabel: "Pondération ergonomie",
        title: "Recours à du personnel saisonnier pour la facturation",
        subtitle: "Nécessite une interface simplifiée et ergonomique pour limiter les temps de formation.",
        type: "single",
        options: [
          { value: "oui", label: "Oui (Turnover saisonnier régulier à la réception)" },
          { value: "non", label: "Non" }
        ]
      },
      {
        number: 64,
        id: "common_procedures_guide",
        isCore: false,
        role: "information",
        roleLabel: "Information",
        title: "Guide de procédures de facturation commun aux établissements",
        subtitle: "Standardisation des règles d'émission et de clôture de caisse.",
        type: "single",
        options: [
          { value: "oui", label: "Oui (Procédures écrites formalisées)" },
          { value: "non", label: "Non" }
        ]
      },
      {
        number: 65,
        id: "para_hotellerie_activity",
        isCore: false,
        role: "information",
        roleLabel: "Information",
        title: "Activité de para-hôtellerie ou résidences de tourisme",
        subtitle: "Fourniture d'au moins 3 prestations para-hôtelières (accueil, ménage, linge, petit-déjeuner).",
        type: "single",
        options: [
          { value: "oui", label: "Oui (Activité de para-hôtellerie)" },
          { value: "non", label: "Non (Hôtellerie classique ou restauration)" }
        ]
      }
    ]
  },
  {
    id: "I",
    title: "Section I · Restitution du résultat et export",
    description: "Dernière étape : transmission de votre rapport d'audit personnalisé, exports et options d'accompagnement.",
    questions: [
      {
        number: 66,
        id: "lead_email",
        isCore: true,
        role: "restitution",
        roleLabel: "Envoi du résultat",
        title: "Votre adresse électronique professionnelle",
        subtitle: "Votre comparatif détaillé et le classement argumenté vous seront transmis à cette adresse.",
        type: "text",
        inputType: "email",
        required: true,
        placeholder: "contact@votre-entreprise.fr"
      },
      {
        number: 67,
        id: "consent_processing",
        isCore: true,
        role: "restitution",
        roleLabel: "Conformité RGPD",
        title: "Consentement au traitement des données pour le calcul du comparatif",
        subtitle: "Base légale : Exécution de la demande d'audit. Vos données sont conservées 12 mois pour le suivi de votre dossier et ne sont jamais revendues sans accord.",
        type: "consent",
        required: true,
        label: "J'accepte que mes données déclarées soient traitées par eFactu dans le but exclusif de générer mon rapport de sélection de Plateformes Agréées."
      },
      {
        number: 68,
        id: "consent_operator_sharing",
        isCore: false,
        role: "restitution",
        roleLabel: "Conformité RGPD",
        title: "Mise en relation technique avec les éditeurs retenus (Optionnel)",
        subtitle: "Case distincte, non pré-cochée.",
        type: "consent",
        required: false,
        label: "J'autorise eFactu à transmettre mes coordonnées techniques aux 3 Plateformes Agréées sélectionnées pour obtenir une proposition tarifaire sans engagement."
      },
      {
        number: 69,
        id: "export_format_choice",
        isCore: false,
        role: "restitution",
        roleLabel: "Restitution",
        title: "Format d'export de votre rapport",
        subtitle: "Téléchargement immédiat disponible dès la validation de votre profil.",
        type: "single",
        options: [
          { value: "pdf", label: "Rapport d'audit imprimable et téléchargeable (PDF)" },
          { value: "excel", label: "Tableau de scoring et critères comparatifs (Excel / CSV)" },
          { value: "les_deux", label: "Les deux formats (Dossier complet PDF + Fichier Excel)" }
        ]
      },
      {
        number: 70,
        id: "callback_request",
        isCore: false,
        role: "information",
        roleLabel: "Information",
        title: "Souhait d'être recontacté pour un cadrage technique d'architecture",
        subtitle: "Échange technique avec un consultant indépendant sur vos flux.",
        type: "single",
        options: [
          { value: "oui", label: "Oui (Être rappelé par un expert pour affiner mon projet)" },
          { value: "non", label: "Non (Rapport d'audit autonome suffisant)" }
        ]
      }
    ]
  }
];

// Helper to flatten default questions list if needed by admin panel
export const defaultQuestions = questionnaireSections.flatMap(section => 
  section.questions.map(q => ({
    ...q,
    step: q.number,
    sectionId: section.id,
    sectionTitle: section.title
  }))
);

export function getQuestions() {
  const cached = getCachedQuestions();
  return (cached && cached.length > 0) ? cached : defaultQuestions;
}

export function saveQuestions(questions) {
  saveQuestionsDb(questions);
}
