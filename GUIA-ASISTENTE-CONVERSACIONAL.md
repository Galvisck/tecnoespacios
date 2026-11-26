# Asistente de TECNO ESPACIOS

El visitante puede empezar con una pregunta escrita o elegir Cotizar, Ver diseños,
Seguimiento o Hablar con un asesor. Para las preguntas frecuentes, el asistente
responde en el chat y enlaza a la sección correspondiente cuando aplica.

Arrastra el botón del chat o el encabezado de la ventana para moverlos por
separado. Las posiciones se guardan en el navegador. Con el teclado, enfoca
el botón del chat o el control «Mover ventana del chat» y usa las flechas.
La tecla Inicio restaura la posición predeterminada.

Cerrar la ventana conserva la conversación. Después de 30 minutos sin mensajes,
la conversación anterior pasa al historial y el visitante puede iniciar otra.

## Atención desde el panel

En **Clientes → Chat en vivo → Activos**, las conversaciones que necesitan ayuda
muestran «Solicita asesor» hasta que el equipo responde. El asistente deja de
intervenir cuando deriva la conversación o escribe un miembro del equipo. El
visitante puede continuar en el chat o enviar voluntariamente su WhatsApp para
que lo contacten. Esos datos se registran mediante la integración existente con
el CRM.

## Respuestas configurables

En **Clientes → Chat en vivo → Respuestas**, las palabras clave guardadas en el
panel tienen prioridad sobre las respuestas frecuentes del asistente. El editor
avanzado permite configurar preguntas adicionales para las consultas que el
asistente no resuelve directamente.

Cada ruta tiene un identificador inicial en `start` y un mapa `nodes`. Cada nodo
puede incluir `message`, `options` (con `label`, `keywords` y `next`), `fallback`,
`any` con `next` para continuar con texto libre, o `end` para cerrar la ruta.
Los destinos deben apuntar a nodos existentes.
