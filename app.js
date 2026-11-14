// ---------- Referencias al HTML ----------
const catalogo = document.getElementById("catalogo");
const buscador = document.getElementById("buscador");
const selectCategoria = document.getElementById("categoria");
const contador = document.getElementById("contador");
const mensaje = document.getElementById("mensaje");

// ---------- Datos ----------
const URL_PRODUCTOS = "productos.json";
const WHATSAPP = "5492944671384";
const CLAVE_PEDIDO = "pedidoMateverso";

let productos = []; // se llena cuando carga el JSON
let seleccion = {}; // variante elegida en cada tarjeta: { slug: "Negro" }
let pedido = leerPedido(); // [{ slug, variante, cantidad }]

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
    mostrarPedido();
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

// ---------- Armar el link de WhatsApp de una consulta (con la variante elegida, si hay) ----------
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
  const elegida = seleccion[producto.slug];
  const foto = fotosVariantes[elegida] || producto.foto || `imagenes/${producto.slug}.jpg`;

  // Cada variante es un botón: sirve para elegirla y, si tiene foto, cambia la imagen
  const variantes = producto.variantes
    .map((variante) => {
      const activo = variante === elegida ? " activo" : "";
      return `<button type="button" class="chip${activo}" data-variante="${variante}">${variante}</button>`;
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
        ${crearImagen(foto, producto.nombre)}
      </div>
      <div class="info">
        <span class="categoria">${producto.subcategoria || producto.categoria}</span>
        <h2>${producto.nombre}</h2>
        <div class="variantes">${variantes}</div>
        ${botonGaleria}
        <p class="precio">${formatearPrecio(producto.precio)}</p>
        <p class="aviso" role="alert" hidden></p>
        <button type="button" class="boton boton-agregar" data-agregar="${producto.slug}">
          Agregar al pedido
        </button>
        <a class="enlace-consulta" href="${armarLink(producto, elegida)}" target="_blank" rel="noopener noreferrer">
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

// =====================================================
//  PEDIDO (carrito): se guarda en el navegador
// =====================================================

// ---------- Leer y guardar el pedido en localStorage ----------
function leerPedido() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE_PEDIDO));
    return Array.isArray(guardado) ? guardado : [];
  } catch (error) {
    return []; // si el navegador no deja usar localStorage, se empieza vacío
  }
}

function guardarPedido() {
  try {
    localStorage.setItem(CLAVE_PEDIDO, JSON.stringify(pedido));
  } catch (error) {
    // si no se puede guardar, el pedido igual funciona mientras la página esté abierta
  }
}

// ---------- Agregar un producto (suma 1 si ya estaba con esa variante) ----------
function agregarAlPedido(producto, variante) {
  const existente = pedido.find(
    (item) => item.slug === producto.slug && item.variante === variante
  );

  if (existente) {
    existente.cantidad = Math.min(existente.cantidad + 1, 99);
  } else {
    pedido.push({ slug: producto.slug, variante: variante, cantidad: 1 });
  }

  guardarPedido();
  mostrarPedido();
}

// ---------- Armar la lista del pedido con los datos actuales de cada producto ----------
// Los precios se leen del JSON cada vez, así que si cambian, el pedido se actualiza solo.
function detallarPedido() {
  return pedido
    .map((item) => {
      const producto = productos.find((p) => p.slug === item.slug);
      return producto ? { ...item, producto: producto } : null;
    })
    .filter((item) => item !== null);
}

function calcularTotal(detalle) {
  return detalle.reduce(
    (total, item) => total + item.producto.precio * item.cantidad,
    0
  );
}

// ---------- Referencias del pedido ----------
const botonPedido = document.getElementById("boton-pedido");
const cantidadPedido = document.getElementById("cantidad-pedido");
const dialogoPedido = document.getElementById("pedido");
const listaPedido = document.getElementById("pedido-lista");
const totalPedido = document.getElementById("pedido-total");
const enviarPedido = document.getElementById("pedido-enviar");
const vaciarPedido = document.getElementById("pedido-vaciar");

// ---------- Dibujar el pedido ----------
function mostrarPedido() {
  const detalle = detallarPedido();
  const unidades = detalle.reduce((suma, item) => suma + item.cantidad, 0);

  cantidadPedido.textContent = unidades;
  botonPedido.hidden = unidades === 0 && !dialogoPedido.open;

  if (detalle.length === 0) {
    listaPedido.innerHTML = `<li class="pedido-vacio">Todavía no agregaste productos.</li>`;
    totalPedido.textContent = formatearPrecio(0);
    enviarPedido.setAttribute("aria-disabled", "true");
    enviarPedido.removeAttribute("href");
    vaciarPedido.hidden = true;
    return;
  }

  listaPedido.innerHTML = detalle
    .map((item, indice) => {
      const variante = item.variante ? ` (${item.variante})` : "";
      return `
        <li class="pedido-item">
          <div class="pedido-datos">
            <strong>${item.producto.nombre}${variante}</strong>
            <span>${formatearPrecio(item.producto.precio * item.cantidad)}</span>
          </div>
          <div class="pedido-cantidad">
            <button type="button" data-restar="${indice}" aria-label="Quitar una unidad">−</button>
            <span>${item.cantidad}</span>
            <button type="button" data-sumar="${indice}" aria-label="Sumar una unidad">+</button>
            <button type="button" class="pedido-quitar" data-quitar="${indice}">Quitar</button>
          </div>
        </li>`;
    })
    .join("");

  totalPedido.textContent = formatearPrecio(calcularTotal(detalle));
  enviarPedido.removeAttribute("aria-disabled");
  enviarPedido.href = armarLinkPedido(detalle);
  vaciarPedido.hidden = false;
}

