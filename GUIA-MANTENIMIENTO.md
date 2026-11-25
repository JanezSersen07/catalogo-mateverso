# Guía de mantenimiento del catálogo Mateverso

Todo el catálogo sale del archivo `productos.json`. No hay que tocar `app.js`, `index.html` ni `style.css` para cambiar productos o precios.

Después de cualquier cambio, siempre se termina igual (en PowerShell, dentro de la carpeta del repo):

```powershell
git add .
git commit -m "Describo el cambio"
git push
```

Y se espera 1 o 2 minutos a que se actualice GitHub Pages (si ves lo viejo, Ctrl+F5).

> Consejo: antes de subir, abrí el catálogo con Live Server en VS Code para ver que todo anda.

---

## 1. Cambiar un precio

1. Abrí `productos.json` en VS Code.
2. Buscá el producto con Ctrl+F por el nombre (ej: `Yerba Baldo 1kg`).
3. Cambiá el número de `"precio"`. Va **sin puntos ni signo $**:

```json
"precio": 13500,
```

4. Guardá y hacé el `git add .`, `commit` y `push` de arriba.

---

## 2. Borrar un producto

1. En `productos.json` buscá el producto.
2. Seleccioná **todo el bloque** desde la llave `{` de arriba hasta su llave `}` de cierre, incluida la coma que lo separa del siguiente.
3. Borralo.

Ojo con las comas: entre bloques va una coma, pero **el último bloque de la lista no lleva coma al final**. Si borrás el último, sacale la coma al que quedó último.

Las fotos de ese producto pueden quedar en `imagenes/`; no molestan. Si querés limpiar, borrá los archivos con su nombre (`slug`).

---

## 3. Agregar un producto

### Paso A: la foto

**Tamaño de la foto:** no hace falta una medida exacta. La página muestra la foto entera sobre fondo blanco, sin deformarla ni recortarla, así que cualquier proporción entra (cuadrada, vertical u horizontal). Lo único que importa es el peso: una foto del celular pesa varios MB y hace lenta la página, por eso se achica a unos 900 px de lado y se guarda como JPG. Las cuadradas con fondo claro son las que mejor se ven.

1. Achicá la foto a unos 900 px de lado y guardala como JPG. Podés hacerlo con cualquier editor, o con el script (ver más abajo).
2. Ponele el nombre del `slug` del producto y guardala en la carpeta `imagenes/`. El `slug` es el nombre en minúsculas, sin tildes ni símbolos y con guiones. Ejemplo: `yerba-nueva-1kg.jpg`.

### Achicar varias fotos nuevas con el script

Sirve para preparar muchas fotos de una vez (por ejemplo, los productos de verano):

1. Creá un archivo de texto `fotos-nuevas.csv` en la carpeta del repo, con este formato (separado por punto y coma, la primera línea es fija):

```
archivo;destino
IMG_1234.jpg;imagenes/mate-verano-1.jpg
IMG_1235.jpg;imagenes/bombilla-verano-1.jpg
```

   `archivo` es el nombre de la foto original (el script la busca en todas las subcarpetas de la carpeta de origen) y `destino` es el nombre final con el `slug`.

