# Informe de pruebas — nuevas funciones comerciales

Entorno: Node 22 + Chromium (Playwright) con las funciones de Netlify ejecutándose contra un almacén Blobs simulado en memoria.
**No se probó contra Netlify real ni con `netlify dev`** (sin internet en el entorno de preparación). Pruébalo en local con `iniciar-local.bat` antes de publicar.

| Bloque | Pruebas | Resultado |
|---|---|---|
| Servidor (solicitudes, CRM, proyectos, seguimiento, estadísticas, copias) | 40 | 40 ✓ |
| Navegador de extremo a extremo (cliente + panel + seguimiento + estadísticas) | 57 | 57 ✓ (ejecutado 3 veces) |
| Regresión (panel anterior, chat, destacados, formulario sin correo) | 12 + 27 | 39 ✓ |

Cubierto: personalizar y enviar (4 canales) · colores = catálogo vigente (12 de 12, categorías, búsqueda, recorte 220×220 verificado en píxeles, ampliar) · textura distinta por parte en la vista previa · quitar un color del catálogo lo elimina de la selección · sin tarifas no hay precio · la solicitud guarda nombre/código/referencia/imagen · cliente creado una sola vez aunque venga de personalizador, formulario y chat · alta manual duplicada rechazada · editar/estado/arrastrar en tablero/recordatorio/contacto/nota/cotización/eliminar con confirmación · alertas y copias (crear, listar, restaurar) · crear proyecto con código · seguimiento con teléfono y con correo · dato incorrecto no revela nada y se bloquea tras 10 intentos · nota interna no visible · actualización de estado y fotos reflejada al cliente · estadísticas (visitas, páginas, ítems, WhatsApp, solicitudes reales, entorno prueba/producción) · al rechazar la medición no se registra nada · datos persisten en un navegador nuevo · vistas móvil y escritorio.
No automatizado (revisar tú): envío real a WhatsApp, avisos por correo (Resend), subida real de fotos a Netlify, y rendimiento con miles de clientes.
