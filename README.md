# Sistema de llamadas

Sistema de turnos (tipo "toma numero / ahora atendemos") reutilizable para cualquier
local: panaderia, banco, consultorio, oficina publica, etc. No tiene nada
hardcodeado del rubro: los servicios y los puestos de atencion se configuran
desde la administracion.

## Pantallas

- **`/kiosk`** — el cliente elige el servicio que necesita y saca un turno
  (por ejemplo `A-014`).
- **`/panel`** — el personal inicia sesion con un PIN, elige su puesto y
  llama al siguiente turno, lo re-anuncia, lo finaliza o lo marca como
  "no se presento".
- **`/display`** — pantalla publica (TV, monitor) que muestra que turno
  esta siendo atendido en cada puesto, con un historial de los ultimos
  atendidos. Anuncia cada turno con un sonido y por voz (sintesis de voz
  del navegador).
- **`/admin`** — el encargado del local inicia sesion con un PIN distinto
  y configura el nombre del local, los servicios (con su prefijo, ej. `A`,
  `B`) y los puestos de atencion.

Todo se sincroniza en tiempo real entre pantallas via WebSocket
(Socket.IO): cuando el personal llama a un turno, la pantalla publica lo
muestra al instante sin recargar.

## Como correrlo

```bash
npm install
cp .env.example .env   # y edita los PIN
npm start
```

Por defecto queda en `http://localhost:3000`. Abri `/kiosk`, `/panel`,
`/display` y `/admin` en las pantallas o dispositivos que corresponda
(por ejemplo el kiosco en una tablet en el mostrador, la pantalla publica
en una TV, y el panel en la computadora de cada puesto).

## Configuracion

Variables de entorno (`.env`, ver `.env.example`):

- `PORT`: puerto del servidor (default `3000`).
- `STAFF_PIN`: PIN para entrar al panel de atencion.
- `ADMIN_PIN`: PIN para entrar a la administracion.
- `SESSION_SECRET`: clave para firmar la cookie de sesion.

Los datos (nombre del local, servicios, puestos y turnos del dia) se
guardan en `data/db.json`, que se crea automaticamente la primera vez que
arranca el servidor con un servicio y un puesto de ejemplo. Los numeros
de turno se reinician todos los dias por servicio (`A-001`, `A-002`, ...).

## Reutilizar para otro local

No hace falta tocar el codigo: desde `/admin` se cambia el nombre del
negocio, se agregan/borran/desactivan servicios (cada uno con su prefijo
de turno) y puestos de atencion. El personal elige que servicios atiende
cada vez que entra al panel, asi que un mismo local puede tener varios
puestos atendiendo distintas colas en simultaneo.

## Estructura

```
server/           API en Express + Socket.IO
  routes/          auth, config, services, counters, tickets
  store.js         persistencia en data/db.json
public/
  kiosk/           sacar turno
  panel/           atencion del personal
  display/         pantalla publica
  admin/           configuracion del local
```
