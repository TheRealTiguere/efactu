import { getPlatforms } from './data/platforms.js';
import { initDatabase } from './data/db.js';

document.addEventListener('DOMContentLoaded', async () => {
  await initDatabase();
  const container = document.getElementById('comparison-table-container');
  if (container) {
    renderComparisonTable(container);
  }
});

function renderComparisonTable(container) {
  const platformsList = getPlatforms();

  // Define features to show as rows
  const rows = [
    { key: 'priceLabel', label: 'Tarif mensuel' },
    { key: 'rating', label: 'Note globale' },
    { key: 'eInvoicing', label: 'Émission Factures (e-Invoicing)', isFeature: true },
    { key: 'receiving', label: 'Réception & Centralisation', isFeature: true },
    { key: 'payment', label: 'Paiement intégré', isFeature: true },
    { key: 'signature', label: 'Signature électronique', isFeature: true },
    { key: 'reminders', label: 'Relances automatiques', isFeature: true },
    { key: 'api', label: 'API & Connecteurs', isFeature: true },
    { key: 'multiUser', label: 'Accès collaborateurs', isFeature: true },
    { key: 'quotes', label: 'Gestion des devis', isFeature: true },
    { key: 'accountingSync', label: 'Synchro bancaire', isFeature: true },
    { key: 'assistance', label: 'Accompagnement', isFeature: true }
  ];

  // SVG check and cross markup
  const checkIcon = `<span style="color: var(--status-success); font-weight: 800; font-size: 18px; display: inline-flex; align-items: center; gap: 4px;">
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg> Oui
  </span>`;
  const crossIcon = `<span style="color: var(--text-light); font-weight: 500; font-size: 18px; display: inline-flex; align-items: center; gap: 4px;">
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg> Non
  </span>`;

  let tableHTML = `
    <div class="comparison-table-wrapper">
      <table class="comparison-table">
        <thead>
          <tr>
            <th style="min-width: 250px;">Fonctionnalités</th>
  `;

  // Column Headers (Platforms)
  platformsList.forEach(p => {
    tableHTML += `
      <th style="text-align: center; min-width: 150px;">
        <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
          <div style="width: 48px; height: 48px;">${p.logo}</div>
          <span style="font-size: 13px; font-weight: 800; color: var(--primary-deep);">${p.name.replace('(Candidat PDP)', '').replace('(PDP Officiel)', '')}</span>
        </div>
      </th>
    `;
  });

  tableHTML += `
          </tr>
        </thead>
        <tbody>
  `;

  // Render Rows
  rows.forEach(row => {
    tableHTML += `
      <tr>
        <td class="platform-th">${row.label}</td>
    `;

    platformsList.forEach(p => {
      let cellContent = '';

      if (row.isFeature) {
        cellContent = p.features[row.key] ? checkIcon : crossIcon;
      } else if (row.key === 'priceLabel') {
        cellContent = `<span style="font-weight: 700; color: var(--text-dark);">${p.price === 0 ? 'Gratuit' : p.price + ' € / mois'}</span>`;
      } else if (row.key === 'rating') {
        cellContent = `
          <div style="display: flex; flex-direction: column; align-items: center;">
            <span style="font-weight: 800; color: #fbbf24; font-size: 15px;">★ ${p.rating}</span>
          </div>
        `;
      }

      tableHTML += `<td style="text-align: center;">${cellContent}</td>`;
    });

    tableHTML += `</tr>`;
  });

  // Action Buttons Row (Footer row)
  tableHTML += `
    <tr style="background-color: #f8fafc;">
      <td class="platform-th" style="vertical-align: middle;">Action</td>
  `;

  platformsList.forEach(p => {
    tableHTML += `
      <td style="text-align: center; padding: 20px 10px;">
        <a href="${p.url}" target="_blank" class="btn btn-secondary btn-sm" style="font-size: 12px; padding: 10px 14px; width: 100%;">
          Découvrir
        </a>
      </td>
    `;
  });

  tableHTML += `
          </tr>
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = tableHTML;
}
