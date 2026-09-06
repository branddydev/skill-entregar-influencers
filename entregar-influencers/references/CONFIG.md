# CONFIG — `entregar-influencers`

Constantes. Usar EXACTAMENTE estos valores.

## Notion

| Qué | Valor |
|---|---|
| Teamspace | 💁🏻‍♀️ Influencer IA — `3ce108f0-6545-81fb-b5c5-0042dfb64010` |
| Home (dashboard) | `4be108f0-6545-8389-b073-01b4d896a98b` |
| 🗂 Catálogo de Influencers — database id | `3526026c8b5847a09b13f951a6fa1d61` |
| 🗂 Catálogo — **data_source_id** (para consultas/creación) | `1c020f24-1257-4385-b46b-4a53df58d57c` |
| 📋 Entregas Influencers — database id | `1893dedb-a2e9-4354-af9d-a1635c7108cd` |
| 📋 Entregas — **data_source_id** | `62d02468-e0be-41e3-b603-96c5a71f1c86` |
| ⚙️ Sistema (doc interna del flujo) | `3d3108f0-6545-810f-95e7-cc7be39dcc54` |
| Template "Nuevo Influencer" (solo para crear influencers nuevas, no para entregar) | `3ce108f0-6545-8011-9663-ca9bc0fb34f2` |

**Vistas útiles de Entregas:** ⏳ Pendientes (Estado = Pendiente), ✅ Entregadas.

### Claves exactas de propiedades (conector Notion)

Catálogo: `Name` (title) · `Nombre` (text) · `userDefined:ID` (number) · `Estado` (select: Disponible/Reservado/Entregado) · `Descargar` (url) · `Cliente` (relation → Entregas) · `Ultima Edicion` (auto).

Entregas: `Cliente` (title) · `Email` (email) · `Teléfono` (phone) · `Estado` (select: Pendiente/Entregado/Error) · `Influencer` (relation → Catálogo) · `Link entrega` (url) · `Fecha entrega` (date) · `Notas` (text) · `GHL Contact ID` (text) · `Orden GHL` (text) · `Monto` (number $) · `Creado` (auto) · `Fecha compra` (fórmula, solo lectura) · `Link ZIP` (rollup, solo lectura).

## Dominio público

| Qué | Valor |
|---|---|
| Dominio custom del sitio Notion | `l.influencerviral.io` |
| URL pública de una influencer | `https://l.influencerviral.io/{page_id sin guiones}` — ej. `https://l.influencerviral.io/3ce108f0654581ce9b59f15eaefb1ef9` (251 - Barbora) |
| Dominio Notion por defecto (NO usar en emails) | `expertoss.notion.site` |

## GHL

| Qué | Valor |
|---|---|
| Location | `54uLLGrmuN0McsFyy8qQ` (Expertos, tz America/Bogota) |
| **Inbound Webhook URL** (workflow "Influencer IA · Email de entrega") | `https://services.leadconnectorhq.com/hooks/54uLLGrmuN0McsFyy8qQ/webhook-trigger/d6caaa24-5e18-4e34-b8fb-c0a87aa4d893` |
| Método / formato | `POST`, `Content-Type: application/json`, sin auth (la URL es el secreto) |
| Respuesta esperada | 2xx (GHL suele devolver 200 con `{"status":"Success"}`) |

### Payload del webhook (claves fijas)
```json
{
  "email": "...",
  "first_name": "...",
  "contact_id": "...",
  "influencer_id": "104",
  "influencer_nombre": "Chloe",
  "influencer_name": "104 - Chloe",
  "zip_url": "https://drive.google.com/file/d/.../view?usp=sharing",
  "notion_url": "https://l.influencerviral.io/...",
  "entrega_page": "https://www.notion.so/..."
}
```
En GHL estos campos se usan en el email como `{{inboundWebhookRequest.zip_url}}`, `{{inboundWebhookRequest.notion_url}}`, etc. (ver `EMAIL-GHL.md`).

## Slack
Reportar en el canal donde Manuel programó la tarea diaria. Mencionar a Manuel solo en errores/urgencias (sin stock, webhook caído).

## Horario
Ejecución programada: **todos los días 9:00 America/Bogota**. También bajo demanda.
