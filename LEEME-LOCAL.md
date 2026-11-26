# Ejecutar TECNO ESPACIOS en tu computador (Windows)

## Requisito (una sola vez)
Instala Node.js LTS: https://nodejs.org

## Iniciar
1. Descomprime el proyecto completo (la carpeta con `public` y `netlify`).
2. Doble clic en `iniciar-local.bat` (la primera vez instala dependencias).
3. Abre http://localhost:8750  ·  Panel: http://localhost:8750/#/admin

El sitio usa el puerto 8750 y un puerto interno 8751 (el 3999 que usa Netlify por defecto puede estar ocupado, por eso se cambió). Si también lo tienes ocupado, abre `iniciar-local.bat` y `detener-local.bat` con el Bloc de notas y cambia las líneas `set PUERTO=8750` y `set PUERTO2=8751` por otros números (por ejemplo 8760 y 8761), en ambos archivos.

## Detener y volver a iniciar
Cierra la ventana negra, o doble clic en `detener-local.bat`. Para volver a ejecutar: `iniciar-local.bat`.

## Datos de prueba separados de producción
El modo local guarda proyectos, productos, promociones, reseñas y chat en un almacén local de Netlify Blobs
(carpeta oculta `.netlify`), distinto del de tu sitio publicado. Borrar la carpeta `.netlify` reinicia los datos de prueba.
Nada de lo que hagas aquí se publica solo.

## Publicar cambios aprobados (producción)
1. Revisa todo en local.
2. Sube SOLO el código: `git add public netlify netlify.toml package.json` y `git commit` / `git push`.
   No subas la carpeta `.netlify` ni `node_modules`.
3. Netlify despliega solo desde GitHub. Revisa el sitio publicado.
4. Los datos de producción (Blobs del sitio) no cambian al desplegar. Las funciones nuevas de esta versión
   solo añaden campos opcionales a las promociones (vigente desde, precio anterior y promocional); no requieren migración.
5. Si algo falla: en Netlify > Deploys, "Publish deploy" sobre el despliegue anterior.

Aviso: el modo local no se pudo probar en el entorno donde se preparó (sin internet); si `netlify dev` da error, copia el mensaje y lo corregimos.

## Correo del formulario de contacto (configuración externa pendiente)
El formulario guarda cada mensaje (panel > Mensajes de contacto) y avisa por correo solo si está configurado el servicio Resend:
- Variables de entorno en Netlify: `RESEND_API_KEY` (obligatoria), `CONTACTO_FROM` (remitente verificado; si falta usa el de pruebas de Resend).
- Destinatario: panel > Empresa > «Correo que recibe los mensajes del formulario» (si está vacío usa el correo público).
- En pruebas locales define `CONTACTO_TEST_TO=tu_correo_de_prueba` para que ningún aviso llegue a clientes ni a la empresa.
- Sin la llave el mensaje igual queda registrado en el panel y en el CRM; solo no se envía el aviso por correo.

## Nuevas herramientas comerciales (v4)
Detalle de uso en `GUIA-NUEVAS-FUNCIONES.md`. En local funcionan igual: personalizador, seguimiento, CRM y estadísticas.
Las estadísticas locales se marcan como «Entorno de pruebas»; solo se consideran datos reales los del dominio publicado
(`tecnoespacios.homes`; si usas otro dominio, define la variable de entorno `ENTORNO=produccion` en Netlify).
