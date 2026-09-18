/*
  Rellena la web con los datos de data/content.js.

  Es el único sitio donde el HTML "conoce" la forma del objeto
  SITE_CONTENT. Si algún día esto se convierte en un CMS real, solo hay
  que sustituir cómo se obtiene SITE_CONTENT (por ejemplo, por una
  llamada a una API) — el resto del código no cambia.

  Progresivo: si por lo que sea este script no llegara a ejecutarse, el
  HTML ya contiene el mismo contenido como placeholder estático, así que
  la web sigue siendo perfectamente utilizable.
*/
(function () {
  const DATA = window.SITE_CONTENT;
  if (!DATA) return;

  function get(path) {
    return path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), DATA);
  }

  // ---------- Enlaces simples de texto / atributos ----------
  document.querySelectorAll('[data-bind]').forEach((el) => {
    const value = get(el.dataset.bind);
    if (value != null) el.textContent = value;
  });
  document.querySelectorAll('[data-bind-href]').forEach((el) => {
    const value = get(el.dataset.bindHref);
    if (value != null) el.setAttribute('href', value);
  });
  document.querySelectorAll('[data-bind-src]').forEach((el) => {
    const value = get(el.dataset.bindSrc);
    if (value != null) el.setAttribute('src', value);
  });

  // ---------- Enlaces de WhatsApp (mensaje genérico; el asistente de
  // reserva construye uno más específico según lo que se vaya rellenando) ----------
  const waNumber = get('contact.whatsappNumber');
  if (waNumber) {
    document.querySelectorAll('[data-whatsapp-btn]').forEach((el) => {
      if (el.closest('.booking')) return; // gestionado por js/booking.js (mensaje dinámico)
      el.href = `https://wa.me/${waNumber}`;
      el.target = '_blank';
      el.rel = 'noopener';
    });
  }

  // ---------- Navegación (desktop + móvil), desde el mismo array ----------
  const navItems = get('nav') || [];
  const navList = document.querySelector('[data-nav-list]');
  if (navList && navItems.length) {
    navList.innerHTML = navItems
      .map((item) => `<li><a href="${item.href}">${item.label}</a></li>`)
      .join('');
  }
  const mobileNavList = document.querySelector('[data-mobile-nav-list]');
  if (mobileNavList && navItems.length) {
    mobileNavList.innerHTML = navItems
      .map((item, i) => `<li style="--i:${i}"><a href="${item.href}" data-mobile-link>${item.label}</a></li>`)
      .join('');
  }

  // ---------- Más que un corte ----------
  const pillars = get('pillars') || [];
  const pillarsList = document.querySelector('[data-pillars-list]');
  if (pillarsList && pillars.length) {
    pillarsList.innerHTML = pillars
      .map(
        (p) => `
        <li class="pillars__item reveal" data-reveal>
          <span class="pillars__number">${p.number}</span>
          <h3>${p.title}</h3>
          <p>${p.text}</p>
        </li>`
      )
      .join('');
  }

  // ---------- Servicios (sección + opciones del asistente de reserva) ----------
  const services = get('services') || [];
  const servicesList = document.querySelector('[data-services-list]');
  if (servicesList && services.length) {
    servicesList.innerHTML = services
      .map(
        (s) => `
        <li class="services__item reveal" data-reveal data-preview="${s.image || ''}">
          <span class="services__number">${s.number}</span>
          <div class="services__body">
            <h3>${s.name}</h3>
            <p>${s.description}</p>
          </div>
          <span class="services__duration">${s.duration || ''}</span>
          <span class="services__price">${s.price}</span>
        </li>`
      )
      .join('');
  }
  const serviceSelect = document.getElementById('bf-service');
  if (serviceSelect && services.length) {
    serviceSelect.innerHTML =
      '<option value="" disabled selected>Selecciona un servicio</option>' +
      services.map((s) => `<option value="${s.name}">${s.name} — ${s.price}</option>`).join('');
  }
  const proSelect = document.getElementById('bf-pro');
  const team = get('team') || [];
  if (proSelect && team.length) {
    proSelect.innerHTML = team
      .map((t, i) => `<option value="${t.name}"${i === 0 ? ' selected' : ''}>${t.name}</option>`)
      .join('');
  }

  // ---------- El estudio: ya enlazado vía data-bind ----------

  // ---------- Galería ----------
  const gallery = get('gallery') || [];
  const galleryGrid = document.querySelector('[data-gallery-list]');
  if (galleryGrid && gallery.length) {
    galleryGrid.innerHTML = gallery
      .map(
        (g) => `
        <button class="gallery__item reveal" data-reveal data-lightbox-trigger data-full="${g.image}">
          <img src="${g.image}" loading="lazy" decoding="async" alt="${g.label}">
          <span class="gallery__tag">${g.label}</span>
        </button>`
      )
      .join('');
  }

  // ---------- Opiniones ----------
  const reviews = get('reviews') || [];
  const reviewsGrid = document.querySelector('[data-testimonials-list]');
  if (reviewsGrid && reviews.length) {
    reviewsGrid.innerHTML = reviews
      .map(
        (r) => `
        <figure class="testimonial reveal" data-reveal>
          <span class="testimonial__stars" aria-hidden="true">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
          <blockquote>“${r.quote}”</blockquote>
          <figcaption>${r.name}</figcaption>
        </figure>`
      )
      .join('');
  }

  // ---------- Preguntas frecuentes ----------
  const faq = get('faq') || [];
  const faqList = document.querySelector('[data-faq-list]');
  if (faqList && faq.length) {
    faqList.innerHTML = faq
      .map(
        (item) => `
        <div class="faq__item reveal" data-reveal data-faq-item>
          <button class="faq__question" data-faq-trigger aria-expanded="false">
            <span>${item.q}</span>
            <span class="faq__icon" aria-hidden="true"></span>
          </button>
          <div class="faq__answer" data-faq-answer hidden>
            <p>${item.a}</p>
          </div>
        </div>`
      )
      .join('');
  }
})();
