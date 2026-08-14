import { getPlatforms } from './data/platforms.js';

/**
 * Evaluates hard filters to determine if platform is eligible
 * @param {Object} platform
 * @param {Object} answers
 * @returns {Object} { eligible: boolean, reasons: Array<string> }
 */
export function evaluatePlatformEligibility(platform, answers) {
  const disqualifications = [];
  const matchedCriteria = [];
  const vigilancePoints = [];

  // 1. Filter Category / Size
  if (answers.company_category && platform.compatibility.companyCategories) {
    if (!platform.compatibility.companyCategories.includes(answers.company_category)) {
      if (answers.company_category === "ge" && platform.id === "tiime") {
        disqualifications.push("Inadapté aux Grandes Entreprises (GE)");
      }
    } else {
      matchedCriteria.push(`Adapté à la structure ${answers.company_category.toUpperCase()}`);
    }
  }

  // 2. Filter Multi-SIREN
  if (answers.company_structure === "multi_siren") {
    if (platform.features.multiSiren === false) {
      disqualifications.push("Ne gère pas les groupes multi-SIREN distincts");
    } else {
      matchedCriteria.push("Gestion centralisée multi-SIREN et multi-entités");
    }
  }

  // 3. Filter Format
  if (answers.structured_format && answers.structured_format !== "ne_sait_pas" && answers.structured_format !== "aucun") {
    if (platform.connectors.formats && !platform.connectors.formats.includes(answers.structured_format)) {
      disqualifications.push(`Format ${answers.structured_format.toUpperCase()} non supporté nativement`);
    } else {
      matchedCriteria.push(`Prise en charge native du format ${answers.structured_format.toUpperCase()}`);
    }
  }

  // 4. Filter Chorus Pro (B2G)
  if (answers.b2g_public === "oui" || (Array.isArray(answers.client_types) && answers.client_types.includes("b2g"))) {
    if (platform.features.chorusPro) {
      matchedCriteria.push("Passerelle transparente Chorus Pro (Facturation secteur public)");
    }
  }

  // 5. Filter Hotel PMS (Section H)
  if (answers.sector === "hotellerie_restauration" && answers.pms_tool && answers.pms_tool !== "aucun" && answers.pms_tool !== "autre") {
    if (platform.connectors.pms && platform.connectors.pms.includes(answers.pms_tool)) {
      matchedCriteria.push(`Connecteur certifié avec votre PMS ${answers.pms_tool.toUpperCase()}`);
    } else {
      vigilancePoints.push(`Interfaçage PMS ${answers.pms_tool.toUpperCase()} via API / connecteur générique`);
    }
  }

  // 6. Filter POS / Caisse (Section H)
  if (answers.pos_software && answers.pos_software !== "aucun" && answers.pos_software !== "autre") {
    if (platform.connectors.pos && platform.connectors.pos.includes(answers.pos_software)) {
      matchedCriteria.push(`Synchronisation automatique avec votre caisse ${answers.pos_software.toUpperCase()}`);
    }
  }

  // 7. Filter Accounting Software (Section C)
  if (answers.current_accounting_software && answers.current_accounting_software !== "autre" && answers.current_accounting_software !== "ne_sait_pas") {
    if (platform.connectors.accounting && platform.connectors.accounting.includes(answers.current_accounting_software)) {
      matchedCriteria.push(`Liaison directe avec votre logiciel comptable ${answers.current_accounting_software.toUpperCase()}`);
    }
  }

  // 8. Filter Probative Archiving (Section D)
  if (answers.probative_archiving === "a_couvrir") {
    if (platform.features.probativeArchiving) {
      matchedCriteria.push("Archivage légal à valeur probante 10 ans (Norme NF Z42-013)");
    }
  }

  // 9. Filter Security ISO 27001 (Section E)
  if (answers.security_certification === "oui") {
    if (!platform.features.iso27001) {
      disqualifications.push("Non certifié ISO 27001");
    } else {
      matchedCriteria.push("Certification de sécurité de haut niveau ISO 27001");
    }
  }

  // 10. Filter Hosting Location (Section E)
  if (answers.data_hosting_location === "exige") {
    if (platform.features.hostingEU) {
      matchedCriteria.push("Hébergement souverain garanti en France / Union Européenne");
    }
  }

  // 11. Multi-VAT & Tourist Tax (Section H)
  if (answers.multi_vat_rates === "oui" && platform.features.multiVatRates) {
    matchedCriteria.push("Ventilation multi-taux de TVA sur facture unique (Hébergement / F&B / Alcool)");
  }
  if (answers.tourist_tax_on_invoice === "oui" && platform.features.touristTax) {
    matchedCriteria.push("Gestion automatisée de la taxe de séjour (Ligne hors champ TVA)");
  }

  // Add generic default criteria if list is small
  if (matchedCriteria.length < 2) {
    matchedCriteria.push("Conformité réglementaire totale avec le schéma en Y de la DGFiP");
    matchedCriteria.push("Émission & Réception Factur-X / transmission e-reporting");
  }

  return {
    eligible: disqualifications.length === 0,
    disqualifications,
    matchedCriteria,
    vigilancePoints
  };
}

