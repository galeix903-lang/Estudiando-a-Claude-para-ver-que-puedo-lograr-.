# NOIR Studio — Plantilla premium para peluquería / barbería

Web de una sola página (HTML + CSS + JS, sin frameworks ni build) pensada
para presentarse como demo a un negocio real y quedar lista para producción
cambiando solo textos, imágenes y algunos datos. No requiere `npm install`
ni compilación: son ficheros estáticos.

## Ver la web en local

Cualquier servidor estático sirve. Por ejemplo:

```bash
cd peluqueria-premium
python3 -m http.server 8080
# abre http://localhost:8080
```

(Abrir `index.html` directamente con doble clic también funciona, pero
algunos navegadores restringen `fetch`/módulos en `file://`; se recomienda
usar un servidor local.)

## Estructura

```
peluqueria-premium/
├── index.html          Toda la maquetación y el contenido (una sola página)
├── css/
│   ├── variables.css    Tokens de diseño: color, tipografía, espaciados
│   ├── base.css         Reset, tipografía global, utilidades, cursor
│   ├── layout.css        Header, navegación, menú móvil, botones, formulario
│   ├── sections.css     Estilos de cada sección
│   ├── animations.css   Keyframes y scroll-reveal
│   └── intro.css        Overlay de la introducción 3D (ver más abajo)
├── js/
│   ├── main.js           Header dinámico, menú móvil, año del footer
│   ├── reveal.js         Animaciones al entrar en viewport
│   ├── gallery.js        Lightbox de la galería
│   ├── collection.js     Carrusel de la colección + panel de detalle
│   ├── booking.js        Validación del formulario + enlace de WhatsApp
│   ├── cursor.js         Cursor personalizado (solo escritorio)
│   ├── intro.js          Orquestador de la introducción (siempre se carga)
│   ├── intro-scene.js    Escena 3D de la introducción (solo se descarga
│   │                     si hace falta, ver más abajo)
│   └── vendor/three.module.min.js   Three.js, autoalojado (ver más abajo)
└── img/                  Imágenes placeholder (sustituir, ver abajo)
```

## Qué personalizar antes de entregarla a un negocio real

### 1. Nombre e identidad
Busca **"NOIR"** / **"NOIR Studio"** en `index.html` (título, cabecera,
footer, JSON-LD) y sustitúyelo por el nombre real del negocio.

### 2. Color de marca
Identidad actual: **beauty premium**, delicada y femenina — rosa
empolvado, vainilla y blanco como base, con un marrón cálido reservado a
pequeños detalles (botones, textos importantes, iconos, bordes,
navegación, hover). El marrón nunca se usa como fondo de sección grande.

Todo el color pasa por las variables de `css/variables.css`:

```css
--c-white: #FFFFFF;
--c-rose: #F3DDE1;       /* rosa muy claro — color principal, fondos de sección */
--c-vanilla: #F8F1DF;    /* vainilla claro — segundo color principal */
--c-brown: #6B5145;      /* marrón cálido — uso mínimo y deliberado */
--c-brown-soft: #A88F82; /* marrón claro secundario, texto suave */
```

Las secciones alternan entre blanco, rosa y vainilla (ver los `background`
en `css/sections.css`, sección por sección) para crear ritmo visual sin
saturar. La sección "Colección" se mantiene siempre en blanco a propósito:
es el fondo neutro que deja que los colores de cada estilo sean los
protagonistas.

### 3. Textos y datos marcados como placeholder
Busca en `index.html` las marcas `[PERSONALIZAR]` y los textos entre
corchetes, por ejemplo:

- `[Ciudad]`, `[Dirección del local]`, `[Código postal]`, `[Horario]`,
  `[Teléfono del local]`
- Precios `Desde XX €` → sustituir por las tarifas reales
- Estadísticas de la sección "Sobre nosotros" (`+XX años`, `+X.XXX
  clientes`, etc.) → son datos de ejemplo, no reales
- Testimonios `[Testimonio real del cliente]` / `[Nombre del cliente]` →
  sustituir por reseñas reales (Google, Instagram) con permiso del cliente
- El bloque `application/ld+json` (datos estructurados SEO) al final del
  `<head>`: nombre, teléfono, dirección y horario reales

### 4. Imágenes (`/img`)
Todas las imágenes son placeholders vectoriales (`.svg`) generados
localmente, con su nombre y proporción recomendada indicados dentro de la
propia imagen. Sustitúyelas por fotografías reales **manteniendo el mismo
nombre de archivo y una proporción similar** para que el diseño no se
descuadre:

| Archivo | Uso | Proporción recomendada |
|---|---|---|
| `hero.svg` | Fondo de la portada | 16:10, ancha, alta calidad |
| `about.svg` | Sección "Sobre nosotros" | 4:5 vertical |
| `experience-1/2/3.svg` | Sección "Más que un corte" | 4:5 vertical |
| `gallery-1…8.svg` | Galería (masonry) | variable, ver nombre del archivo |
| `wig-01-blonde.svg` … `wig-11-ash-blonde.svg` | Sección "Encuentra tu estilo" (colección) | 3:4 vertical, **las 11 con el mismo encuadre e iluminación** |

Recomendaciones: fotografías propias del local (nunca imágenes genéricas
haciéndolas pasar por reales), formato `.jpg`/`.webp` optimizado, peso
ideal por debajo de 300 KB por imagen. Si cambias la extensión (por
ejemplo a `.jpg`), actualiza también el `src` correspondiente en
`index.html`.

