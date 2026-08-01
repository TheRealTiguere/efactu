import { getPlatforms, savePlatforms, defaultPlatforms } from './data/platforms.js';
import { getQuestions, saveQuestions, defaultQuestions } from './data/questions.js';
import { initDatabase, getLeadsListDb, getContactsListDb, clearLeadsDb, clearContactsDb } from './data/db.js';

document.addEventListener('DOMContentLoaded', async () => {
  await initDatabase();
  new AdminController();
});

class AdminController {
  constructor() {
    this.platforms = getPlatforms();
    this.questions = getQuestions();
    this.leads = [];
    this.contacts = [];

    this.initElements();
    this.bindEvents();
    this.loadDataAndRender();
  }

  initElements() {
    // Tabs
    this.tabButtons = document.querySelectorAll('.admin-tab-btn');
    this.tabContents = document.querySelectorAll('.admin-tab-content');

    // Toast
    this.toast = document.getElementById('admin-notify');

    // Platforms Tab
    this.platformsTbody = document.getElementById('platforms-tbody');
    this.btnAddPlatform = document.getElementById('btn-add-platform');
    this.platformFormContainer = document.getElementById('platform-form-container');
    this.platformForm = document.getElementById('platform-form');
    this.btnCancelPlatform = document.getElementById('btn-cancel-platform');
    this.formPlatformIndex = document.getElementById('form-platform-index');
    this.formPlatformId = document.getElementById('form-platform-id');
    this.formPlatformTitle = document.getElementById('form-platform-title');

    // Questionnaire Tab
    this.qListContainer = document.getElementById('q-list-container');
    this.qEditorContainer = document.getElementById('q-editor-container');
    this.questionForm = document.getElementById('question-form');
    this.formQStep = document.getElementById('form-q-step');
    this.qTitleInput = document.getElementById('q-title');
    this.qSubtitleInput = document.getElementById('q-subtitle');
    this.qOptionsContainer = document.getElementById('q-options-container');
    this.btnAddQOption = document.getElementById('btn-add-q-option');

    // Leads Tab
    this.leadsTbody = document.getElementById('leads-tbody');
    this.contactsTbody = document.getElementById('contacts-tbody');
    this.btnExportLeads = document.getElementById('btn-export-leads');
    this.btnClearLeads = document.getElementById('btn-clear-leads');
    this.btnExportContacts = document.getElementById('btn-export-contacts');
    this.btnClearContacts = document.getElementById('btn-clear-contacts');

    // Settings
    this.btnResetDb = document.getElementById('btn-reset-db');
  }

