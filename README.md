# Archipiélago

Un mapa vivo de las letras puertorriqueñas — autores, obras, mapa y multimedia,
editables desde `/admin` sin tocar código.

**Stack:** Jekyll (contenido) + Decap CMS (panel de admin, escribe directo al
repo de GitHub) + GitHub Pages (hosting, gratis).

## Estructura

```
_authors/         → cada autor es un archivo .md (perfil, obras, enlaces)
_works/            → cada obra, vinculada a un autor por nombre exacto
_media/            → podcast/video, alimenta el switch audio/video
_map_locations/    → pines del mapa (librerías, editoriales, tertulias)
admin/             → panel de Decap CMS
assets/            → CSS, JS (toggle de audio/video, mapa Leaflet)
```

## 1. Súbelo a GitHub

```
cd pr-lit-hub
git init
git add .
git commit -m "Primer commit: Archipiélago"
gh repo create archipielago --public --source=. --push
```

(O crea el repo manualmente en github.com y usa `git remote add origin ...`.)

## 2. Activa GitHub Pages

En el repo → Settings → Pages → Build and deployment → Source: **Deploy from
a branch** → branch `main`, carpeta `/ (root)`. En un par de minutos el sitio
estará en `https://TU_USUARIO.github.io/archipielago`.

## 3. Conecta Decap CMS a GitHub (la parte que suele confundir)

Decap necesita un "OAuth provider" para poder autenticarte y escribir commits
en tu nombre. La ruta más simple, sin salir de GitHub Pages para el hosting
del sitio:

1. Ve a **github.com/settings/developers** → New OAuth App.
   - Homepage URL: `https://TU_USUARIO.github.io/archipielago`
   - Authorization callback URL: `https://api.netlify.com/auth/done`
2. Copia el **Client ID** y **Client Secret**.
3. Crea una cuenta gratis en Netlify (solo se usa para el login, no para
   hospedar el sitio) → New site → "Deploy manually" con una carpeta vacía,
   o conecta el mismo repo (no importa, Netlify no será tu hosting real).
4. En ese sitio de Netlify → Site settings → Access control → OAuth →
   Install provider → GitHub → pega el Client ID y Secret.
5. En `admin/config.yml`, reemplaza `YOUR_GITHUB_USERNAME/YOUR_REPO_NAME`
   por tu repo real (ej. `janet/archipielago`) y `site_url`/`display_url`
   por tu URL de GitHub Pages. Añade esta línea dentro de `backend:`:
   ```yaml
   backend:
     name: github
     repo: janet/archipielago
     branch: main
     base_url: https://TU-SITIO-DE-NETLIFY.netlify.app
   ```
6. Commit y push. Entra a `https://TU_USUARIO.github.io/archipielago/admin/`,
   dale "Login with GitHub", y ya puedes crear autores, obras, pines del mapa
   y episodios desde formularios — cada guardado es un commit al repo.

*(Alternativa sin Netlify: desplegar un pequeño OAuth proxy en Cloudflare
Workers. Si prefieres esa ruta, dímelo y te paso la plantilla.)*

## 4. Añade contenido real

Ya hay una entrada de ejemplo en cada colección (`_authors`, `_works`,
`_media`, `_map_locations`) — bórralas o edítalas desde `/admin` una vez esté
conectado.

## Desarrollo local (opcional)

```
bundle install
bundle exec jekyll serve
```

Sitio en `http://localhost:4000`. El panel `/admin` en local requiere el
"Local Git Bridge" de Decap (`npx decap-server` en otra terminal) — no es
necesario para editar en producción.
