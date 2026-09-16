const express = require('express');
const crypto = require('crypto');
const { transaction } = require('../store');
const { requireAdmin } = require('./auth');

const router = express.Router();

router.get('/', (req, res) => {
  const counters = transaction((data) => data.counters);
  res.json(counters);
});

router.post('/', requireAdmin, (req, res) => {
  const { name } = req.body || {};
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'El nombre del puesto es obligatorio' });
  }
  const counter = { id: crypto.randomUUID(), name: name.trim(), active: true };
  const counters = transaction((data) => {
    data.counters.push(counter);
    return data.counters;
  });
  req.app.get('broadcast')('counters:updated', counters);
  res.status(201).json(counter);
});

router.put('/:id', requireAdmin, (req, res) => {
  const { name, active } = req.body || {};
  const result = transaction((data) => {
    const counter = data.counters.find((c) => c.id === req.params.id);
    if (!counter) return null;
    if (name !== undefined) counter.name = name.trim();
    if (active !== undefined) counter.active = !!active;
    return { counter, all: data.counters };
  });
  if (!result) return res.status(404).json({ error: 'Puesto no encontrado' });
  req.app.get('broadcast')('counters:updated', result.all);
  res.json(result.counter);
});

router.delete('/:id', requireAdmin, (req, res) => {
  const counters = transaction((data) => {
    data.counters = data.counters.filter((c) => c.id !== req.params.id);
    return data.counters;
  });
  req.app.get('broadcast')('counters:updated', counters);
  res.json({ ok: true });
});

module.exports = router;
