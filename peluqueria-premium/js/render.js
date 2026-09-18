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

  // ---------- Resultados (comparador antes/después) ----------
  const transformations = get('transformations') || [];
  const compareList = document.querySelector('[data-compare-list]');
  if (compareList && transformations.length) {
    compareList.innerHTML = transformations
      .map(
        (t) => `
        <figure class="compare reveal" data-reveal>
          <div class="compare__frame" data-compare tabindex="0" role="slider" aria-label="Comparar antes y después: ${t.label}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50">
            <img class="compare__img compare__img--after" src="${t.afterImage}" alt="Después — ${t.label}" loading="lazy" decoding="async">
            <div class="compare__before-wrap" data-compare-before-wrap>
              <img class="compare__img compare__img--before" src="${t.beforeImage}" alt="Antes — ${t.label}" loading="lazy" decoding="async">
            </div>
            <span class="compare__tag compare__tag--before">Antes</span>
            <span class="compare__tag compare__tag--after">Después</span>
            <div class="compare__handle" data-compare-handle aria-hidden="true">
              <span class="compare__handle-line"></span>
              <span class="compare__handle-grip">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 6 3 12l5 6M16 6l5 6-5 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </span>
            </div>
          </div>
          <figcaption class="compare__meta">
            <span class="compare__label">${t.label}</span>
            <span class="compare__category">${t.category}</span>
          </figcaption>
        </figure>`
      )
      .join('');
  }

  // ---------- La experiencia (pasos + imagen fija que cambia con el scroll) ----------
  const experienceSteps = get('experienceSteps') || [];
  const experienceList = document.querySelector('[data-experience-list]');
  if (experienceList && experienceSteps.length) {
    experienceList.innerHTML = experienceSteps
      .map(
        (s, i) => `
        <li class="exp__step${i === 0 ? ' is-current' : ''}" data-exp-step="${i + 1}">
          <span class="exp__step-line" aria-hidden="true"></span>
          <span class="exp__step-num">${s.number}</span>
          <h3>${s.title}</h3>
          <p>${s.text}</p>
        </li>`
      )
      .join('');
  }
  const experienceMedia = document.querySelector('[data-experience-media]');
  if (experienceMedia && experienceSteps.length) {
    experienceMedia.innerHTML = experienceSteps
      .map(
        (s, i) => `<img class="${i === 0 ? 'is-active' : ''}" src="${s.image}" loading="${i === 0 ? 'eager' : 'lazy'}" decoding="async" alt="${s.title}">`
      )
      .join('');
  }

  // ---------- El equipo ----------
  const teamMembers = get('teamMembers') || [];
  const teamList = document.querySelector('[data-team-list]');
  if (teamList && teamMembers.length) {
    teamList.innerHTML = teamMembers
      .map(
        (m) => `
        <li class="team__member reveal" data-reveal>
          <div class="team__photo-wrap" tabindex="0">
            <span class="team__number">${m.number}</span>
            <img class="team__photo" src="${m.photo}" loading="lazy" decoding="async" alt="${m.name}, ${m.role}">
            <div class="team__caption">
              <p class="team__name">${m.name}</p>
              <p class="team__role">${m.role}</p>
              <p class="team__bio">${m.bio}</p>
              ${m.instagram ? `<a class="team__instagram" href="${m.instagram}" target="_blank" rel="noopener">Instagram</a>` : ''}
            </div>
          </div>
        </li>`
      )
      .join('');
  }

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
