# Workflow de GHL "Influencer IA · Email de entrega" (referencia)

Lo configura Manuel en GHL. Viktor solo necesita saber qué recibe el cliente y qué claves del payload usa el email.

## Trigger
**Inbound Webhook** → genera una URL única. Esa URL va en `CONFIG.md`. GHL expone cada clave del JSON como `{{inboundWebhookRequest.<clave>}}`.

Pasos recomendados en el workflow:
1. Trigger: Inbound Webhook.
2. Acción **Find/Update contact** por `{{inboundWebhookRequest.email}}` (o usar `contact_id`) para que el email salga asociado al contacto correcto.
3. Acción **Send Email** (plantilla de abajo).
4. (Opcional) Añadir tag `influencer-entregada` y nota interna con `{{inboundWebhookRequest.influencer_name}}`.

## Email al cliente (plantilla)

**Asunto:** Tu influencer IA está lista 🎉 — {{inboundWebhookRequest.influencer_name}}

**Cuerpo:**

Hola {{inboundWebhookRequest.first_name}},

Ya tienes tu influencer IA asignada: **{{inboundWebhookRequest.influencer_name}}**.

👉 **Ver tu influencer (galería de 21 fotos):**
{{inboundWebhookRequest.notion_url}}

📦 **Descargar todas las fotos en ZIP:**
{{inboundWebhookRequest.zip_url}}

Las 21 imágenes vienen en JPEG, numeradas y listas para usar (10 ángulos + 11 escenarios). Guarda este email: el link de la galería es tuyo y siempre estará disponible.

Si tienes cualquier duda, responde a este correo.

Un abrazo,
Equipo Expertos

## Datos que manda Viktor (para el picker de merge fields)
`email`, `first_name`, `contact_id`, `influencer_id`, `influencer_nombre`, `influencer_name`, `zip_url`, `notion_url`, `entrega_page`.

## Prueba
Manuel crea el workflow y lo publica → pasa la URL a Viktor (CONFIG) → Viktor manda un POST de prueba con `email = hola+negocio@expertos.io` → debe llegar el email con los dos links funcionando.