// ---------- Armar el mensaje de WhatsApp con todo el pedido ----------
function armarLinkPedido(detalle) {
  const lineas = detalle.map((item) => {
    const variante = item.variante ? ` (${item.variante})` : "";
    const subtotal = formatearPrecio(item.producto.precio * item.cantidad);
    return `- ${item.cantidad} x ${item.producto.nombre}${variante} - ${subtotal}`;
  });

  const texto = [
    "Hola Mateverso! Quiero hacer este pedido por encargo:",
    "",
    ...lineas,
    "",
    `Total estimado: ${formatearPrecio(calcularTotal(detalle))}`,
    "",
    "¿Qué día de retiro tenés disponible?",
  ].join("\n");

  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;
}

// ---------- Eventos del pedido ----------
botonPedido.addEventListener("click", () => dialogoPedido.showModal());
document.getElementById("pedido-cerrar").addEventListener("click", () => dialogoPedido.close());

// Al cerrar la ventana, si el pedido quedó vacío se vuelve a esconder el botón
dialogoPedido.addEventListener("close", mostrarPedido);

// Click en el fondo oscuro también cierra
dialogoPedido.addEventListener("click", (evento) => {
  if (evento.target === dialogoPedido) {
    dialogoPedido.close();
  }
});

vaciarPedido.addEventListener("click", () => {
  pedido = [];
  guardarPedido();
  mostrarPedido();
});

// Sumar, restar y quitar productos dentro del pedido
listaPedido.addEventListener("click", (evento) => {
  const detalle = detallarPedido();
  const boton = evento.target.closest("button");
  if (!boton) return;

  const sumar = boton.dataset.sumar;
  const restar = boton.dataset.restar;
  const quitar = boton.dataset.quitar;

  // El índice del detalle puede diferir del de "pedido" si un producto ya no existe
  const buscar = (indice) =>
    pedido.find(
      (item) =>
        item.slug === detalle[indice].slug && item.variante === detalle[indice].variante
    );

  if (sumar !== undefined) {
    const item = buscar(sumar);
    item.cantidad = Math.min(item.cantidad + 1, 99);
  } else if (restar !== undefined) {
    const item = buscar(restar);
    item.cantidad -= 1;
    if (item.cantidad <= 0) pedido = pedido.filter((otro) => otro !== item);
  } else if (quitar !== undefined) {
    const item = buscar(quitar);
    pedido = pedido.filter((otro) => otro !== item);
  } else {
    return;
  }

  guardarPedido();
  mostrarPedido();
});

// =====================================================
//  CLICKS EN EL CATÁLOGO: variantes, agregar y galería
// =====================================================
catalogo.addEventListener("click", (evento) => {
  const chip = evento.target.closest("button.chip");
  const botonAgregar = evento.target.closest("button.boton-agregar");
  const botonGaleria = evento.target.closest("button.boton-galeria");

  // Elegir una variante: cambia la foto (si tiene) y el mensaje de consulta
  if (chip) {
    const tarjeta = chip.closest(".tarjeta");
    const producto = productos.find((p) => p.slug === tarjeta.dataset.slug);
    const variante = chip.dataset.variante;
    const fotosVariantes = producto.fotosVariantes || {};

    seleccion[producto.slug] = variante;

    if (fotosVariantes[variante]) {
      tarjeta.querySelector(".imagen").innerHTML =
        `<span aria-hidden="true">🧉</span>` +
        crearImagen(fotosVariantes[variante], `${producto.nombre} - ${variante}`);
    }

    tarjeta.querySelectorAll("button.chip").forEach((otro) => {
      otro.classList.toggle("activo", otro === chip);
    });
    tarjeta.querySelector(".aviso").hidden = true;
    tarjeta.querySelector(".enlace-consulta").href = armarLink(producto, variante);
  }

  // Agregar al pedido: si tiene variantes, hay que elegir una antes
  if (botonAgregar) {
    const tarjeta = botonAgregar.closest(".tarjeta");
    const producto = productos.find((p) => p.slug === tarjeta.dataset.slug);
    const variante = seleccion[producto.slug] || "";

    if (producto.variantes.length > 0 && !variante) {
      const aviso = tarjeta.querySelector(".aviso");
      aviso.textContent = "Elegí una variante antes de agregar.";
      aviso.hidden = false;
      return;
    }

    agregarAlPedido(producto, variante);
    botonAgregar.textContent = "Agregado ✓";
    setTimeout(() => (botonAgregar.textContent = "Agregar al pedido"), 1200);
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
