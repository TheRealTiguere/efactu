import { getPlatforms } from './data/platforms.js';

/**
 * Calculates the compatibility score of a platform based on questionnaire answers
 * @param {Object} platform - The platform object
 * @param {Object} answers - The user's answers
 * @returns {number} Score between 0 and 100
 */
export function calculateCompatibilityScore(platform, answers) {
  let score = 0;

  // 1. Status (Max: 15 pts)
  if (platform.compatibility.status.includes(answers.status)) {
    score += 15;
  } else {
    score += 5; // Partial compatibility
  }

  // 2. Volume of invoices (Max: 20 pts)
  const vol = answers.volume;
  if (platform.compatibility.volume.includes(vol)) {
    score += 20;
  } else {
    // Adjacency check
    const volOrder = ["less-50", "50-200", "200-500", "500-1000", "plus-1000"];
    const pVols = platform.compatibility.volume;
    const userIdx = volOrder.indexOf(vol);
    
    let isAdjacent = false;
    for (const pv of pVols) {
      const pvIdx = volOrder.indexOf(pv);
      if (Math.abs(pvIdx - userIdx) <= 1) {
        isAdjacent = true;
        break;
      }
    }

    if (isAdjacent) {
      score += 10;
    } else {
      score += 2;
    }
  }

  // Heavy misfit penalties for volume mismatch
  if (vol === "plus-1000" && (platform.id === "chorus-pro" || platform.id === "tiime")) {
    score -= 15; // Too small for big volume
  }
  if (vol === "less-50" && (platform.id === "sage" || platform.id === "yooz")) {
    score -= 10; // Overkill for micro-businesses
  }

  // 3. Current Software (Max: 15 pts)
  if (answers.software === platform.id) {
    score += 15; // Native integration bonus
  } else if (platform.compatibility.software.includes(answers.software)) {
    score += 12;
  } else if (answers.software === "none" || answers.software === "excel") {
    if (["pennylane", "tiime", "ebp", "chorus-pro"].includes(platform.id)) {
      score += 10; // Very friendly starter tools
    } else {
      score += 5;
    }
  } else {
    score += 4;
  }

  // 4. Accountant connection (Max: 10 pts)
  const hasAccountant = answers.accountant === "oui";
  if (hasAccountant) {
    if (platform.compatibility.accountant.includes(true)) {
      score += 10;
    } else {
      score += 4;
    }
  } else {
    if (["tiime", "pennylane", "chorus-pro"].includes(platform.id)) {
      score += 10; // Self-managed friendly
    } else {
      score += 6;
    }
  }

  // 5. Special Features Needed (Max: 25 pts)
  const neededFeatures = answers.features || [];
  if (neededFeatures.length === 0) {
    score += 25; // No specific requirements
  } else {
    let matches = 0;
    neededFeatures.forEach(feat => {
      if (platform.features[feat] === true) {
        matches++;
      }
    });
    score += Math.round(25 * (matches / neededFeatures.length));
  }

  // 6. Monthly Budget (Max: 10 pts)
  const budgetLimits = {
    "free": 0,
    "less-20": 20,
    "20-50": 50,
    "50-100": 100,
    "plus-100": 99999
  };

  const userMaxBudget = budgetLimits[answers.budget] !== undefined ? budgetLimits[answers.budget] : 99999;
  const platformPrice = platform.price;

  if (platformPrice <= userMaxBudget) {
    score += 10;
  } else {
    // If user asked for free and it's paid
    if (answers.budget === "free" && platformPrice > 0) {
      score -= 15; // Strongly discourage paid options if free is strictly requested
    } else if (answers.budget === "less-20" && platformPrice <= 30) {
      score += 4; // Close enough
    } else if (answers.budget === "20-50" && platformPrice <= 65) {
      score += 3; // Slightly above
    } else {
      score += 0; // Exceeds budget
    }
  }

  // 7. Onboarding Assistance (Max: 5 pts)
  const wantsAssistance = answers.assistance === "oui";
  if (wantsAssistance) {
    if (platform.features.assistance === true) {
      score += 5;
    } else {
      score += 1;
    }
  } else {
    score += 5; // Don't penalize if assistance not wanted
  }

  // Ensure score is within [0, 100] range
  return Math.min(100, Math.max(0, score));
}

/**
 * Returns a ranked list of recommended platforms based on questionnaire answers
 * @param {Object} answers - User answers from the multi-step questionnaire
 * @returns {Array} List of platforms with dynamic compatibility score
 */
export function recommendPlatforms(answers) {
  return getPlatforms()
    .map(p => {
      const score = calculateCompatibilityScore(p, answers);
      return {
        ...p,
        compatibilityScore: score
      };
    })
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore);
}
