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
  const platformsList = getPlatforms().slice(0, 10); // Display top curated platforms in matrix

  // Define features to show as rows
  const rows = [
    { key: 'statusLabel', label: 'Statut officiel DGFiP' },
    { key: 'registrationNumber', label: 'N° Immatriculation' },
    { key: 'priceLabel', label: 'Tarif indicatif' },
    { key: 'rating', label: 'Note d\'évaluation' },
    { key: 'eInvoicing', label: 'Émission Factures (e-Invoicing)', isFeature: true },
    { key: 'receiving', label: 'Réception & Centralisation', isFeature: true },
    { key: 'eReporting', label: 'Transmission e-Reporting', isFeature: true },
    { key: 'chorusPro', label: 'Passerelle Chorus Pro (B2G)', isFeature: true },
    { key: 'multiSiren', label: 'Multi-SIREN / Groupes', isFeature: true },
    { key: 'probativeArchiving', label: 'Archivage probant 10 ans', isFeature: true },
    { key: 'iso27001', label: 'Certification ISO 27001', isFeature: true },
    { key: 'multiVatRates', label: 'Gestion Multi-taux TVA', isFeature: true },
    { key: 'payment', label: 'Paiement intégré', isFeature: true },
    { key: 'accountingSync', label: 'Accès Expert-Comptable', isFeature: true },
    { key: 'assistance', label: 'Support & Accompagnement', isFeature: true }
  ];

  // SVG check and cross markup
  const checkIcon = `<span style="color: #10b981; font-weight: 800; font-size: 14px; display: inline-flex; align-items: center; justify-content: center; gap: 4px;">
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg> Inclus
  </span>`;
  const crossIcon = `<span style="color: #94a3b8; font-weight: 500; font-size: 14px; display: inline-flex; align-items: center; justify-content: center; gap: 4px;">
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg> Non
  </span>`;

  let tableHTML = `
    <div class="comparison-table-wrapper" style="overflow-x: auto; border: 1px solid #e2e8f0; border-radius: var(--radius-lg); background: #ffffff;">
      <table class="comparison-table" style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
            <th style="min-width: 250px; padding: 20px 24px; text-align: left; font-size: 14px; font-weight: 900; color: #0b132b;">Critères & Fonctionnalités</th>
  `;

  // Column Headers (Platforms)
  platformsList.forEach(p => {
    tableHTML += `
      <th style="text-align: center; min-width: 170px; padding: 20px 16px; border-left: 1px solid #e2e8f0;">
        <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
          <div style="width: 44px; height: 44px;">${p.logo}</div>
          <span style="font-size: 14px; font-weight: 800; color: #0b132b;">${p.name}</span>
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
  rows.forEach((row, rIdx) => {
    const bgRow = rIdx % 2 === 0 ? '#ffffff' : '#f8fafc';
    tableHTML += `
      <tr style="background-color: ${bgRow}; border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 14px 24px; font-size: 13.5px; font-weight: 700; color: #334155;">${row.label}</td>
    `;

    platformsList.forEach(p => {
      let cellContent = '';

      if (row.isFeature) {
        cellContent = p.features[row.key] ? checkIcon : crossIcon;
      } else if (row.key === 'statusLabel') {
        cellContent = p.statusType === 'immatricule'
          ? `<span style="background: #dcfce7; color: #166534; font-size: 11px; font-weight: 800; padding: 3px 6px; border-radius: 4px;">✓ Immatriculée</span>`
          : `<span style="background: #fef9c3; color: #854d0e; font-size: 11px; font-weight: 800; padding: 3px 6px; border-radius: 4px;">⏳ Candidate</span>`;
      } else if (row.key === 'registrationNumber') {
        cellContent = `<span style="font-size: 12px; font-family: monospace; font-weight: 700; color: #64748b;">${p.registrationNumber || 'En cours'}</span>`;
      } else if (row.key === 'priceLabel') {
        cellContent = `<span style="font-weight: 700; font-size: 13px; color: #0f766e;">${p.priceLabel}</span>`;
      } else if (row.key === 'rating') {
        cellContent = `<span style="font-weight: 800; color: #f59e0b; font-size: 14px;">★ ${p.rating} / 5</span>`;
      }

      tableHTML += `<td style="text-align: center; padding: 14px 16px; border-left: 1px solid #e2e8f0;">${cellContent}</td>`;
    });

    tableHTML += `</tr>`;
  });

  // Action Buttons Row (Footer row)
  tableHTML += `
    <tr style="background-color: #f1f5f9; border-top: 2px solid #e2e8f0;">
      <td style="padding: 20px 24px; font-weight: 800; color: #0b132b; vertical-align: middle;">Accéder aux offres</td>
  `;

  platformsList.forEach(p => {
    tableHTML += `
      <td style="text-align: center; padding: 16px; border-left: 1px solid #e2e8f0;">
        <a href="${p.url}" target="_blank" class="btn btn-primary btn-sm" style="font-size: 12px; font-weight: 700; padding: 8px 12px; width: 100%;">
          Consulter
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
