import { questionnaireSections } from './data/questions.js';
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
    this.currentSectionIndex = 0;
    this.answers = {};
    
    this.initElements();
    this.renderCurrentSection();
    this.bindGlobalEvents();
  }

  initElements() {
    this.progressBar = document.querySelector('.q-progress-bar-fill');
    this.progressText = document.querySelector('.q-progress-step-text');
    this.progressPercent = document.querySelector('.q-progress-percentage');
    this.stepsContainer = document.querySelector('.q-steps-container');
    this.prevBtn = document.querySelector('.q-btn-prev');
    this.nextBtn = document.querySelector('.q-btn-next');
  }

  getActiveSections() {
    return questionnaireSections.filter(sec => {
      if (!sec.condition) return true;
      const { field, value } = sec.condition;
      return this.answers[field] === value;
    });
  }

  isQuestionVisible(q) {
    if (!q.condition) return true;
    const { field, value, in: inList, notIn: notInList, contains } = q.condition;
    const currentVal = this.answers[field];

    if (value !== undefined) {
      return currentVal === value;
    }
    if (inList !== undefined) {
      return Array.isArray(inList) && inList.includes(currentVal);
    }
    if (notInList !== undefined) {
      return Array.isArray(notInList) && !notInList.includes(currentVal);
    }
    if (contains !== undefined) {
      return Array.isArray(currentVal) && currentVal.includes(contains);
    }
    return true;
  }

  renderCurrentSection() {
    const activeSections = this.getActiveSections();
    if (this.currentSectionIndex >= activeSections.length) {
      this.currentSectionIndex = activeSections.length - 1;
    }

    const currentSection = activeSections[this.currentSectionIndex];
    const totalSections = activeSections.length;
    const currentNum = this.currentSectionIndex + 1;

    // Update Progress Bar & Header
    const progressPercent = Math.round((currentNum / totalSections) * 100);
    if (this.progressBar) this.progressBar.style.width = `${progressPercent}%`;
    if (this.progressText) this.progressText.textContent = `Section ${currentNum} sur ${totalSections} · ${currentSection.title.replace(/^Section [A-I] · /, '')}`;
    if (this.progressPercent) this.progressPercent.textContent = `${progressPercent}%`;

    // Render HTML inside stepsContainer
    this.stepsContainer.innerHTML = '';
    const sectionWrapper = document.createElement('div');
    sectionWrapper.className = 'q-step active';

    const headerHTML = `
      <h3 class="q-step-title">${currentSection.title}</h3>
      <p class="q-step-subtitle">${currentSection.description}</p>
    `;

    let questionsHTML = '';
    currentSection.questions.forEach(q => {
      const visible = this.isQuestionVisible(q);
      questionsHTML += this.renderQuestionHTML(q, visible);
    });

    sectionWrapper.innerHTML = headerHTML + questionsHTML;
    this.stepsContainer.appendChild(sectionWrapper);

    // Update Navigation Buttons
    if (this.prevBtn) {
      this.prevBtn.style.visibility = this.currentSectionIndex > 0 ? 'visible' : 'hidden';
    }
    if (this.nextBtn) {
      this.nextBtn.textContent = (currentNum === totalSections) ? 'Générer mon comparatif' : 'Section suivante →';
    }

    this.bindSectionInputs(sectionWrapper);
  }

  renderQuestionHTML(q, isVisible) {
    const hiddenStyle = isVisible ? '' : 'style="display: none;"';
    const roleBadgeClass = q.role === 'filtre' ? 'role-badge-filtre' : (q.role === 'ponderation' ? 'role-badge-ponderation' : 'role-badge-info');
    const badgeHTML = `<span class="q-role-badge ${roleBadgeClass}">${q.roleLabel}</span>`;
    const isCorePrefix = q.isCore ? '<span class="q-core-dot" title="Question du socle obligatoire">•</span>' : '<span class="q-branch-arrow" title="Question approfondie conditionnelle">↳</span>';

    let inputBodyHTML = '';

    if (q.type === 'single') {
      inputBodyHTML += `<div class="q-options-list">`;
      q.options.forEach(opt => {
        const isChecked = this.answers[q.id] === opt.value;
        inputBodyHTML += `
          <div class="q-option-card ${isChecked ? 'selected' : ''}" data-question-id="${q.id}" data-value="${opt.value}">
            <div class="q-option-text-wrapper">
              <div class="q-option-label">${opt.label}</div>
              ${opt.desc ? `<div class="q-option-desc">${opt.desc}</div>` : ''}
            </div>
            <div class="q-option-indicator"></div>
          </div>
        `;
      });
      inputBodyHTML += `</div>`;
    } else if (q.type === 'multiple') {
      inputBodyHTML += `<div class="q-options-list" data-type="multiple">`;
      const currentSelected = Array.isArray(this.answers[q.id]) ? this.answers[q.id] : [];
      q.options.forEach(opt => {
        const isChecked = currentSelected.includes(opt.value);
        inputBodyHTML += `
          <div class="q-option-card ${isChecked ? 'selected' : ''}" data-question-id="${q.id}" data-value="${opt.value}" data-multiple="true">
            <div class="q-option-text-wrapper">
              <div class="q-option-label">${opt.label}</div>
              ${opt.desc ? `<div class="q-option-desc">${opt.desc}</div>` : ''}
            </div>
            <div class="q-option-indicator q-indicator-checkbox"></div>
          </div>
        `;
      });
      inputBodyHTML += `</div>`;
    } else if (q.type === 'number') {
      const val = this.answers[q.id] || '';
      inputBodyHTML += `
        <div class="q-input-row" style="max-width: 640px; margin: 0 auto 24px;">
          <input type="number" class="q-form-input" data-question-id="${q.id}" min="${q.min || 0}" placeholder="${q.placeholder || ''}" value="${val}" />
        </div>
      `;
    } else if (q.type === 'text') {
      const val = this.answers[q.id] || '';
      const inputType = q.inputType || 'text';
      inputBodyHTML += `
        <div class="q-input-row" style="max-width: 640px; margin: 0 auto 24px;">
          <input type="${inputType}" class="q-form-input" data-question-id="${q.id}" placeholder="${q.placeholder || ''}" value="${val}" ${q.required ? 'required' : ''} />
        </div>
      `;
    } else if (q.type === 'select' || q.type === 'search-select') {
      inputBodyHTML += `
        <div class="q-input-row" style="max-width: 640px; margin: 0 auto 24px;">
          <select class="q-form-input q-select-custom" data-question-id="${q.id}">
            <option value="">-- Sélectionnez une option --</option>
            ${q.options.map(opt => `<option value="${opt.value}" ${this.answers[q.id] === opt.value ? 'selected' : ''}>${opt.label}</option>`).join('')}
          </select>
        </div>
      `;
    } else if (q.type === 'consent') {
      const isChecked = !!this.answers[q.id];
      inputBodyHTML += `
        <div class="q-consent-box" style="max-width: 640px; margin: 0 auto 24px;">
          <label class="q-consent-label">
            <input type="checkbox" data-question-id="${q.id}" ${isChecked ? 'checked' : ''} ${q.required ? 'required' : ''} />
            <span>${q.label}</span>
          </label>
        </div>
      `;
    }

    return `
      <div class="q-question-block" id="q-block-${q.id}" ${hiddenStyle}>
        <div class="q-question-header">
          <div class="q-title-row">
            ${isCorePrefix}
            <h4 class="q-question-title">${q.title}</h4>
            ${badgeHTML}
          </div>
          ${q.subtitle ? `<p class="q-question-sub">${q.subtitle}</p>` : ''}
        </div>
        ${inputBodyHTML}
      </div>
    `;
  }

  bindSectionInputs(container) {
    // Single choice option cards
    const singleCards = container.querySelectorAll('.q-option-card:not([data-multiple="true"])');
    singleCards.forEach(card => {
      card.addEventListener('click', () => {
        const qId = card.dataset.questionId;
        const val = card.dataset.value;
        
        // Deselect other cards for same question
        container.querySelectorAll(`.q-option-card[data-question-id="${qId}"]`).forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        
        this.answers[qId] = val;
        this.reEvaluateConditionalQuestions();
      });
    });

    // Multiple choice option cards
    const multiCards = container.querySelectorAll('.q-option-card[data-multiple="true"]');
    multiCards.forEach(card => {
      card.addEventListener('click', () => {
        const qId = card.dataset.questionId;
        const val = card.dataset.value;
        
        if (!Array.isArray(this.answers[qId])) {
          this.answers[qId] = [];
        }

        if (card.classList.contains('selected')) {
          card.classList.remove('selected');
          this.answers[qId] = this.answers[qId].filter(v => v !== val);
        } else {
          card.classList.add('selected');
          this.answers[qId].push(val);
        }

        this.reEvaluateConditionalQuestions();
      });
    });

    // Select dropdowns
    const selects = container.querySelectorAll('select.q-form-input');
    selects.forEach(select => {
      select.addEventListener('change', () => {
        const qId = select.dataset.questionId;
        this.answers[qId] = select.value;
        this.reEvaluateConditionalQuestions();
      });
    });

    // Inputs (text, number, email)
    const textInputs = container.querySelectorAll('input.q-form-input');
    textInputs.forEach(input => {
      input.addEventListener('input', () => {
        const qId = input.dataset.questionId;
        this.answers[qId] = input.value;
        this.reEvaluateConditionalQuestions();
      });
    });

    // Checkboxes (Consent)
    const consentBoxes = container.querySelectorAll('.q-consent-box input[type="checkbox"]');
    consentBoxes.forEach(box => {
      box.addEventListener('change', () => {
        const qId = box.dataset.questionId;
        this.answers[qId] = box.checked;
      });
    });
  }

  reEvaluateConditionalQuestions() {
    const activeSections = this.getActiveSections();
    const currentSection = activeSections[this.currentSectionIndex];
    if (!currentSection) return;

    currentSection.questions.forEach(q => {
      const block = document.getElementById(`q-block-${q.id}`);
      if (!block) return;

      const shouldBeVisible = this.isQuestionVisible(q);
      if (shouldBeVisible) {
        block.style.display = 'block';
      } else {
        block.style.display = 'none';
        delete this.answers[q.id];
      }
    });
  }

  bindGlobalEvents() {
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => {
        if (this.currentSectionIndex > 0) {
          this.currentSectionIndex--;
          this.renderCurrentSection();
          this.scrollToQuestionnaireTop();
        }
      });
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => {
        const activeSections = this.getActiveSections();
        const currentSection = activeSections[this.currentSectionIndex];

        // Validation for required questions in current section
        const missingRequired = currentSection.questions.find(q => {
          if (!q.required) return false;
          if (!this.isQuestionVisible(q)) return false;
          const val = this.answers[q.id];
          if (val === undefined || val === null || val === '') return true;
          if (Array.isArray(val) && val.length === 0) return true;
          if (q.type === 'consent' && !val) return true;
          return false;
        });

        if (missingRequired) {
          alert(`Veuillez répondre à la question obligatoire : "${missingRequired.title}"`);
          const block = document.getElementById(`q-block-${missingRequired.id}`);
          if (block) {
            block.scrollIntoView({ behavior: 'smooth', block: 'center' });
            block.classList.add('shake-highlight');
            setTimeout(() => block.classList.remove('shake-highlight'), 600);
          }
          return;
        }

        if (this.currentSectionIndex < activeSections.length - 1) {
          this.currentSectionIndex++;
          this.renderCurrentSection();
          this.scrollToQuestionnaireTop();
        } else {
          // Final section submitted!
          this.handleFormSubmission();
        }
      });
    }
  }

  scrollToQuestionnaireTop() {
    window.scrollTo({
      top: this.form.offsetTop - 100,
      behavior: 'smooth'
    });
  }

  async handleFormSubmission() {
    this.nextBtn.disabled = true;
    this.nextBtn.textContent = 'Calcul du classement...';

    // 1. Save lead in database
    await saveLeadDb({
      ...this.answers,
      timestamp: new Date().toISOString(),
      source: 'Questionnaire Détaillé 8 Sections'
    });

    // 2. Compute matching recommendations
    const recommendations = recommendPlatforms(this.answers);

    // 3. Render official results restitution
    this.renderResultsDashboard(recommendations);
  }

  renderResultsDashboard(results) {
    const parentContainer = this.form.parentElement;
    parentContainer.innerHTML = '';
    parentContainer.classList.add('results-mode');

    const topResults = results.slice(0, 5);
    const currentDate = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

    const resultsDiv = document.createElement('div');
    resultsDiv.className = 'results-dashboard';

    // Header with official DGFiP date
    const headerHTML = `
      <div class="results-header-box" style="text-align: center; margin-bottom: 40px; padding: 36px 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: var(--radius-xl); box-shadow: 0 10px 30px rgba(0,0,0,0.03);">
        <div style="display: inline-flex; align-items: center; gap: 8px; background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; font-size: 13px; font-weight: 800; padding: 6px 16px; border-radius: 20px; margin-bottom: 16px;">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
          Audit et sélection conformes DGFiP
        </div>
        <h2 style="font-size: 30px; font-weight: 900; color: #0b132b; margin-bottom: 12px;">Rapport de sélection des Plateformes Agréées (PA)</h2>
        <p style="color: #64748b; max-width: 680px; margin: 0 auto 16px; font-size: 15px;">
          Classement établi sur la base de vos critères d'architecture, connecteurs logiciels, volumes de flux et obligations légales de la réforme.
        </p>
        <p style="font-size: 12px; color: #94a3b8; margin: 0;">
          Données mises à jour au <strong>15 août 2026</strong> — Source officielle : <a href="https://www.impots.gouv.fr/partenaire-de-dematerialisation" target="_blank" style="color: #0d9488; text-decoration: underline;">Annuaire DGFiP des Plateformes Agréées</a>.
        </p>
      </div>
    `;

    // Action buttons bar: Download PDF + Export Excel
    const actionsBarHTML = `
      <div class="results-export-bar" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; margin-bottom: 30px; padding: 18px 24px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: var(--radius-lg);">
        <div style="font-size: 14px; font-weight: 700; color: #1e293b;">
          ${results.length} Plateformes Agréées analysées pour votre entreprise
        </div>
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <button id="btn-export-pdf" class="btn btn-primary btn-sm" style="font-weight: 700;">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            Télécharger le Rapport (PDF)
          </button>
          <button id="btn-export-csv" class="btn btn-outline btn-sm" style="font-weight: 700;">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 2v-6m-8-3h7a2 2 0 012 2v9a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2z"/></svg>
            Exporter le Tableau (Excel / CSV)
          </button>
        </div>
      </div>
    `;

    // Cards list
    let cardsHTML = `<div class="platform-results-list">`;

    topResults.forEach((platform, index) => {
      const isTop = index === 0;
      const cardClass = isTop ? 'platform-card recommended-card' : 'platform-card';
      const statusBadge = platform.statusType === 'immatricule'
        ? `<span class="badge" style="background-color: #dcfce7; color: #166534; font-weight: 800; font-size: 11px; padding: 4px 8px; border-radius: 4px;">✓ ${platform.statusLabel} (${platform.registrationNumber})</span>`
        : `<span class="badge" style="background-color: #fef9c3; color: #854d0e; font-weight: 800; font-size: 11px; padding: 4px 8px; border-radius: 4px;">⏳ ${platform.statusLabel}</span>`;

      // Matched Criteria List
      const matchedItemsHTML = (platform.matchedCriteria || []).map(c => `
        <li style="display: flex; align-items: flex-start; gap: 8px; font-size: 13.5px; color: #1e293b; margin-bottom: 6px;">
          <span style="color: #10b981; font-weight: bold; flex-shrink: 0;">✓</span>
          <span>${c}</span>
        </li>
      `).join('');

      // Vigilance points if any
      const vigilanceItemsHTML = (platform.vigilancePoints && platform.vigilancePoints.length > 0) ? `
        <div style="margin-top: 12px; padding: 10px 14px; background: #fffbeb; border: 1px solid #fef3c7; border-radius: 6px;">
          <span style="font-size: 12px; font-weight: 800; color: #b45309; text-transform: uppercase;">Points de vigilance :</span>
          <ul style="margin: 4px 0 0; padding-left: 16px; font-size: 12.5px; color: #92400e;">
            ${platform.vigilancePoints.map(v => `<li>${v}</li>`).join('')}
          </ul>
        </div>
      ` : '';

      cardsHTML += `
        <div class="${cardClass}" style="margin-bottom: 24px; padding: 32px; background: #ffffff; border: 2px solid ${isTop ? '#10b981' : '#e2e8f0'}; border-radius: var(--radius-xl); box-shadow: 0 10px 30px rgba(0,0,0,0.04);">
          ${isTop ? `<div style="margin-bottom: 12px;"><span class="badge badge-recommended" style="background: #10b981; color: white; padding: 4px 12px; font-weight: 800; border-radius: 6px;">★ Recommandation n°1</span></div>` : ''}

          <div style="display: grid; grid-template-columns: 240px 1fr 200px; gap: 32px; align-items: start;">
            <!-- Column 1: Logo & Identity -->
            <div>
              <div style="width: 70px; height: 70px; margin-bottom: 12px;">${platform.logo}</div>
              <h3 style="font-size: 20px; font-weight: 800; color: #0b132b; margin: 0 0 6px;">${platform.name}</h3>
              <div style="margin-bottom: 8px;">${statusBadge}</div>
              <div style="font-size: 14px; font-weight: 700; color: #64748b;">${platform.priceLabel}</div>
            </div>

            <!-- Column 2: Criteria Explaining Ranking -->
            <div>
              <h4 style="font-size: 14px; font-weight: 800; text-transform: uppercase; color: #0d9488; letter-spacing: 0.5px; margin: 0 0 10px;">
                Critères justifiant ce classement :
              </h4>
              <ul style="list-style: none; padding: 0; margin: 0;">
                ${matchedItemsHTML}
              </ul>
              ${vigilanceItemsHTML}
            </div>

            <!-- Column 3: Score & Link -->
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: var(--radius-lg); padding: 20px;">
              <div style="font-size: 32px; font-weight: 900; color: #10b981; line-height: 1;">
                ${platform.compatibilityScore}%
              </div>
              <span style="font-size: 12px; font-weight: 700; color: #64748b; margin-top: 4px; margin-bottom: 16px;">Indice d'adéquation</span>
              <a href="${platform.url}" target="_blank" class="btn btn-primary btn-sm" style="width: 100%; font-weight: 700;">
                Consulter l'offre
              </a>
            </div>
          </div>
        </div>
      `;
    });

    cardsHTML += `</div>`;

    // Methodology link footer
    const footerHTML = `
      <div style="margin-top: 50px; text-align: center; padding: 30px; background: #f8fafc; border-radius: var(--radius-lg); border: 1px solid #e2e8f0;">
        <h4 style="font-size: 17px; font-weight: 800; color: #0b132b; margin-bottom: 8px;">Transparence et Indépendance de Notation</h4>
        <p style="font-size: 14px; color: #64748b; max-width: 640px; margin: 0 auto 16px;">
          eFactu est un comparateur tiers indépendant. Nos algorithmes d'adéquation évaluent les offres sans affiliation commerciale, sur la base des connecteurs vérifiés et des critères déclarés par les éditeurs.
        </p>
        <div style="display: flex; justify-content: center; gap: 16px;">
          <a href="/methodologie.html" class="btn btn-outline btn-sm">Consulter notre méthodologie complète</a>
          <button id="btn-restart-quiz" class="btn btn-outline btn-sm">Recommencer une simulation</button>
        </div>
      </div>
    `;

    resultsDiv.innerHTML = headerHTML + actionsBarHTML + cardsHTML + footerHTML;
    parentContainer.appendChild(resultsDiv);

    // Bind Result Action Events
    this.bindResultActions(results);

    // Scroll to results top
    window.scrollTo({
      top: parentContainer.offsetTop - 80,
      behavior: 'smooth'
    });
  }

  bindResultActions(results) {
    const btnPdf = document.getElementById('btn-export-pdf');
    if (btnPdf) {
      btnPdf.addEventListener('click', () => {
        window.print();
      });
    }

    const btnCsv = document.getElementById('btn-export-csv');
    if (btnCsv) {
      btnCsv.addEventListener('click', () => {
        this.exportResultsToCSV(results);
      });
    }

    const btnRestart = document.getElementById('btn-restart-quiz');
    if (btnRestart) {
      btnRestart.addEventListener('click', () => {
        window.location.reload();
      });
    }
  }

  exportResultsToCSV(results) {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "Rang;Plateforme;Statut DGFIP;Immatriculation;Score Adequation (%);Prix Base;Criteres Valides\r\n";

    results.forEach((p, idx) => {
      const row = [
        idx + 1,
        p.name,
        p.statusLabel,
        p.registrationNumber || 'En cours',
        p.compatibilityScore,
        p.priceLabel,
        (p.matchedCriteria || []).join(' | ')
      ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(';');

      csvContent += row + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `efactu_classement_plateformes_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
