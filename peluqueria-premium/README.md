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
│   └── animations.css   Keyframes y scroll-reveal
├── js/
│   ├── main.js           Header dinámico, menú móvil, año del footer
│   ├── reveal.js         Animaciones al entrar en viewport
│   ├── gallery.js        Lightbox de la galería
│   ├── booking.js        Validación del formulario + enlace de WhatsApp
│   └── cursor.js         Cursor personalizado (solo escritorio)
└── img/                  Imágenes placeholder (sustituir, ver abajo)
```

## Qué personalizar antes de entregarla a un negocio real

### 1. Nombre e identidad
Busca **"NOIR"** / **"NOIR Studio"** en `index.html` (título, cabecera,
footer, JSON-LD) y sustitúyelo por el nombre real del negocio.

### 2. Color de marca
Todo el color pasa por las variables de `css/variables.css`. Para adaptar
la paleta a otra marca basta con tocar un puñado de valores, principalmente:

```css
--c-accent: #9C7A42;      /* color de acento (subrayados, iconos, precios) */
--c-accent-soft: #C6AD82;
--c-dark: #100E0B;         /* fondo de secciones oscuras (hero, footer, CTA) */
```

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

## Notas técnicas

- **Sin dependencias ni build**: HTML/CSS/JS vanilla, fácil de mantener
  por cualquier agencia o el propio negocio.
- **Rendimiento**: imágenes con `loading="lazy"` (excepto el hero),
  fuentes con `font-display: swap` y solo los pesos necesarios, sin
  librerías de animación externas (todo con CSS + `IntersectionObserver`).
- **Accesibilidad**: navegación por teclado en el menú móvil y el
  lightbox, `:focus-visible`, `prefers-reduced-motion` respetado en todas
  las animaciones, textos alternativos en imágenes.
- **SEO**: metadatos Open Graph, `title`/`description`, jerarquía de
  encabezados H1–H3 y datos estructurados `HairSalon` (schema.org) listos
  para rellenar con datos reales.
