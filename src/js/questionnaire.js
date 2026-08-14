import { getQuestions } from './data/questions.js';
import { recommendPlatforms } from './recommender.js';
import { initDatabase, saveLeadDb } from './data/db.js';

document.addEventListener('DOMContentLoaded', async () => {
  await initDatabase();
  const formElement = document.getElementById('comparator-form');
  if (formElement) {
    new QuestionnaireController(formElement);
  }
});

class QuestionnaireController {
  constructor(formElement) {
    this.form = formElement;
    this.currentStepIndex = 0;
    this.answers = {
      status: '',
      volume: '',
      software: '',
      accountant: '',
      features: [],
      budget: '',
      assistance: '',
      leadName: '',
      leadCompany: '',
      leadEmail: '',
      leadPhone: ''
    };
    
    this.initElements();
    this.renderStep();
    this.bindEvents();
  }

  initElements() {
    this.progressBar = document.querySelector('.q-progress-bar-fill');
    this.progressText = document.querySelector('.q-progress-step-text');
    this.progressPercent = document.querySelector('.q-progress-percentage');
    this.stepsContainer = document.querySelector('.q-steps-container');
    this.prevBtn = document.querySelector('.q-btn-prev');
    this.nextBtn = document.querySelector('.q-btn-next');
    
    // Create HTML elements for steps dynamically
    this.createStepsHTML();
    
    this.steps = Array.from(document.querySelectorAll('.q-step'));
  }

  createStepsHTML() {
    this.stepsContainer.innerHTML = '';
    
    // Step 1 to 7 from questions configuration
    getQuestions().forEach((q) => {
      const stepDiv = document.createElement('div');
      stepDiv.className = 'q-step';
      stepDiv.dataset.step = q.step;
      stepDiv.dataset.id = q.id;
      stepDiv.dataset.type = q.type;
      
      let optionsHTML = '';
      
      if (q.id === 'software') {
        // Render Top 6 popular tools
        const top6Values = ['none', 'excel', 'sage', 'pennylane', 'ebp', 'cegid'];
        const top6Options = q.options.filter(opt => top6Values.includes(opt.value));
        
        optionsHTML += `<div class="q-options-grid-3">`;
        top6Options.forEach(opt => {
          optionsHTML += `
            <div class="q-option-card" data-value="${opt.value}">
              <div class="q-option-icon">${opt.icon}</div>
              <div class="q-option-label">${opt.label}</div>
              <div class="q-option-indicator"></div>
            </div>
          `;
        });
        optionsHTML += `</div>`;
        
        // Render searchable autocomplete input
        optionsHTML += `
          <div class="q-software-search-wrapper" style="margin-top: 32px; text-align: center;">
            <label class="q-form-label" style="text-align: center; margin-bottom: 12px; display: block; font-weight: 700;">
              Ou recherchez votre outil dans notre liste complète (+140 logiciels) :
            </label>
            <div class="q-search-input-container" style="position: relative; max-width: 460px; margin: 0 auto;">
              <input type="text" id="software-search" class="q-form-input" placeholder="Saisissez le nom de votre logiciel (ex: Indy, Axonaut, Odoo...)" style="padding-right: 40px; text-align: center; background: #ffffff; border: 2px solid #e2e8f0; color: var(--text-dark); border-radius: var(--radius-md); font-size: 15px; font-weight: 600;">
              <span class="search-icon" style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; display: flex; align-items: center;">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </span>
              <div id="software-search-results" class="q-search-results-list" style="display: none; position: absolute; left: 0; right: 0; top: 100%; background: #ffffff; border: 1px solid #cbd5e1; border-radius: var(--radius-md); max-height: 200px; overflow-y: auto; z-index: 1000; box-shadow: 0 10px 25px rgba(0,0,0,0.1); margin-top: 6px; text-align: left;"></div>
            </div>
          </div>
        `;
      } else {
        const gridClass = q.options.length > 5 ? 'q-options-grid-3' : 'q-options-grid';
        optionsHTML += `<div class="${gridClass}">`;
        q.options.forEach(opt => {
          optionsHTML += `
            <div class="q-option-card" data-value="${opt.value}">
              <div class="q-option-icon">${opt.icon}</div>
              <div class="q-option-label">${opt.label}</div>
              <div class="q-option-indicator"></div>
            </div>
          `;
        });
        optionsHTML += `</div>`;
      }
      
      stepDiv.innerHTML = `
        <h3 class="q-step-title">${q.title}</h3>
        <p class="q-step-subtitle">${q.subtitle}</p>
        ${optionsHTML}
      `;
      
      this.stepsContainer.appendChild(stepDiv);
    });

    // Step 8: Final lead capture step
    const finalStepDiv = document.createElement('div');
    finalStepDiv.className = 'q-step';
    finalStepDiv.dataset.step = '8';
    finalStepDiv.dataset.id = 'lead';
    finalStepDiv.dataset.type = 'form';
    
    finalStepDiv.innerHTML = `
      <h3 class="q-step-title">Dernière étape : Calculez vos résultats</h3>
      <p class="q-step-subtitle">Saisissez vos coordonnées pour recevoir votre comparatif sur-mesure et accéder immédiatement aux meilleures plateformes.</p>
      
      <div class="q-form-group">
        <label class="q-form-label" for="lead-name">Votre nom complet *</label>
        <input type="text" id="lead-name" class="q-form-input" placeholder="Ex: Jean Dupont" required>
        <div class="q-error-text" style="display: none;">Veuillez saisir votre nom.</div>
      </div>
      
      <div class="q-form-group">
        <label class="q-form-label" for="lead-company">Nom de l'entreprise *</label>
        <input type="text" id="lead-company" class="q-form-input" placeholder="Ex: Dupont Tech" required>
        <div class="q-error-text" style="display: none;">Veuillez saisir le nom de votre entreprise.</div>
      </div>
      
      <div class="q-form-group">
        <label class="q-form-label" for="lead-email">Adresse email professionnelle *</label>
        <input type="email" id="lead-email" class="q-form-input" placeholder="Ex: jean.dupont@entreprise.fr" required>
        <div class="q-error-text" style="display: none;">Veuillez saisir une adresse email professionnelle valide.</div>
      </div>
      
      <div class="q-form-group">
        <label class="q-form-label" for="lead-phone">Numéro de téléphone (Optionnel)</label>
        <input type="tel" id="lead-phone" class="q-form-input" placeholder="Ex: 06 12 34 56 78">
        <div class="q-error-text" style="display: none;">Veuillez saisir un numéro de téléphone valide.</div>
      </div>

      <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 24px; text-align: left;">
        En cliquant sur le bouton ci-dessous, vous acceptez que vos données soient traitées conformément à notre politique de confidentialité pour vous transmettre les résultats. Vos données ne sont jamais vendues.
      </div>
    `;
    
    this.stepsContainer.appendChild(finalStepDiv);
  }

