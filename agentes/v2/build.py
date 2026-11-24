"""Arma reel/index.html: incrusta los 8 avatares + isotipo + logotipo con ids prefijados.
Uso: python build.py   (lee ../vectores y ../../brand-ms-nuevo/svgs)"""
import re, os

HERE = os.path.dirname(os.path.abspath(__file__))
VEC = os.path.join(HERE, "..", "..", "vectores")
BRAND = os.path.join(HERE, "..", "..", "..", "brand-ms-nuevo", "svgs")

# Centro y tamaño del objeto dentro de cada SVG (medidos en el render de referencia)
AV = {
    "catalina": (960, 965, 1280), "teo": (962, 900, 1170), "sara": (1000, 940, 1240),
    "alma": (960, 945, 1060), "noelia": (965, 960, 1290), "dalia": (975, 990, 1250),
    "lia": (968, 942, 1170), "clara": (962, 940, 1110),
}

# Versiones planas (silueta + sonrisa) derivadas de la guía de personajes, viewBox 0 0 200 200
FLAT = {
    "catalina": '<g transform="translate(10 8) scale(.9)"><rect x="30" y="35" width="66" height="66" rx="18"/><rect x="104" y="30" width="66" height="66" rx="18"/><rect x="30" y="108" width="66" height="66" rx="18"/><rect x="104" y="104" width="66" height="70" rx="18"/></g>',
    "teo": '<polygon points="100,18 162,56 172,128 114,184 50,152 32,80" stroke-linejoin="round"/>',
    "sara": '<path d="M80 30h40a8 8 0 0 1 8 8v34h34a8 8 0 0 1 8 8v40a8 8 0 0 1-8 8h-34v34a8 8 0 0 1-8 8H80a8 8 0 0 1-8-8v-34H38a8 8 0 0 1-8-8V80a8 8 0 0 1 8-8h34V38a8 8 0 0 1 8-8z"/>',
    "alma": '<path d="M36 104C28 58 84 24 132 38c44 14 50 64 30 100-22 40-74 46-100 22-15-13-22-32-26-56z"/>',
    "noelia": '<path d="M100 14C108 66 134 92 186 100 134 108 108 134 100 186 92 134 66 108 14 100 66 92 92 66 100 14z"/>',
    "dalia": '<polygon points="100,22 168,60 168,140 100,178 32,140 32,60"/>',
    "lia": '<path d="M48 40h104a22 22 0 0 1 22 22v64a22 22 0 0 1-22 22H98l-34 30v-30H48a22 22 0 0 1-22-22V62a22 22 0 0 1 22-22z"/>',
    "clara": '<path d="M56 26h62l38 38v100a12 12 0 0 1-12 12H56a12 12 0 0 1-12-12V38a12 12 0 0 1 12-12z"/>',
}
FLAT_SMILE = {"lia": "M78 92Q100 112 122 92", "catalina": "M80 112Q100 132 120 112"}


def prefix_ids(svg, p):
    svg = re.sub(r'id="([^"]+)"', lambda m: f'id="{p}-{m.group(1)}"', svg)
    svg = re.sub(r'url\(#([^)]+)\)', lambda m: f'url(#{p}-{m.group(1)})', svg)
    svg = re.sub(r'href="#([^"]+)"', lambda m: f'href="#{p}-{m.group(1)}"', svg)
    return svg


def inner(svg):
    svg = re.sub(r"<title>.*?</title>", "", svg, flags=re.S)
    return svg[svg.index(">", svg.index("<svg")) + 1: svg.rindex("</svg>")]


def avatar(name):
    cx, cy, size = AV[name]
    side = size * 1.32
    vb = f"{cx - side/2:.0f} {cy - side/2:.0f} {side:.0f} {side:.0f}"
    body = prefix_ids(inner(open(os.path.join(VEC, f"{name}.svg"), encoding="utf-8").read()), name)
    flat = FLAT[name]
    sm = FLAT_SMILE.get(name, "M78 110Q100 130 122 110")
    return f'''<div class="av" id="av-{name}">
  <svg class="flat" viewBox="-32 -32 264 264" overflow="visible"><defs><linearGradient id="fl-{name}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7556D7"/><stop offset="1" stop-color="#529DE8"/></linearGradient></defs>
    <g fill="url(#fl-{name})">{flat}</g><path d="{sm}" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round"/></svg>
  <svg class="glass" viewBox="{vb}" overflow="visible">{body}</svg>
  <div class="shine"></div>
</div>'''


def brand(file, p):
    s = open(os.path.join(BRAND, file), encoding="utf-8").read()
    vb = re.search(r'viewBox="([^"]+)"', s).group(1)
    return vb, prefix_ids(inner(s), p)


iso_vb, iso = brand("Medismart-ISO27.svg", "iso")
iso_paths = re.findall(r"<path[^>]*/>", iso)
iso_defs = iso[iso.index("<defs>"):]
logo_vb, logo = brand("Medismart-S27.svg", "logo")
logo_paths = re.findall(r"<path[^>]*/>", logo)
logo_defs = logo[logo.index("<defs>"):]

ISO = f'''<svg id="iso" viewBox="{iso_vb}" overflow="visible">{iso_defs}
  <g id="isoTop">{iso_paths[0]}</g>
  <path id="isoTopStroke" d="{re.search(r' d="([^"]+)"', iso_paths[0]).group(1)}" fill="none" stroke="#030C43" stroke-width="1.4" stroke-linejoin="round"/>
  <g id="isoSmile">{iso_paths[1]}</g>
</svg>'''
# Logotipo: el isotipo (paths 0-1) se oculta; lo reemplaza el isotipo grande al aterrizar
LOGO = f'''<svg id="logo" viewBox="{logo_vb}" overflow="visible">{logo_defs}
  <g id="logoIso" opacity="0">{"".join(logo_paths[:2])}</g>
  <g id="logoWord">{"".join(logo_paths[2:])}</g>
</svg>'''

avatars = "\n".join(avatar(n) for n in AV)
tpl = open(os.path.join(HERE, "template.html"), encoding="utf-8").read()
html = tpl.replace("<!--AVATARS-->", avatars).replace("<!--ISO-->", ISO).replace("<!--LOGO-->", LOGO)
import sys
rd = lambda *p: open(os.path.join(HERE, *p), encoding="utf-8").read()
if len(sys.argv) > 1:   # guion en subcarpeta: usa la biblioteca compartida
    g = sys.argv[1]
    html = html.replace("/*MUSIC_JS*/", rd("shared", "synth.js") + "\n" + rd(g, "music.js")).replace("/*REEL_JS*/", rd("shared", "lib.js") + "\n" + rd(g, "reel.js"))
    out = os.path.join(HERE, g, "index.html")
else:
    html = html.replace("/*REEL_JS*/", rd("reel.js")).replace("/*MUSIC_JS*/", rd("music.js"))
    out = os.path.join(HERE, "index.html")
open(out, "w", encoding="utf-8").write(html)
print(out, len(html.encode()) // 1024, "KB")
