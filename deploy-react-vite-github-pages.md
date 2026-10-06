# Desplegar un proyecto React + Vite en GitHub Pages

Guía completa: configuración, despliegue automático con GitHub Actions en cada commit a `main`, routing de SPAs, dominios propios, variables de entorno, límites y solución de problemas.

> Versiones de las actions revisadas en octubre de 2026 según la guía oficial de Vite: `checkout@v7`, `setup-node@v7`, `configure-pages@v6`, `upload-pages-artifact@v5`, `deploy-pages@v5`. Si algo falla en el futuro, revisa primero si hay versiones mayores nuevas.

---

## Índice

1. [Qué es GitHub Pages y qué puede (y no puede) hacer](#1-qué-es-github-pages-y-qué-puede-y-no-puede-hacer)
2. [Tipos de sitio y URLs](#2-tipos-de-sitio-y-urls)
3. [Crear el proyecto React + Vite](#3-crear-el-proyecto-react--vite)
4. [Configurar `base` en Vite (lo más importante)](#4-configurar-base-en-vite-lo-más-importante)
5. [Método recomendado: GitHub Actions (deploy automático desde `main`)](#5-método-recomendado-github-actions-deploy-automático-desde-main)
6. [Variantes del workflow](#6-variantes-del-workflow)
7. [Método alternativo: paquete `gh-pages` (deploy manual)](#7-método-alternativo-paquete-gh-pages-deploy-manual)
8. [Routing en una SPA (React Router) y el problema del 404](#8-routing-en-una-spa-react-router-y-el-problema-del-404)
9. [Assets, carpeta `public/` y rutas](#9-assets-carpeta-public-y-rutas)
10. [Variables de entorno y secretos](#10-variables-de-entorno-y-secretos)
11. [Dominio personalizado y HTTPS](#11-dominio-personalizado-y-https)
12. [Límites y condiciones de GitHub Pages](#12-límites-y-condiciones-de-github-pages)
13. [Solución de problemas (troubleshooting)](#13-solución-de-problemas-troubleshooting)
14. [Checklist final](#14-checklist-final)

---

## 1. Qué es GitHub Pages y qué puede (y no puede) hacer

GitHub Pages es un hosting **estático** gratuito integrado en GitHub. Sirve HTML, CSS, JS, imágenes y otros ficheros tal cual, a través de su CDN y con HTTPS.

**Encaja perfectamente con React + Vite** porque `vite build` genera una carpeta `dist/` con ficheros estáticos.

**Lo que puedes hacer:**

- Webs personales, portfolios, landing pages, documentación, demos.
- SPAs de React (con un par de trucos para el routing, ver sección 8).
- Consumir APIs externas desde el navegador (fetch a otros dominios con CORS).
- Usar un dominio propio con HTTPS gratis.

**Lo que NO puedes hacer:**

- Ejecutar código de servidor (Node, PHP, Python…). Nada de SSR, API routes ni bases de datos propias.
- Configurar cabeceras HTTP, redirecciones del servidor o reglas de reescritura (no hay `_redirects` ni `.htaccess`).
- Guardar secretos de forma segura en el frontend: todo lo que va en el bundle es público.

Si necesitas backend, combínalo con un servicio externo (Supabase, Firebase, una API en Render/Fly/Cloudflare Workers, etc.) o usa otra plataforma (Vercel, Netlify, Cloudflare Pages).

---

## 2. Tipos de sitio y URLs

GitHub Pages tiene dos tipos de sitio, y esto determina cómo configuras Vite:

| Tipo | Nombre del repo | URL final | `base` en Vite |
|---|---|---|---|
| **Sitio de usuario/organización** | `<usuario>.github.io` | `https://<usuario>.github.io/` | `'/'` |
| **Sitio de proyecto** | cualquier nombre, p. ej. `mi-app` | `https://<usuario>.github.io/mi-app/` | `'/mi-app/'` |
| **Cualquiera con dominio propio** | cualquiera | `https://www.midominio.com/` | `'/'` |

Solo puedes tener **un** sitio de usuario por cuenta, pero **tantos sitios de proyecto como repos** quieras.

---

## 3. Crear el proyecto React + Vite

Requisitos: Node.js LTS reciente y git.

```bash
# JavaScript
npm create vite@latest mi-app -- --template react

# TypeScript
npm create vite@latest mi-app -- --template react-ts

cd mi-app
npm install
npm run dev
```

Los scripts que genera Vite en `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

> En la plantilla TypeScript, `build` suele ser `tsc -b && vite build`, así que un error de tipos romperá el build en CI. Es bueno: así no se despliega código roto.

Sube el proyecto a GitHub:

```bash
git init
git add .
git commit -m "Proyecto inicial"
git branch -M main
git remote add origin https://github.com/<usuario>/mi-app.git
git push -u origin main
```

Asegúrate de que **`package-lock.json` está commiteado** (lo necesita `npm ci` en CI) y de que `node_modules/` y `dist/` están en `.gitignore` (la plantilla ya lo hace).

---

## 4. Configurar `base` en Vite (lo más importante)

El 90 % de los problemas de "página en blanco" en GitHub Pages vienen de aquí. `base` le dice a Vite en qué ruta pública vivirá la app, para generar bien las URLs de JS, CSS e imágenes.

### Opción A: valor fijo (lo más sencillo)

```js
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/mi-app/', // ← nombre EXACTO del repo, con barras al principio y al final
})
```

Para un sitio `<usuario>.github.io` o con dominio propio, usa `base: '/'` (o quítalo, porque es el valor por defecto).

Con `base: '/mi-app/'`, el servidor de desarrollo también servirá en `http://localhost:5173/mi-app/`. Es normal.

### Opción B: valor dinámico desde una variable de entorno (recomendada con Actions)

La action `configure-pages` devuelve el `base_path` real del sitio (por ejemplo `/mi-app`, o vacío si usas dominio propio). Puedes pasárselo a Vite y olvidarte de mantenerlo a mano:

```js
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: process.env.BASE_PATH || '/',
})
```

El workflow de la sección 5 ya pasa `BASE_PATH` automáticamente. Ventajas: si renombras el repo o añades un dominio propio, no tienes que tocar el código.

> En proyectos TypeScript, si el editor se queja de `process`, instala los tipos: `npm i -D @types/node`.

---

## 5. Método recomendado: GitHub Actions (deploy automático desde `main`)

**Sí, puedes (y es lo recomendable) usar GitHub Actions** para que en cada push/commit a `main` se haga automáticamente `npm ci`, `npm run build` y el despliegue de `dist/`. No hace falta subir `dist/` al repo ni tener una rama `gh-pages`.

### Paso 1: activar Pages con Actions como fuente

1. En el repo: **Settings → Pages**.
2. En **Build and deployment → Source**, selecciona **GitHub Actions**.

(No elijas "Deploy from a branch" para este método.)

### Paso 2: crear el workflow

Crea el fichero `.github/workflows/deploy.yml`:

```yaml
name: Deploy a GitHub Pages

on:
  # Se ejecuta en cada push a main
  push:
    branches: ['main']
  # Permite lanzarlo a mano desde la pestaña Actions
  workflow_dispatch:

# Permisos mínimos del GITHUB_TOKEN para desplegar en Pages
permissions:
  contents: read
  pages: write
  id-token: write

# Solo un despliegue a la vez; si llega uno nuevo, cancela el anterior en curso
concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v7

      - name: Setup Node
        uses: actions/setup-node@v7
        with:
          node-version: lts/*
          cache: 'npm'

      - name: Setup Pages
        id: pages
        uses: actions/configure-pages@v6

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          # Ej.: "/mi-app/" en un sitio de proyecto, "/" con dominio propio
          BASE_PATH: ${{ steps.pages.outputs.base_path }}/

      - name: SPA fallback (404.html)
        run: cp dist/index.html dist/404.html

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v5
        with:
          path: ./dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v5
```

### Paso 3: hacer commit y push

```bash
git add .
git commit -m "Añadir workflow de deploy a GitHub Pages"
git push
```

Ve a la pestaña **Actions** del repo: verás el workflow ejecutándose. Al terminar, el job `deploy` mostrará la URL del sitio. A partir de ahora **cada commit que llegue a `main` (push directo o merge de un PR) despliega automáticamente**.

### Qué hace cada parte

| Bloque | Para qué sirve |
|---|---|
| `on.push.branches: ['main']` | Dispara el workflow con cada commit en `main`. |
| `workflow_dispatch` | Añade un botón "Run workflow" para relanzarlo a mano sin hacer commit. |
| `permissions` | `pages: write` permite publicar; `id-token: write` lo necesita `deploy-pages` para autenticarse con OIDC; `contents: read` para leer el código. |
| `concurrency` | Evita dos despliegues simultáneos pisándose. |
| `actions/checkout` | Descarga el código del repo en la máquina virtual. |
| `actions/setup-node` con `cache: 'npm'` | Instala Node y cachea las descargas de npm, para builds más rápidos. |
| `actions/configure-pages` | Prepara Pages y expone datos como `base_path`. |
| `npm ci` | Instalación limpia y reproducible a partir de `package-lock.json`. |
| `npm run build` | Genera `dist/`. |
| `cp dist/index.html dist/404.html` | Truco para que las rutas de React Router funcionen al recargar (sección 8). |
| `actions/upload-pages-artifact` | Empaqueta `dist/` como artefacto especial de Pages. |
| `actions/deploy-pages` | Publica ese artefacto en el entorno `github-pages`. |

> **Nota:** con este método no necesitas fichero `.nojekyll`. Jekyll solo procesa los sitios desplegados desde una rama; los artefactos subidos por Actions se sirven tal cual.

---

## 6. Variantes del workflow

### 6.1. Un solo job (más compacto)

Es el ejemplo de la documentación oficial de Vite. Funciona igual, pero si el deploy falla tienes que repetir también el build.

```yaml
jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version: lts/*
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/configure-pages@v6
      - uses: actions/upload-pages-artifact@v5
        with:
          path: './dist'
      - id: deployment
        uses: actions/deploy-pages@v5
```

### 6.2. Lint y tests antes de desplegar

Si los tests fallan, no se despliega:

```yaml
      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Tests
        run: npm test -- --run   # con Vitest; ajusta a tu runner

      - name: Build
        run: npm run build
```

### 6.3. Comprobar el build en Pull Requests (sin desplegar)

Crea un workflow aparte, por ejemplo `.github/workflows/ci.yml`, para que cada PR verifique que compila:

```yaml
name: CI

on:
  pull_request:
    branches: ['main']

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version: lts/*
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run build
```

Combinado con **reglas de protección de rama** (Settings → Branches / Rulesets → exigir que el check `CI` pase antes de mergear), te aseguras de que en `main` solo entra código que compila.

> GitHub Pages no ofrece "preview deployments" por PR de forma sencilla como Vercel, Netlify o Cloudflare Pages. Si las necesitas, esas plataformas son mejor opción.

### 6.4. pnpm, Yarn o Bun

**pnpm:**

```yaml
      - uses: actions/checkout@v7
      - uses: pnpm/action-setup@v4   # comprueba la última versión mayor
        # si tu package.json tiene "packageManager": "pnpm@x.y.z", no hace falta indicar versión
      - uses: actions/setup-node@v7
        with:
          node-version: lts/*
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm run build
```

**Yarn:**

```yaml
      - uses: actions/setup-node@v7
        with:
          node-version: lts/*
          cache: 'yarn'
      - run: yarn install --frozen-lockfile   # en Yarn Berry: yarn install --immutable
      - run: yarn build
```

**Bun:**

```yaml
      - uses: oven-sh/setup-bun@v2   # comprueba la última versión mayor
      - run: bun install --frozen-lockfile
      - run: bun run build
```

### 6.5. No desplegar si solo cambia documentación

```yaml
on:
  push:
    branches: ['main']
    paths-ignore:
      - '**.md'
      - 'docs/**'
```

### 6.6. Proyecto en una subcarpeta (monorepo)

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./frontend
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version: lts/*
          cache: 'npm'
          cache-dependency-path: ./frontend/package-lock.json
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v5
        with:
          path: ./frontend/dist
```

### 6.7. Fijar la versión de Node

En vez de `lts/*`, puedes fijar una versión concreta o leerla de un fichero `.nvmrc`:

```yaml
      - uses: actions/setup-node@v7
        with:
          node-version-file: '.nvmrc'
          cache: 'npm'
```

### 6.8. Fijar actions por SHA (seguridad extra)

La guía oficial de Vite fija las actions por hash de commit en lugar de por etiqueta (`@v5`), para protegerse de que alguien mueva una etiqueta a código malicioso. Es más seguro, pero tendrás que actualizarlas a mano (o con Dependabot). Ejemplo de formato:

```yaml
uses: actions/deploy-pages@<sha-completo-del-commit> # v5
```

Para mantener las actions al día automáticamente, añade `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: 'github-actions'
    directory: '/'
    schedule:
      interval: 'weekly'
```

---

## 7. Método alternativo: paquete `gh-pages` (deploy manual)

Útil si quieres desplegar desde tu máquina sin CI. Construye en local y sube `dist/` a una rama `gh-pages`.

```bash
npm install -D gh-pages
```

En `package.json`:

```json
{
  "scripts": {
    "build": "vite build",
    "predeploy": "npm run build && cp dist/index.html dist/404.html",
    "deploy": "gh-pages -d dist"
  }
}
```

(En Windows sin bash, sustituye `cp` por `copy dist\\index.html dist\\404.html` o usa un paquete como `shx`.)

Despliegue:

```bash
npm run deploy
```

Luego, **una sola vez**: Settings → Pages → Source: **Deploy from a branch** → rama `gh-pages`, carpeta `/ (root)`.

Con este método:

- Aquí sí conviene un fichero `.nojekyll` vacío en `public/` (Vite lo copiará a `dist/`), para que Jekyll no ignore ficheros que empiezan por `_`. Algunas versiones de `gh-pages` permiten también `gh-pages -d dist --nojekyll`.
- Debes poner `base` a mano en `vite.config.js` (la opción B de la sección 4 no recibe `BASE_PATH`).

**Comparativa:**

| | GitHub Actions | Paquete `gh-pages` |
|---|---|---|
| Despliegue automático en cada commit | Sí | No (manual) |
| Build reproducible en entorno limpio | Sí | Depende de tu máquina |
| Rama extra en el repo | No | Sí (`gh-pages`) |
| Necesita `.nojekyll` | No | Recomendable |
| Recomendado hoy | **Sí** | Para casos puntuales |

> Existe también la action de terceros `peaceiris/actions-gh-pages`, que desde Actions empuja `dist/` a la rama `gh-pages`. Funciona, pero el flujo oficial con `upload-pages-artifact` + `deploy-pages` es más limpio y no necesita permisos de escritura sobre el repo.

---

## 8. Routing en una SPA (React Router) y el problema del 404

### El problema

GitHub Pages busca ficheros reales. Si tu app tiene la ruta `/mi-app/perfil` y el usuario **recarga la página o entra por enlace directo**, Pages busca `perfil/index.html`, no lo encuentra y devuelve un 404. Navegar dentro de la app funciona; recargar no.

### Paso previo: `basename` en el router

Si usas sitio de proyecto, el router debe saber que la app vive bajo `/mi-app/`. Vite expone `base` como `import.meta.env.BASE_URL`:

```jsx
// main.jsx (React Router v6/v7)
import { BrowserRouter } from 'react-router' // en v6: 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <BrowserRouter basename={import.meta.env.BASE_URL}>
    <App />
  </BrowserRouter>
)
```

Con `createBrowserRouter`:

```jsx
const router = createBrowserRouter(routes, {
  basename: import.meta.env.BASE_URL,
})
```

### Solución 1: copiar `index.html` a `404.html` (la más usada)

Es lo que hace el paso `cp dist/index.html dist/404.html` del workflow. Cuando una ruta no existe, Pages sirve `404.html`, que es tu app, y React Router renderiza la ruta correcta.

- Pros: trivial, URLs limpias.
- Contras: el servidor responde con **código HTTP 404** aunque la página se vea bien. Afecta al SEO de esas rutas y a algunas herramientas de monitorización. Para portfolios y apps personales normalmente da igual.

### Solución 2: `HashRouter`

```jsx
import { HashRouter } from 'react-router'

<HashRouter>
  <App />
</HashRouter>
```

Las URLs quedan como `https://usuario.github.io/mi-app/#/perfil`. Todo lo que va detrás de `#` no llega al servidor, así que nunca hay 404.

- Pros: funciona siempre, sin trucos. No necesita `basename`.
- Contras: URLs menos bonitas y peor para SEO.

### Solución 3: script de redirección (spa-github-pages)

Técnica conocida (proyecto `rafgraph/spa-github-pages`): un `404.html` con un script que convierte la ruta en query string y redirige a `index.html`, y otro script en `index.html` que restaura la URL con `history.replaceState`. Consigue URLs limpias, pero es más complejo y sigue habiendo un 404 intermedio. Solo merece la pena si te importan mucho las URLs.

### Solución 4: prerenderizar las rutas

Si tus rutas son conocidas de antemano (una web informativa), puedes generar un HTML por ruta (por ejemplo con React Router en modo framework con prerender, o con herramientas de SSG). Así cada ruta existe como fichero real y devuelve 200. Es lo mejor para SEO, pero cambia bastante la arquitectura.

**Resumen:** para la mayoría de proyectos, `BrowserRouter` + `basename` + `404.html` es suficiente.

---

## 9. Assets, carpeta `public/` y rutas

- **Imports desde `src/`** (`import logo from './assets/logo.svg'`): Vite añade el `base` y un hash al nombre automáticamente. Siempre funcionan.
- **Ficheros en `public/`**: se copian tal cual a la raíz de `dist/`. En `index.html` y en CSS, Vite reescribe las rutas absolutas como `/favicon.svg` para añadir el `base`. **Pero en JSX no**: si escribes `<img src="/foto.png" />`, en un sitio de proyecto apuntará a `https://usuario.github.io/foto.png` y fallará.

Forma correcta en JSX:

```jsx
<img src={`${import.meta.env.BASE_URL}foto.png`} alt="Foto" />
```

Lo mismo para `fetch` de ficheros estáticos:

```js
fetch(`${import.meta.env.BASE_URL}data/productos.json`)
```

- **Mayúsculas y minúsculas**: el runner de Actions es Linux, que distingue mayúsculas. `import Header from './header'` puede funcionar en tu Mac/Windows y fallar en CI si el fichero es `Header.jsx`. Revisa los nombres si el build falla solo en Actions.

---

## 10. Variables de entorno y secretos

Vite solo expone al código del cliente las variables que empiezan por **`VITE_`**, accesibles con `import.meta.env.VITE_LO_QUE_SEA`.

En local, en un `.env` (añádelo a `.gitignore` si tiene valores tuyos):

```
VITE_API_URL=https://api.ejemplo.com
```

En GitHub Actions, guárdalas en **Settings → Secrets and variables → Actions** y pásalas al paso de build:

```yaml
      - name: Build
        run: npm run build
        env:
          BASE_PATH: ${{ steps.pages.outputs.base_path }}/
          VITE_API_URL: ${{ vars.VITE_API_URL }}          # variable (no secreta)
          VITE_PUBLIC_KEY: ${{ secrets.VITE_PUBLIC_KEY }} # secreto de repositorio
```

> ⚠️ **Muy importante:** cualquier variable `VITE_` acaba **incrustada en el JavaScript público**. Guardarla como "secret" en GitHub solo evita que aparezca en el repo y en los logs, **no** la protege en la web: cualquiera puede verla en las DevTools. Nunca pongas claves privadas (claves de servidor, tokens de OpenAI, claves secretas de Stripe…) en el frontend. Usa solo claves pensadas para ser públicas (p. ej. la anon key de Supabase con RLS, la clave publicable de Stripe) o pon un backend/proxy por medio.

---

## 11. Dominio personalizado y HTTPS

### Configurarlo en GitHub

1. **Settings → Pages → Custom domain**: escribe tu dominio (p. ej. `www.midominio.com`) y guarda.
2. Cuando el DNS esté propagado y el certificado emitido, activa **Enforce HTTPS**.
3. Cambia `base` a `'/'` (con la opción B de la sección 4 se ajusta solo).

Con el despliegue por GitHub Actions **no necesitas fichero `CNAME`**: el dominio configurado en Settings es el que manda. El fichero `CNAME` (en `public/`) solo es necesario con el método de rama (sección 7).

### Registros DNS

**Subdominio (`www.midominio.com`)**, recomendado:

| Tipo | Nombre | Valor |
|---|---|---|
| CNAME | `www` | `<usuario>.github.io` |

**Dominio raíz (`midominio.com`)**:

| Tipo | Nombre | Valor |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| AAAA (opcional) | `@` | `2606:50c0:8000::153` |
| AAAA (opcional) | `@` | `2606:50c0:8001::153` |
| AAAA (opcional) | `@` | `2606:50c0:8002::153` |
| AAAA (opcional) | `@` | `2606:50c0:8003::153` |

Si configuras ambos (raíz y `www`), GitHub redirige automáticamente uno al otro.

> Comprueba siempre las IPs actuales en la documentación oficial de GitHub ("Managing a custom domain for your GitHub Pages site") antes de configurarlas.

### Recomendaciones

- **Verifica el dominio** en Settings (de tu cuenta u organización) → Pages → *Add a domain*. Evita que otra persona pueda "secuestrar" tu dominio apuntándolo a su repo si un día lo quitas del tuyo.
- No uses registros DNS comodín (`*.midominio.com`) apuntando a GitHub Pages: es un riesgo de seguridad.
- La propagación DNS y la emisión del certificado HTTPS pueden tardar desde minutos hasta 24 horas.

---

## 12. Límites y condiciones de GitHub Pages

Valores de la documentación oficial de GitHub (pueden cambiar, revísalos si te acercas a ellos):

- **Tamaño del sitio publicado**: máximo 1 GB.
- **Ancho de banda**: límite blando de 100 GB al mes.
- **Tiempo de despliegue**: los despliegues que tardan más de 10 minutos fallan.
- **Builds**: límite blando de 10 builds por hora para sitios publicados desde rama; **no aplica** a despliegues con workflow propio de Actions.
- **Repos privados**: publicar Pages desde un repo privado requiere plan de pago (Pro, Team o Enterprise). Aun así, **el sitio es público** salvo en GitHub Enterprise Cloud con control de acceso.
- **Uso**: no está pensado como hosting comercial gratuito para tiendas online o SaaS, ni se permite contenido prohibido por los términos de GitHub.
- **Minutos de Actions**: gratis e ilimitados en repos públicos; en repos privados consumen la cuota de tu plan.
- **Caché**: GitHub Pages sirve con caché de unos minutos (`max-age` de 10 minutos). Si no ves los cambios tras un deploy, prueba con recarga forzada (Ctrl/Cmd + Shift + R) o en ventana privada. Los ficheros de Vite llevan hash en el nombre, así que JS y CSS nuevos se cargan bien en cuanto se actualiza `index.html`.

---

## 13. Solución de problemas (troubleshooting)

### Página en blanco y errores 404 en `/assets/index-xxxx.js`

`base` mal configurado. Abre las DevTools → pestaña Network: si pide `https://usuario.github.io/assets/...` en vez de `https://usuario.github.io/mi-app/assets/...`, falta `base: '/mi-app/'`. Comprueba también que coincide **exactamente** con el nombre del repo (mayúsculas incluidas).

### Funciona al navegar pero da 404 al recargar una ruta

Falta el fallback de SPA (sección 8): añade `404.html` o usa `HashRouter`. Y revisa el `basename` del router.

### La app carga pero el router muestra "No routes matched" o la página de "no encontrado"

Falta `basename={import.meta.env.BASE_URL}` en el router.

### Imágenes de `public/` no cargan en producción

Estás usando rutas absolutas (`/img.png`) en JSX. Usa `` `${import.meta.env.BASE_URL}img.png` `` (sección 9).

### `Error: Get Pages site failed` / `Not Found` en `configure-pages`

Pages no está activado o la fuente no es "GitHub Actions". Ve a Settings → Pages → Source: GitHub Actions. Alternativa: `configure-pages` acepta la opción `enablement: true` para intentar activarlo automáticamente (requiere un token con permisos de administración del repo; con el `GITHUB_TOKEN` normal suele no bastar, así que lo más fácil es activarlo a mano).

### `Branch "xxx" is not allowed to deploy to github-pages due to environment protection rules`

El entorno `github-pages` solo permite desplegar desde la rama por defecto. Si quieres desplegar desde otra rama: Settings → Environments → `github-pages` → *Deployment branches and tags* → añade la rama. O asegúrate de que el workflow se dispara desde `main`.

### Error de permisos en `deploy-pages` (`id-token`, `HttpError: Resource not accessible`)

Falta el bloque `permissions` con `pages: write` e `id-token: write`. Si tu organización restringe los permisos por defecto de Actions, revisa también Settings → Actions → General → *Workflow permissions*.

### `npm ci` falla: "The `npm ci` command can only install with an existing package-lock.json"

No has commiteado `package-lock.json`, o está desincronizado con `package.json`. Ejecuta `npm install` en local y haz commit del lock.

### El build funciona en local pero falla en Actions

Causas típicas: mayúsculas/minúsculas en imports (Linux), variables de entorno que existen en tu `.env` local pero no en Actions, versión de Node distinta (fíjala con `.nvmrc`), o errores de TypeScript que en local ignoras con `npm run dev`. Ejecuta `npm ci && npm run build` en local para reproducirlo.

### El workflow no se ejecuta

Comprueba que el fichero está exactamente en `.github/workflows/` con extensión `.yml` o `.yaml`, que la rama se llama `main` (y no `master`), que el YAML es válido (la indentación importa) y que Actions está habilitado en Settings → Actions.

### Desplegó, pero sigo viendo la versión antigua

Caché del navegador o de la CDN (hasta ~10 minutos). Recarga forzada o ventana privada. Comprueba en la pestaña Actions que el último run terminó en verde.

### Probar el build de producción en local antes de subir

```bash
npm run build
npm run preview
```

`vite preview` sirve `dist/` respetando `base`, así que si funciona aquí, casi seguro funcionará en Pages. Si usas la opción dinámica de `base`, simula el entorno: `BASE_PATH=/mi-app/ npm run build && npm run preview`.

---

## 14. Checklist final

- [ ] Proyecto creado con Vite y subido a GitHub en la rama `main`.
- [ ] `package-lock.json` (o el lock de tu gestor) commiteado.
- [ ] `base` configurado en `vite.config.js` (fijo o con `BASE_PATH`).
- [ ] Settings → Pages → Source: **GitHub Actions**.
- [ ] `.github/workflows/deploy.yml` creado con `permissions`, build, `upload-pages-artifact` y `deploy-pages`.
- [ ] Si usas React Router: `basename={import.meta.env.BASE_URL}` y fallback `404.html` (o `HashRouter`).
- [ ] Rutas a ficheros de `public/` en JSX usan `import.meta.env.BASE_URL`.
- [ ] Variables `VITE_` configuradas en Actions, sin ningún secreto real en el frontend.
- [ ] (Opcional) Workflow de CI para PRs y protección de la rama `main`.
- [ ] (Opcional) Dominio propio con DNS configurado, dominio verificado y HTTPS forzado.
- [ ] (Opcional) Dependabot para mantener actualizadas las actions.

Flujo de trabajo resultante:

```
git commit → git push (o merge de PR) a main
        ↓
GitHub Actions: checkout → npm ci → npm run build → 404.html → upload artifact
        ↓
deploy-pages publica dist/
        ↓
https://<usuario>.github.io/<repo>/ actualizado en 1–2 minutos
```

---

### Referencias

- Guía oficial de Vite – Deploying a Static Site: https://vite.dev/guide/static-deploy
- Documentación de GitHub Pages: https://docs.github.com/pages
- Publicar con un workflow propio de Actions: https://docs.github.com/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- Dominios personalizados: https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site
- Action `deploy-pages`: https://github.com/actions/deploy-pages
- Action `upload-pages-artifact`: https://github.com/actions/upload-pages-artifact
- Action `configure-pages`: https://github.com/actions/configure-pages