  bindEvents() {
    // Tab switching
    this.tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        
        // Toggle active button
        this.tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Toggle active content
        this.tabContents.forEach(content => {
          content.classList.remove('active');
          if (content.id === `tab-${tabName}`) {
            content.classList.add('active');
          }
        });

        // Hide platform form when switching tabs
        this.platformFormContainer.style.display = 'none';
        document.getElementById('platforms-table-container').style.display = 'block';
      });
    });

    // Reset Database
    this.btnResetDb.addEventListener('click', () => {
      if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données ? Vos modifications de plateformes et de questions seront définitivement perdues.')) {
        localStorage.removeItem('efactu_platforms');
        localStorage.removeItem('efactu_questions');
        this.showToast('Base de données réinitialisée ! Rechargement de la page...');
        setTimeout(() => window.location.reload(), 1500);
      }
    });

    // Platform Tab Events
    this.btnAddPlatform.addEventListener('click', () => this.showPlatformForm());
    this.btnCancelPlatform.addEventListener('click', () => this.hidePlatformForm());
    this.platformForm.addEventListener('submit', (e) => this.handlePlatformSubmit(e));

    // Questionnaire Tab Events
    this.questionForm.addEventListener('submit', (e) => this.handleQuestionSubmit(e));
    this.btnAddQOption.addEventListener('click', () => this.addQuestionOptionRow());

    // Leads Tab Events
    this.btnExportLeads.addEventListener('click', () => this.exportToCSV('efactu_prospects.csv', this.leads, 'leads'));
    this.btnClearLeads.addEventListener('click', async () => {
      if (confirm('Voulez-vous vraiment effacer tous les prospects capturés ? cette action est irréversible.')) {
        await clearLeadsDb();
        this.leads = [];
        this.renderLeads();
        this.showToast('Historique des prospects effacé.');
      }
    });

    this.btnExportContacts.addEventListener('click', () => this.exportToCSV('efactu_demandes_contact.csv', this.contacts, 'contacts'));
    this.btnClearContacts.addEventListener('click', async () => {
      if (confirm('Voulez-vous vraiment effacer toutes les demandes de contact ? cette action est irréversible.')) {
        await clearContactsDb();
        this.contacts = [];
        this.renderContacts();
        this.showToast('Historique des messages effacé.');
      }
    });

    // Logout
    this.btnLogout = document.getElementById('btn-logout');
    if (this.btnLogout) {
      this.btnLogout.addEventListener('click', () => {
        sessionStorage.removeItem('efactu_admin_token');
        window.location.replace('/admin-login.html');
      });
    }
  }

  async loadDataAndRender() {
    this.leads = await getLeadsListDb();
    this.contacts = await getContactsListDb();
    this.renderAll();
  }

  showToast(message) {
    this.toast.textContent = message;
    this.toast.style.display = 'block';
    setTimeout(() => {
      this.toast.style.display = 'none';
    }, 3000);
  }

  renderAll() {
    this.renderPlatforms();
    this.renderQuestionnaire();
    this.renderLeads();
    this.renderContacts();
  }

  // =================== TAB 1: PLATFORMS LOGIC ===================

  renderPlatforms() {
    this.platformsTbody.innerHTML = '';
    
    this.platforms.forEach((p, idx) => {
      const tr = document.createElement('tr');
      
      tr.innerHTML = `
        <td style="width: 60px;">
          <div style="width: 36px; height: 36px; border-radius: var(--radius-sm); overflow: hidden; background-color: var(--bg-main); display: flex; align-items: center; justify-content: center; padding: 4px; border: 1px solid #e2e8f0;">
            ${p.logo.startsWith('<svg') ? p.logo : `<img src="${p.logo}" style="width:100%;height:100%;object-fit:contain;"/>`}
          </div>
        </td>
        <td style="font-weight: 700; color: var(--text-dark);">${p.name}</td>
        <td>${p.price === 0 ? 'Gratuit' : p.price + ' € / mois'}</td>
        <td><span style="color: #fbbf24; font-weight: 700;">★ ${p.rating}</span> / 5</td>
        <td>
          <span class="badge ${p.recommended ? 'badge-recommended' : 'badge-default'}" style="font-size: 11px;">
            ${p.recommended ? 'Recommandé' : 'Normal'}
          </span>
        </td>
        <td style="text-align: right;">
          <div style="display: flex; gap: 8px; justify-content: flex-end;">
            <button class="btn btn-outline btn-sm btn-edit-p" data-idx="${idx}" style="padding: 6px 12px; font-size: 12px;">Modifier</button>
            <button class="btn btn-outline btn-sm btn-delete-p" data-idx="${idx}" style="padding: 6px 12px; font-size: 12px; color: var(--status-danger); border-color: #fca5a5;">Supprimer</button>
          </div>
        </td>
      `;

      this.platformsTbody.appendChild(tr);
    });

    // Bind Table row action buttons
    document.querySelectorAll('.btn-edit-p').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        this.showPlatformForm(idx);
      });
    });

    document.querySelectorAll('.btn-delete-p').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        if (confirm(`Voulez-vous vraiment supprimer la plateforme "${this.platforms[idx].name}" ?`)) {
          this.platforms.splice(idx, 1);
          savePlatforms(this.platforms);
          this.renderPlatforms();
          this.showToast('Plateforme supprimée.');
        }
      });
    });
  }

  showPlatformForm(index = null) {
    document.getElementById('platforms-table-container').style.display = 'none';
    this.platformFormContainer.style.display = 'block';

    // Populate target criteria multiselects dynamically first
    this.populateTargetCheckboxes();

    if (index !== null) {
      // Edit mode
      const p = this.platforms[index];
      this.formPlatformTitle.textContent = `Modifier la Plateforme : ${p.name}`;
      this.formPlatformIndex.value = index;
      this.formPlatformId.value = p.id;

      document.getElementById('p-name').value = p.name;
      document.getElementById('p-price').value = p.price;
      document.getElementById('p-priceLabel').value = p.priceLabel;
      document.getElementById('p-rating').value = p.rating;
      document.getElementById('p-url').value = p.url;
      document.getElementById('p-logo').value = p.logo;
      document.getElementById('p-desc').value = p.description;
      document.getElementById('p-advantages').value = p.advantages.join('\n');
      document.getElementById('p-disadvantages').value = p.disadvantages.join('\n');
      document.getElementById('p-recommended').checked = p.recommended || false;

      // Checkboxes Features
      Object.keys(p.features).forEach(feat => {
        const chk = document.getElementById(`f-${feat}`);
        if (chk) chk.checked = p.features[feat] || false;
      });

      // Target criteria checklist values
      this.setCheckboxGroupValues('c-status', p.compatibility.status);
      this.setCheckboxGroupValues('c-volume', p.compatibility.volume);
      this.setCheckboxGroupValues('c-software', p.compatibility.software);
      this.setCheckboxGroupValues('c-budget', p.compatibility.budget);
      
    } else {
      // Add mode
      this.formPlatformTitle.textContent = 'Ajouter une Plateforme';
      this.formPlatformIndex.value = '';
      this.formPlatformId.value = '';
      this.platformForm.reset();
      
      // Uncheck all features checkboxes
      const featCheckboxes = this.platformForm.querySelectorAll('.admin-checkbox-grid input[type="checkbox"]');
      featCheckboxes.forEach(chk => chk.checked = false);

      // Uncheck criteria multiselects
      const critCheckboxes = this.platformForm.querySelectorAll('.admin-multiselect-box input[type="checkbox"]');
      critCheckboxes.forEach(chk => chk.checked = false);
    }
    
    // Scroll to form
    this.platformFormContainer.scrollIntoView({ behavior: 'smooth' });
  }

  hidePlatformForm() {
    this.platformFormContainer.style.display = 'none';
    document.getElementById('platforms-table-container').style.display = 'block';
  }

  populateTargetCheckboxes() {
    // Generate multiselects based on current options list of matching questions
    const statusQ = this.questions.find(q => q.id === 'status');
    const volumeQ = this.questions.find(q => q.id === 'volume');
    const softwareQ = this.questions.find(q => q.id === 'software');
    const budgetQ = this.questions.find(q => q.id === 'budget');

    this.renderCheckboxList('c-status', statusQ ? statusQ.options : []);
    this.renderCheckboxList('c-volume', volumeQ ? volumeQ.options : []);
    this.renderCheckboxList('c-software', softwareQ ? softwareQ.options : []);
    this.renderCheckboxList('c-budget', budgetQ ? budgetQ.options : []);
  }

  renderCheckboxList(containerId, options) {
    const box = document.getElementById(containerId);
    box.innerHTML = '';
    options.forEach(opt => {
      box.innerHTML += `
        <label>
          <input type="checkbox" value="${opt.value}"> ${opt.label}
        </label>
      `;
    });
  }

  getCheckboxGroupValues(containerId) {
    const checked = Array.from(document.querySelectorAll(`#${containerId} input[type="checkbox"]:checked`));
    return checked.map(chk => chk.value);
  }

  setCheckboxGroupValues(containerId, values = []) {
    const checkboxes = document.querySelectorAll(`#${containerId} input[type="checkbox"]`);
    checkboxes.forEach(chk => {
      chk.checked = values.includes(chk.value);
    });
  }

  handlePlatformSubmit(e) {
    const idxVal = this.formPlatformIndex.value;
    const isEdit = idxVal !== '';
    
    // Read features values
    const featuresKeys = [
      'eInvoicing', 'receiving', 'payment', 'signature', 
      'reminders', 'api', 'multiUser', 'quotes', 
      'accountingSync', 'assistance'
    ];
    
    const features = {};
    featuresKeys.forEach(key => {
      const chk = document.getElementById(`f-${key}`);
      features[key] = chk ? chk.checked : false;
    });

    // Special eReporting default rules matching eInvoicing
    features['eReporting'] = features['eInvoicing'];

    // Construct platform object
    const name = document.getElementById('p-name').value.trim();
    const id = isEdit ? this.formPlatformId.value : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const pData = {
      id: id,
      name: name,
      price: parseInt(document.getElementById('p-price').value),
      priceLabel: document.getElementById('p-priceLabel').value.trim(),
      rating: parseFloat(document.getElementById('p-rating').value),
      url: document.getElementById('p-url').value.trim(),
      logo: document.getElementById('p-logo').value.trim(),
      description: document.getElementById('p-desc').value.trim(),
      advantages: document.getElementById('p-advantages').value.split('\n').map(v => v.trim()).filter(v => v),
      disadvantages: document.getElementById('p-disadvantages').value.split('\n').map(v => v.trim()).filter(v => v),
      features: features,
      compatibility: {
        status: this.getCheckboxGroupValues('c-status'),
        volume: this.getCheckboxGroupValues('c-volume'),
        software: this.getCheckboxGroupValues('c-software'),
        accountant: [true, false], // generic default
        budget: this.getCheckboxGroupValues('c-budget')
      },
      recommended: document.getElementById('p-recommended').checked
    };

    // If setting this platform to recommended, un-recommend others
    if (pData.recommended) {
      this.platforms.forEach(p => p.recommended = false);
    }

    if (isEdit) {
      const index = parseInt(idxVal);
      this.platforms[index] = pData;
      this.showToast('Plateforme mise à jour avec succès.');
    } else {
      this.platforms.push(pData);
      this.showToast('Nouvelle plateforme ajoutée avec succès.');
    }

    savePlatforms(this.platforms);
    this.renderPlatforms();
    this.hidePlatformForm();
  }

  // =================== TAB 2: QUESTIONNAIRE LOGIC ===================

  renderQuestionnaire() {
    this.qListContainer.innerHTML = '';
    
    this.questions.forEach((q) => {
      const div = document.createElement('button');
      div.className = 'admin-q-item';
      div.dataset.step = q.step;
      
      div.innerHTML = `
        <div>
          <h4>Étape ${q.step} : ${q.title}</h4>
          <span>Champ ID : ${q.id} | ${q.type === 'single' ? 'Choix Unique' : 'Choix Multiples'}</span>
        </div>
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
      `;

      div.addEventListener('click', () => {
        // Toggle Active
        document.querySelectorAll('.admin-q-item').forEach(el => el.classList.remove('active'));
        div.classList.add('active');
        
        this.loadQuestionForEdit(q.step);
      });

      this.qListContainer.appendChild(div);
    });

    // Auto click first question
    if (this.questions.length > 0) {
      this.qListContainer.querySelector('.admin-q-item').click();
    }
  }

  loadQuestionForEdit(step) {
    this.qEditorContainer.style.display = 'block';
    const q = this.questions.find(item => item.step === step);
    
    this.formQStep.value = q.step;
    this.qTitleInput.value = q.title;
    this.qSubtitleInput.value = q.subtitle;
    
    this.renderQuestionOptions(q.options);
  }

  renderQuestionOptions(options = []) {
    this.qOptionsContainer.innerHTML = '';
    
    options.forEach(opt => {
      this.addQuestionOptionRow(opt.value, opt.label, opt.icon);
    });
  }

  addQuestionOptionRow(value = '', label = '', icon = '') {
    const row = document.createElement('div');
    row.className = 'admin-option-row';
    
    // Default Icon SVG if empty
    const defaultIcon = icon || `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4"/></svg>`;

    row.innerHTML = `
      <div>
        <input type="text" class="opt-value" required placeholder="Valeur" value="${value}" style="font-family: monospace;">
      </div>
      <div>
        <input type="text" class="opt-label" required placeholder="Libellé option" value="${label}">
      </div>
      <div>
        <input type="text" class="opt-icon" required placeholder="Code SVG de l'icône" value="${escapeHtml(defaultIcon)}">
      </div>
      <button type="button" class="btn-delete-option" title="Supprimer cette option">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
      </button>
    `;

    row.querySelector('.btn-delete-option').addEventListener('click', () => {
      if (this.qOptionsContainer.children.length <= 1) {
        alert('Une question doit disposer d\'au moins une option de choix.');
        return;
      }
      row.remove();
    });

    this.qOptionsContainer.appendChild(row);
  }

  handleQuestionSubmit(e) {
    const step = parseInt(this.formQStep.value);
    const qIndex = this.questions.findIndex(item => item.step === step);
    
    // Read options
    const optionRows = Array.from(this.qOptionsContainer.querySelectorAll('.admin-option-row'));
    const options = optionRows.map(row => {
      return {
        value: row.querySelector('.opt-value').value.trim(),
        label: row.querySelector('.opt-label').value.trim(),
        icon: row.querySelector('.opt-icon').value.trim()
      };
    });

    this.questions[qIndex].title = this.qTitleInput.value.trim();
    this.questions[qIndex].subtitle = this.qSubtitleInput.value.trim();
    this.questions[qIndex].options = options;

    saveQuestions(this.questions);
    this.showToast('Question mise à jour avec succès.');
    
    // Re-render sidebar (maintains active tab)
    const activeStep = step;
    this.renderQuestionnaire();
    
    // Select the edited question again
    const items = Array.from(this.qListContainer.querySelectorAll('.admin-q-item'));
    const toSelect = items.find(el => parseInt(el.dataset.step) === activeStep);
    if (toSelect) {
      document.querySelectorAll('.admin-q-item').forEach(el => el.classList.remove('active'));
      toSelect.classList.add('active');
    }
  }

  // =================== TAB 3: LEADS LOGIC ===================

  renderLeads() {
    this.leadsTbody.innerHTML = '';
    
    if (this.leads.length === 0) {
      this.leadsTbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 30px;">Aucun prospect enregistré pour le moment.</td></tr>`;
      return;
    }

    // Sort by date descending
    this.leads.sort((a, b) => new Date(b.date) - new Date(a.date));

    this.leads.forEach(lead => {
      const dateStr = new Date(lead.date).toLocaleDateString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="white-space: nowrap;">${dateStr}</td>
        <td style="font-weight: 700; color: var(--text-dark);">${lead.leadName}</td>
        <td>${lead.leadCompany}</td>
        <td><a href="mailto:${lead.leadEmail}" style="color: var(--accent-dark); font-weight: 600;">${lead.leadEmail}</a></td>
        <td>${lead.leadPhone || '-'}</td>
        <td>${lead.status || '-'}</td>
        <td>${lead.volume || '-'}</td>
        <td>${lead.budget || '-'}</td>
      `;
      this.leadsTbody.appendChild(tr);
    });
  }

  renderContacts() {
    this.contactsTbody.innerHTML = '';
    
    if (this.contacts.length === 0) {
      this.contactsTbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">Aucun message reçu pour le moment.</td></tr>`;
      return;
    }

    // Sort descending
    this.contacts.sort((a, b) => new Date(b.date) - new Date(a.date));

    this.contacts.forEach(msg => {
      const dateStr = new Date(msg.date).toLocaleDateString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="white-space: nowrap;">${dateStr}</td>
        <td style="font-weight: 700; color: var(--text-dark);">${msg.name}</td>
        <td>${msg.company}</td>
        <td><a href="mailto:${msg.email}" style="color: var(--accent-dark); font-weight: 600;">${msg.email}</a></td>
        <td>${msg.phone || '-'}</td>
        <td style="max-width: 300px; font-size: 13px; color: var(--text-main);">${escapeHtml(msg.message)}</td>
      `;
      this.contactsTbody.appendChild(tr);
    });
  }

  // Export utility to downloadable CSV file
  exportToCSV(filename, arrayData, type) {
    if (arrayData.length === 0) {
      alert("Il n'y a aucune donnée à exporter.");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // UTF-8 BOM
    
    if (type === 'leads') {
      csvContent += "Date;Nom complet;Entreprise;Email;Telephone;Statut Juridique;Volume mensuel;Budget maximum;Outil actuel;Comptable;Accompagnement\r\n";
      arrayData.forEach(lead => {
        const row = [
          lead.date,
          lead.leadName,
          lead.leadCompany,
          lead.leadEmail,
          lead.leadPhone || "",
          lead.status,
          lead.volume,
          lead.budget,
          lead.software,
          lead.accountant,
          lead.assistance
        ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(";");
        csvContent += row + "\r\n";
      });
    } else {
      csvContent += "Date;Nom;Entreprise;Email;Telephone;Message\r\n";
      arrayData.forEach(msg => {
        const row = [
          msg.date,
          msg.name,
          msg.company,
          msg.email,
          msg.phone || "",
          msg.message
        ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(";");
        csvContent += row + "\r\n";
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Simple HTML escaping helper to avoid markup injections
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, function(m) { return map[m]; });
}
