#!/usr/bin/env python3
"""Genera el sitio publicado: copia el catálogo a _site/ y le suma
una página por producto (p/<slug>/), el sitemap.xml y la lista de enlaces del inicio.
Lo ejecuta GitHub Actions en cada push; no hace falta correrlo a mano."""
import json, shutil, sys
from datetime import date
from html import escape
from pathlib import Path
from urllib.parse import quote

BASE = "https://janezsersen07.github.io/catalogo-mateverso/"
WHATSAPP = "5492944671384"
RAIZ = Path(__file__).resolve().parent
SALIDA = RAIZ / "_site"
IGNORAR = shutil.ignore_patterns(".git", ".github", "_site", "__pycache__", "*.md", "*.ps1",
                                 "*.csv", "*.py", "captura-*.png", "*.txt")


def pesos(n):
    return "$" + f"{int(n):,}".replace(",", ".")


def json_seguro(obj):
    return json.dumps(obj, ensure_ascii=False).replace("</", "<\\/")


def url_foto(ruta):
    return BASE + quote(ruta, safe="/")


def descripcion(p):
    texto = f"{p['nombre']}, {p['categoria'].lower()} de Mateverso. {pesos(p['precio'])}."
    if p.get("variantes"):
        texto += " Variantes: " + ", ".join(p["variantes"]) + "."
    extra = " Por encargo, coordinamos por WhatsApp."
    if len(texto) + len(extra) <= 158:
        texto += extra
    return texto if len(texto) <= 158 else texto[:155].rstrip(" ,.") + "..."


def wa(texto):
    return f"https://wa.me/{WHATSAPP}?text={quote(texto, safe='')}"


