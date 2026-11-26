# Facturas y cotizaciones de TECNO ESPACIOS

Abre **Administración → Facturas y cotizaciones**. Para una factura comercial,
guarda en **Datos de la empresa** la razón social, el NIT con dígito de
verificación, la dirección y la ciudad. Puedes añadir el teléfono, el correo
y el sitio web. El PDF usa el logo del sitio y la tarjeta de presentación que
aparece en **Contacto**. Puedes actualizarla desde **Sitio web → Tarjeta de
presentación** con el frente y el reverso en JPG o PNG.

Selecciona el tipo de documento, completa los datos del cliente y agrega los
productos o servicios. La cantidad admite tres decimales. Los valores se
calculan en pesos colombianos, con el IVA elegido para cada concepto.
Puedes escribir precios como `250000` o `250.000,50`.

**Generar PDF** guarda el documento y la tarjeta en el historial privado del
panel. Puedes descargar ambos archivos y abrir el chat del destinatario para
adjuntarlos manualmente. **Generar y enviar por WhatsApp** hace el envío
automático de los dos PDF cuando WhatsApp Business está configurado y el
cliente ha autorizado recibirlos.

## Si el panel no abre o la factura no se genera

- Publica el proyecto completo desde el repositorio conectado a Netlify,
  incluyendo `public/`, `netlify/`, `netlify.toml`, `package.json` y
  `package-lock.json`. Para probar en Windows, usa `iniciar-local.bat`.
- Comprueba que `/.netlify/functions/documentos` devuelva un mensaje JSON de
  método no permitido al abrir la dirección en el navegador. Si aparece la
  portada o una página 404, el despliegue aún no tiene activa la función.
- En el panel, completa y guarda los datos de empresa. Usa **Generar PDF**
  para crear y descargar los archivos mientras configuras WhatsApp Business.

## Conectar WhatsApp Business

En Meta, habilita **WhatsApp Business Platform Cloud API** para el número
emisor. Crea dos plantillas transaccionales aprobadas por Meta en el mismo
idioma. Ambas deben tener encabezado **Documento** y texto sin variables
ni botones obligatorios. Por ejemplo:

- Documento: «Hola. Adjuntamos el documento comercial que solicitaste a
  TECNO ESPACIOS. Si tienes alguna pregunta, responde a este mensaje».
- Tarjeta: «Adjuntamos la tarjeta de TECNO ESPACIOS con nuestros datos de
  contacto para el servicio que solicitaste».

Configura estas variables privadas en el entorno de **Functions** del sitio
Netlify y vuelve a desplegar. Para el despliegue de la función de documentos, usa Node.js 20 o
posterior.

| Variable | Valor |
| --- | --- |
| `WA_ACCESS_TOKEN` | Token del sistema con permiso `whatsapp_business_messaging` para el número emisor. |
| `WA_PHONE_NUMBER_ID` | Identificador del número emisor en Meta. |
| `WA_TEMPLATE_DOCUMENTO` | Nombre exacto de la plantilla aprobada para factura o cotización. |
| `WA_TEMPLATE_TARJETA` | Nombre exacto de la plantilla aprobada para la tarjeta. |
| `WA_TEMPLATE_LANGUAGE` | Idioma exacto de las dos plantillas. Valor predeterminado `es_CO`. |
| `WA_GRAPH_VERSION` | Versión activa de Graph API. Valor predeterminado `v23.0`. |

El panel informa por separado si WhatsApp aceptó el documento y la tarjeta.
«Aceptado por WhatsApp» significa que Meta recibió la solicitud. Cuando
Meta rechaza un archivo, puedes corregir el problema y reintentar el pendiente.
Si el resultado queda por confirmar, revisa la conversación antes de reenviar
manualmente para evitar duplicados.

La factura de este apartado es un PDF comercial. La emisión de facturas
electrónicas de venta requiere una solución habilitada ante la DIAN.

## Registrar abonos

En **Facturas y cotizaciones → Historial**, abre la factura. En **Abonos**,
indica el valor recibido, la fecha y el medio de pago. Puedes añadir una
referencia. El panel guarda el historial, suma lo pagado y calcula el saldo
pendiente. Los abonos se registran para el control de cobro en el panel.
