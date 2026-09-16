const callingGrid = document.getElementById('callingGrid');
const historyList = document.getElementById('historyList');
const clockEl = document.getElementById('clock');
const businessNameEl = document.getElementById('business-name');

let counters = [];
let services = [];

function updateClock() {
  clockEl.textContent = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}
setInterval(updateClock, 1000 * 15);
updateClock();

function counterName(id) {
  const c = counters.find((c) => c.id === id);
  return c ? c.name : '';
}

function serviceName(id) {
  const s = services.find((s) => s.id === id);
  return s ? s.name : '';
}

function renderState(state) {
  counters = state.counters || counters;
  services = state.services || services;
  if (state.business && state.business.name) businessNameEl.textContent = state.business.name;

  if (!state.calling || !state.calling.length) {
    callingGrid.innerHTML = '<div class="empty">Todavía no hay turnos en atención</div>';
  } else {
    callingGrid.innerHTML = '';
    state.calling.forEach((ticket) => {
      const card = document.createElement('div');
      card.className = 'calling-card';
      card.dataset.ticketId = ticket.id;
      card.innerHTML = `
        <div class="counter">${counterName(ticket.counterId)}</div>
        <div class="code">${ticket.code}</div>
        <div class="muted">${serviceName(ticket.serviceId)}</div>
      `;
      callingGrid.appendChild(card);
    });
  }

  historyList.innerHTML = (state.recentlyDone || [])
    .map(
      (t) => `<div class="history-item"><span>${t.code}</span><span>${serviceName(t.serviceId)}</span></div>`
    )
    .join('');
}

function flashCard(ticketId) {
  const card = callingGrid.querySelector(`[data-ticket-id="${ticketId}"]`);
  if (card) {
    card.classList.remove('flash');
    void card.offsetWidth;
    card.classList.add('flash');
  }
}

function beepThenSpeak(text) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
    osc.onended = () => ctx.close();
  } catch (e) {
    // el navegador puede bloquear audio sin interacción previa; se ignora
  }
  if ('speechSynthesis' in window) {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'es-ES';
    utter.rate = 0.95;
    setTimeout(() => window.speechSynthesis.speak(utter), 450);
  }
}

async function loadInitialState() {
  const state = await fetch('/api/tickets/state').then((r) => r.json());
  renderState(state);
}

const socket = io();
socket.on('queue:updated', renderState);
socket.on('ticket:called', (ticket) => {
  fetch('/api/tickets/state')
    .then((r) => r.json())
    .then((state) => {
      renderState(state);
      flashCard(ticket.id);
      const text = `Turno ${ticket.code.split('').join(' ')}, dirigirse a ${counterName(ticket.counterId)}`;
      beepThenSpeak(text);
    });
});
socket.on('config:updated', (business) => {
  if (business && business.name) businessNameEl.textContent = business.name;
});

fetch('/api/config').then((r) => r.json()).then((c) => {
  if (c && c.name) businessNameEl.textContent = c.name;
});

loadInitialState();