Para la colección de pelucas en concreto, procura que las 11 fotos (o las
que uses) compartan fondo, distancia y luz — es lo que hace que la
colección se sienta ordenada y "de marca" en lugar de una tienda genérica.
Cada tarjeta lleva además `data-name`, `data-color` y `data-desc` en
`index.html`: son los textos que se muestran al abrir el detalle de cada
estilo, y se editan ahí mismo.

### 5. WhatsApp
En `js/booking.js`, primera línea de la función:

```js
const WHATSAPP_NUMBER = '34600000000'; // [PERSONALIZAR]
```

Formato internacional, sin espacios ni símbolo `+`.

### 6. Horario de reserva
También en `js/booking.js`, el array de franjas horarias (`HOURS`) genera
citas de 9:00 a 19:30 cada 30 min por defecto. Ajusta el rango a los
horarios reales del negocio.

### 7. Mapa de Google
En `index.html`, dentro de `<section class="location">`, hay un bloque de
marcador de posición (`.location__map-placeholder`) y, justo encima en un
comentario, el `<iframe>` real listo para pegar con la URL de Google Maps
Embed de la dirección del negocio.

### 8. Backend de reservas
El formulario de `#reserva` valida y funciona en el cliente, y deja
preparada (comentada) la llamada `fetch()` a un endpoint `/api/reservations`
dentro de `js/booking.js`. Conecta ahí tu backend real (o un servicio como
un CRM/calendario) cuando exista.

### 9. Aviso legal / política de privacidad
Los enlaces del footer y del formulario ("Aviso legal", "Política de
privacidad") apuntan a `#` y deben enlazar a las páginas legales reales del
negocio.

### 10. Introducción 3D ("Entrar en la peluquería")
Al entrar por primera vez aparece una intro a pantalla completa: un busto
estilizado con cabello y unas tijeras (geometría 3D generada por código,
sin modelos ni texturas), que el usuario "corta" con un clic, arrastre,
scroll o toque — y la web hace una transición al Hero. No vuelve a
aparecer en visitas siguientes (se recuerda en `localStorage`), tiene un
botón **"Saltar introducción"** siempre visible y responde a `Esc`, y hay
un enlace discreto **"Ver introducción"** en el footer para repetirla.

En **móvil, dispositivos táctiles o de gama más modesta** se sustituye
automáticamente por una versión ligera en SVG + CSS con la misma idea
(mismo busto, mismo cabello, mismas tijeras cortando), sin cargar Three.js
en absoluto. La lógica de decisión está al principio de `js/intro.js`
(`shouldUseThree()`): ajusta ahí los umbrales si quieres ser más o menos
exigente.

Qué tocar para personalizarla:
- **Colores**: la escena 3D (`js/intro-scene.js`) y la versión ligera
  (el `<svg>` dentro de `#intro` en `index.html`) usan los mismos tonos
  que el resto de la web (vainilla, marrón, rosa de fondo). Si cambias la
  paleta en `css/variables.css`, actualiza también los códigos de color
  hexadecimales de esos dos sitios (los `<canvas>`/`<svg>` no leen
  variables CSS).
- **Textos**: el nombre del negocio y el texto de invitación
  ("Haz clic para entrar") están en el bloque `<div class="intro" ...>`
  de `index.html`, justo después del `skip-link`.
- **Duración**: `MAX_WAIT_MS` (tiempo máximo de espera sin interactuar) y
  los tiempos de las transiciones están al principio de `js/intro.js`.
- **Desactivarla del todo**: borra o comenta el bloque `<div class="intro" ...>`
  en `index.html` y su `<script src="js/intro.js">`; el resto de la web
  no depende de ella.

**Sobre `js/vendor/three.module.min.js`**: es la única dependencia externa
de toda la plantilla (el resto es HTML/CSS/JS sin librerías). Va
autoalojada a propósito, no desde un CDN, para que la web no dependa de un
tercero en tiempo de ejecución. Solo se descarga (mediante `import()`
dinámico) cuando `js/intro.js` decide usar la versión 3D — en móvil, con
`prefers-reduced-motion`, o en visitas repetidas, no se descarga nunca.
Pesa ~670 KB sin comprimir (~165 KB con gzip/brotli, que casi cualquier
hosting aplica automáticamente); si actualizas la librería, vuelve a
generar el fichero con `npm install three@<versión> --prefix /tmp/three &&
cp /tmp/three/node_modules/three/build/three.module.min.js js/vendor/`.

## Notas técnicas

- **Prácticamente sin dependencias ni build**: HTML/CSS/JS vanilla, fácil
  de mantener por cualquier agencia o el propio negocio. La única
  excepción es Three.js, autoalojado y usado solo por la introducción 3D
  (ver el punto 10 de personalización) — el resto de la web no lo
  necesita para nada.
- **Rendimiento**: imágenes con `loading="lazy"` (excepto el hero),
  fuentes con `font-display: swap`, sin librerías de animación externas
  (todo con CSS + `IntersectionObserver`), y la introducción 3D con carga
  perezosa (`import()` dinámico) solo cuando hace falta.
- **Accesibilidad**: navegación por teclado en el menú móvil y el
  lightbox, `:focus-visible`, `prefers-reduced-motion` respetado en todas
  las animaciones, textos alternativos en imágenes.
- **SEO**: metadatos Open Graph, `title`/`description`, jerarquía de
  encabezados H1–H3 y datos estructurados `HairSalon` (schema.org) listos
  para rellenar con datos reales.
