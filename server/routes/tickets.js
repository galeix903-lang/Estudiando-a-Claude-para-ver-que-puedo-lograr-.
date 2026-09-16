const express = require('express');
const crypto = require('crypto');
const { transaction, todayKey } = require('../store');
const { requireStaff } = require('./auth');

const router = express.Router();

function ticketsOfToday(data) {
  const day = todayKey();
  return data.tickets.filter((t) => t.day === day);
}

function publicState(data) {
  const today = ticketsOfToday(data);
  const calling = today
    .filter((t) => t.status === 'called')
    .sort((a, b) => (a.calledAt < b.calledAt ? 1 : -1));
  const recentlyDone = today
    .filter((t) => t.status === 'done')
    .sort((a, b) => (a.completedAt < b.completedAt ? 1 : -1))
    .slice(0, 8);
  const pendingCounts = {};
  for (const service of data.services) {
    pendingCounts[service.id] = today.filter(
      (t) => t.serviceId === service.id && t.status === 'pending'
    ).length;
  }
  return {
    calling,
    recentlyDone,
    pendingCounts,
    services: data.services,
    counters: data.counters,
    business: data.business,
  };
}

router.get('/state', (req, res) => {
  const state = transaction((data) => publicState(data));
  res.json(state);
});

router.post('/', (req, res) => {
  const { serviceId } = req.body || {};
  const result = transaction((data) => {
    const service = data.services.find((s) => s.id === serviceId && s.active);
    if (!service) return null;
    const day = todayKey();
    const countToday = data.tickets.filter(
      (t) => t.serviceId === serviceId && t.day === day
    ).length;
    const number = countToday + 1;
    const ticket = {
      id: crypto.randomUUID(),
      serviceId,
      number,
      code: `${service.prefix}-${String(number).padStart(3, '0')}`,
      status: 'pending',
      counterId: null,
      day,
      createdAt: new Date().toISOString(),
      calledAt: null,
      completedAt: null,
    };
    data.tickets.push(ticket);
    return { ticket, state: publicState(data) };
  });
  if (!result) return res.status(400).json({ error: 'Servicio invalido' });
  req.app.get('broadcast')('queue:updated', result.state);
  res.status(201).json(result.ticket);
});

router.get('/queue', requireStaff, (req, res) => {
  const pending = transaction((data) =>
    ticketsOfToday(data)
      .filter((t) => t.status === 'pending')
      .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1))
  );
  res.json(pending);
});

router.post('/next', requireStaff, (req, res) => {
  const { counterId, serviceIds } = req.body || {};
  const result = transaction((data) => {
    const counter = data.counters.find((c) => c.id === counterId);
    if (!counter) return { error: 'Puesto invalido' };
    const candidates = ticketsOfToday(data)
      .filter((t) => t.status === 'pending')
      .filter((t) => !serviceIds || !serviceIds.length || serviceIds.includes(t.serviceId))
      .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));
    const ticket = candidates[0];
    if (!ticket) return { error: 'No hay turnos pendientes' };
    ticket.status = 'called';
    ticket.counterId = counterId;
    ticket.calledAt = new Date().toISOString();
    return { ticket, state: publicState(data) };
  });
  if (result.error) return res.status(400).json({ error: result.error });
  req.app.get('broadcast')('ticket:called', result.ticket);
  req.app.get('broadcast')('queue:updated', result.state);
  res.json(result.ticket);
});

router.post('/:id/recall', requireStaff, (req, res) => {
  const ticket = transaction((data) =>
    data.tickets.find((t) => t.id === req.params.id && t.status === 'called')
  );
  if (!ticket) return res.status(404).json({ error: 'Turno no encontrado o ya finalizado' });
  req.app.get('broadcast')('ticket:called', ticket);
  res.json(ticket);
});

router.post('/:id/complete', requireStaff, (req, res) => {
  const result = transaction((data) => {
    const ticket = data.tickets.find((t) => t.id === req.params.id);
    if (!ticket || ticket.status !== 'called') return null;
    ticket.status = 'done';
    ticket.completedAt = new Date().toISOString();
    return { ticket, state: publicState(data) };
  });
  if (!result) return res.status(404).json({ error: 'Turno no encontrado o no esta en atencion' });
  req.app.get('broadcast')('ticket:done', result.ticket);
  req.app.get('broadcast')('queue:updated', result.state);
  res.json(result.ticket);
});

router.post('/:id/no-show', requireStaff, (req, res) => {
  const result = transaction((data) => {
    const ticket = data.tickets.find((t) => t.id === req.params.id);
    if (!ticket || ticket.status !== 'called') return null;
    ticket.status = 'no_show';
    ticket.completedAt = new Date().toISOString();
    return { ticket, state: publicState(data) };
  });
  if (!result) return res.status(404).json({ error: 'Turno no encontrado o no esta en atencion' });
  req.app.get('broadcast')('ticket:done', result.ticket);
  req.app.get('broadcast')('queue:updated', result.state);
  res.json(result.ticket);
});

router.get('/today', requireStaff, (req, res) => {
  const today = transaction((data) => ticketsOfToday(data));
  res.json(today);
});

module.exports = router;
