/*
  Formulario de reserva.
  [PERSONALIZAR] WHATSAPP_NUMBER con el número real del negocio,
  en formato internacional sin "+" (ej. "34600000000").
  Cuando exista un backend real de reservas, sustituye el bloque
  marcado más abajo por la llamada fetch() a tu API.
*/
(function () {
  const WHATSAPP_NUMBER = '34600000000'; // [PERSONALIZAR]

  const form = document.getElementById('booking-form');
  if (!form) return;

  const timeSelect = document.getElementById('bf-time');
  const dateInput = document.getElementById('bf-date');
  const errorEl = form.querySelector('[data-form-error]');
  const successEl = form.querySelector('[data-form-success]');
  const submitBtn = form.querySelector('[data-submit-btn]');

  // Fecha mínima: hoy
  const today = new Date().toISOString().split('T')[0];
  dateInput.setAttribute('min', today);

  // Franjas horarias de ejemplo — [PERSONALIZAR] según el horario real del local
  const HOURS = [];
  for (let h = 9; h <= 19; h++) {
    HOURS.push(`${String(h).padStart(2, '0')}:00`);
    if (h !== 19) HOURS.push(`${String(h).padStart(2, '0')}:30`);
  }
  HOURS.forEach((h) => {
    const opt = document.createElement('option');
    opt.value = h;
    opt.textContent = h;
    timeSelect.appendChild(opt);
  });

  function buildWhatsAppMessage(data) {
    const lines = [
      'Hola, quiero reservar una cita:',
      data.servicio ? `Servicio: ${data.servicio}` : null,
      data.fecha ? `Fecha: ${data.fecha}` : null,
      data.hora ? `Hora: ${data.hora}` : null,
      data.nombre ? `Nombre: ${data.nombre}` : null,
      data.telefono ? `Teléfono: ${data.telefono}` : null,
    ].filter(Boolean);
    return encodeURIComponent(lines.join('\n'));
  }

  function currentFormData() {
    const fd = new FormData(form);
    return Object.fromEntries(fd.entries());
  }

  function updateWhatsAppLinks() {
    const data = currentFormData();
    const message = buildWhatsAppMessage(data);
    document.querySelectorAll('[data-whatsapp-btn]').forEach((link) => {
      link.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
      link.target = '_blank';
      link.rel = 'noopener';
    });
  }

  form.addEventListener('input', updateWhatsAppLinks);
  updateWhatsAppLinks();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.hidden = true;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = currentFormData();
    submitBtn.disabled = true;
    submitBtn.querySelector('.btn__label').textContent = 'Enviando…';

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
      submitBtn.querySelector('.btn__label').textContent = 'Solicitar reserva';
    }
  });
})();
