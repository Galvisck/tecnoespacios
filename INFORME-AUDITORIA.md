# Informe de auditoría (avance)
| # | Error | Sección | Debía hacer | Hacía mal | Corrección | Prueba |
|---|---|---|---|---|---|---|
| 1 | Contacto por correo no pedía el correo del cliente | Contacto | Pedir nombre, correo, teléfono, asunto, mensaje y validar | Solo pedía nombre, asunto y mensaje; el correo de destino iba en un campo oculto | Campos nuevos con validación; envío por función `contacto.mjs`; mensajes guardados y visibles en el panel | Validación en navegador y función probada con almacén simulado |
| 2 | Éxito mostrado sin confirmar el envío | Contacto | Informar el resultado real | Alert de éxito aunque el servidor no hubiera enviado | Tres resultados reales: enviado, guardado sin aviso por correo, error | Probado en navegador (3 casos) |
| 3 | «Ver productos» llevaba al inicio | TECNO SHOP | Bajar al catálogo | El ancla `#productos-disponibles` activaba el enrutador | Botón con desplazamiento | Navegador |
| 4 | Tarjetas de servicios iban todas a Contacto | Inicio | Cada una a su destino | Mismo enlace | Abren Proyectos filtrado | Navegador |
| 5 | Buscador de TECNO SHOP no filtraba | TECNO SHOP | Filtrar | Sin código asociado | Filtro en vivo | Navegador |
| 6 | Cuentas, carrito y favoritos de la tienda inoperantes | TECNO SHOP | — | Falta el contenedor `#shopModal` y las claves no coinciden | Sin tocar (el README dice que la tienda no tiene carrito) | Revisión de código |
| 7 | Sin separación local/producción | Entorno | Datos de prueba aparte | — | `iniciar-local.bat` con `netlify dev` | NO probado (sin internet) |
