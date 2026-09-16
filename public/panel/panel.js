const loginView = document.getElementById('loginView');
const setupView = document.getElementById('setupView');
const workView = document.getElementById('workView');
const pinInput = document.getElementById('pinInput');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const whoami = document.getElementById('whoami');
const counterSelect = document.getElementById('counterSelect');
const serviceChecks = document.getElementById('serviceChecks');
const startBtn = document.getElementById('startBtn');
const changeCounterBtn = document.getElementById('changeCounterBtn');
const counterLabel = document.getElementById('counterLabel');
const currentCode = document.getElementById('currentCode');
const currentService = document.getElementById('currentService');
const actionsEl = document.getElementById('actions');
const statsEl = document.getElementById('stats');
const toastEl = document.getElementById('toast');

let counters = [];
let services = [];
let myCounterId = localStorage.getItem('panel.counterId') || null;
let myServiceIds = JSON.parse(localStorage.getItem('panel.serviceIds') || '[]');
let currentTicket = null;

function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  setTimeout(() => toastEl.classList.remove('show'), 2200);
}

async function api(url, options) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Error inesperado');
  return data;
}

async function checkSession() {
  const { role } = await api('/api/auth/session');
  if (role === 'staff' || role === 'admin') {
    whoami.textContent = role === 'admin' ? 'Administrador' : 'Personal';
    logoutBtn.style.display = 'inline-block';
    loginView.style.display = 'none';
    await loadCountersAndServices();
    if (myCounterId && counters.some((c) => c.id === myCounterId)) {
      showWorkView();
    } else {
      showSetupView();
    }
  } else {
    loginView.style.display = 'block';
    setupView.style.display = 'none';
    workView.style.display = 'none';
    logoutBtn.style.display = 'none';
    whoami.textContent = '';
  }
}

loginBtn.addEventListener('click', doLogin);
pinInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') doLogin();
});

async function doLogin() {
  loginError.textContent = '';
  try {
    await api('/api/auth/login/staff', {
      method: 'POST',
      body: JSON.stringify({ pin: pinInput.value }),
    });
    pinInput.value = '';
    await checkSession();
  } catch (err) {
    loginError.textContent = err.message;
  }
}

logoutBtn.addEventListener('click', async () => {
  await api('/api/auth/logout', { method: 'POST' });
  checkSession();
});

async function loadCountersAndServices() {
  counters = await api('/api/counters');
  services = await api('/api/services');
}

function showSetupView() {
  setupView.style.display = 'block';
  workView.style.display = 'none';
  counterSelect.innerHTML = counters
    .filter((c) => c.active)
    .map((c) => `<option value="${c.id}">${c.name}</option>`)
    .join('');
  if (myCounterId) counterSelect.value = myCounterId;
  serviceChecks.innerHTML = services
    .map(
      (s) => `
      <label class="service-check">
        <input type="checkbox" value="${s.id}" ${myServiceIds.includes(s.id) ? 'checked' : ''} />
        ${s.name}
      </label>`
    )
    .join('');
}

startBtn.addEventListener('click', () => {
  myCounterId = counterSelect.value;
  myServiceIds = Array.from(serviceChecks.querySelectorAll('input:checked')).map((i) => i.value);
  localStorage.setItem('panel.counterId', myCounterId);
  localStorage.setItem('panel.serviceIds', JSON.stringify(myServiceIds));
  showWorkView();
});

changeCounterBtn.addEventListener('click', () => {
  showSetupView();
  workView.style.display = 'none';
});

function showWorkView() {
  setupView.style.display = 'none';
  workView.style.display = 'block';
  const counter = counters.find((c) => c.id === myCounterId);
  counterLabel.textContent = counter ? counter.name : 'Puesto';
  currentTicket = null;
  renderCurrent();
  refreshQueueStats();
}

function serviceName(id) {
  const s = services.find((s) => s.id === id);
  return s ? s.name : '';
}

function renderCurrent() {
  if (currentTicket && currentTicket.status === 'called') {
    currentCode.textContent = currentTicket.code;
    currentService.textContent = serviceName(currentTicket.serviceId);
    actionsEl.innerHTML = '';
    actionsEl.appendChild(makeBtn('Re-llamar', 'secondary', recallCurrent));
    actionsEl.appendChild(makeBtn('Finalizar', '', completeCurrent));
    actionsEl.appendChild(makeBtn('No se presento', 'danger', noShowCurrent));
  } else {
    currentCode.textContent = '--';
    currentService.textContent = 'Sin turno en atención';
    actionsEl.innerHTML = '';
    actionsEl.appendChild(makeBtn('Llamar siguiente', '', callNext));
  }
}

function makeBtn(label, cls, handler) {
  const btn = document.createElement('button');
  btn.textContent = label;
  if (cls) btn.className = cls;
  btn.addEventListener('click', handler);
  return btn;
}

async function callNext() {
  try {
    currentTicket = await api('/api/tickets/next', {
      method: 'POST',
      body: JSON.stringify({ counterId: myCounterId, serviceIds: myServiceIds }),
    });
    renderCurrent();
  } catch (err) {
    toast(err.message);
  }
}

async function recallCurrent() {
  if (!currentTicket) return;
  try {
    await api(`/api/tickets/${currentTicket.id}/recall`, { method: 'POST' });
    toast('Turno re-anunciado');
  } catch (err) {
    toast(err.message);
  }
}

async function completeCurrent() {
  if (!currentTicket) return;
  try {
    await api(`/api/tickets/${currentTicket.id}/complete`, { method: 'POST' });
    currentTicket = null;
    renderCurrent();
  } catch (err) {
    toast(err.message);
  }
}

async function noShowCurrent() {
  if (!currentTicket) return;
  try {
    await api(`/api/tickets/${currentTicket.id}/no-show`, { method: 'POST' });
    currentTicket = null;
    renderCurrent();
  } catch (err) {
    toast(err.message);
  }
}

async function refreshQueueStats() {
  const state = await api('/api/tickets/state');
  statsEl.innerHTML = services
    .map(
      (s) => `<div class="stat"><span>${s.name}</span><strong>${state.pendingCounts[s.id] || 0}</strong></div>`
    )
    .join('');
}

const socket = io();
socket.on('queue:updated', () => {
  if (workView.style.display === 'block') refreshQueueStats();
});
socket.on('config:updated', (business) => {
  if (business && business.name) document.getElementById('business-name').textContent = business.name;
});

fetch('/api/config').then((r) => r.json()).then((c) => {
  if (c && c.name) document.getElementById('business-name').textContent = c.name;
});

checkSession();
