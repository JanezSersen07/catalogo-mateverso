# Catálogo Mateverso
![Vista del catálogo](captura-catalogo.png)

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
