# Asistente conversacional de TECNO ESPACIOS

El chat ahora utiliza un flujo ramificado en `public/chat-flujos.js` y el motor de conversación de `netlify/functions/chat.mjs`.

## Qué incluye
- Más de 120 nodos de conversación (preguntas y destinos).
- Inicio por saludo y detección de intención.
- Rutas para cocinas, closets, muebles de baño, otros muebles y proyectos completos.
- En cada servicio: cotización, diseño, ideas e información.
- Preguntas sobre estado del espacio, medidas, estilo, acabado, accesorios y ciudad.
- Si no reconoce la respuesta, repite la pregunta con una aclaración.
- La conversación termina solicitando datos para que el equipo comercial continúe.
- El chat conserva el estado de la rama por sesión.

## Cómo ampliar las ramificaciones desde el panel
1. Entra al panel administrativo.
2. Abre **Clientes → Chat en vivo → Respuestas**.
3. Despliega **Editor avanzado de ramificaciones**.
4. Edita el JSON y sal del campo para guardar. El panel valida que el JSON sea correcto y que exista el nodo inicial.
5. Cada nodo usa esta estructura:

```json
{
  "message": "¿Qué tipo de acabado prefieres?",
  "options": [
    {
      "label": "Madera",
      "keywords": ["madera", "roble", "nogal"],
      "next": "acabado_madera"
    },
    {
      "label": "Color claro",
      "keywords": ["blanco", "beige", "claro"],
      "next": "acabado_claro"
    }
  ],
  "fallback": "Puedes elegir una opción o explicarme qué buscas."
}
```

Añade los nodos de destino dentro de `nodes`:

```json
"acabado_madera": {
  "message": "¿Prefieres roble o nogal?",
  "options": [
    {"label": "Roble", "keywords": ["roble"], "next": "pregunta_medidas"},
    {"label": "Nogal", "keywords": ["nogal"], "next": "pregunta_medidas"}
  ],
  "fallback": "Dime si prefieres roble o nogal."
},
"pregunta_medidas": {
  "message": "¿Cuáles son las medidas aproximadas?",
  "any": true,
  "next": "salida"
},
"salida": {
  "message": "Gracias. Nuestro equipo se pondrá en contacto contigo.",
  "end": true
}
```

- `message`: texto que envía el asistente.
- `options`: opciones que muestra numeradas y que el cliente puede elegir por número o por palabras clave.
- `keywords`: sinónimos y formas habituales de responder.
- `next`: identificador del siguiente nodo.
- `fallback`: respuesta cuando no entiende lo que escribió el cliente.
- `any: true`: acepta cualquier respuesta y continúa al siguiente nodo.
- `end: true`: marca el cierre del flujo.

**Importante:** cada `next` debe coincidir exactamente con el ID de un nodo existente. Conserva `start` y `nodes` en la estructura principal. Antes de publicar cambios grandes, guarda una copia del JSON actual.

## Nota de integración
El proyecto utiliza JavaScript en el navegador y funciones serverless de Netlify. No necesita instalar Python ni ejecutar un servidor Python para que el chat funcione.
