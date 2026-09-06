# BACKUP — Publicar una fila del Catálogo con el navegador

Usar SOLO cuando `https://l.influencerviral.io/{page_id sin guiones}` no responde 200 (Paso 3 del SKILL). La API de Notion no puede publicar páginas ni cambiar settings del sitio; hay que hacerlo desde la UI. Todo el flujo está automatizado en `scripts/publicar_pagina.js`.

## Settings objetivo (idénticos a los de las 151 páginas ya publicadas)
- **Publicado en el dominio custom** `l.influencerviral.io` (no en `expertoss.notion.site`).
- Publish tab: **Duplicate as template = OFF**, **Search engine indexing = OFF**.
- Customize site styling → **Header = Custom**: Breadcrumbs **OFF**, Search **ON**, Share **ON**, Duplicate as template **OFF**, Show Notion sign up button **OFF**.
- Settings: Theme = System, Google Analytics = Off.
- Al final: **"Publish changes"**.

## Procedimiento (con navegador logueado en Notion, workspace Expertos)
1. Abrir `https://www.notion.so/{page_id sin guiones}`. Esperar ~4 s a que cargue. Pulsar `Escape` (cierra popups).
2. Ejecutar en la consola/JS de la página el contenido de `scripts/publicar_pagina.js` sustituyendo `__ID__` por el número de la influencer (solo se usa para el log).
3. El script devuelve un string de log. Debe terminar en **`live-custom:true saved:true`**. Cada paso reporta `:true` / `:1` / `:ok` / `a->b`.
4. Volver a verificar por HTTP (Paso 3 del SKILL). Si sigue fallando, repetir una vez; si no, `Error` + avisar a Manuel.

## Lo que hace el script, paso a paso (por si hay que hacerlo a mano)
1. Click en **Share** (`[role="button"][aria-label="Share"]`, arriba a la derecha).
2. Click en la pestaña **Publish**.
3. Click en el botón **Publish** (si ya estaba publicada, este paso reporta `Publish:0` y sigue).
4. En el selector de dominio, click en `expertoss.notion.site` → elegir `l.influencerviral.io` (aparece "Successfully updated domain…").
5. Toggle **Duplicate as template** → OFF.
6. Click **Customize site styling** → fila **Header** (la que dice "Custom") → toggles: Breadcrumbs OFF, Search ON, Share ON, Duplicate as template OFF, Show Notion sign up button OFF.
7. Click **Publish changes**.
8. Comprueba que el panel muestre **"This page is live on l.influencerviral.io"** y "Changes published".

## Gotchas
- Los toggles del script son idempotentes: solo hacen click si el estado difiere del deseado.
- Si el popup de Share ya estaba abierto, el script lo detecta (`popup`) y no vuelve a pulsar Share.
- No cambies la URL a mano: constrúyela siempre desde el `page_id` de Notion (un carácter mal = otra página).
- El favicon del sitio queda pendiente (Notion solo admite subir un archivo); no es bloqueante.
