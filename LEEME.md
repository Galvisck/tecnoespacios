# Publicar en Netlify (guardado automático)
1. Sube esta carpeta a GitHub y en Netlify elige "Import from Git" (o `npx netlify deploy --prod` dentro de la carpeta). Netlify instala lo necesario y activa las funciones.
2. Entra a tu-sitio/#/admin con usuario `tecnoespacio` y tu contraseña. Cambia la contraseña en la pestaña Acceso.
3. Todo lo que edites se guarda solo (textos, colores, fotos, reseñas). Las fotos quedan en Netlify Blobs.
Arrastrar la carpeta a Netlify Drop no instala dependencias de funciones: usa Git o el CLI.

# Asistente IA: la clave se pega en la página
Panel > Asistente IA > **Conexión de la IA**:
1. Elige el servicio (Groq, Gemini y OpenRouter tienen opción gratis) y pulsa "Conseguir una clave".
2. Pega la clave y pulsa **Guardar y probar**. Si responde, ya puedes escribirle al asistente.
La clave se guarda en tu cuenta de Netlify (no en los datos públicos del sitio) y nunca se muestra completa. Ya no necesitas variables de entorno; si las tienes (`LLM_API_KEY`, `LLM_BASE_URL`, `LLM_MODEL`) sirven de respaldo.
Los modelos gratis cambian con el tiempo: si uno deja de funcionar, cambia el nombre en el campo "Modelo".
Fotos con IA: "adjunta" usa las que subas en el asistente; "buscar" usa Pixabay (clave opcional en la pestaña Búsqueda y guardado o variable `PIXABAY_KEY`).

# Reseñas de clientes
- Los clientes dejan su reseña (nombre, estrellas y opinión) en la sección **Reseñas** del sitio.
- Por defecto quedan **pendientes**: las apruebas en Panel > Reseñas (Aprobar, Ocultar o Borrar).
- Si prefieres que salgan sin revisión, marca "Publicar las reseñas sin revisarlas antes".
- Protección contra spam: campo oculto y límite de 3 reseñas por hora por conexión. Las aprobadas salen también en el inicio (las 3 más recientes).

# Catálogo
Colores, Mesones, Herrajes y Electrodomésticos empiezan **vacíos**: agrégalos desde el panel. Cada sección aparece en el menú del sitio cuando tiene al menos un elemento.
Si el sitio ya tenía datos guardados, el catálogo base anterior se quita solo la primera vez que entres al panel; lo que hayas creado tú con tus propias descripciones se conserva.
