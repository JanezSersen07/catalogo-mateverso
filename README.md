# Catálogo Mateverso

Catálogo online de **Mateverso**, mi emprendimiento de mates, con buscador y filtro por categoría. Hecho con **HTML, CSS y JavaScript** (sin librerías). Muestra más de 160 productos reales.

🔗 **Ver online:** https://janezsersen07.github.io/catalogo-mateverso/

## Qué hace

- Carga los productos desde un archivo `productos.json` usando `fetch` y `async/await`.
- **Buscador** por nombre, subcategoría o variante (color, modelo), que filtra mientras se escribe.
- **Filtro por categoría**: las opciones se generan solas a partir de los datos.
- Fotos de cada producto, con un respaldo si todavía no hay foto cargada.
- Variantes de cada producto (colores, modelos) como etiquetas.
- Contador de resultados y mensaje cuando no hay coincidencias.
- Botón de consulta por WhatsApp con el nombre del producto ya escrito en el mensaje.
- Diseño adaptable a celular y escritorio (CSS Grid).

## Conceptos de JavaScript que practiqué

- `fetch` + `async/await` + manejo de errores con `try/catch`
- `filter` para aplicar los filtros combinados
- `map` para generar las tarjetas
- `reduce` para obtener las categorías sin repetir
- Eventos (`input`, `change`) y manipulación del DOM
- Formato de moneda con `toLocaleString`

## Estructura

```
catalogo-mateverso/
├── index.html       Estructura de la página
├── style.css        Estilos
├── app.js           Lógica (carga, filtros, render)
├── productos.json   Datos de los productos
└── imagenes/        Fotos (un archivo por producto, nombrado con su slug)
```

## Cómo probarlo en tu compu

Como la página usa `fetch`, hay que abrirla desde un servidor local (no alcanza con doble clic en `index.html`). La forma más simple es instalar la extensión **Live Server** en VS Code y tocar **Go Live**.

## Autor

Janez · Estudiante de la Tecnicatura Universitaria en Programación (UTN Haedo)


## Fotos de los productos

Cada producto muestra su foto desde `imagenes/`. Los campos nuevos de `productos.json`:

- `foto`: foto principal de la tarjeta.
- `fotosVariantes`: foto por variante (color, diseño). Esas variantes se ven como botones: al tocarlas cambia la imagen y el mensaje de WhatsApp incluye la variante elegida.
- `galeria`: lista de fotos de ejemplo (la usa "Grabado Predeterminado", con el botón "Ver ejemplos").

Si una foto no existe, la tarjeta muestra el emoji de mate en su lugar.

### Preparar las fotos

Las fotos originales son pesadas, así que `preparar-fotos.ps1` las copia y achica (máx. 900 px, JPG) con los nombres que usa el catálogo, según `plan-fotos.csv`. Los originales no se modifican.

```powershell
.\preparar-fotos.ps1 -Origen "C:\ruta\a\PRODUCTOS" -Prueba   # prueba con 3 fotos
.\preparar-fotos.ps1 -Origen "C:\ruta\a\PRODUCTOS"           # todas
```

## Pedido por WhatsApp

Mateverso trabaja por encargo, así que el catálogo permite armar un pedido y enviarlo por WhatsApp:

- Cada tarjeta tiene "Agregar al pedido". Si el producto tiene variantes (color, diseño), hay que elegir una antes.
- El botón flotante "Mi pedido" abre el detalle: se puede sumar, restar o quitar productos, y muestra el total estimado.
- "Enviar pedido por WhatsApp" abre el chat con el mensaje armado (productos, variantes, cantidades, total y la consulta por el día de retiro).
- El pedido se guarda en el navegador (`localStorage`), así que no se pierde si se cierra la página.
- Los precios se leen de `productos.json` cada vez, por lo que si cambian, el pedido se actualiza solo.
- El pedido no cobra ni controla stock: es un mensaje armado. El pago, la disponibilidad y el día de retiro se coordinan por WhatsApp.

## Diseño

- Paleta basada en la marca: verde yerba profundo, papel crema y un acento bronce (como las bombillas de alpaca/bronce).
- La franja de rombos debajo de la portada es una guarda tradicional dibujada con CSS (un SVG embebido).
- Los filtros quedan fijos arriba al hacer scroll; las categorías son botones que se deslizan en celular.
- Grilla de 2 columnas en celular y de 4 en pantallas grandes; mientras cargan los productos se ven tarjetas de espera.
- El pedido aparece como hoja desde abajo en celular. Respeta `prefers-reduced-motion` y tiene foco visible para navegar con teclado.
- Tipografías: Bricolage Grotesque (títulos y precios) y DM Sans (texto), desde Google Fonts.

La carpeta `logo/` tiene el logo de Mateverso en versión clara (para fondos oscuros) y verde (para fondos claros), el ícono solo y el favicon. Se generaron a partir del logo original, quitándole el fondo de papel para que tengan transparencia.