  bindEvents() {
    // Nav buttons
    this.prevBtn.addEventListener('click', () => this.navigate(-1));
    this.nextBtn.addEventListener('click', () => this.navigate(1));
    
    // Options select click
    this.stepsContainer.addEventListener('click', (e) => {
      const optionCard = e.target.closest('.q-option-card');
      if (!optionCard) return;

      const stepDiv = optionCard.closest('.q-step');
      const stepId = stepDiv.dataset.id;
      const stepType = stepDiv.dataset.type;
      const value = optionCard.dataset.value;

      if (stepType === 'single') {
        // Deselect others in this step
        stepDiv.querySelectorAll('.q-option-card').forEach(card => {
          card.classList.remove('selected');
        });
        
        // Select current
        optionCard.classList.add('selected');
        this.answers[stepId] = value;
        
        // Auto advance to next step for smoother UX (except final choice pages if we prefer, but for single choice it's amazing)
        setTimeout(() => {
          this.navigate(1);
        }, 300);
        
      } else if (stepType === 'multiple') {
        // Toggle current selection
        optionCard.classList.toggle('selected');
        
        // Collect all selected values
        const selected = Array.from(stepDiv.querySelectorAll('.q-option-card.selected'))
          .map(card => card.dataset.value);
        
        this.answers[stepId] = selected;
      }
    });

    // Real-time input handling on final step
    this.stepsContainer.addEventListener('input', (e) => {
      if (e.target.classList.contains('q-form-input') && e.target.id !== 'software-search') {
        e.target.classList.remove('error');
        const errDiv = e.target.nextElementSibling;
        if (errDiv && errDiv.classList.contains('q-error-text')) {
          errDiv.style.display = 'none';
        }
      }
    });

    // Autocomplete Search Input
    this.stepsContainer.addEventListener('input', (e) => {
      if (e.target.id === 'software-search') {
        const query = e.target.value.trim().toLowerCase();
        const resultsDiv = document.getElementById('software-search-results');
        if (!resultsDiv) return;

        if (!query) {
          resultsDiv.style.display = 'none';
          return;
        }

        // Find software question config
        const softwareQ = getQuestions().find(q => q.id === 'software');
        if (!softwareQ) return;

        // Filter choices (exclude none and excel)
        const matches = softwareQ.options.filter(opt => 
          opt.value !== 'none' && 
          opt.value !== 'excel' && 
          opt.label.toLowerCase().includes(query)
        );

        if (matches.length === 0) {
          resultsDiv.innerHTML = `<div style="padding: 12px; color: var(--text-muted); font-size: 14px; text-align: center;">Aucun logiciel trouvé</div>`;
        } else {
          resultsDiv.innerHTML = matches.map(opt => `
            <div class="q-search-result-item" data-value="${opt.value}" data-label="${opt.label}" style="padding: 12px 16px; cursor: pointer; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: var(--text-dark); transition: background 0.2s;">
              ${opt.label}
            </div>
          `).join('');
        }
        resultsDiv.style.display = 'block';
      }
    });

    // Autocomplete Result Click
    this.stepsContainer.addEventListener('click', (e) => {
      const resultItem = e.target.closest('.q-search-result-item');
      if (!resultItem) return;

      const value = resultItem.dataset.value;
      const label = resultItem.dataset.label;
      const searchInput = document.getElementById('software-search');
      const resultsDiv = document.getElementById('software-search-results');

      if (searchInput) searchInput.value = label;
      if (resultsDiv) resultsDiv.style.display = 'none';

      // Set value in answers
      this.answers.software = value;

      // Deselect options grid
      const stepDiv = resultItem.closest('.q-step');
      if (stepDiv) {
        stepDiv.querySelectorAll('.q-option-card').forEach(card => card.classList.remove('selected'));
      }

      // Auto advance
      setTimeout(() => {
        this.navigate(1);
      }, 300);
    });

    // Global Click to dismiss results dropdown
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.q-search-input-container')) {
        const resultsDiv = document.getElementById('software-search-results');
        if (resultsDiv) resultsDiv.style.display = 'none';
      }
    });
  }

  renderStep() {
    const totalSteps = this.steps.length;
    const progressPercent = Math.round((this.currentStepIndex / (totalSteps - 1)) * 100);
    
    // Hide all steps, show current
    this.steps.forEach((step, idx) => {
      step.classList.remove('active');
      if (idx === this.currentStepIndex) {
        step.classList.add('active');
        
        // Apply directional animations
        step.style.animation = 'slideInFromRight 0.35s forwards';
      }
    });

    // Update Progress bar
    if (this.progressBar) {
      this.progressBar.style.width = `${progressPercent}%`;
    }
    if (this.progressPercent) {
      this.progressPercent.textContent = `${progressPercent}%`;
    }
    if (this.progressText) {
      this.progressText.textContent = `Étape ${this.currentStepIndex + 1} sur ${totalSteps}`;
    }

    // Toggle navigation buttons visibility
    if (this.currentStepIndex === 0) {
      this.prevBtn.style.visibility = 'hidden';
    } else {
      this.prevBtn.style.visibility = 'visible';
    }

    if (this.currentStepIndex === totalSteps - 1) {
      this.nextBtn.innerHTML = `Voir mes résultats personnalisés <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>`;
      this.nextBtn.classList.add('btn-primary');
    } else {
      this.nextBtn.innerHTML = `Continuer <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>`;
      this.nextBtn.classList.remove('btn-primary');
    }

    // Populate previously selected options if any
    this.restoreStepSelections();
  }

  restoreStepSelections() {
    const currentStepDiv = this.steps[this.currentStepIndex];
    const stepId = currentStepDiv.dataset.id;
    const stepType = currentStepDiv.dataset.type;
    const answer = this.answers[stepId];

    if (!answer) return;

    if (stepId === 'software') {
      const searchInput = document.getElementById('software-search');
      if (searchInput) {
        const top6Values = ['none', 'excel', 'sage', 'pennylane', 'ebp', 'cegid'];
        if (top6Values.includes(answer)) {
          searchInput.value = '';
        } else {
          const softwareQ = getQuestions().find(q => q.id === 'software');
          const matchedOpt = softwareQ ? softwareQ.options.find(opt => opt.value === answer) : null;
          searchInput.value = matchedOpt ? matchedOpt.label : '';
        }
      }
    }

    if (stepType === 'single') {
      currentStepDiv.querySelectorAll('.q-option-card').forEach(card => {
        if (card.dataset.value === answer) {
          card.classList.add('selected');
        } else {
          card.classList.remove('selected');
        }
      });
    } else if (stepType === 'multiple') {
      currentStepDiv.querySelectorAll('.q-option-card').forEach(card => {
        if (answer.includes(card.dataset.value)) {
          card.classList.add('selected');
        } else {
          card.classList.remove('selected');
        }
      });
    }
  }

  navigate(direction) {
    // If going forward, validate current step first
    if (direction > 0 && !this.validateCurrentStep()) {
      return;
    }

    const nextIdx = this.currentStepIndex + direction;
    
    // If reached end, submit form and display results
    if (nextIdx >= this.steps.length) {
      this.handleFormSubmission();
      return;
    }

    // Otherwise, transition to next step
    if (nextIdx >= 0 && nextIdx < this.steps.length) {
      this.currentStepIndex = nextIdx;
      this.renderStep();
      
      // Scroll smoothly to questionnaire container top
      const containerRect = this.form.getBoundingClientRect();
      const absoluteTop = window.scrollY + containerRect.top - 100;
      window.scrollTo({
        top: absoluteTop,
        behavior: 'smooth'
      });
    }
  }

  validateCurrentStep() {
    const currentStepDiv = this.steps[this.currentStepIndex];
    const stepId = currentStepDiv.dataset.id;
    const stepType = currentStepDiv.dataset.type;

    if (stepType === 'single') {
      const selected = currentStepDiv.querySelector('.q-option-card.selected');
      if (!selected) {
        // Show validation alert/toast (or shake visual effect)
        this.shakeElement(currentStepDiv);
        return false;
      }
      return true;
    }

    if (stepType === 'multiple') {
      // Multiple is optional (needs can be empty), so always validate
      return true;
    }

    if (stepType === 'form') {
      // Lead Form Validation
      const nameInput = document.getElementById('lead-name');
      const companyInput = document.getElementById('lead-company');
      const emailInput = document.getElementById('lead-email');
      const phoneInput = document.getElementById('lead-phone');
      
      let isValid = true;

      // Reset
      [nameInput, companyInput, emailInput, phoneInput].forEach(inp => {
        if (inp) {
          inp.classList.remove('error');
          const err = inp.nextElementSibling;
          if (err && err.classList.contains('q-error-text')) err.style.display = 'none';
        }
      });

      if (!nameInput.value.trim()) {
        this.showInputError(nameInput);
        isValid = false;
      }

      if (!companyInput.value.trim()) {
        this.showInputError(companyInput);
        isValid = false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
        this.showInputError(emailInput);
        isValid = false;
      }

      if (phoneInput.value.trim()) {
        // Optional phone validation: basic check for digits/spaces
        const phoneRegex = /^[\d\s\+\-\(\).]{8,20}$/;
        if (!phoneRegex.test(phoneInput.value.trim())) {
          this.showInputError(phoneInput);
          isValid = false;
        }
      }

      if (!isValid) {
        this.shakeElement(currentStepDiv);
      } else {
        // Store final values
        this.answers.leadName = nameInput.value.trim();
        this.answers.leadCompany = companyInput.value.trim();
        this.answers.leadEmail = emailInput.value.trim();
        this.answers.leadPhone = phoneInput.value.trim();
      }

      return isValid;
    }

    return true;
  }

  showInputError(inputElement) {
    inputElement.classList.add('error');
    const errText = inputElement.nextElementSibling;
    if (errText && errText.classList.contains('q-error-text')) {
      errText.style.display = 'block';
    }
  }

  shakeElement(el) {
    el.style.animation = 'none';
    // trigger reflow
    void el.offsetWidth;
    el.style.animation = 'shake 0.4s ease';
    
    // Add temporary shake animation keyframes dynamically if not present
    if (!document.getElementById('shake-keyframes')) {
      const style = document.createElement('style');
      style.id = 'shake-keyframes';
      style.textContent = `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
      `;
      document.head.appendChild(style);
    }
  }

  async handleFormSubmission() {
    // 1. Save Lead in Database (Supabase / LocalStorage fallback)
    await saveLeadDb(this.answers);
    console.log("Lead captured successfully on eFactu:", this.answers);

    // 2. Run matching engine
    const recommendations = recommendPlatforms(this.answers);

    // 3. Render Results Dashboard
    this.renderResultsDashboard(recommendations);
  }

  renderResultsDashboard(results) {
    const parentContainer = this.form.parentElement;
    parentContainer.innerHTML = ''; // Clear questionnaire container
    parentContainer.classList.add('results-mode');
    
    // Create Results Wrapper
    const resultsDiv = document.createElement('div');
    resultsDiv.className = 'results-dashboard';

    // Labels mapping for recap
    const statusLabels = {
      'micro-entreprise': 'Micro-entreprise',
      'SAS': 'SAS / SASU',
      'SARL': 'SARL / EURL',
      'association': 'Association',
      'autre': 'Autre statut'
    };

    const volumeLabels = {
      'less-50': 'Moins de 50 factures/mois',
      '50-200': '50 à 200 factures/mois',
      '200-500': '200 à 500 factures/mois',
      '500-1000': '500 à 1000 factures/mois',
      'plus-1000': 'Plus de 1000 factures/mois'
    };

    const softwareLabels = {
      'none': 'Aucun outil',
      'excel': 'Excel / Papier',
      'sage': 'Sage',
      'pennylane': 'Pennylane',
      'ebp': 'EBP',
      'cegid': 'Cegid',
      'odoo': 'Odoo',
      'sellsy': 'Sellsy',
      'autre': 'Autre outil'
    };

    const budgetLabels = {
      'free': 'Gratuit uniquement',
      'less-20': '< 20€/mois',
      '20-50': '20€ à 50€/mois',
      '50-100': '50€ à 100€/mois',
      'plus-100': '> 100€/mois'
    };

    const recapHTML = `
      <div class="results-header-box">
        <h2>Voici votre sélection personnalisée</h2>
        <p>Nous avons comparé les critères de votre entreprise avec les Plateformes Agréées (PAFE/PDP) de notre base de données.</p>
        <div class="results-recap-tags">
          <span class="results-recap-tag">${statusLabels[this.answers.status] || this.answers.status}</span>
          <span class="results-recap-tag">${volumeLabels[this.answers.volume] || this.answers.volume}</span>
          <span class="results-recap-tag">Logiciel : ${softwareLabels[this.answers.software] || this.answers.software}</span>
          <span class="results-recap-tag">Budget : ${budgetLabels[this.answers.budget] || this.answers.budget}</span>
          <span class="results-recap-tag">Accompagnement : ${this.answers.assistance === 'oui' ? 'Oui' : 'Non'}</span>
        </div>
      </div>
    `;

    let cardsHTML = `<div class="platform-results-list">`;
    
    results.forEach((platform, index) => {
      const isTopResult = index === 0;
      const cardClass = isTopResult ? 'platform-card recommended-card' : 'platform-card';
      
      const score = platform.compatibilityScore;
      let scoreColorClass = 'score-low';
      if (score >= 85) scoreColorClass = 'score-high';
      else if (score >= 60) scoreColorClass = 'score-medium';

      // Pros list
      let prosHTML = '';
      platform.advantages.forEach(adv => {
        prosHTML += `
          <div class="pro-con-item pro-item">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
            <span>${adv}</span>
          </div>
        `;
      });

      // Cons list
      let consHTML = '';
      platform.disadvantages.forEach(dis => {
        consHTML += `
          <div class="pro-con-item con-item">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/></svg>
            <span>${dis}</span>
          </div>
        `;
      });

      // Features details check grid
      const featsNeeded = this.answers.features || [];
      const featuresToCheck = [
        { key: 'eInvoicing', label: 'Émission Factures' },
        { key: 'receiving', label: 'Réception Factures' },
        { key: 'payment', label: 'Paiement Intégré' },
        { key: 'signature', label: 'Signature Élec.' },
        { key: 'reminders', label: 'Relance Impayés' },
        { key: 'api', label: 'API Connecteurs' },
        { key: 'multiUser', label: 'Multi-utilisateurs' },
        { key: 'quotes', label: 'Gestion Devis' },
        { key: 'accountingSync', label: 'Synchro Bancaire' }
      ];

      let checksHTML = '<div class="features-check-grid">';
      featuresToCheck.forEach(ft => {
        const supported = platform.features[ft.key] === true;
        const checkIcon = supported 
          ? `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>`
          : `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>`;
        
        checksHTML += `
          <div class="check-item ${supported ? 'active' : 'inactive'}">
            ${checkIcon}
            <span>${ft.label}</span>
          </div>
        `;
      });
      checksHTML += '</div>';

      // Stars Rating
      let starsHTML = '';
      const fullStars = Math.floor(platform.rating);
      const halfStar = platform.rating % 1 >= 0.5;
      for (let s = 1; s <= 5; s++) {
        if (s <= fullStars) {
          starsHTML += `<svg viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`;
        } else {
          starsHTML += `<svg viewBox="0 0 20 20" style="color: #e2e8f0;"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`;
        }
      }

      cardsHTML += `
        <div class="${cardClass}">
          ${isTopResult ? `<div class="recommended-ribbon"><span class="badge badge-recommended">★ Recommandé</span></div>` : ''}
          
          <!-- Column 1: Logo & Name -->
          <div class="platform-col-logo">
            ${platform.logo}
            <h4 class="platform-name">${platform.name}</h4>
            <div style="margin-top: 8px; display: flex; flex-direction: column; align-items: center; gap: 4px;">
              <div class="rating-stars">${starsHTML}</div>
              <span style="font-size: 13px; font-weight: 700; color: var(--text-muted);">${platform.rating} / 5</span>
            </div>
          </div>
          
          <!-- Column 2: Strengths & Weaknesses -->
          <div class="platform-col-content">
            <p class="platform-description">${platform.description}</p>
            
            <div class="platform-pros-cons">
              <div>
                <span style="font-size: 13px; font-weight: 800; text-transform: uppercase; color: var(--text-dark); display: block; margin-bottom: 8px;">Avantages</span>
                ${prosHTML}
              </div>
              <div>
                <span style="font-size: 13px; font-weight: 800; text-transform: uppercase; color: var(--text-dark); display: block; margin-bottom: 8px;">Limites</span>
                ${consHTML}
              </div>
            </div>
            
            <div>
              <button class="platform-accordion-trigger">
                <span>Détails des fonctionnalités</span>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg>
              </button>
              <div class="platform-accordion-content">
                ${checksHTML}
              </div>
            </div>
          </div>
          
          <!-- Column 3: Score & Action Button -->
          <div class="platform-col-actions">
            <div class="platform-score-wrapper">
              <div class="platform-score-circle ${scoreColorClass}">
                ${score}%
              </div>
              <span class="platform-score-label">Compatibilité</span>
            </div>
            
            <div class="platform-price-label">
              ${platform.priceLabel}
            </div>
            
            <a href="${platform.url}" target="_blank" class="btn btn-secondary btn-sm" style="width: 100%;">
              Découvrir l'offre
            </a>
          </div>
        </div>
      `;
    });

    cardsHTML += `</div>`;

    const trustElementsHTML = `
      <div class="text-center" style="margin-top: 60px;">
        <h3 style="font-size: 24px; font-weight: 800; margin-bottom: 12px; color: var(--primary-deep);">Besoin d'aide pour finaliser votre choix ?</h3>
        <p style="color: var(--text-muted); max-width: 600px; margin: 0 auto 30px;">Nos conseillers experts en facturation électronique vous accompagnent gratuitement pour installer et configurer votre plateforme.</p>
        <div style="display: flex; justify-content: center; gap: 16px; flex-wrap: wrap;">
          <a href="/contact.html" class="btn btn-primary">Être recontacté par un conseiller</a>
          <button onclick="window.print()" class="btn btn-outline" style="border-color: #cbd5e1; color: var(--text-main);">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-3a2 2 0 00-2-2H9a2 2 0 00-2 2v3a2 2 0 002 2zm0-9a9 9 0 0118 0v4H3v-4z"/></svg> Imprimer mes résultats
          </button>
        </div>
      </div>
    `;

    resultsDiv.innerHTML = recapHTML + cardsHTML + trustElementsHTML;
    parentContainer.appendChild(resultsDiv);
    
    // Scroll to results top
    window.scrollTo({
      top: parentContainer.offsetTop - 120,
      behavior: 'smooth'
    });
  }
}
