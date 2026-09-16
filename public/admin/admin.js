const loginView = document.getElementById('loginView');
const adminView = document.getElementById('adminView');
const pinInput = document.getElementById('pinInput');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const businessNameInput = document.getElementById('businessNameInput');
const saveBusinessBtn = document.getElementById('saveBusinessBtn');
const servicesList = document.getElementById('servicesList');
const countersList = document.getElementById('countersList');
const newServiceName = document.getElementById('newServiceName');
const newServicePrefix = document.getElementById('newServicePrefix');
const addServiceBtn = document.getElementById('addServiceBtn');
const newCounterName = document.getElementById('newCounterName');
const addCounterBtn = document.getElementById('addCounterBtn');
const toastEl = document.getElementById('toast');

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
  if (role === 'admin') {
    loginView.style.display = 'none';
    adminView.style.display = 'block';
    logoutBtn.style.display = 'inline-block';
    await loadAll();
  } else {
    loginView.style.display = 'block';
    adminView.style.display = 'none';
    logoutBtn.style.display = 'none';
  }
}

loginBtn.addEventListener('click', doLogin);
pinInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') doLogin();
});

async function doLogin() {
  loginError.textContent = '';
  try {
    await api('/api/auth/login/admin', {
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

async function loadAll() {
  const [business, services, counters] = await Promise.all([
    api('/api/config'),
    api('/api/services'),
    api('/api/counters'),
  ]);
  businessNameInput.value = business.name || '';
  document.getElementById('business-name').textContent = business.name || 'Administracion';
  renderServices(services);
  renderCounters(counters);
}

saveBusinessBtn.addEventListener('click', async () => {
  try {
    await api('/api/config', {
      method: 'PUT',
      body: JSON.stringify({ name: businessNameInput.value }),
    });
    toast('Nombre guardado');
    document.getElementById('business-name').textContent = businessNameInput.value;
  } catch (err) {
    toast(err.message);
  }
});

function renderServices(services) {
  servicesList.innerHTML = '';
  services.forEach((service) => {
    const row = document.createElement('div');
    row.className = 'row';
    row.innerHTML = `
      <span class="name">${service.name} <span class="badge">${service.prefix}</span></span>
      <label style="display:flex;align-items:center;gap:0.35rem;font-size:0.85rem" class="muted">
        <input type="checkbox" ${service.active ? 'checked' : ''} /> activo
      </label>
      <button class="danger" style="padding:0.4rem 0.8rem">Borrar</button>
    `;
    const checkbox = row.querySelector('input');
    checkbox.addEventListener('change', async () => {
      try {
        await api(`/api/services/${service.id}`, {
          method: 'PUT',
          body: JSON.stringify({ active: checkbox.checked }),
        });
      } catch (err) {
        toast(err.message);
      }
    });
    row.querySelector('button').addEventListener('click', async () => {
      if (!confirm(`Borrar el servicio "${service.name}"?`)) return;
      try {
        await api(`/api/services/${service.id}`, { method: 'DELETE' });
        loadAll();
      } catch (err) {
        toast(err.message);
      }
    });
    servicesList.appendChild(row);
  });
}

function renderCounters(counters) {
  countersList.innerHTML = '';
  counters.forEach((counter) => {
    const row = document.createElement('div');
    row.className = 'row';
    row.innerHTML = `
      <span class="name">${counter.name}</span>
      <label style="display:flex;align-items:center;gap:0.35rem;font-size:0.85rem" class="muted">
        <input type="checkbox" ${counter.active ? 'checked' : ''} /> activo
      </label>
      <button class="danger" style="padding:0.4rem 0.8rem">Borrar</button>
    `;
    const checkbox = row.querySelector('input');
    checkbox.addEventListener('change', async () => {
      try {
        await api(`/api/counters/${counter.id}`, {
          method: 'PUT',
          body: JSON.stringify({ active: checkbox.checked }),
        });
      } catch (err) {
        toast(err.message);
      }
    });
    row.querySelector('button').addEventListener('click', async () => {
      if (!confirm(`Borrar el puesto "${counter.name}"?`)) return;
      try {
        await api(`/api/counters/${counter.id}`, { method: 'DELETE' });
        loadAll();
      } catch (err) {
        toast(err.message);
      }
    });
    countersList.appendChild(row);
  });
}

addServiceBtn.addEventListener('click', async () => {
  if (!newServiceName.value.trim() || !newServicePrefix.value.trim()) {
    toast('Completa nombre y prefijo');
    return;
  }
  try {
    await api('/api/services', {
      method: 'POST',
      body: JSON.stringify({ name: newServiceName.value, prefix: newServicePrefix.value }),
    });
    newServiceName.value = '';
    newServicePrefix.value = '';
    loadAll();
  } catch (err) {
    toast(err.message);
  }
});

addCounterBtn.addEventListener('click', async () => {
  if (!newCounterName.value.trim()) {
    toast('Completa el nombre del puesto');
    return;
  }
  try {
    await api('/api/counters', {
      method: 'POST',
      body: JSON.stringify({ name: newCounterName.value }),
    });
    newCounterName.value = '';
    loadAll();
  } catch (err) {
    toast(err.message);
  }
});

checkSession();
