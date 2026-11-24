import { defineConfig } from 'vite';
import { resolve, dirname } from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const pages = ['index', 'sobre-nosotros', 'servicios', 'agentes-ia', 'wikidoc', 'contacto'];

/**
 * Inserta parciales HTML compartidos (header, footer, Catalina) en build y en dev.
 * Uso dentro de cualquier página: <!-- @include header -->
 */
function htmlInclude() {
  const render = (html) =>
    html.replace(/<!--\s*@include\s+([\w-]+)\s*-->/g, (_, name) =>
      render(readFileSync(resolve(root, 'partials', `${name}.html`), 'utf8'))
    );
  return {
    name: 'html-include',
    transformIndexHtml: { order: 'pre', handler: render },
    handleHotUpdate({ file, server }) {
      if (file.includes('partials')) server.ws.send({ type: 'full-reload' });
    },
  };
}

export default defineConfig({
  plugins: [htmlInclude()],
  build: {
    rollupOptions: {
      input: Object.fromEntries(pages.map((p) => [p, resolve(root, `${p}.html`)])),
    },
  },
});