2. En PowerShell, dentro de la carpeta del repo:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\preparar-fotos.ps1 -Origen "C:\Users\janez\Pictures\EMPRENDIMIENTO\PRODUCTOS" -Plan ".\fotos-nuevas.csv"
```

3. Las fotos achicadas quedan en `imagenes/`. Las originales no se tocan. Si alguna no se encuentra, el script la lista al final.

### Paso B: el bloque en el JSON

Copiá un bloque parecido que ya exista, pegalo al final de la lista (sin olvidar la coma del bloque anterior) y cambiá los datos:

```json
{
  "id": 170,
  "slug": "yerba-nueva-1kg",
  "nombre": "Yerba Nueva 1kg",
  "categoria": "Yerbas",
  "subcategoria": "1kg",
  "precio": 15000,
  "variantes": [],
  "foto": "imagenes/yerba-nueva-1kg.jpg"
}
```

Qué significa cada campo:

| Campo | Qué poner |
|---|---|
| `id` | Un número que no se repita. Usá el siguiente al más alto que haya (ahora el último es 180). |
| `slug` | Nombre en minúsculas, sin tildes, con guiones. Tiene que ser único. |
| `nombre` | El nombre que se ve en la tarjeta. |
| `categoria` | Una categoría que ya exista, escrita igual (ej: `Yerbas`, `Bombillas`). Si escribís una nueva, aparece sola en el filtro. |
| `subcategoria` | Texto chico que se ve arriba del nombre. Si no tiene, poné `""`. |
| `precio` | Número, sin puntos. |
| `variantes` | Lista de colores o diseños entre comillas, ej: `["Negro", "Marrón"]`. Sin variantes: `[]`. |
| `foto` | Ruta de la foto principal. |

### Si tiene variantes con foto propia

Agregá `fotosVariantes`, con una foto por variante. Al tocar el botón de esa variante, cambia la imagen:

```json
"variantes": ["Negro", "Marrón"],
"foto": "imagenes/matera-nueva--negro.jpg",
"fotosVariantes": {
  "Negro": "imagenes/matera-nueva--negro.jpg",
  "Marrón": "imagenes/matera-nueva--marron.jpg"
}
```

Las variantes que no estén en `fotosVariantes` se ven como etiqueta, sin botón.

### Productos de la sección Verano

Para que un producto aparezca también en la sección **Verano** (además de en su categoría), agregá `"verano": true` en su bloque:

```json
"precio": 6000,
"verano": true,
"foto": "imagenes/yerba-nueva.jpg"
```

El botón "Verano" aparece solo mientras haya algún producto con ese campo. Cuando termine la temporada, borrá esa línea de los productos (o ponele `false`) y el botón desaparece.

---

## 3b. Agregar o cambiar la foto de un producto

- **Foto principal:** poné la foto nueva en `imagenes/`. Si usás el mismo nombre que la vieja, la reemplaza sin tocar el JSON. Si usás otro nombre, actualizá el campo `"foto"` del producto.
- **Foto de una variante:** agregá o editá `fotosVariantes` con una foto por variante (ver ejemplo arriba). Al tocar el botón de la variante, cambia la imagen.
- Achicá la foto antes (unos 900 px, JPG) para que la página cargue rápido.
- Si cambiaste una foto con el mismo nombre y seguís viendo la vieja, refrescá con Ctrl + F5: el navegador guarda la anterior.

---

## 3c. Marcar un producto como agotado

No hace falta borrarlo. En el bloque del producto agregá `"agotado": true` (con coma en la línea anterior):

```json
"precio": 15000,
"agotado": true,
"foto": "imagenes/yerba-nueva-1kg.jpg"
```

Qué pasa en la página:

- La tarjeta se ve atenuada, con la etiqueta "Agotado", y pasa al final de la lista.
- No se puede agregar al pedido. En su lugar aparece "Consultar si vuelve", que abre WhatsApp con el producto (y la variante elegida).
- Si alguien ya lo tenía en su pedido, deja de contarse.

Cuando vuelve a haber stock, borrá esa línea (o poné `false`) y subí el cambio.

---

## 4. Errores típicos del JSON

- **Falta una coma** entre bloques, o **sobra** una después del último. Es el error más común.
- **Comillas dobles** `"` siempre; las comillas simples `'` no sirven.
- **Una llave `{` o `}` sin cerrar.**
- Si el catálogo queda vacío o dice "No se pudieron cargar los productos", casi seguro es una coma o una comilla. VS Code subraya en rojo el lugar del error.
- Para revisar que el archivo esté bien: abrilo en VS Code y mirá que no haya subrayados rojos, o pegalo en https://jsonlint.com.

Si algo se rompe y no lo encontrás, podés volver atrás con `git checkout productos.json` (deshace los cambios que todavía no guardaste en un commit).

## Páginas de producto y Google

No tenés que hacer nada extra: al subir los cambios (`git push`), GitHub genera solo la página de cada producto y el sitemap. Tarda 1 o 2 minutos en publicarse; podés ver el avance en la pestaña **Actions** del repositorio (un tilde verde significa que ya está en línea).

- Si el tilde sale **rojo**, hacé clic en esa ejecución para ver el error. Lo más común es un `slug` repetido en `productos.json` (el mensaje te dice cuál).
- El `slug` de cada producto es parte de su link (`.../p/<slug>/`). Si lo cambiás, el link viejo deja de funcionar, así que conviene no tocarlo una vez que lo compartiste.
