const express = require('express');
const crypto = require('crypto');
const { transaction } = require('../store');
const { requireAdmin } = require('./auth');

const router = express.Router();

router.get('/', (req, res) => {
  const services = transaction((data) => data.services);
  res.json(services);
});

router.post('/', requireAdmin, (req, res) => {
  const { name, prefix } = req.body || {};
  if (!name || !name.trim() || !prefix || !prefix.trim()) {
    return res.status(400).json({ error: 'Nombre y prefijo son obligatorios' });
  }
  const service = {
    id: crypto.randomUUID(),
    name: name.trim(),
    prefix: prefix.trim().toUpperCase().slice(0, 3),
    active: true,
  };
  const services = transaction((data) => {
    data.services.push(service);
    return data.services;
  });
  req.app.get('broadcast')('services:updated', services);
  res.status(201).json(service);
});

router.put('/:id', requireAdmin, (req, res) => {
  const { name, prefix, active } = req.body || {};
  const result = transaction((data) => {
    const service = data.services.find((s) => s.id === req.params.id);
    if (!service) return null;
    if (name !== undefined) service.name = name.trim();
    if (prefix !== undefined) service.prefix = prefix.trim().toUpperCase().slice(0, 3);
    if (active !== undefined) service.active = !!active;
    return { service, all: data.services };
  });
  if (!result) return res.status(404).json({ error: 'Servicio no encontrado' });
  req.app.get('broadcast')('services:updated', result.all);
  res.json(result.service);
});

router.delete('/:id', requireAdmin, (req, res) => {
  const services = transaction((data) => {
    data.services = data.services.filter((s) => s.id !== req.params.id);
    return data.services;
  });
  req.app.get('broadcast')('services:updated', services);
  res.json({ ok: true });
});

module.exports = router;
