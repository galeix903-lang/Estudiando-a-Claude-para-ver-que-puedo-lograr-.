# Sistema de llamadas

Sistema de turnos (tipo "toma número / ahora atendemos") reutilizable para
cualquier local: panadería, banco, consultorio, oficina pública, etc. No
tiene nada fijado al rubro: los servicios y los puestos de atención se
configuran desde la administración.

## Pantallas

- **`/kiosk`** — el cliente elige el servicio que necesita y saca un turno
  (por ejemplo `A-014`).
- **`/panel`** — el personal inicia sesión con un PIN, elige su puesto y
  llama al siguiente turno, lo vuelve a anunciar, lo finaliza o lo marca
  como "no se presentó".
- **`/display`** — pantalla pública (TV, monitor) que muestra qué turno se
  está atendiendo en cada puesto, con un historial de los últimos
  atendidos. Anuncia cada turno con un sonido y por voz (síntesis de voz
  del navegador).
- **`/admin`** — el encargado del local inicia sesión con un PIN distinto
  y configura el nombre del local, los servicios (con su prefijo, ej. `A`,
  `B`) y los puestos de atención.

Todo se sincroniza en tiempo real entre pantallas vía WebSocket
(Socket.IO): cuando el personal llama a un turno, la pantalla pública lo
muestra al instante sin recargar.

## Cómo ponerlo en marcha

```bash
npm install
cp .env.example .env   # y edita los PIN
npm start
```

Por defecto queda en `http://localhost:3000`. Abre `/kiosk`, `/panel`,
`/display` y `/admin` en las pantallas o dispositivos que correspondan
(por ejemplo el kiosco en una tablet en el mostrador, la pantalla pública
en una TV, y el panel en el ordenador de cada puesto).

## Configuración

Variables de entorno (`.env`, ver `.env.example`):

- `PORT`: puerto del servidor (por defecto `3000`).
- `STAFF_PIN`: PIN para entrar al panel de atención.
- `ADMIN_PIN`: PIN para entrar a la administración.
- `SESSION_SECRET`: clave para firmar la cookie de sesión.

Los datos (nombre del local, servicios, puestos y turnos del día) se
guardan en `data/db.json`, que se crea automáticamente la primera vez que
arranca el servidor con un servicio y un puesto de ejemplo. Los números
de turno se reinician todos los días por servicio (`A-001`, `A-002`, ...).

## Reutilizarlo para otro local

No hace falta tocar el código: desde `/admin` se cambia el nombre del
negocio, se añaden, borran o desactivan servicios (cada uno con su
prefijo de turno) y puestos de atención. El personal elige qué servicios
atiende cada vez que entra al panel, así que un mismo local puede tener
varios puestos atendiendo colas distintas a la vez.

## Estructura

```
server/           API en Express + Socket.IO
  routes/          auth, config, services, counters, tickets
  store.js         persistencia en data/db.json
public/
  kiosk/           sacar turno
  panel/           atención del personal
  display/         pantalla pública
  admin/           configuración del local
```
