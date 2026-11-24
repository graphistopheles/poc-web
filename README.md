# Medismart Empresas · Sitio con Catalina

Sitio multipágina construido sobre el **Diagrama de Contenidos** (`Diagrama Contenidos Sitio Web.png`). Toma de referencia el lenguaje visual de ohmd.com (espaciados, formas, tratamiento fotográfico, escala tipográfica) y el agente flotante de impilohealth.com, adaptado a **Catalina**.

## Ejecutar

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # genera /dist estático (6 páginas)
```

## Arquitectura de información

| Página | Archivo | Secciones (según diagrama) |
|---|---|---|
| Home | `index.html` | 1 Bienvenida + Catalina · 2 Organizaciones que confían · 3 Cifras · 4 Ecosistema (4 pilares) · 5 Innovación y tecnología (agentes IA + SmartCheck) · 6 Las personas detrás · 7 CTA "Agenda una demo" |
| Sobre nosotros | `sobre-nosotros.html` | ¿Quiénes somos? · Nuestro equipo · Nuestro impacto (cifras + calculadora de ausentismo) · Casos de éxito · Ciberseguridad · Actualidad |
| Servicios › Soluciones de salud | `servicios.html` | Telemedicina y prevención · Soluciones especializadas · Salud y bienestar animal · Farmacias y complementarios · FAQ |
| Servicios › Agentes IA | `agentes-ia.html` | Catalina y la familia (selector de agentes) · Conoce sus funciones · SmartCheck · IA responsable |
| WikiDoc | `wikidoc.html` | Artículo destacado · filtros y búsqueda · newsletter |
| Contacto | `contacto.html` | Canales (correo, WhatsApp, línea corporativa) · formulario de demo · próximos pasos |

Header (con selector de país) y footer (enlaces clave, legal, certificaciones, canales y redes) son parciales compartidos en `partials/`, insertados en build por un plugin de Vite (`<!-- @include header -->`).

## Sistema de diseño

- **Grilla de 8 px.** Todos los espaciados, gaps, radios, alturas de control y line-heights son múltiplos de 8 (`src/styles/tokens.css`). Solo los hairlines de 1 px y los círculos (50%) escapan a la regla.
- **Tipografía:** Plus Jakarta Sans (Brandbook '27): Bold 700 para títulos, Medium 500 para cuerpos. Escala en rem (1rem = 16px) con line-heights en múltiplos de 8, y tres breakpoints (desktop, ≤1024, ≤640).
- **Paleta:** exclusivamente la de `assets-externos/Color Palette.png`; los tintes intermedios se derivan con `color-mix` de esos mismos colores.
- **Fotografía:** radios de 24/32 px, velo de marca (multiply violeta/azul), revelado con máscara y parallax interno.

## Catalina (agente flotante)

`src/js/catalina.js` + `partials/catalina.html`

- Vive en **perchas** (`data-cata-perch`): en la home aparece sentada sobre el escenario del hero y, al hacer scroll, despega desde ahí. Al llegar a "Innovación y tecnología" vuelve a su lugar en la familia de agentes, y en `/agentes-ia` aparece al centro de la fila de la familia.
- **Deriva libre (como Pilo de Impilo):** fuera de una percha viaja en línea recta a ~80 px/s (48 en móvil) y rebota en los bordes del viewport sin invadir el header, con bamboleo de ±4°/1,6 s, inclinación según su rumbo y un leve aplastamiento al chocar. Se frena al pasar el mouse, mientras habla y con el panel abierto. La burbuja se abre hacia el lado con más espacio. Con `prefers-reduced-motion` se queda quieta abajo a la derecha.
- Cada sección le deja una frase (`data-cata-say`) que ella comenta en una burbuja cuando entra en escena; `data-cata-ask` precarga una pregunta.
- Gestos: parpadeo, "habla" al comentar, sus cubos se separan al pasar el mouse y se "abrazan" al volver.
- **Click → panel lateral derecho** (bottom sheet en móvil) para preguntarle sobre Medismart. Las respuestas salen de una base de conocimiento local (`src/js/catalina-kb.js`) por palabras clave, sin backend.
- Vectores extraídos de `agentes/v2/index.html` a `public/assets/agentes/*.svg`.

## Animación (GSAP 3.15)

Intro por página (titular por palabras, escenario que sube, conversación del hero), SplitText con máscara por línea, frase que se ilumina palabra por palabra con el scroll, contadores, marquee de logos, tarjetas de pilares apiladas (sticky + escala), revelado fotográfico, botón magnético y transiciones del panel. Con `prefers-reduced-motion` todo queda estático y visible.

## Pendientes / a validar

- **Fotografías:** se cargan desde Unsplash (hotlink) para el POC. Hay que reemplazarlas por fotografía propia o licenciada antes de publicar.
- **Contenido a validar con marketing:** cifras (7M+, 8 países, 25+ especialidades, 99,9% uptime), los casos de éxito (industrias, métricas y citas son **ilustrativos**), noticias de "Actualidad", artículos de WikiDoc y la descripción de SmartCheck.
- La calculadora usa un supuesto referencial (22 días hábiles, −25% de ausentismo de corta duración), indicado en la misma UI.
- Catalina no está conectada a un LLM; `catalina-kb.js` está pensado para reemplazarse por un endpoint con RAG.
- Los formularios validan en el cliente y no envían datos. Los links legales y los artículos son placeholders.
- Los assets del POC anterior (`public/assets/pilar*`, `ia/`, `ui/`, `brand/medismart-logo.svg`) ya no se usan; se pueden eliminar.
