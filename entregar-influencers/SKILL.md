---
name: entregar-influencers
description: Entrega diaria de influencers IA a los clientes que compraron en GHL. Lee las filas Pendientes de la DB "📋 Entregas Influencers" en Notion, asigna a cada cliente la siguiente influencer Disponible del Catálogo (ID más bajo, desde la 102), marca Catálogo y Entregas como Entregado, comprueba que la página de la influencer está publicada en l.influencerviral.io (y si no, la publica con el navegador), y avisa a GHL por webhook para que envíe el email con el ZIP + link público. Corre todos los días a las 9:00 America/Bogota o bajo demanda. Disparadores: "entrega los influencers", "entregar influencers pendientes", "/entregar-influencers".
---

# Entregar Influencers (Notion → cliente vía GHL)

Cada mañana (9:00 Bogotá) o cuando Manuel lo pida: **cada fila Pendiente de 📋 Entregas Influencers recibe UNA influencer del Catálogo** y GHL le manda el email al cliente. Viktor es el centro del flujo: nadie más toca Notion ni dispara el email.

> ⚠️ **REGLAS DE ENTORNO:** usa tus propios conectores (Notion, navegador, HTTP, Slack). Nada depende de una máquina local. **No uses automations nativas de Notion ni campos custom de GHL** — todo el estado vive en Notion.

**Archivos de esta skill:**
- `references/CONFIG.md` — IDs de Notion, URL del webhook de GHL, formato del payload. **Léelo antes de empezar.**
- `references/REQUISITOS.md` — checklist con auto-tests. Validar la primera vez y cuando algo falle.
- `references/PUBLICAR-PAGINA.md` — procedimiento de BACKUP para publicar una fila del Catálogo con el navegador si no está live.
- `references/EMAIL-GHL.md` — qué hace GHL con el webhook (copy del email); solo referencia.
- `scripts/publicar_pagina.js` — JS que ejecuta el flujo de publicación completo en Notion (para el backup).
- `scripts/verificar_publicada.py` — comprueba por HTTP que una página está live en el dominio custom.

---

## 0. Modelo de datos (resumen)

**🗂 Catálogo de Influencers** (`data_source_id` en CONFIG) — una fila por influencer:
`Name` = `"NNN - Nombre"`, `Nombre`, `userDefined:ID` (número), `Estado` (`Disponible` | `Reservado` | `Entregado`), `Descargar` (URL del ZIP en Drive), `Cliente` (relación → Entregas).

**📋 Entregas Influencers** (`data_source_id` en CONFIG) — una fila por compra, la crea GHL:
`Cliente` (title, nombre del comprador), `Email`, `Teléfono`, `Estado` (`Pendiente` | `Entregado` | `Error`), `Influencer` (relación → Catálogo), `Link entrega` (URL pública), `Fecha entrega` (date), `Notas`, `GHL Contact ID`, `Orden GHL`, `Monto`, `Creado` (auto), `Fecha compra` (fórmula = Creado), `Link ZIP` (rollup del Catálogo, solo lectura).

**URL pública de una influencer** = `https://l.influencerviral.io/{page_id del Catálogo sin guiones}`.

---

## 1. PROCESO (cada ejecución)

### Paso 1 — Leer pendientes
Consulta Entregas con `Estado = Pendiente`, ordenadas por `Creado` ascendente (la más antigua primero). Si no hay ninguna → reporte corto en Slack ("0 pendientes, stock: N") y fin.

También consulta las filas con `Estado = Error` **que ya tengan `Influencer` asignada**: esas NO se reasignan, solo se reintenta el Paso 6 (webhook). Ver §3.

### Paso 2 — Elegir la influencer
Consulta Catálogo con `Estado = Disponible` y `userDefined:ID >= 102`, ordenada por `userDefined:ID` ascendente, y toma la **primera**. Guarda: `page_id`, `Name`, `Nombre`, `userDefined:ID`, `Descargar` (ZIP).

- **Re-consulta antes de cada asignación** (no reutilices la lista): así nunca se asigna la misma influencer a dos clientes.
- Si no queda ninguna Disponible → marca la fila de Entregas como `Error` con `Notas = "Sin stock de influencers"`, avisa a Manuel en Slack como **URGENTE**, y pasa a la siguiente (que también fallará; reporta todas juntas).
- La **101 - Lena** nunca se entrega (ya está `Entregado`; es la muestra).

### Paso 3 — Verificar que la página está publicada
Comprueba `https://l.influencerviral.io/{page_id sin guiones}` con `scripts/verificar_publicada.py` (o un GET con tu conector HTTP). Criterio: responde **200 Y el HTML contiene el propio `page_id`** (con o sin guiones).
> ⚠️ Notion Sites devuelve 200 para CUALQUIER id, exista o no, y el nombre de la influencer no está en el HTML (render en cliente). Un 200 a secas NO significa publicada; el `page_id` en el HTML sí.

- Si **NO** está live → ejecuta el **backup de publicación** (`references/PUBLICAR-PAGINA.md`) con tu navegador y vuelve a verificar. Si sigue sin estar live → `Error` + `Notas = "Página no publicada: {Name}"`, Slack a Manuel, siguiente cliente. **No entregues un link que no abre.**

### Paso 4 — Marcar el Catálogo
Actualiza la fila de la influencer: `Estado = "Entregado"`, `Cliente = [page_id de la fila de Entregas]` (relación).

