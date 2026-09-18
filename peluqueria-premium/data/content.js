/*
  Fuente única de datos — plantilla reutilizable.

  Todo lo que cambia de un cliente a otro (nombre, contacto, servicios,
  galería, equipo, reseñas, preguntas frecuentes) vive aquí, en un único
  objeto. js/render.js lee este archivo y rellena la web; el resto del
  código no contiene ningún dato de negocio "hardcodeado".

  Para adaptar la web a un negocio real: edita solo este archivo.
  No hace falta tocar index.html ni el CSS para cambiar textos, precios,
  fotos o datos de contacto.
*/
window.SITE_CONTENT = {
  business: {
    name: 'STUDIO NAME',
    shortName: 'STUDIO',
    tagline: 'Tu estilo. Tu identidad.',
    description:
      'Un espacio pensado para el detalle: cortes de precisión, color y tratamientos capilares, con una experiencia cuidada de principio a fin.',
    foundedYear: '20XX',
    city: '[Ciudad]',
  },

  hero: {
    headlineLine1: 'El corte que define',
    headlineLine2: 'tu estilo.',
    subline: 'Precisión · Estilo · Experiencia',
    ctaPrimary: 'Reservar cita',
    ctaSecondary: 'Ver servicios',
    image: 'img/hero.svg',
  },

  contact: {
    phoneDisplay: '+34 XXX XXX XXX',
    phoneHref: 'tel:+34600000000',
    whatsappNumber: '34600000000',
    instagramUrl: 'https://instagram.com/',
    instagramHandle: '@studioname',
    addressLine1: '[Dirección del local]',
    addressLine2: '[Código postal], [Ciudad]',
    mapsUrl: 'https://maps.google.com',
    hoursShort: 'L–V 09:00–20:00',
    hours: [
      { days: 'Lunes – Viernes', time: '09:00 – 20:00' },
      { days: 'Sábado', time: '10:00 – 15:00' },
      { days: 'Domingo', time: 'Cerrado' },
    ],
  },

  nav: [
    { label: 'Servicios', href: '#servicios' },
    { label: 'El estudio', href: '#estudio' },
    { label: 'El equipo', href: '#equipo' },
    { label: 'Galería', href: '#galeria' },
    { label: 'Opiniones', href: '#opiniones' },
    { label: 'Contacto', href: '#contacto' },
  ],

  pillars: [
    {
      number: '01',
      title: 'Precisión',
      text: 'Cada detalle importa.',
    },
    {
      number: '02',
      title: 'Estilo',
      text: 'Un resultado pensado para ti.',
    },
    {
      number: '03',
      title: 'Experiencia',
      text: 'Mucho más que sentarse en una silla.',
    },
  ],

  services: [
    {
      number: '01',
      name: 'Corte',
      description: 'Corte personalizado según forma de rostro y tipo de cabello.',
      price: '25 €',
      duration: '45 min',
      image: 'img/service-1.svg',
    },
    {
      number: '02',
      name: 'Corte + Barba',
      description: 'Corte de precisión combinado con arreglo de barba.',
      price: '35 €',
      duration: '60 min',
      image: 'img/service-2.svg',
    },
    {
      number: '03',
      name: 'Color',
      description: 'Color personalizado, mechas y matices.',
      price: 'Desde XX €',
      duration: '90 min',
      image: 'img/service-3.svg',
    },
    {
      number: '04',
      name: 'Tratamiento',
      description: 'Hidratación profunda y rituales capilares a medida.',
      price: 'Desde XX €',
      duration: '30 min',
      image: 'img/service-4.svg',
    },
  ],

  // Solo para el desplegable "Profesional" del asistente de reserva.
  // Para la sección "El equipo" (fotos, cargos, bio), ver `teamMembers`.
  team: [
    { id: 'sin-preferencia', name: 'Sin preferencia' },
    { id: 'profesional-01', name: 'Profesional 01' },
    { id: 'profesional-02', name: 'Profesional 02' },
    { id: 'profesional-03', name: 'Profesional 03' },
  ],

  studio: {
    eyebrow: 'El estudio',
    title: 'Un espacio creado para sentirte cómodo desde el primer momento.',
    text:
      'Diseñado para que cada visita sea un paréntesis de calma: luz natural, materiales cálidos y un equipo formado en técnica clásica y tendencia actual.',
    image: 'img/studio.svg',
  },

  impact: {
    eyebrow: '02',
    titleLine1: 'TU ESTILO.',
    titleLine2: 'TU IDENTIDAD.',
    text: 'Una experiencia diseñada alrededor de ti, de principio a fin.',
    image: 'img/impact.svg',
  },

  // Sección "Resultados": comparador antes/después. Cada entrada es una
  // transformación; añade o quita objetos para cambiar cuántas se muestran.
  transformations: [
    {
      beforeImage: 'img/before-1.svg',
      afterImage: 'img/after-1.svg',
      label: 'Corte + Styling',
      category: 'Corte',
    },
    {
      beforeImage: 'img/before-2.svg',
      afterImage: 'img/after-2.svg',
      label: 'Corte + Barba',
      category: 'Transformación',
    },
  ],

  // Sección "El equipo". No confundir con `team` (arriba): aquella es solo
  // la lista corta que alimenta el desplegable "Profesional" del asistente
  // de reserva; esta es la ficha editorial completa de cada persona.
  teamMembers: [
    {
      number: '01',
      name: 'STYLIST NAME',
      role: 'Senior Stylist',
      bio: 'Especialista en cortes y styling.',
      photo: 'img/team-1.svg',
      instagram: null,
    },
    {
      number: '02',
      name: 'STYLIST NAME',
      role: 'Colorist',
      bio: 'Especialista en color.',
      photo: 'img/team-2.svg',
      instagram: null,
    },
    {
      number: '03',
      name: 'STYLIST NAME',
      role: 'Barber',
      bio: 'Especialista en barba y afeitado clásico.',
      photo: 'img/team-3.svg',
      instagram: null,
    },
  ],

  // Sección "La experiencia": pasos que se resaltan según el scroll.
  experienceSteps: [
    {
      number: '01',
      title: 'RESERVA',
      text: 'Elige el servicio y el momento que mejor te convenga.',
      image: 'img/experience-1.svg',
    },
    {
      number: '02',
      title: 'LLEGA',
      text: 'Te recibimos en un espacio pensado para ti.',
      image: 'img/experience-2.svg',
    },
    {
      number: '03',
      title: 'TRANSFORMA',
      text: 'Nuestro equipo trabaja cada detalle.',
      image: 'img/experience-3.svg',
    },
    {
      number: '04',
      title: 'SAL',
      text: 'Un resultado pensado para ti.',
      image: 'img/experience-4.svg',
    },
  ],

  gallery: [
    { image: 'img/gallery-1.svg', label: 'Corte', span: 'tall' },
    { image: 'img/gallery-2.svg', label: 'Barba', span: 'normal' },
    { image: 'img/gallery-3.svg', label: 'Interior', span: 'wide' },
    { image: 'img/gallery-4.svg', label: 'Color', span: 'normal' },
    { image: 'img/gallery-5.svg', label: 'Styling', span: 'tall' },
    { image: 'img/gallery-6.svg', label: 'Detalle', span: 'normal' },
    { image: 'img/gallery-7.svg', label: 'Corte', span: 'wide' },
    { image: 'img/gallery-8.svg', label: 'Resultado', span: 'normal' },
  ],

  reviews: [
    { quote: '[Opinión del cliente]', name: '[Nombre del cliente]', rating: 5 },
    { quote: '[Opinión del cliente]', name: '[Nombre del cliente]', rating: 5 },
    { quote: '[Opinión del cliente]', name: '[Nombre del cliente]', rating: 5 },
    { quote: '[Opinión del cliente]', name: '[Nombre del cliente]', rating: 5 },
  ],

  faq: [
    {
      q: '¿Necesito reservar con antelación?',
      a: 'Recomendamos reservar con unos días de antelación, especialmente para fines de semana, aunque también atendemos citas de última hora según disponibilidad.',
    },
    {
      q: '¿Qué servicios ofrecéis?',
      a: 'Corte, corte y barba, color y tratamientos capilares. Puedes ver el detalle de cada uno en la sección de servicios.',
    },
    {
      q: '¿Puedo elegir profesional?',
      a: 'Sí, al reservar puedes seleccionar un profesional concreto o dejarlo sin preferencia y te asignaremos el primero disponible.',
    },
    {
      q: '¿Dónde está el estudio?',
      a: '[Dirección del local], [Ciudad]. Tienes el enlace a Google Maps en la sección de contacto.',
    },
    {
      q: '¿Cómo puedo cancelar o modificar mi cita?',
      a: 'Escríbenos por WhatsApp o llámanos con la mayor antelación posible y te ayudamos a reprogramarla.',
    },
  ],

  // Deja preparado el enlace a tu sistema de reservas real (Booksy,
  // Fresha, Treatwell...) cuando exista. Mientras tanto el formulario de
  // la web funciona en el cliente y queda pendiente de confirmación.
  bookingUrl: null,
};
