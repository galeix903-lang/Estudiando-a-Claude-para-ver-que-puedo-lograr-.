const express = require('express');
const { transaction } = require('../store');
const { requireAdmin } = require('./auth');

const router = express.Router();

router.get('/', (req, res) => {
  const business = transaction((data) => data.business);
  res.json(business);
});

router.put('/', requireAdmin, (req, res) => {
  const { name } = req.body || {};
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'El nombre del local es obligatorio' });
  }
  const business = transaction((data) => {
    data.business.name = name.trim();
    return data.business;
  });
  req.app.get('broadcast')('config:updated', business);
  res.json(business);
});

module.exports = router;
