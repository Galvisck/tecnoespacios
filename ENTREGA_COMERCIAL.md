# Entrega comercial — TECNO ESPACIOS

Fecha: 26 de noviembre de 2026. Proyecto activo: `C:\Users\TecnoEspacios\Documents\Proyecto predeterminado\tecnoespacios-main`.

Esta entrega convierte el sitio en una plataforma comercial sin reconstruir la web ni tocar el sistema de guardado existente. Las cinco funciones originales (`datos`, `chat`, `resenas`, `shop-cuenta`, `ia`) y los stores `tecnoespacios` y `tecnoespacios-shop` no se modificaron. Los módulos nuevos escriben en un store separado: **`tecnoespacios-comercial`**.

---

## 1. Qué se implementó

### 1.1 Personalizador (`/personalizador`, alias `/configurador`)

- Flujo en tres pasos: tipo/diseño → colores → resumen y envío.
- **Única fuente de colores**: `public/catalogo.js` (`window.TE_CAT`), complementado con los colores que el administrador agregue en Panel > Colores (`D.items` con `k === 'colores'`). No hay lista hardcodeada ni colores inventados.
- Los 56 colores del catálogo se muestran con **fotografía, nombre, referencia/código hexadecimal, descripción y botón de ampliación**.
- Permite **selección múltiple** y asignación por parte: puertas, estructura, cajones, laterales y divisiones.
- La vista previa se actualiza al cambiar colores u opciones; el resumen incluye medidas, materiales, herrajes y observaciones.
- Los listados de modelos, estilos, materiales, puertas, cajones y tiradores se configuran en Panel > Panel comercial > Personalizador y solicitudes. Los colores se ocultan temporalmente desde la misma pantalla, sin borrar su ficha original.
- Envío de la solicitud a la base comercial del CRM. Opcionalmente crea un proyecto con código de seguimiento.
- El botón de WhatsApp abre `wa.me` con el resumen; también puede enviarse al chat en vivo del sitio.
- **No se muestran precios**: el resumen indica «Sujeto a cotización».

### 1.2 Seguimiento de proyectos (`/seguimiento`)

- Código único con formato `TE-YYYYMMDD-XXXX`.
- Verificación privada mediante hash del teléfono o correo registrado. No se publica el dato del cliente en la respuesta.
- Vista pública limitada: estado, hitos, novedades, fechas, fotografías e historial. No expone correo, teléfono, identificador interno ni hashes.
- El administrador puede cambiar estado, agregar novedades, subir fotografías, editar fechas y consultar el historial desde Panel > Panel comercial > Seguimiento de proyectos.
- Nueve etapas: Solicitud recibida, En revisión, Diseño y planificación, Cotización enviada, Cotización aprobada, En fabricación, En preparación para instalación, En instalación y Proyecto finalizado.

### 1.3 Estadísticas reales

- Se registran eventos de visita, sección, proyecto, producto, promoción, WhatsApp, contacto, formulario, cotización, personalizador, chat y pedido.
- Solo se envían eventos de navegación **después del consentimiento** del visitante. El visitante se identifica con un hash anónimo diario; no se envían correos, teléfonos ni nombres a analítica.
- Panel > Panel comercial > Estadísticas muestra: visitas, visitantes únicos, hoy, 7 y 30 días, solicitudes, conversión, serie diaria, comparación con el período anterior, acciones comerciales, secciones populares, estado del CRM, estado de proyectos y datos existentes de chat, reseñas y tienda.
- Los entornos que no son producción muestran aviso explícito de **datos de prueba**.

### 1.4 CRM

- Registro automático de contactos desde solicitud, WhatsApp, chat, personalizador, TECNO SHOP y reseñas.
- Deduplicación por correo, teléfono (últimos 10 dígitos) o referencia. Nunca se fusiona solo por nombre.
- Historial de cambios, notas, llamadas, tareas/recordatorios, cotizaciones y proyectos vinculados.
- Tablero de oportunidades por siete etapas, con selector y arrastrar y soltar.
- Importación única de contactos existentes de chat, reseñas y tienda **sin modificar los registros originales**.
- Todas las acciones administrativas exigen la credencial del panel. No se envían correos, SMS ni campañas automáticas.

