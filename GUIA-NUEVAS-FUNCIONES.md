# Guía de las nuevas funciones comerciales

## Panel de administración

El panel abre en **Resumen**, con accesos a las tareas frecuentes. El menú
agrupa las secciones por trabajo y permite buscarlas por nombre. Pulsa
**Organizar menú** y usa las flechas para ordenar los grupos. La preferencia
queda guardada en ese navegador.

## 1. Personalizador de muebles (público: menú «Personalizador»)
El cliente avanza por pasos: **Tipo → Diseño → Estilo → Colores → Materiales → Medidas → Resumen**. Puede elegir
tres distribuciones por tipo de mueble. La vista previa muestra la distribución
seleccionada y responde en el momento a los cambios de acabado.
- **Colores:** se toman de **Catálogo → Colores**. Si ese catálogo está
  vacío, el cliente puede probar la paleta marcada como referencia.
- **Mesones:** en **Catálogo → Mesones**, marca **Disponible** para incluir
  un acabado en el selector de mesón. Los acabados disponibles se combinan
  con los colores en el mismo paso del personalizador.
- Cada color se muestra con su foto, nombre, referencia y categoría. Se usa **solo un recorte central de 220×220 px** de la foto (para evitar las letras de los bordes), tanto en la tarjeta como en la vista previa y la ampliación (🔍).
- El cliente puede asignar un color distinto a **puertas, estructura, cajones, laterales y divisiones**, o «todas las partes» a la vez. Las cocinas y los lavaderos permiten elegir por separado el acabado de las puertas superiores.
- Al enviar se guardan, por cada color: nombre, categoría, **código del catálogo, referencia** e imagen. El servidor valida el catálogo vigente y guarda como referencias los colores de muestra cuando corresponde.
- **Referencia:** en Catálogo → Colores (y Mesones) → **Editar** hay un campo nuevo «Código / referencia». Si lo dejas vacío, solo se muestran nombre y categoría (no se inventa nada).
- Salidas: **Solicitar cotización**, **Enviar por WhatsApp** (abre WhatsApp con el resumen), **Enviar al chat** (el resumen llega al chat en vivo) y **Guardar como solicitud**. Las cuatro registran la solicitud y reciben un código `SOL-XXXXXX`.
- **Precios:** nunca se inventan. Muestra «Valor sujeto a cotización» salvo que configures tarifas (ver abajo).

**Panel → Comercial → Personalizador y solicitudes**
- *Solicitudes:* lista con filtros; el detalle muestra todas las elecciones, los colores con foto/nombre/código/referencia, medidas y observaciones. Puedes cambiar el estado, dejar una nota, relacionarla con otro cliente, **crear el proyecto** o eliminarla.
- *Configuración:* edita las listas de estilos, materiales, puertas, cajones, tiradores y herrajes (una por línea; «Nombre | 50000» suma un valor). Las listas que traen son opciones genéricas de partida: **revísalas y ajústalas a lo que realmente ofreces**. Si vacías una lista, ese paso se oculta. Las **tarifas por m²** (por tipo de mueble) activan el «valor estimado referencial» = tarifa × ancho × alto + extras configurados. Sin tarifa → sujeto a cotización.

## 2. Seguimiento de proyectos
**Cliente (menú «Seguimiento»):** ingresa el código (`TE-XXXXXX`) y el teléfono o correo con el que se registró. Ve estado actual, línea de los 9 estados, fecha de inicio, entrega estimada, novedades, fotos de avance e historial.
**Protección:** si el dato no coincide, el mensaje es genérico (no revela si el código existe); tras 10 intentos fallidos en 15 minutos se bloquea temporalmente esa conexión; la nota interna nunca se envía al cliente.

**Panel → Comercial → Seguimiento de proyectos**
- «Nuevo proyecto» (o «Crear proyecto» desde una solicitud o un cliente) genera el **código único**. Desde el detalle puedes copiarlo o enviarlo por WhatsApp al cliente (tú decides cuándo; no hay envíos automáticos).
- «Actualizar estado / novedad» cambia el estado, la fecha de entrega, la novedad visible y la nota interna. Cada cambio queda en el historial. También puedes subir fotos de avance con descripción.

## 3. Estadísticas (Panel → Comercial → Estadísticas)
- Visitas totales, hoy, 7 y 30 días; visitantes únicos (se cuenta una vez por día cada visitante) y nuevos; páginas, proyectos, productos y promociones más vistos; clics en WhatsApp y contacto; % de visitantes que hicieron alguna acción; gráfico por día con comparación contra el período anterior; evolución de solicitudes de cotización; período 7/30/90 días o personalizado.
- **Solicitudes de cotización, formularios enviados y solicitudes del personalizador** se cuentan desde los registros reales (siempre). El resto requiere que el visitante **acepte la medición anónima** (aviso al entrar; se puede cambiar desde «Medición anónima» en el pie).
- **Privacidad:** solo contadores. No se guarda IP, nombre, ni identificadores; no hay cookies de seguimiento; se respeta «No rastrear» del navegador; tus propias visitas al panel no se cuentan.
- **Datos de prueba vs reales:** un cartel indica «Entorno de pruebas» en local y vistas previas. Solo el dominio publicado se marca como datos reales.

## 4. CRM de clientes (Panel → Comercial → CRM de clientes)
- **Registro automático** (sin duplicados: mismo teléfono o correo = mismo cliente): personalizador, formulario de contacto y chat (el chat ahora tiene un campo opcional de teléfono; solo con teléfono se registra). Si el cliente ya existe, la nueva solicitud se relaciona con él y se suma su origen.
- **Tablero** por estados (arrastra la tarjeta a otra columna, o usa el selector de la tarjeta), **Lista** con búsqueda y filtros (estado, origen, tipo, fecha), **Alertas** y **Copias**.
- En la ficha: editar datos, estado, valor de la oportunidad, recordatorios, registro de llamadas/contactos, notas, cotizaciones (con estado), solicitudes y proyectos relacionados, historial de conversaciones (chat y formularios) y actividad. Eliminar pide confirmación.
- **Alertas:** recordatorios vencidos o próximos, clientes que escribieron y no tienen respuesta registrada (más de 1 día) y oportunidades sin seguimiento (por defecto 3 días; configurable en Personalizador → Configuración).
- **Copias de seguridad:** se crea una copia automática por día (se guardan las últimas 14). Puedes crear una al instante, descargar todo en JSON y restaurar desde un archivo (antes de restaurar se guarda lo actual). *Las fotos de avance no van dentro del JSON; se conservan en el almacén.*

## Servicios o configuraciones pendientes
- Nada externo es obligatorio. El correo de avisos (Resend) sigue siendo opcional y se configura como antes.
- Revisar y ajustar las listas de opciones y, si quieres, las tarifas.
- Rellenar el «Código / referencia» de los colores y mesones si los tienen.
- Si publicas en un dominio distinto a `tecnoespacios.homes`, define `ENTORNO=produccion` en Netlify para que las estadísticas cuenten como reales.
- Los avisos legales (política de privacidad completa) deben ser revisados por quien administre el negocio; el sitio solo incluye el aviso breve de medición.

## Límites conocidos
- Netlify Blobs no tiene incrementos atómicos: si dos personas escriben en el mismo milisegundo, una actualización podría perderse (improbable con este volumen).
- Las fotos de avance tienen enlaces no adivinables, pero no son privadas: cualquiera que tenga el enlace exacto puede verlas.
