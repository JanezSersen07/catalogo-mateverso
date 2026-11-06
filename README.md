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

## Estado del proyecto

Prototipo funcional. Próximos pasos:
- Cargar las fotos de todos los productos
- Agregar ordenamiento por precio
- Conectar los datos a una base de datos en lugar de un archivo JSON
- 
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
