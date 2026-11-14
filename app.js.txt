// ---------- Referencias al HTML ----------
const catalogo = document.getElementById("catalogo");
const buscador = document.getElementById("buscador");
const selectCategoria = document.getElementById("categoria");
const contador = document.getElementById("contador");
const mensaje = document.getElementById("mensaje");

// ---------- Datos ----------
const URL_PRODUCTOS = "productos.json";
const WHATSAPP = "5492944671384";

let productos = []; // se llena cuando carga el JSON

// ---------- Cargar los productos con fetch ----------
async function cargarProductos() {
  try {
    const respuesta = await fetch(URL_PRODUCTOS);

    if (!respuesta.ok) {
      throw new Error("Error HTTP " + respuesta.status);
    }

    productos = await respuesta.json();
    cargarCategorias();
    mostrarProductos();
  } catch (error) {
    console.error(error);
    contador.textContent = "";
    mensaje.hidden = false;
    mensaje.textContent =
      "No se pudieron cargar los productos. Si abriste el archivo con doble clic, probá con un servidor local (Live Server) o desde la página publicada.";
  }
}

// ---------- Armar las opciones del select (con reduce) ----------
function cargarCategorias() {
  const categorias = productos.reduce((lista, producto) => {
    if (!lista.includes(producto.categoria)) {
      lista.push(producto.categoria);
    }
    return lista;
  }, []);

  const opciones = categorias.map((categoria) => {
    return `<option value="${categoria}">${categoria}</option>`;
  });

  selectCategoria.innerHTML += opciones.join("");
}

// ---------- Filtrar según lo que eligió el usuario (con filter) ----------
function filtrarProductos() {
  const texto = buscador.value.trim().toLowerCase();
  const categoria = selectCategoria.value;

  return productos.filter((producto) => {
    const coincideTexto =
      producto.nombre.toLowerCase().includes(texto) ||
      producto.subcategoria.toLowerCase().includes(texto) ||
      producto.variantes.join(" ").toLowerCase().includes(texto);
    const coincideCategoria =
      categoria === "todas" || producto.categoria === categoria;

    return coincideTexto && coincideCategoria;
  });
}

// ---------- Dar formato de precio argentino ----------
function formatearPrecio(numero) {
  return numero.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });
}

// ---------- Armar el link de WhatsApp (con la variante elegida, si hay) ----------
function armarLink(producto, variante) {
  const detalle = variante ? ` (${variante})` : "";
  const consulta = encodeURIComponent(
    `Hola Mateverso! Quiero consultar por: ${producto.nombre}${detalle}`
  );
  return `https://wa.me/${WHATSAPP}?text=${consulta}`;
}

// ---------- Armar el <img> de una foto (si no existe, se borra y queda el emoji) ----------
function crearImagen(ruta, texto) {
  return `<img src="${ruta}" alt="${texto}" loading="lazy" onerror="this.remove()">`;
}

// ---------- Armar el HTML de una tarjeta ----------
function crearTarjeta(producto) {
  const fotosVariantes = producto.fotosVariantes || {};

  // Si la variante tiene foto propia, el chip es un botón que cambia la imagen
  const variantes = producto.variantes
    .map((variante) => {
      if (fotosVariantes[variante]) {
        return `<button type="button" class="chip" data-variante="${variante}">${variante}</button>`;
      }
      return `<span class="chip">${variante}</span>`;
    })
    .join("");

  // Los productos con galería muestran un botón para ver los ejemplos
  const botonGaleria = producto.galeria
    ? `<button type="button" class="boton-galeria" data-galeria="${producto.slug}">
         Ver ${producto.galeria.length} ejemplos
       </button>`
    : "";

  return `
    <article class="tarjeta" data-slug="${producto.slug}">
      <div class="imagen">
        <span aria-hidden="true">🧉</span>
        ${crearImagen(producto.foto || `imagenes/${producto.slug}.jpg`, producto.nombre)}
      </div>
      <div class="info">
        <span class="categoria">${producto.subcategoria || producto.categoria}</span>
        <h2>${producto.nombre}</h2>
        <div class="variantes">${variantes}</div>
        ${botonGaleria}
        <p class="precio">${formatearPrecio(producto.precio)}</p>
        <a class="boton" href="${armarLink(producto)}" target="_blank" rel="noopener noreferrer">
          Consultar por WhatsApp
        </a>
      </div>
    </article>
  `;
}

// ---------- Mostrar en pantalla (con map) ----------
function mostrarProductos() {
  const filtrados = filtrarProductos();

  catalogo.innerHTML = filtrados.map(crearTarjeta).join("");

  contador.textContent =
    filtrados.length === 1
      ? "1 producto"
      : `${filtrados.length} productos`;

  if (filtrados.length === 0) {
    mensaje.hidden = false;
    mensaje.textContent = "No encontramos productos con esos filtros.";
  } else {
    mensaje.hidden = true;
  }
}

// ---------- Elegir una variante: cambia la foto y el mensaje de WhatsApp ----------
catalogo.addEventListener("click", (evento) => {
  const chip = evento.target.closest("button.chip");
  const botonGaleria = evento.target.closest("button.boton-galeria");

  if (chip) {
    const tarjeta = chip.closest(".tarjeta");
    const producto = productos.find((p) => p.slug === tarjeta.dataset.slug);
    const variante = chip.dataset.variante;

    tarjeta.querySelector(".imagen").innerHTML =
      `<span aria-hidden="true">🧉</span>` +
      crearImagen(producto.fotosVariantes[variante], `${producto.nombre} - ${variante}`);

    tarjeta.querySelectorAll("button.chip").forEach((otro) => {
      otro.classList.toggle("activo", otro === chip);
    });
    tarjeta.querySelector(".boton").href = armarLink(producto, variante);
  }

  if (botonGaleria) {
    abrirGaleria(productos.find((p) => p.slug === botonGaleria.dataset.galeria));
  }
});

// ---------- Galería de ejemplos (ventana <dialog>) ----------
const dialogo = document.getElementById("galeria");
const galeriaTitulo = document.getElementById("galeria-titulo");
const galeriaFotos = document.getElementById("galeria-fotos");

function abrirGaleria(producto) {
  galeriaTitulo.textContent = `${producto.nombre} - ejemplos`;
  galeriaFotos.innerHTML = producto.galeria
    .map((ruta, i) => crearImagen(ruta, `Ejemplo de grabado ${i + 1}`))
    .join("");
  dialogo.showModal();
}

document.getElementById("galeria-cerrar").addEventListener("click", () => dialogo.close());

// Click en el fondo oscuro también cierra
dialogo.addEventListener("click", (evento) => {
  if (evento.target === dialogo) {
    dialogo.close();
  }
});


// ---------- Eventos: se vuelve a filtrar cada vez que el usuario cambia algo ----------
buscador.addEventListener("input", mostrarProductos);
selectCategoria.addEventListener("change", mostrarProductos);

// ---------- Arranque ----------
cargarProductos();