---

## 2. Archivos de la entrega

### Nuevos

| Archivo | Función |
|---|---|
| `netlify/functions/_comun.mjs` | Utilidades compartidas, store aislado, auth, hashes, validación y rate limit. |
| `netlify/functions/eventos.mjs` | Registro de eventos anónimos con consentimiento previo del navegador. |
| `netlify/functions/comercial.mjs` | Solicitudes, configuración, CRM, dedupe y migración. |
| `netlify/functions/proyectos.mjs` | Creación, verificación pública y administración de proyectos. |
| `netlify/functions/estadisticas.mjs` | Agregación real de datos de los stores. |
| `public/catalogo.js` | `window.TE_CAT`: catálogo obligatorio de colores (ya existía, ahora se carga). |
| `public/comercial.js` | Personalizador, seguimiento y panel comercial; parcha `view`, `admin` y `render` sin reescribir `app.js`. |
| `PRUEBAS_COMERCIALES.ps1` | 26 pruebas de API y rutas. |
| `PRUEBAS_UI_COMERCIAL.mjs` | 15 pruebas de navegador en escritorio y móvil mediante CDP. |
| `ENTREGA_COMERCIAL.md` | Este documento. |

### Modificados

- `public/index.html`: carga `catalogo.js` y `comercial.js`; caché `?v=20261126e`.
- `public/404.html`: misma versión de caché.
- `public/estilos.css`: componentes del módulo comercial y objetivos táctiles móviles.
- `public/sitemap.xml`: añade `/personalizador` y `/seguimiento`.
- `netlify.toml`: redirect de `/seguimiento` y cabeceras de caché para los scripts nuevos.
- `.env.example`: variables opcionales de sales de analítica y seguimiento.
- `LEEME.md`: referencias actualizadas al personalizador y a esta entrega.

---

## 3. Instrucciones para Windows

### 3.1 Requisitos

- Node.js 22.13 o superior. En este equipo está en `C:\Program Files\nodejs`.
- Si PowerShell bloquea `npm.ps1`, usa el ejecutable directo de Node como se muestra abajo.

### 3.2 Ejecutar en local

Abre PowerShell en la carpeta del proyecto:

```powershell
cd "C:\Users\TecnoEspacios\Documents\Proyecto predeterminado\tecnoespacios-main"
$env:Path = 'C:\Program Files\nodejs;' + $env:Path
& 'C:\Program Files\nodejs\node.exe' '.\node_modules\netlify-cli\bin\run.js' dev --port 8888
```

Si aún no hay dependencias:

```powershell
& 'C:\Program Files\nodejs\npm.cmd' install
```

URLs:

- Sitio: `http://localhost:8888`
- Personalizador: `http://localhost:8888/personalizador`
- Seguimiento: `http://localhost:8888/seguimiento`
- Panel: `http://localhost:8888/#/admin`
- Tienda: `http://localhost:8888/shop`

El entorno local usa Blobs aislados: **no lee ni sobrescribe los datos de producción**.

### 3.3 Publicar

1. Sube la carpeta completa a GitHub (incluye `netlify/functions`, no solo `public`).
2. Conecta el repositorio al mismo sitio de Netlify.
3. Verifica que `/personalizador` y `/seguimiento` respondan y que las funciones nuevas aparezcan en Netlify > Functions.
4. No subas `.env`, `.netlify`, credenciales ni el estado local de Blobs.

---

## 4. Configuración

| Ajuste | Dónde | Observación |
|---|---|---|
| Contraseña del panel | Panel > Cuenta > Acceso | El hash inicial no se cambió. Cámbialo antes de producción. |
| Colores | Panel > Colores | Fuente de `D.items` y de `window.TE_CAT`. |
| Ocultar colores del personalizador | Panel > Panel comercial > Personalizador y solicitudes | No elimina la ficha del catálogo. |
| Modelos, estilos, materiales y herrajes | Panel > Panel comercial > Personalizador y solicitudes | Una opción por línea. |
| Sales de hashes | Netlify > Environment variables | `TE_ANALYTICS_SALT`, `TE_TRACK_SALT`. Opcionales en local, recomendadas en producción. |
| Consentimiento | Aviso automático en el sitio | «Aceptar medidas» habilita estadísticas; «Solo esencial» no envía eventos. |

