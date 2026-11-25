# Publicar en Netlify (guardado automático)
1. Sube esta carpeta a GitHub y en Netlify elige "Import from Git" (o `npx netlify deploy --prod` dentro de la carpeta). Netlify instala lo necesario y activa las funciones.
2. Entra a tu-sitio/#/admin con usuario `tecnoespacio` y tu contraseña. Cambia la contraseña en la pestaña Acceso.
3. Todo lo que edites se guarda solo (textos, colores, fotos, reseñas). Las fotos quedan en Netlify Blobs.
Arrastrar la carpeta a Netlify Drop no instala dependencias de funciones: usa Git o el CLI.

# Apariencia
Panel > Apariencia:
- **Predefinidas**: 6 combinaciones listas (colores y letras). Pulsa "Aplicar".
- **Mis apariencias**: personaliza colores y letras abajo, escribe un nombre y pulsa "Guardar". Luego la aplicas o la borras cuando quieras (hasta 30).
- Hay 49 tipos de letra: modernas, con serifa, llamativas para títulos, manuscritas y del sistema.

# Reseñas de clientes
- Los clientes dejan su reseña (nombre, estrellas y opinión) en la sección **Reseñas** del sitio.
- Por defecto quedan **pendientes**: las apruebas en Panel > Reseñas (Aprobar, Ocultar o Borrar).
- Si prefieres que salgan sin revisión, marca "Publicar las reseñas sin revisarlas antes".
- Protección contra spam: campo oculto y límite de 3 reseñas por hora por conexión. Las aprobadas salen también en el inicio (las 3 más recientes).

# Catálogo
Colores, Mesones, Herrajes y Electrodomésticos empiezan **vacíos**: agrégalos desde el panel. Cada sección aparece en el menú del sitio cuando tiene al menos un elemento.
Si el sitio ya tenía datos guardados, el catálogo base anterior se quita solo la primera vez que entres al panel; lo que hayas creado tú con tus propias descripciones se conserva.
Buscar fotos: en la pestaña Búsqueda y guardado puedes poner una clave gratis de Pixabay; sin clave, el botón abre Google Imágenes.

# Añadir productos rápido (panel > Colores, Mesones, Herrajes, Electrodomésticos, Proyectos)
- A la izquierda están las **categorías** (con conteo). Elige una y todo lo que añadas queda dentro. «+ Nueva categoría» y «✎ Renombrar» las gestionan.
- **Añadir rápido**: nombre + subtítulo (ya viene con la categoría) + enlace de foto opcional, y Enter. En Colores el tono se toma solo de la foto.
- **Subir varias fotos** (o arrastrarlas al cuadro): crea un producto por foto con el nombre del archivo.
- **Pegar lista**: una línea por producto `Nombre | Subtítulo | https://foto | #color` (también sirve pegar columnas de Excel).
- Cada fila se edita ahí mismo (nombre, categoría, color; clic en la miniatura para cambiar la foto).
- En el sitio público las categorías también salen a la izquierda (arriba en celular).


# Rediseño visual y SEO
Esta versión conserva el panel administrativo y el guardado persistente existente mediante Netlify Blobs. No requiere Supabase.

Mejoras incluidas:
- Nueva identidad visual editorial en tonos cálidos, madera y neutros.
- Encabezado, navegación, botones, tarjetas, galerías y formularios rediseñados.
- Mejor adaptación a móviles, accesibilidad básica y movimiento reducido.
- Títulos y descripciones por sección.
- Metadatos para compartir en redes sociales.
- Datos estructurados de tipo FurnitureStore.
- `robots.txt` y `sitemap.xml`.
- Cabeceras básicas de seguridad y caché en Netlify.

## Pasos recomendados para mejorar la presencia en Google
1. Publica el proyecto desde GitHub conectado a Netlify. No uses Netlify Drop, porque las funciones de Netlify Blobs deben desplegarse correctamente.
2. Comprueba que `https://tecnoespacios.homes/robots.txt` y `https://tecnoespacios.homes/sitemap.xml` abran correctamente.
3. Registra el dominio en Google Search Console, verifica la propiedad y envía `https://tecnoespacios.homes/sitemap.xml`.
4. En Search Console revisa la inspección de URL, indexación, consultas y errores.
5. Completa un Perfil de Empresa en Google con el nombre real, teléfono, ubicación o zona de servicio, horarios, fotos y categorías correctas.
6. Publica fotografías reales de trabajos con nombres descriptivos y texto alternativo; agrega descripciones originales a cada proyecto.
7. Pide reseñas auténticas a clientes y responde de forma profesional.
8. Mantén actualizados los proyectos, servicios, datos de contacto y contenido.

El SEO no garantiza aparecer primero ni que Google muestre siempre el sitio para cualquier búsqueda. La posición depende de muchos factores y toma tiempo. Esta versión deja una base técnica y de contenido mejor preparada, pero se debe trabajar continuamente y medir los resultados en Search Console.

Importante: el dominio y los datos de contacto del marcado estructurado deben revisarse si cambian. Añade la ciudad o zona real de atención en el contenido público desde el panel; no publiques una dirección que no quieras hacer pública.
