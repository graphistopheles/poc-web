# Medismart Empresas — POC landing progresiva

Landing B2B basada en el diseño de Figma (`base` › sección `landing`, nodo 51:5), con narrativa por capítulos y animaciones con GSAP.

## Ejecutar

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # genera /dist (estático, desplegable en cualquier CDN)
```

## Stack

- **Vite** + HTML/CSS/JS sin framework.
- **GSAP 3.15**: ScrollTrigger, ScrollSmoother, SplitText, ScrambleText y DrawSVG (todos gratuitos desde GSAP 3.13).
- **@fontsource**: Poppins, Mulish e IBM Plex Mono, servidas localmente.
- **lucide**: íconos de los pilares 1, 3 y 4.

## Estructura narrativa

| # | Sección | Animación clave |
|---|---------|-----------------|
| 0 | Preloader | Contador 00→100 y cortina |
| 1 | Hero + formulario | Títulos por línea, el brillo sigue al cursor y el copy se desvanece al hacer scroll |
| 2 | Confianza | Logos escalonados |
| 3 | Puente "Te mostramos cómo lo hacemos" | Las palabras se iluminan con el scroll y las cifras cuentan hacia arriba |
| 4–7 | Pilares 1–4 | Sección fijada (pin) mientras la ilustración se arma capa por capa con el scroll |
| 8 | Innovación (SARA, AIDA, NADIA) | Tarjetas con tilt 3D, brillo y nombres con efecto scramble |
| 9 | Cierre | Botón magnético que lleva al formulario |

Elementos de navegación: barra de progreso bajo el header, navegación lateral de capítulos ("Recorrido"), header que se oculta al bajar y fondo que cambia de oscuro a claro por capítulo.

En pantallas de 1200px o menos se desactivan los pins y las animaciones se reproducen al entrar. Con `prefers-reduced-motion` todo queda estático y visible.

## Pendientes

- El formulario solo valida en el cliente: aún no hay backend ni integración de calendario.
- "Simular ahorro de mi empresa" no tiene destino (simulador por definir).
- Los links "Conocer…" de los pilares y los del footer de Recursos son placeholders.
- Las cifras del puente (7M+ usuarios, 8 países, 25+ especialidades, 24/7) vienen del sitio de Medismart Personas. Hay que validarlas con marketing.
