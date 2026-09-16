const express = require('express');

const router = express.Router();

const STAFF_PIN = process.env.STAFF_PIN || '1234';
const ADMIN_PIN = process.env.ADMIN_PIN || 'admin';

router.post('/login/staff', (req, res) => {
  const { pin } = req.body || {};
  if (pin !== STAFF_PIN) {
    return res.status(401).json({ error: 'PIN incorrecto' });
  }
  req.session.role = 'staff';
  res.json({ ok: true });
});

router.post('/login/admin', (req, res) => {
  const { pin } = req.body || {};
  if (pin !== ADMIN_PIN) {
    return res.status(401).json({ error: 'PIN incorrecto' });
  }
  req.session.role = 'admin';
  res.json({ ok: true });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

router.get('/session', (req, res) => {
  res.json({ role: req.session.role || null });
});

function requireStaff(req, res, next) {
  if (req.session.role === 'staff' || req.session.role === 'admin') return next();
  res.status(401).json({ error: 'Necesitas iniciar sesion como personal' });
}

function requireAdmin(req, res, next) {
  if (req.session.role === 'admin') return next();
  res.status(401).json({ error: 'Necesitas iniciar sesion como administrador' });
}

module.exports = { router, requireStaff, requireAdmin };
