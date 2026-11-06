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

// ---------- Armar el HTML de una tarjeta ----------
function crearTarjeta(producto) {
  const consulta = encodeURIComponent(
    `Hola Mateverso! Quiero consultar por: ${producto.nombre}`
  );
  const link = `https://wa.me/${WHATSAPP}?text=${consulta}`;

  const variantes = producto.variantes
    .map((variante) => `<span>${variante}</span>`)
    .join("");

  // Si la foto no existe, onerror la borra y queda el emoji de fondo
  return `
    <article class="tarjeta">
      <div class="imagen">
        <span aria-hidden="true">🧉</span>
        <img src="imagenes/${producto.slug}.jpg" alt="${producto.nombre}"
             loading="lazy" onerror="this.remove()">
      </div>
      <div class="info">
        <span class="categoria">${producto.subcategoria || producto.categoria}</span>
        <h2>${producto.nombre}</h2>
        <div class="variantes">${variantes}</div>
        <p class="precio">${formatearPrecio(producto.precio)}</p>
        <a class="boton" href="${link}" target="_blank" rel="noopener noreferrer">
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

// ---------- Eventos: se vuelve a filtrar cada vez que el usuario cambia algo ----------
buscador.addEventListener("input", mostrarProductos);
selectCategoria.addEventListener("change", mostrarProductos);

// ---------- Arranque ----------
cargarProductos();