No hay credenciales nuevas obligatorias. Netlify Blobs se aprovisiona automáticamente al desplegar las funciones.

---

## 5. Uso de cada función

### Personalizar y cotizar

1. Entrar a `/personalizador`.
2. Elegir tipo de mueble, modelo, estilo, materiales, herrajes y medidas.
3. Pulsar «Elegir colores».
4. Elegir una parte, buscar o filtrar por referencia y seleccionar uno o varios colores. El botón ↗ amplía la fotografía del acabado.
5. Repetir para otras partes. Revisar la vista previa y los colores asignados.
6. Pulsar «Revisar solicitud», llenar los datos de contacto y marcar «Guardar también como solicitud de proyecto» si se desea seguimiento.
7. Enviar por cotización, WhatsApp o chat. Si se creó proyecto, el mensaje muestra el código para `/seguimiento`.

### Consultar un proyecto

1. Entrar a `/seguimiento`.
2. Escribir el código `TE-...` y el teléfono o correo registrado.
3. Consultar estado, hitos, novedades, fotos e historial.

### Administrar comercialmente

1. Entrar a `#/admin` y abrir **Panel comercial**.
2. **Personalizador y solicitudes**: configurar listas, ocultar colores, ver solicitudes, marcarlas atendidas y crear proyectos desde una solicitud.
3. **Seguimiento de proyectos**: crear proyectos, cambiar estado, agregar novedades y fotos, ver historial.
4. **Estadísticas**: elegir 7, 30 o 90 días y revisar las métricas reales.
5. **CRM de clientes**: buscar, filtrar, editar, cambiar estado, agregar notas/llamadas/recordatorios, importar contactos existentes y mover tarjetas en el tablero.

---

## 6. Datos, permisos y privacidad

| Store | Claves usadas por los módulos nuevos | Acceso |
|---|---|---|
| `tecnoespacios-comercial` | `config`, `meta`, `eventos`, `contactos`, `solicitudes`, `proyectos`, `limites` | Solo el panel para datos personales; `config` y eventos son públicos según su función. |
| `tecnoespacios` | Solo lectura de `cred`, `chat-mensajes`, `resenas` para la importación y estadísticas. | Sin escritura. |
| `tecnoespacios-shop` | Solo lectura de `users-index` y cuentas para la importación y estadísticas. | Sin escritura. |

- Las acciones administrativas comprueban la credencial enviada por `app.js`.
- Las acciones públicas usan validación de campos, honeypot y límite por hora.
- Los hashes de verificación usan `TE_TRACK_SALT`; los de analítica usan `TE_ANALYTICS_SALT`.
- La respuesta pública de seguimiento no incluye datos personales.
- Las estadísticas no contienen correos ni teléfonos.
- Límites de conservación: 10.000 eventos, 2.000 solicitudes, 2.000 proyectos, 4.000 contactos y 500 entradas de historial por registro.

---

## 7. Informe de pruebas

### 7.1 API y rutas — `PRUEBAS_COMERCIALES.ps1`

**26 de 26 pruebas correctas.** Incluye:

- Servidor local y rutas `/personalizador` y `/seguimiento`.
- Scripts del catálogo y del módulo comercial cargados.
- Sitemap con las rutas nuevas.
- Evento anónimo registrado.
- Acceso sin credencial rechazado con HTTP 401.
- Solicitud pública creada con proyecto y código `TE-YYYYMMDD-XXXX`.
- Reenvío idéntico sin duplicar contacto.
- Configuración guardada y persistida.
- Proyecto visible en el panel.
- Verificación pública incorrecta rechazada con HTTP 403.
- Verificación pública correcta sin exponer contacto ni hashes.
- Novedad, cambio de estado y fotografía guardados.
- Estadísticas reales con entorno de prueba marcado y sin datos personales.
- Persistencia tras varias escrituras.

