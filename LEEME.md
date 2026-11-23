# Publicar en Netlify (guardado automático)
1. Sube esta carpeta a GitHub y en Netlify elige "Import from Git" (o `npx netlify deploy --prod` dentro de la carpeta). Netlify instala lo necesario y activa las funciones.
2. Entra a tu-sitio/#/admin con usuario `tecnoespacio` y tu contraseña. Cambia la contraseña en la pestaña Acceso.
3. Todo lo que edites se guarda solo (textos, colores, fotos). Las fotos quedan en Netlify Blobs.
Arrastrar la carpeta a Netlify Drop no instala dependencias de funciones: usa Git o el CLI.

# Asistente IA gratis (pestaña "Asistente IA" del panel)
Escribes "crea una promo de 25% en clósets hasta fin de mes con la foto que adjunto" o "cambia el acento a verde olivo"; te muestra los cambios y tú pulsas Aplicar.

En Netlify: Site configuration > Environment variables, agrega:
- `LLM_API_KEY` (obligatoria): clave gratis. Recomendado Groq: https://console.groq.com (sin tarjeta).
- `LLM_BASE_URL` (opcional): por defecto Groq `https://api.groq.com/openai/v1`.
  Otras gratis y compatibles: Gemini `https://generativelanguage.googleapis.com/v1beta/openai/` (modelo `gemini-2.5-flash`) u OpenRouter `https://openrouter.ai/api/v1` (modelo terminado en `:free`).
- `LLM_MODEL` (opcional): por defecto `llama-3.3-70b-versatile`.
- `PIXABAY_KEY` (opcional, gratis en pixabay.com/api/docs): para que la IA busque fotos de stock. Mejor aquí que en el panel, porque la clave del panel queda dentro de los datos públicos del sitio.
Luego vuelve a desplegar. Los límites gratis cambian: si sale "límite agotado", espera un minuto.
Fotos: "adjunta" usa las que subas en el asistente; "buscar" usa Pixabay; "ia" intenta generar una imagen con Pollinations (gratis, sin clave, puede tardar o fallar).

# Catálogo
- Las imágenes de ejemplo están en `public/img/cat` (ilustraciones y texturas generadas, NO fotos reales). Cámbialas desde el panel cuando tengas las reales.
- Colores Duratex (colecciones 2023 a 2026) con tono aproximado. Colores, Herrajes, Electrodomésticos y Mesones salen de la A a la Z.
- Al abrir el sitio con datos ya guardados, el catálogo se actualiza solo (no pisa lo que hayas editado).