/**
 * Calculates weighted score (0 to 100) based on deep-dive answers
 * @param {Object} platform
 * @param {Object} answers
 * @param {Object} evaluation
 * @returns {number}
 */
export function calculateWeightedScore(platform, answers, evaluation) {
  let score = 50; // Baseline

  // 1. Status Official Bonus (+15 for Immatriculée)
  if (platform.statusType === "immatricule") {
    score += 15;
  } else {
    score += 8;
  }

  // 2. Matched criteria weight (+3 pts per validated criteria, max 24)
  score += Math.min(24, evaluation.matchedCriteria.length * 3);

  // 3. Volume alignment (+10 pts)
  if (answers.sales_volume && platform.compatibility.salesVolume) {
    if (platform.compatibility.salesVolume.includes(answers.sales_volume)) {
      score += 10;
    } else {
      score += 3;
    }
  }

  // 4. Expert Accountant Dedicated Portal (+8 pts)
  if (answers.has_accountant === "oui") {
    if (platform.features.accountingSync) {
      score += 8;
    }
  }

  // 5. Budget fit (+8 pts)
  if (answers.annual_budget) {
    const budgetMap = {
      "less_200": 200,
      "200_600": 600,
      "600_2000": 2000,
      "plus_2000": 999999,
      "non_defini": 999999
    };
    const maxBudget = budgetMap[answers.annual_budget] || 999999;
    const annualPrice = platform.price * 12;

    if (annualPrice <= maxBudget) {
      score += 8;
    } else if (annualPrice <= maxBudget * 1.3) {
      score += 4;
    } else {
      score -= 8;
    }
  }

  // 6. Onboarding support (+5 pts)
  if (answers.onboarding_need === "complet" && platform.features.assistance) {
    score += 5;
  }

  // Cap score between 30 and 99
  return Math.min(99, Math.max(30, score));
}

/**
 * Main recommendation entry point
 * @param {Object} answers - User submitted questionnaire answers
 * @returns {Array} List of ranked matching platforms with explanations
 */
export function recommendPlatforms(answers) {
  const allPlatforms = getPlatforms();
  
  const results = [];

  allPlatforms.forEach(platform => {
    const evaluation = evaluatePlatformEligibility(platform, answers);
    
    if (evaluation.eligible) {
      const score = calculateWeightedScore(platform, answers, evaluation);
      results.push({
        ...platform,
        compatibilityScore: score,
        matchedCriteria: evaluation.matchedCriteria,
        vigilancePoints: evaluation.vigilancePoints
      });
    }
  });

  // If strict filtering returned too few, re-include top base platforms with caveats
  if (results.length < 3) {
    allPlatforms.slice(0, 5).forEach(platform => {
      if (!results.some(r => r.id === platform.id)) {
        const evaluation = evaluatePlatformEligibility(platform, answers);
        const score = calculateWeightedScore(platform, answers, evaluation);
        results.push({
          ...platform,
          compatibilityScore: Math.max(40, score - 15),
          matchedCriteria: evaluation.matchedCriteria.length > 0 ? evaluation.matchedCriteria : ["Conformité officielle DGFiP", "Réseau national d'échanges"],
          vigilancePoints: evaluation.disqualifications.length > 0 ? evaluation.disqualifications : ["Vérifier le connecteur avec votre environnement"]
        });
      }
    });
  }

  // Sort descending by compatibility score
  return results.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
}