def pagina_producto(p, todos):
    slug, nombre = p["slug"], p["nombre"]
    agotado = bool(p.get("agotado"))
    variantes = p.get("variantes") or []
    fotos_var = p.get("fotosVariantes") or {}
    foto = p.get("foto") or f"imagenes/{slug}.jpg"
    url = f"{BASE}p/{slug}/"
    desc = descripcion(p)
    titulo = f"{nombre} | Mateverso"

    imagenes = [foto] + [f for f in (p.get("galeria") or []) if f != foto][:5]
    ld = {
        "@context": "https://schema.org", "@type": "Product", "name": nombre, "sku": str(p["id"]),
        "description": desc, "category": p["categoria"],
        "image": [url_foto(f) for f in imagenes], "brand": {"@type": "Brand", "name": "Mateverso"},
        "offers": {"@type": "Offer", "url": url, "priceCurrency": "ARS", "price": str(int(p["precio"])),
                   "availability": "https://schema.org/OutOfStock" if agotado else "https://schema.org/InStock",
                   "seller": {"@type": "Organization", "name": "Mateverso"}},
    }
    migas = {
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Catálogo Mateverso", "item": BASE},
            {"@type": "ListItem", "position": 2, "name": nombre, "item": url}],
    }

    chips = ""
    if variantes:
        botones = []
        for i, v in enumerate(variantes):
            f = fotos_var.get(v, "")
            botones.append(
                f'<button type="button" class="chip" data-variante="{escape(v)}" '
                f'data-foto="{escape("../../" + f if f else "")}" aria-pressed="{"true" if i == 0 else "false"}">{escape(v)}</button>')
        chips = ('<p class="etiqueta" id="etiqueta-variante">Variante</p>'
                 '<div class="chips" role="group" aria-labelledby="etiqueta-variante">' + "".join(botones) + "</div>")

    miniaturas = ""
    extra = [f for f in imagenes[1:]]
    if extra:
        miniaturas = '<div class="miniaturas">' + "".join(
            f'<img src="../../{escape(f)}" alt="{escape(nombre)}" loading="lazy" width="72" height="72" tabindex="0">' for f in imagenes[:6]) + "</div>"

    insignias = ""
    if agotado:
        insignias += '<span class="insignia agotado">Agotado por ahora</span>'
    if p.get("popular") and not agotado:
        insignias += '<span class="insignia popular">Más pedido</span>'
    if p.get("verano"):
        insignias += '<span class="insignia verano">Verano</span>'

    if agotado:
        acciones = (f'<a class="boton principal" id="enlace-wa" target="_blank" rel="noopener noreferrer" '
                    f'href="{wa("Hola Mateverso! Quería saber si va a volver a haber: " + nombre)}">Avisame cuando vuelva</a>')
    else:
        acciones = (f'<a class="boton principal" id="enlace-wa" target="_blank" rel="noopener noreferrer" '
                    f'href="{wa("Hola Mateverso! Quiero consultar por: " + nombre)}">Consultar por WhatsApp</a>'
                    f'<a class="boton secundario" id="enlace-catalogo" href="../../?producto={quote(slug)}">Agregar a mi pedido</a>')

    relacionados = [q for q in todos if q["categoria"] == p["categoria"] and q["slug"] != slug][:6]
    rel_html = ""
    if relacionados:
        rel_html = ('<section class="relacionados"><h2>Más de ' + escape(p["categoria"]) + '</h2><ul>' + "".join(
            f'<li><a href="../{escape(q["slug"])}/"><img src="../../{escape(q.get("foto") or "imagenes/" + q["slug"] + ".jpg")}" '
            f'alt="" loading="lazy" width="120" height="120"><span>{escape(q["nombre"])}</span>'
            f'<strong>{pesos(q["precio"])}</strong></a></li>' for q in relacionados) + "</ul></section>")

    datos_js = json_seguro({"nombre": nombre, "slug": slug, "agotado": agotado})
    return f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{escape(titulo)}</title>
  <meta name="description" content="{escape(desc)}">
  <link rel="canonical" href="{url}">
  <meta property="og:type" content="product">
  <meta property="og:locale" content="es_AR">
  <meta property="og:site_name" content="Mateverso">
  <meta property="og:title" content="{escape(titulo)}">
  <meta property="og:description" content="{escape(desc)}">
  <meta property="og:url" content="{url}">
  <meta property="og:image" content="{url_foto(foto)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="theme-color" content="#243516">
  <link rel="icon" type="image/png" href="../../logo/favicon.png">
  <link rel="apple-touch-icon" href="../../logo/apple-touch-icon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600..800&family=DM+Sans:wght@400;500;700&display=swap">
  <link rel="stylesheet" href="../../producto.css?v=1">
  <script type="application/ld+json">{json_seguro(ld)}</script>
  <script type="application/ld+json">{json_seguro(migas)}</script>
