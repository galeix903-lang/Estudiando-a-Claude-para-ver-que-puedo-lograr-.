const path = require('path');
const fs = require('fs');
const http = require('http');
const express = require('express');
const session = require('express-session');
const { Server } = require('socket.io');

const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
}

const { router: authRouter } = require('./routes/auth');
const configRouter = require('./routes/config');
const servicesRouter = require('./routes/services');
const countersRouter = require('./routes/counters');
const ticketsRouter = require('./routes/tickets');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'cambia-esta-clave',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 12 * 60 * 60 * 1000 },
});

app.use(express.json());
app.use(sessionMiddleware);
app.use(express.static(path.join(__dirname, '..', 'public')));

app.set('broadcast', (event, payload) => io.emit(event, payload));

app.use('/api/auth', authRouter);
app.use('/api/config', configRouter);
app.use('/api/services', servicesRouter);
app.use('/api/counters', countersRouter);
app.use('/api/tickets', ticketsRouter);

io.on('connection', () => {});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Sistema de llamadas escuchando en http://localhost:${PORT}`);
});