### Paso 5 — Marcar Entregas
Actualiza la fila del cliente: `Influencer = [page_id de la influencer]`, `Link entrega = URL pública`, `Fecha entrega = ahora` (ISO 8601 con zona, ej. `2026-09-07T09:03:00-05:00`), `Estado = "Entregado"`.

> Orden importante: primero Catálogo (Paso 4), luego Entregas (Paso 5), luego GHL (Paso 6). Si algo falla a mitad, el estado en Notion dice exactamente dónde se quedó.

### Paso 6 — Avisar a GHL (dispara el email al cliente)
`POST` a la URL del **Inbound Webhook** de GHL (CONFIG) con este JSON (todas las claves en minúsculas, exactamente así — GHL las usa como merge fields del email):

```json
{
  "email": "cliente@correo.com",
  "first_name": "Nombre del cliente",
  "contact_id": "wlKrxv2nU6dvtQpAuKzB",
  "influencer_id": "104",
  "influencer_nombre": "Chloe",
  "influencer_name": "104 - Chloe",
  "zip_url": "https://drive.google.com/file/d/.../view?usp=sharing",
  "notion_url": "https://l.influencerviral.io/3ce108f0654581...",
  "entrega_page": "https://www.notion.so/3d3108f0..."
}
```
- `email` = el de la fila de Entregas **sin espacios ni tabs** (aplica `trim`). `first_name` = primera palabra de `Cliente`.
- Respuesta esperada: **2xx**. Si no → la entrega en Notion se mantiene (la influencer ya es de ese cliente), pero pon `Estado = "Error"` y `Notas = "GHL webhook falló: {código/motivo}"`. Se reintenta en la próxima ejecución (§3).

### Paso 7 — Siguiente cliente
Repite Pasos 2-6 para cada Pendiente, **en orden y de uno en uno**.

### Paso 8 — Reporte en Slack (siempre)
Al terminar, un mensaje a Manuel en el canal donde se programó la tarea:
```
📦 Entregas {fecha} — {N} entregadas, {E} errores
• Ana García → 104 - Chloe ✅
• Luis Pérez → 105 - Ingrid ✅
• Marta Ruiz → ❌ GHL webhook falló (reintento mañana)
Stock disponible: 146
```
Si el stock disponible es **< 10** → añade ⚠️ "Quedan pocas influencers, hay que migrar/crear más".

---

## 2. REGLAS DE NEGOCIO
- **Una compra = una influencer.** Si el mismo email compra dos veces (dos filas), recibe dos influencers distintas. Solo se considera duplicado si la **`Orden GHL` es la misma** que la de una fila ya Entregada → en ese caso marca `Error` + `Notas = "Orden duplicada de {url fila original}"` y no asignes nada.
- **Asignación = ID más bajo Disponible**, sin excepciones, salvo que Manuel indique una influencer concreta en `Notas` de la fila (formato `Asignar: 120`) → entonces usa esa si está Disponible.
- **Nunca reasignes** una influencer ya `Entregado` ni cambies la relación de una fila ya Entregada.
- **No borres nada.** Ni filas, ni páginas, ni propiedades.
- Idempotencia: si te vuelven a lanzar el mismo día, las Entregadas no se tocan; solo Pendientes y Errores reintentables.

---

## 3. REINTENTOS (filas en `Error`)
| Situación en la fila | Qué hacer |
|---|---|
| `Error`, con `Influencer` asignada y `Link entrega` | Solo reenviar el webhook (Paso 6). Si va bien → `Entregado`, limpiar `Notas`. |
| `Error`, sin `Influencer`, `Notas` = "Sin stock" | Reintentar asignación completa (Pasos 2-6) si ya hay stock. |
| `Error`, `Notas` = "Página no publicada" | Reintentar backup de publicación y Pasos 3-6. |
| `Error`, `Notas` = "Orden duplicada" | No hacer nada; Manuel decide. |

---

## 4. QA (por entrega)
- Catálogo: la influencer pasó a `Entregado` y su `Cliente` apunta a la fila correcta.
- Entregas: `Estado = Entregado`, `Influencer`, `Link entrega`, `Fecha entrega` rellenos; `Link ZIP` (rollup) muestra el Drive.
- `Link entrega` abre en incógnito y muestra las 21 fotos.
- GHL respondió 2xx (el email lo envía el workflow de GHL; si Manuel dice que no llegó, revisa primero el mapeo de `email` en el payload).

---

## 5. GOTCHAS
- El **email de GHL puede llegar con un tab/espacio delante** (mapeo de merge fields). Siempre `trim` antes de usarlo.
- `Fecha compra` es **fórmula** y `Link ZIP` es **rollup**: no intentes escribirlas.
- `userDefined:ID` es la clave exacta del número de influencer en el conector de Notion (la propiedad se llama `ID`).
- Las páginas del Catálogo ya están publicadas (101-251, hecho el 2026-09-06). El backup de §Paso 3 es para filas nuevas o si alguien despublicó.
- La URL pública usa el `page_id` **sin guiones**. Nunca uses `expertoss.notion.site` en el email: el dominio del cliente es `l.influencerviral.io`.
- No proceses upsells: GHL solo crea filas para el producto Influencer IA; si ves un `Monto` de 97 o 197, marca `Error` + `Notas = "Upsell, no es compra de influencer"` y avisa.
- Zona horaria: **America/Bogota** para "hoy" y para `Fecha entrega`.

---

## 6. RITMO
Secuencial, un cliente cada vez (~30-60 s por entrega si la página ya está live; +2-3 min si hay que publicarla). Volumen esperado: 1-10 al día.