Para repetir:

```powershell
powershell -ExecutionPolicy Bypass -File .\PRUEBAS_COMERCIALES.ps1
```

### 7.2 Navegador real — `PRUEBAS_UI_COMERCIAL.mjs`

**15 de 15 pruebas correctas**, sin errores de consola. Ejecutado con Chrome headless y emulación de dispositivo.

Escritorio (1440 × 900):

- 56 colores visibles con foto, nombre, referencia y código.
- Selección múltiple y asignación por partes.
- Resumen «Sujeto a cotización» sin precios inventados.
- Solicitud enviada con código de seguimiento.
- Consulta pública con 9 hitos.
- Estadísticas con 7 tarjetas, CRM con 7 etapas, 56 colores gestionables y retorno al panel general.

Móvil (390 × 844, escala 2):

- Sin desbordamiento horizontal.
- Una columna, controles de 40 px y los 56 colores disponibles.
- Seguimiento sin desbordamiento y en una columna.

Para repetir, con Netlify Dev activo:

```powershell
$env:Path += ';C:\Program Files\nodejs'
& 'C:\Program Files\nodejs\node.exe' PRUEBAS_UI_COMERCIAL.mjs
```

Capturas generadas en `PRUEBAS_CAPTURAS/`:

- `te-personalizador-escritorio.png`
- `te-seguimiento-escritorio.png`
- `te-personalizador-movil.png`
- `te-seguimiento-movil.png`

### 7.3 Comprobaciones adicionales

- `node --check` correcto para todos los `.js` y `.mjs` del proyecto y de las pruebas.
- El catálogo contiene 56 filas `colores`, todas con imagen, nombre, referencia y hexadecimal.
- Auditoría Lighthouse previa: 100 en Accesibilidad, Buenas prácticas y SEO para `/` y `/shop`. **No se ejecutó Lighthouse sobre las rutas nuevas en esta entrega**; se recomienda hacerlo después de publicar.

Los datos creados por las pruebas quedan únicamente en el entorno local aislado. No se copiaron a producción.

---

## 8. Servicios externos pendientes

Estos servicios **no están integrados** y no se activaron sin autorización:

1. **Correo transaccional** (Resend, SendGrid o similar): hoy no se envían avisos automáticos de solicitudes ni recordatorios.
2. **WhatsApp Business API / Cloud API**: los botones abren `wa.me` con el mensaje preparado; no hay envío automático.
3. **Pasarela de pago**: no hay cobros en línea; todo queda sujeto a cotización.
4. **Google Analytics / Search Console**: no se usa analítica de terceros. El panel mide solo eventos propios con consentimiento. Se recomienda configurar Search Console y enviar `sitemap.xml`.
5. **Sales de producción**: definir `TE_ANALYTICS_SALT` y `TE_TRACK_SALT` en Netlify antes de publicar.
6. **Notificaciones push o SMS**: no implementadas.
7. **Mapas o geolocalización**: no implementados; la ciudad se registra como texto opcional.

---

## 9. ZIP adjunto

El ZIP `C:\Users\TecnoEspacios\Downloads\TECNO_ESPACIOS_actualizado.zip` permanece extraído en:

`C:\Users\TecnoEspacios\Desktop\TECNO_ESPACIOS_actualizado\tecnoespacios-main`

Se mantuvo el proyecto activo como base porque conserva la infraestructura SEO, `404.html`, herrajes, `package.json`, `.env.example` y las cabeceras de seguridad. Del ZIP se tomó únicamente como referencia el configurador avanzado y la idea de bandeja de contacto; **no se copiaron** sus `chat.mjs`, `datos.js`, `netlify.toml`, `.netlify` ni credenciales.

Al finalizar esta entrega, los archivos de código de la carpeta activa se sincronizaron con la carpeta extraída del escritorio, conservando allí el ZIP original. Los estados locales de Blobs no se copiaron.
