import { initDatabase, saveContactDb } from './data/db.js';

document.addEventListener('DOMContentLoaded', async () => {
  await initDatabase();
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    initContactForm(contactForm);
  }
});

function initContactForm(form) {
  const successAlert = document.getElementById('contact-success-alert');
  const nameInput = document.getElementById('contact-name');
  const companyInput = document.getElementById('contact-company');
  const emailInput = document.getElementById('contact-email');
  const phoneInput = document.getElementById('contact-phone');
  const messageInput = document.getElementById('contact-message');

  // Input listener to clear errors on type
  form.addEventListener('input', (e) => {
    if (e.target.classList.contains('q-form-input')) {
      e.target.classList.remove('error');
      const err = e.target.nextElementSibling;
      if (err && err.classList.contains('q-error-text')) {
        err.style.display = 'none';
      }
    }
  });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      let isValid = true;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      // Reset error visuals
      [nameInput, companyInput, emailInput, phoneInput, messageInput].forEach(inp => {
        if (inp) {
          inp.classList.remove('error');
          const err = inp.nextElementSibling;
          if (err && err.classList.contains('q-error-text')) err.style.display = 'none';
        }
      });

      // Validate Name
      if (!nameInput.value.trim()) {
        showError(nameInput);
        isValid = false;
      }

      // Validate Company
      if (!companyInput.value.trim()) {
        showError(companyInput);
        isValid = false;
      }

      // Validate Email
      if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
        showError(emailInput);
        isValid = false;
      }

      // Validate Message
      if (!messageInput.value.trim()) {
        showError(messageInput);
        isValid = false;
      }

      // Validate Phone (optional, but if filled, check structure)
      if (phoneInput.value.trim()) {
        const phoneRegex = /^[\d\s\+\-\(\).]{8,20}$/;
        if (!phoneRegex.test(phoneInput.value.trim())) {
          showError(phoneInput);
          isValid = false;
        }
      }

      if (!isValid) return;

      // Payload compilation
      const payload = {
        name: nameInput.value.trim(),
        company: companyInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim(),
        message: messageInput.value.trim(),
        date: new Date().toISOString()
      };

      // Store in Database (Supabase / LocalStorage fallback)
      await saveContactDb(payload);
      console.log("Contact request captured on eFactu:", payload);

      // Visual transition
      form.style.display = 'none';
      if (successAlert) {
        successAlert.style.display = 'block';
        successAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });

  function showError(input) {
    input.classList.add('error');
    const errText = input.nextElementSibling;
    if (errText && errText.classList.contains('q-error-text')) {
      errText.style.display = 'block';
    }
  }
}
