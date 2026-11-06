# Catálogo Mateverso

Catálogo de productos con buscador y filtros, hecho con **HTML, CSS y JavaScript** (sin librerías). Los productos y precios son de ejemplo.

🔗 **Ver online:** https://janezsersen07.github.io/catalogo-mateverso/

## Qué hace

- Carga los productos desde un archivo `productos.json` usando `fetch` y `async/await`.
- **Buscador** por nombre o descripción, que filtra mientras se escribe.
- **Filtro por categoría**: las opciones se generan solas a partir de los datos.
- Opción **"Solo con stock"**.
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
└── productos.json   Datos de ejemplo
```

## Cómo probarlo en tu compu

Como la página usa `fetch`, hay que abrirla desde un servidor local (no alcanza con doble clic en `index.html`). La forma más simple es instalar la extensión **Live Server** en VS Code y tocar **Go Live**.

## Autor

Janez · Estudiante de la Tecnicatura Universitaria en Programación (UTN Haedo)
