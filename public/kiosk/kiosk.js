const servicesEl = document.getElementById('services');
const errorEl = document.getElementById('error');
const picker = document.getElementById('picker');
const ticketView = document.getElementById('ticketView');
const ticketCode = document.getElementById('ticketCode');
const ticketService = document.getElementById('ticketService');
const ticketPending = document.getElementById('ticketPending');
const newTicketBtn = document.getElementById('newTicketBtn');

let services = [];
let pendingCounts = {};

async function loadConfig() {
  const config = await fetch('/api/config').then((r) => r.json());
  if (config && config.name) document.getElementById('business-name').textContent = config.name;
}

async function loadServices() {
  services = await fetch('/api/services').then((r) => r.json());
  renderServices();
}

async function loadState() {
  const state = await fetch('/api/tickets/state').then((r) => r.json());
  pendingCounts = state.pendingCounts || {};
  renderServices();
}

function renderServices() {
  servicesEl.innerHTML = '';
  services
    .filter((s) => s.active)
    .forEach((service) => {
      const btn = document.createElement('button');
      btn.className = 'service-btn secondary';
      const waiting = pendingCounts[service.id] || 0;
      btn.innerHTML = `${service.name}<br /><span class="muted" style="font-size:0.8rem">${waiting} en espera</span>`;
      btn.addEventListener('click', () => requestTicket(service.id));
      servicesEl.appendChild(btn);
    });
}

async function requestTicket(serviceId) {
  errorEl.textContent = '';
  const res = await fetch('/api/tickets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ serviceId }),
  });
  const data = await res.json();
  if (!res.ok) {
    errorEl.textContent = data.error || 'No se pudo generar el turno';
    return;
  }
  const service = services.find((s) => s.id === serviceId);
  ticketCode.textContent = data.code;
  ticketService.textContent = service ? service.name : '';
  ticketPending.textContent = String((pendingCounts[serviceId] || 1) - 1 >= 0 ? (pendingCounts[serviceId] || 1) : 0);
  picker.style.display = 'none';
  ticketView.style.display = 'block';
}

newTicketBtn.addEventListener('click', () => {
  ticketView.style.display = 'none';
  picker.style.display = 'block';
  loadState();
});

const socket = io();
socket.on('queue:updated', (state) => {
  pendingCounts = state.pendingCounts || {};
  renderServices();
});
socket.on('services:updated', (list) => {
  services = list;
  renderServices();
});
socket.on('config:updated', (business) => {
  if (business && business.name) document.getElementById('business-name').textContent = business.name;
});

loadConfig();
loadServices();
loadState();
