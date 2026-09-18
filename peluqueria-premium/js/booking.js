/*
  Asistente de reserva en 4 pasos: Servicio → Fecha → Datos → Confirmación.
  [PERSONALIZAR] WHATSAPP_NUMBER ya se toma de data/content.js
  (contact.whatsappNumber); no hace falta tocar este archivo para eso.
  Cuando exista un backend real de reservas, sustituye el bloque
  marcado más abajo por la llamada fetch() a tu API.
*/
(function () {
  const wizard = document.querySelector('[data-wizard]');
  const form = document.querySelector('[data-wizard-form]');
  if (!wizard || !form) return;

  const TOTAL_STEPS = 4;
  let currentStep = 1;

  const steps = wizard.querySelectorAll('[data-wizard-steps] [data-step]');
  const panels = form.querySelectorAll('[data-panel]');
  const prevBtn = form.querySelector('[data-wizard-prev]');
  const nextBtn = form.querySelector('[data-wizard-next]');
  const submitBtn = form.querySelector('[data-wizard-submit]');
  const errorEl = form.querySelector('[data-form-error]');
  const summaryEl = form.querySelector('[data-wizard-summary]');
  const successEl = wizard.querySelector('[data-form-success]');

  const dateInput = document.getElementById('bf-date');
  const timeSelect = document.getElementById('bf-time');

  const today = new Date().toISOString().split('T')[0];
  if (dateInput) dateInput.setAttribute('min', today);

  if (timeSelect) {
    for (let h = 9; h <= 19; h++) {
      [':00', ':30'].forEach((m) => {
        if (h === 19 && m === ':30') return;
        const value = `${String(h).padStart(2, '0')}${m}`;
        const opt = document.createElement('option');
        opt.value = value;
        opt.textContent = value;
        timeSelect.appendChild(opt);
      });
    }
  }

  function panelFor(step) {
    return form.querySelector(`[data-panel="${step}"]`);
  }

  function updateStepIndicator() {
    steps.forEach((step) => {
      const n = Number(step.dataset.step);
      step.classList.toggle('is-current', n === currentStep);
      step.classList.toggle('is-done', n < currentStep);
    });
  }

  function showStep(step) {
    panels.forEach((panel) => {
      panel.hidden = Number(panel.dataset.panel) !== step;
    });
    prevBtn.hidden = step === 1;
    nextBtn.hidden = step === TOTAL_STEPS;
    submitBtn.hidden = step !== TOTAL_STEPS;
    errorEl.hidden = true;
    updateStepIndicator();
    if (step === TOTAL_STEPS) fillSummary();
    const firstField = panelFor(step)?.querySelector('input, select');
    firstField?.focus({ preventScroll: true });
  }

  function validateStep(step) {
    const panel = panelFor(step);
    if (!panel) return true;
    const fields = panel.querySelectorAll('input[required], select[required]');
    for (const field of fields) {
      if (!field.checkValidity()) {
        field.reportValidity();
        return false;
      }
    }
    return true;
  }

  function fillSummary() {
    const data = currentFormData();
    summaryEl.innerHTML = `
      <div><dt>Servicio</dt><dd>${data.servicio || '—'}</dd></div>
      <div><dt>Profesional</dt><dd>${data.profesional || '—'}</dd></div>
      <div><dt>Fecha</dt><dd>${formatDate(data.fecha) || '—'}</dd></div>
      <div><dt>Hora</dt><dd>${data.hora || '—'}</dd></div>
      <div><dt>Nombre</dt><dd>${data.nombre || '—'}</dd></div>
      <div><dt>Teléfono</dt><dd>${data.telefono || '—'}</dd></div>
    `;
  }

  function formatDate(value) {
    if (!value) return '';
    const [y, m, d] = value.split('-');
    return `${d}/${m}/${y}`;
  }

  function currentFormData() {
    return Object.fromEntries(new FormData(form).entries());
  }

  nextBtn.addEventListener('click', () => {
    if (!validateStep(currentStep)) return;
    currentStep = Math.min(currentStep + 1, TOTAL_STEPS);
    showStep(currentStep);
  });

  prevBtn.addEventListener('click', () => {
    currentStep = Math.max(currentStep - 1, 1);
    showStep(currentStep);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    const data = currentFormData();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando…';

    try {
      /*
        [PERSONALIZAR] Conexión a un backend real, por ejemplo:

        const response = await fetch('/api/reservations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('No se pudo completar la reserva');
      */
      await new Promise((resolve) => setTimeout(resolve, 700)); // simulación de envío

      form.hidden = true;
      successEl.hidden = false;
    } catch (err) {
      errorEl.textContent = 'No se pudo enviar la reserva. Inténtalo de nuevo o escríbenos por WhatsApp.';
      errorEl.hidden = false;
      submitBtn.disabled = false;
      submitBtn.textContent = 'Confirmar reserva';
    }
  });

  showStep(currentStep);

  /* ---------- WhatsApp: mensaje construido con lo que se vaya rellenando ---------- */
  const waNumber = window.SITE_CONTENT?.contact?.whatsappNumber;
  const waBtn = wizard.parentElement.querySelector('[data-whatsapp-btn]');

  function buildWhatsAppMessage(data) {
    const lines = [
      'Hola, quiero reservar una cita:',
      data.servicio ? `Servicio: ${data.servicio}` : null,
      data.profesional && data.profesional !== 'Sin preferencia' ? `Profesional: ${data.profesional}` : null,
      data.fecha ? `Fecha: ${formatDate(data.fecha)}` : null,
      data.hora ? `Hora: ${data.hora}` : null,
      data.nombre ? `Nombre: ${data.nombre}` : null,
      data.telefono ? `Teléfono: ${data.telefono}` : null,
    ].filter(Boolean);
    return encodeURIComponent(lines.join('\n'));
  }

  function updateWhatsAppLink() {
    if (!waBtn || !waNumber) return;
    const message = buildWhatsAppMessage(currentFormData());
    waBtn.href = `https://wa.me/${waNumber}?text=${message}`;
    waBtn.target = '_blank';
    waBtn.rel = 'noopener';
  }
  form.addEventListener('input', updateWhatsAppLink);
  updateWhatsAppLink();
})();