</head>
<body>
  <header class="barra">
    <a class="marca" href="../../"><img src="../../logo/icono-claro.png" alt="" width="30" height="36"><span>Mateverso</span></a>
    <a class="volver" href="../../">Ver el catálogo</a>
  </header>
  <main class="ficha">
    <nav class="migas" aria-label="Ubicación"><a href="../../">Catálogo</a> / <span>{escape(p["categoria"])}</span></nav>
    <div class="ficha-grid">
      <div class="galeria">
        <div class="foto"><img id="foto-principal" src="../../{escape(foto)}" alt="{escape(nombre)}" width="640" height="640"></div>
        {miniaturas}
      </div>
      <div class="detalle">
        <div class="insignias">{insignias}</div>
        <h1>{escape(nombre)}</h1>
        <p class="precio">{pesos(p["precio"])}</p>
        {chips}
        <div class="acciones">{acciones}</div>
        <p class="nota">Trabajamos por encargo, con seña del 50%. Te confirmamos precio, disponibilidad y entrega por WhatsApp. Somos de Ciudad Evita.</p>
      </div>
    </div>
    {rel_html}
  </main>
  <footer class="pie">
    <a href="../../">Catálogo Mateverso</a> ·
    <a href="https://www.instagram.com/mateversoo_/" target="_blank" rel="noopener noreferrer">Instagram</a> ·
    <a href="https://www.tiktok.com/@mateversoo_" target="_blank" rel="noopener noreferrer">TikTok</a>
  </footer>
  <script>
    const P = {datos_js};
    const params = new URLSearchParams(location.search);
    const chips = [...document.querySelectorAll('.chip')];
    const foto = document.getElementById('foto-principal');
    const wa = document.getElementById('enlace-wa');
    const cat = document.getElementById('enlace-catalogo');
    function elegir(chip) {{
      chips.forEach(c => c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'));
      if (chip.dataset.foto) foto.src = chip.dataset.foto;
      const v = chip.dataset.variante;
      const base = P.agotado ? 'Hola Mateverso! Quería saber si va a volver a haber: ' : 'Hola Mateverso! Quiero consultar por: ';
      wa.href = 'https://wa.me/{WHATSAPP}?text=' + encodeURIComponent(base + P.nombre + ' (' + v + ')');
      if (cat) cat.href = '../../?producto=' + encodeURIComponent(P.slug) + '&variante=' + encodeURIComponent(v);
    }}
    chips.forEach(c => c.addEventListener('click', () => elegir(c)));
    document.querySelectorAll('.miniaturas img').forEach(m => {{
      const cambiar = () => {{ foto.src = m.src; }};
      m.addEventListener('click', cambiar);
      m.addEventListener('keydown', e => {{ if (e.key === 'Enter') cambiar(); }});
    }});
    const pedida = params.get('variante');
    const inicial = chips.find(c => c.dataset.variante === pedida);
    if (inicial) elegir(inicial); else if (chips.length) elegir(chips[0]);
  </script>
</body>
</html>
"""


def lista_enlaces(productos):
    grupos = {}
    for p in productos:
        grupos.setdefault(p["categoria"], []).append(p)
    partes = ['<nav class="todos-productos" aria-label="Todos los productos"><details>'
              '<summary>Ver la lista completa de productos</summary>']
    for cat, items in grupos.items():
        partes.append(f"<h3>{escape(cat)}</h3><ul>" + "".join(
            f'<li><a href="p/{escape(p["slug"])}/">{escape(p["nombre"])}</a></li>' for p in items) + "</ul>")
    partes.append("</details></nav>")
    return "".join(partes)


def main():
    productos = json.loads((RAIZ / "productos.json").read_text(encoding="utf-8"))
    slugs = [p["slug"] for p in productos]
    if len(set(slugs)) != len(slugs):
        repetidos = sorted({s for s in slugs if slugs.count(s) > 1})
        sys.exit("Hay slugs repetidos en productos.json: " + ", ".join(repetidos))

    if SALIDA.exists():
        shutil.rmtree(SALIDA)
    shutil.copytree(RAIZ, SALIDA, ignore=IGNORAR)

    for p in productos:
        carpeta = SALIDA / "p" / p["slug"]
        carpeta.mkdir(parents=True)
        (carpeta / "index.html").write_text(pagina_producto(p, productos), encoding="utf-8")

    hoy = date.today().isoformat()
    urls = [BASE] + [f"{BASE}p/{s}/" for s in slugs]
    sitemap = ('<?xml version="1.0" encoding="UTF-8"?>\n'
               '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
               "".join(f"  <url><loc>{escape(u)}</loc><lastmod>{hoy}</lastmod></url>\n" for u in urls) +
               "</urlset>\n")
    (SALIDA / "sitemap.xml").write_text(sitemap, encoding="utf-8")

    indice = SALIDA / "index.html"
    html = indice.read_text(encoding="utf-8")
    if "<!-- LISTA-PRODUCTOS -->" in html:
        html = html.replace("<!-- LISTA-PRODUCTOS -->", lista_enlaces(productos))
        indice.write_text(html, encoding="utf-8")

    print(f"Listo: {len(productos)} páginas de producto + sitemap en {SALIDA}")


if __name__ == "__main__":
    main()
