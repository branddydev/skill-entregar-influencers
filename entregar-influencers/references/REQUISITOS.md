# Requisitos de Viktor para `entregar-influencers`

Validar la primera vez (y cuando algo falle). Si alguno falla → PARAR y avisar a Manuel.

## 1. Conector de Notion ✅
Sobre Catálogo (`1c020f24-1257-4385-b46b-4a53df58d57c`) y Entregas (`62d02468-e0be-41e3-b603-96c5a71f1c86`) debe poder:
- Consultar con filtro y orden (Estado, `userDefined:ID`, Creado).
- Actualizar propiedades: select, url, date, text y **relación** (Catálogo.Cliente ↔ Entregas.Influencer).

**Auto-test:** leer la fila de prueba de Entregas ("Expertos", hola+negocio@expertos.io) y la influencer 102 del Catálogo. Escribir y borrar un texto en `Notas` de la fila de prueba. Si sale → OK.

## 2. HTTP saliente ✅
Debe poder hacer `GET https://l.influencerviral.io/3ce108f0654581ce9b59f15eaefb1ef9` → 200 y el HTML contiene `3ce108f0654581ce9b59f15eaefb1ef9` (o su forma con guiones), y `POST` JSON al webhook de GHL.

**Auto-test:** `python scripts/verificar_publicada.py 3ce108f0654581ce9b59f15eaefb1ef9` → `"live": true`. Y con un id falso (`000…0`, 32 ceros) → `"live": false` aunque responda 200. Para el POST, esperar a que Manuel pase la URL del Inbound Webhook (CONFIG) y enviar un payload de prueba con `email = hola+negocio@expertos.io` → 2xx y Manuel confirma que llegó el email de prueba.

## 3. Navegador con sesión en Notion (solo para el backup de publicación) ✅
Necesario únicamente si una página del Catálogo no está publicada. Debe poder abrir `https://www.notion.so/{page_id}` logueado como miembro del workspace Expertos con permiso de publicar, y ejecutar JavaScript en la página.

**Auto-test:** abrir la 102 - Sofia en el navegador y ver el botón "Share" arriba a la derecha. Si sale → OK. (No hace falta publicar nada: ya está publicada.)

## 4. Slack ✅
Poder escribir en el canal donde se programó la tarea y mencionar a Manuel.

## 5. Tarea programada ✅
Cron diario 9:00 America/Bogota que invoque esta skill. La configura Manuel en Viktor.

---

| # | Requisito | Estado |
|---|---|---|
| 1 | Notion: leer/filtrar + escribir select/url/date/text/relación en las 2 DBs | ⬜ |
| 2 | HTTP: GET al dominio público + POST al webhook de GHL | ⬜ |
| 3 | Navegador logueado en Notion (backup de publicación) | ⬜ |
| 4 | Slack: reporte y menciones | ⬜ |
| 5 | Cron 9:00 Bogotá | ⬜ |

**Con 1, 2 y 4 ✅ ya se puede entregar. 3 solo hace falta para el backup. 5 para que sea automático.**
