(function(){
const nodes={};
nodes.inicio={message:'¡Hola! 👋 Bienvenido a TECNO ESPACIOS. Diseñamos y fabricamos muebles a medida. Para orientarte mejor, ¿qué estás buscando?',options:[
{label:"Cocinas integrales",keywords:["cocina", "cocinas", "cocina integral"],next:"serv_cocina"},
{label:"Closets o vestieres",keywords:["closet", "clóset", "armario", "vestier"],next:"serv_closet"},
{label:"Muebles de baño",keywords:["baño", "mueble de baño", "lavamanos"],next:"serv_bano"},
{label:"Otro mueble",keywords:["otro", "centro de entretenimiento", "mueble personalizado"],next:"serv_otro"},
{label:"Un proyecto completo",keywords:["proyecto completo", "varios muebles", "toda la casa"],next:"serv_proyecto"},
{label:"Precios y cotizaciones",keywords:["precio", "precios", "cuánto cuesta", "cotización"],next:"precio_inicio"},
{label:"Promociones",keywords:["promoción", "promociones", "descuento", "oferta"],next:"promo_inicio"},
{label:"Hablar con un asesor",keywords:["asesor", "persona", "humano", "agente"],next:"salida"},
],fallback:'Puedes elegir una de las opciones o escribir qué mueble necesitas.'};
nodes.serv_cocina={message:"¡Perfecto! Te ayudaremos con cocinas integrales. ¿Qué necesitas en este momento?",options:[
{label:"Quiero cotizar",keywords:["cotizar", "cotización", "presupuesto", "precio"],next:"cocina_cotizar_situacion"},
{label:"Necesito ayuda con el diseño",keywords:["diseño", "diseñar", "asesoría", "asesoramiento"],next:"cocina_diseno_situacion"},
{label:"Estoy buscando ideas",keywords:["ideas", "inspiración", "referencias", "ejemplos"],next:"cocina_ideas_situacion"},
{label:"Solo quiero información",keywords:["información", "información general", "saber más"],next:"cocina_informacion_situacion"},
],fallback:'Puedes elegir cotizar, recibir ayuda con el diseño, ver ideas o conocer información.'};
nodes["cocina_cotizar_situacion"]={message:"¿Cómo está el espacio actualmente?",options:[
{label:"Ya está listo para instalar",keywords:["listo", "terminado", "listo para instalar"],next:"cocina_cotizar_medidas"},
{label:"Quiero remodelar uno existente",keywords:["remodelar", "remodelación", "cambiar", "reemplazar"],next:"cocina_cotizar_medidas"},
{label:"Es una obra nueva",keywords:["obra nueva", "construcción", "nuevo"],next:"cocina_cotizar_medidas"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["cocina_cotizar_medidas"]={message:"¿Ya tienes las medidas aproximadas?",options:[
{label:"Sí, tengo las medidas",keywords:["sí", "tengo medidas", "ya medí", "medidas listas"],next:"cocina_cotizar_estilo"},
{label:"Todavía no las tengo",keywords:["no", "todavía no", "no tengo medidas", "necesito medir"],next:"cocina_cotizar_estilo"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["cocina_cotizar_estilo"]={message:"¿Qué estilo te gustaría?",options:[
{label:"Moderno",keywords:["moderno", "minimalista", "moderno"],next:"cocina_cotizar_acabado"},
{label:"Clásico",keywords:["clásico", "tradicional"],next:"cocina_cotizar_acabado"},
{label:"Elegante",keywords:["elegante", "contemporáneo", "sofisticado"],next:"cocina_cotizar_acabado"},
{label:"Quiero recomendaciones",keywords:["recomiéndame", "no sé", "asesoría"],next:"cocina_cotizar_acabado"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["cocina_cotizar_acabado"]={message:"¿Tienes algún color o acabado en mente?",options:[
{label:"Madera",keywords:["madera", "tonos madera", "roble", "nogal"],next:"cocina_cotizar_extras"},
{label:"Colores claros",keywords:["blanco", "beige", "claro", "crema"],next:"cocina_cotizar_extras"},
{label:"Colores oscuros",keywords:["negro", "gris", "oscuro"],next:"cocina_cotizar_extras"},
{label:"Quiero ver el catálogo",keywords:["catálogo", "colores", "referencias", "ver colores"],next:"cocina_cotizar_extras"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["cocina_cotizar_extras"]={message:"¿Qué elementos te gustaría incluir?",options:[
{label:"Solo el mueble",keywords:["solo mueble", "únicamente el mueble"],next:"cocina_cotizar_ciudad"},
{label:"Cajones y accesorios",keywords:["cajones", "accesorios", "herrajes"],next:"cocina_cotizar_ciudad"},
{label:"Iluminación",keywords:["iluminación", "luces", "led"],next:"cocina_cotizar_ciudad"},
{label:"Aún no lo sé",keywords:["no sé", "por definir", "después"],next:"cocina_cotizar_ciudad"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["cocina_cotizar_ciudad"]={message:"¿En qué ciudad o municipio se realizará el proyecto? Puedes escribirlo libremente.",any:true,next:'salida'};
nodes["cocina_diseno_situacion"]={message:"¿Cómo está el espacio actualmente?",options:[
{label:"Ya está listo para instalar",keywords:["listo", "terminado", "listo para instalar"],next:"cocina_diseno_medidas"},
{label:"Quiero remodelar uno existente",keywords:["remodelar", "remodelación", "cambiar", "reemplazar"],next:"cocina_diseno_medidas"},
{label:"Es una obra nueva",keywords:["obra nueva", "construcción", "nuevo"],next:"cocina_diseno_medidas"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["cocina_diseno_medidas"]={message:"¿Ya tienes las medidas aproximadas?",options:[
{label:"Sí, tengo las medidas",keywords:["sí", "tengo medidas", "ya medí", "medidas listas"],next:"cocina_diseno_estilo"},
{label:"Todavía no las tengo",keywords:["no", "todavía no", "no tengo medidas", "necesito medir"],next:"cocina_diseno_estilo"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["cocina_diseno_estilo"]={message:"¿Qué estilo te gustaría?",options:[
{label:"Moderno",keywords:["moderno", "minimalista", "moderno"],next:"cocina_diseno_acabado"},
{label:"Clásico",keywords:["clásico", "tradicional"],next:"cocina_diseno_acabado"},
{label:"Elegante",keywords:["elegante", "contemporáneo", "sofisticado"],next:"cocina_diseno_acabado"},
{label:"Quiero recomendaciones",keywords:["recomiéndame", "no sé", "asesoría"],next:"cocina_diseno_acabado"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["cocina_diseno_acabado"]={message:"¿Tienes algún color o acabado en mente?",options:[
{label:"Madera",keywords:["madera", "tonos madera", "roble", "nogal"],next:"cocina_diseno_extras"},
{label:"Colores claros",keywords:["blanco", "beige", "claro", "crema"],next:"cocina_diseno_extras"},
{label:"Colores oscuros",keywords:["negro", "gris", "oscuro"],next:"cocina_diseno_extras"},
{label:"Quiero ver el catálogo",keywords:["catálogo", "colores", "referencias", "ver colores"],next:"cocina_diseno_extras"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["cocina_diseno_extras"]={message:"¿Qué elementos te gustaría incluir?",options:[
{label:"Solo el mueble",keywords:["solo mueble", "únicamente el mueble"],next:"cocina_diseno_ciudad"},
{label:"Cajones y accesorios",keywords:["cajones", "accesorios", "herrajes"],next:"cocina_diseno_ciudad"},
{label:"Iluminación",keywords:["iluminación", "luces", "led"],next:"cocina_diseno_ciudad"},
{label:"Aún no lo sé",keywords:["no sé", "por definir", "después"],next:"cocina_diseno_ciudad"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["cocina_diseno_ciudad"]={message:"¿En qué ciudad o municipio se realizará el proyecto? Puedes escribirlo libremente.",any:true,next:'salida'};
nodes["cocina_ideas_situacion"]={message:"¿Cómo está el espacio actualmente?",options:[
{label:"Ya está listo para instalar",keywords:["listo", "terminado", "listo para instalar"],next:"cocina_ideas_medidas"},
{label:"Quiero remodelar uno existente",keywords:["remodelar", "remodelación", "cambiar", "reemplazar"],next:"cocina_ideas_medidas"},
{label:"Es una obra nueva",keywords:["obra nueva", "construcción", "nuevo"],next:"cocina_ideas_medidas"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["cocina_ideas_medidas"]={message:"¿Ya tienes las medidas aproximadas?",options:[
{label:"Sí, tengo las medidas",keywords:["sí", "tengo medidas", "ya medí", "medidas listas"],next:"cocina_ideas_estilo"},
{label:"Todavía no las tengo",keywords:["no", "todavía no", "no tengo medidas", "necesito medir"],next:"cocina_ideas_estilo"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["cocina_ideas_estilo"]={message:"¿Qué estilo te gustaría?",options:[
{label:"Moderno",keywords:["moderno", "minimalista", "moderno"],next:"cocina_ideas_acabado"},
{label:"Clásico",keywords:["clásico", "tradicional"],next:"cocina_ideas_acabado"},
{label:"Elegante",keywords:["elegante", "contemporáneo", "sofisticado"],next:"cocina_ideas_acabado"},
{label:"Quiero recomendaciones",keywords:["recomiéndame", "no sé", "asesoría"],next:"cocina_ideas_acabado"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["cocina_ideas_acabado"]={message:"¿Tienes algún color o acabado en mente?",options:[
{label:"Madera",keywords:["madera", "tonos madera", "roble", "nogal"],next:"cocina_ideas_extras"},
{label:"Colores claros",keywords:["blanco", "beige", "claro", "crema"],next:"cocina_ideas_extras"},
{label:"Colores oscuros",keywords:["negro", "gris", "oscuro"],next:"cocina_ideas_extras"},
{label:"Quiero ver el catálogo",keywords:["catálogo", "colores", "referencias", "ver colores"],next:"cocina_ideas_extras"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["cocina_ideas_extras"]={message:"¿Qué elementos te gustaría incluir?",options:[
{label:"Solo el mueble",keywords:["solo mueble", "únicamente el mueble"],next:"cocina_ideas_ciudad"},
{label:"Cajones y accesorios",keywords:["cajones", "accesorios", "herrajes"],next:"cocina_ideas_ciudad"},
{label:"Iluminación",keywords:["iluminación", "luces", "led"],next:"cocina_ideas_ciudad"},
{label:"Aún no lo sé",keywords:["no sé", "por definir", "después"],next:"cocina_ideas_ciudad"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["cocina_ideas_ciudad"]={message:"¿En qué ciudad o municipio se realizará el proyecto? Puedes escribirlo libremente.",any:true,next:'salida'};
nodes["cocina_informacion_situacion"]={message:"¿Cómo está el espacio actualmente?",options:[
{label:"Ya está listo para instalar",keywords:["listo", "terminado", "listo para instalar"],next:"cocina_informacion_medidas"},
{label:"Quiero remodelar uno existente",keywords:["remodelar", "remodelación", "cambiar", "reemplazar"],next:"cocina_informacion_medidas"},
{label:"Es una obra nueva",keywords:["obra nueva", "construcción", "nuevo"],next:"cocina_informacion_medidas"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["cocina_informacion_medidas"]={message:"¿Ya tienes las medidas aproximadas?",options:[
{label:"Sí, tengo las medidas",keywords:["sí", "tengo medidas", "ya medí", "medidas listas"],next:"cocina_informacion_estilo"},
{label:"Todavía no las tengo",keywords:["no", "todavía no", "no tengo medidas", "necesito medir"],next:"cocina_informacion_estilo"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["cocina_informacion_estilo"]={message:"¿Qué estilo te gustaría?",options:[
{label:"Moderno",keywords:["moderno", "minimalista", "moderno"],next:"cocina_informacion_acabado"},
{label:"Clásico",keywords:["clásico", "tradicional"],next:"cocina_informacion_acabado"},
{label:"Elegante",keywords:["elegante", "contemporáneo", "sofisticado"],next:"cocina_informacion_acabado"},
{label:"Quiero recomendaciones",keywords:["recomiéndame", "no sé", "asesoría"],next:"cocina_informacion_acabado"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["cocina_informacion_acabado"]={message:"¿Tienes algún color o acabado en mente?",options:[
{label:"Madera",keywords:["madera", "tonos madera", "roble", "nogal"],next:"cocina_informacion_extras"},
{label:"Colores claros",keywords:["blanco", "beige", "claro", "crema"],next:"cocina_informacion_extras"},
{label:"Colores oscuros",keywords:["negro", "gris", "oscuro"],next:"cocina_informacion_extras"},
{label:"Quiero ver el catálogo",keywords:["catálogo", "colores", "referencias", "ver colores"],next:"cocina_informacion_extras"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["cocina_informacion_extras"]={message:"¿Qué elementos te gustaría incluir?",options:[
{label:"Solo el mueble",keywords:["solo mueble", "únicamente el mueble"],next:"cocina_informacion_ciudad"},
{label:"Cajones y accesorios",keywords:["cajones", "accesorios", "herrajes"],next:"cocina_informacion_ciudad"},
{label:"Iluminación",keywords:["iluminación", "luces", "led"],next:"cocina_informacion_ciudad"},
{label:"Aún no lo sé",keywords:["no sé", "por definir", "después"],next:"cocina_informacion_ciudad"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["cocina_informacion_ciudad"]={message:"¿En qué ciudad o municipio se realizará el proyecto? Puedes escribirlo libremente.",any:true,next:'salida'};
nodes.serv_closet={message:"¡Perfecto! Te ayudaremos con closets y vestieres. ¿Qué necesitas en este momento?",options:[
{label:"Quiero cotizar",keywords:["cotizar", "cotización", "presupuesto", "precio"],next:"closet_cotizar_situacion"},
{label:"Necesito ayuda con el diseño",keywords:["diseño", "diseñar", "asesoría", "asesoramiento"],next:"closet_diseno_situacion"},
{label:"Estoy buscando ideas",keywords:["ideas", "inspiración", "referencias", "ejemplos"],next:"closet_ideas_situacion"},
{label:"Solo quiero información",keywords:["información", "información general", "saber más"],next:"closet_informacion_situacion"},
],fallback:'Puedes elegir cotizar, recibir ayuda con el diseño, ver ideas o conocer información.'};
nodes["closet_cotizar_situacion"]={message:"¿Cómo está el espacio actualmente?",options:[
{label:"Ya está listo para instalar",keywords:["listo", "terminado", "listo para instalar"],next:"closet_cotizar_medidas"},
{label:"Quiero remodelar uno existente",keywords:["remodelar", "remodelación", "cambiar", "reemplazar"],next:"closet_cotizar_medidas"},
{label:"Es una obra nueva",keywords:["obra nueva", "construcción", "nuevo"],next:"closet_cotizar_medidas"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["closet_cotizar_medidas"]={message:"¿Ya tienes las medidas aproximadas?",options:[
{label:"Sí, tengo las medidas",keywords:["sí", "tengo medidas", "ya medí", "medidas listas"],next:"closet_cotizar_estilo"},
{label:"Todavía no las tengo",keywords:["no", "todavía no", "no tengo medidas", "necesito medir"],next:"closet_cotizar_estilo"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["closet_cotizar_estilo"]={message:"¿Qué estilo te gustaría?",options:[
{label:"Moderno",keywords:["moderno", "minimalista", "moderno"],next:"closet_cotizar_acabado"},
{label:"Clásico",keywords:["clásico", "tradicional"],next:"closet_cotizar_acabado"},
{label:"Elegante",keywords:["elegante", "contemporáneo", "sofisticado"],next:"closet_cotizar_acabado"},
{label:"Quiero recomendaciones",keywords:["recomiéndame", "no sé", "asesoría"],next:"closet_cotizar_acabado"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["closet_cotizar_acabado"]={message:"¿Tienes algún color o acabado en mente?",options:[
{label:"Madera",keywords:["madera", "tonos madera", "roble", "nogal"],next:"closet_cotizar_extras"},
{label:"Colores claros",keywords:["blanco", "beige", "claro", "crema"],next:"closet_cotizar_extras"},
{label:"Colores oscuros",keywords:["negro", "gris", "oscuro"],next:"closet_cotizar_extras"},
{label:"Quiero ver el catálogo",keywords:["catálogo", "colores", "referencias", "ver colores"],next:"closet_cotizar_extras"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["closet_cotizar_extras"]={message:"¿Qué elementos te gustaría incluir?",options:[
{label:"Solo el mueble",keywords:["solo mueble", "únicamente el mueble"],next:"closet_cotizar_ciudad"},
{label:"Cajones y accesorios",keywords:["cajones", "accesorios", "herrajes"],next:"closet_cotizar_ciudad"},
{label:"Iluminación",keywords:["iluminación", "luces", "led"],next:"closet_cotizar_ciudad"},
{label:"Aún no lo sé",keywords:["no sé", "por definir", "después"],next:"closet_cotizar_ciudad"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["closet_cotizar_ciudad"]={message:"¿En qué ciudad o municipio se realizará el proyecto? Puedes escribirlo libremente.",any:true,next:'salida'};
nodes["closet_diseno_situacion"]={message:"¿Cómo está el espacio actualmente?",options:[
{label:"Ya está listo para instalar",keywords:["listo", "terminado", "listo para instalar"],next:"closet_diseno_medidas"},
{label:"Quiero remodelar uno existente",keywords:["remodelar", "remodelación", "cambiar", "reemplazar"],next:"closet_diseno_medidas"},
{label:"Es una obra nueva",keywords:["obra nueva", "construcción", "nuevo"],next:"closet_diseno_medidas"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["closet_diseno_medidas"]={message:"¿Ya tienes las medidas aproximadas?",options:[
{label:"Sí, tengo las medidas",keywords:["sí", "tengo medidas", "ya medí", "medidas listas"],next:"closet_diseno_estilo"},
{label:"Todavía no las tengo",keywords:["no", "todavía no", "no tengo medidas", "necesito medir"],next:"closet_diseno_estilo"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["closet_diseno_estilo"]={message:"¿Qué estilo te gustaría?",options:[
{label:"Moderno",keywords:["moderno", "minimalista", "moderno"],next:"closet_diseno_acabado"},
{label:"Clásico",keywords:["clásico", "tradicional"],next:"closet_diseno_acabado"},
{label:"Elegante",keywords:["elegante", "contemporáneo", "sofisticado"],next:"closet_diseno_acabado"},
{label:"Quiero recomendaciones",keywords:["recomiéndame", "no sé", "asesoría"],next:"closet_diseno_acabado"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["closet_diseno_acabado"]={message:"¿Tienes algún color o acabado en mente?",options:[
{label:"Madera",keywords:["madera", "tonos madera", "roble", "nogal"],next:"closet_diseno_extras"},
{label:"Colores claros",keywords:["blanco", "beige", "claro", "crema"],next:"closet_diseno_extras"},
{label:"Colores oscuros",keywords:["negro", "gris", "oscuro"],next:"closet_diseno_extras"},
{label:"Quiero ver el catálogo",keywords:["catálogo", "colores", "referencias", "ver colores"],next:"closet_diseno_extras"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["closet_diseno_extras"]={message:"¿Qué elementos te gustaría incluir?",options:[
{label:"Solo el mueble",keywords:["solo mueble", "únicamente el mueble"],next:"closet_diseno_ciudad"},
{label:"Cajones y accesorios",keywords:["cajones", "accesorios", "herrajes"],next:"closet_diseno_ciudad"},
{label:"Iluminación",keywords:["iluminación", "luces", "led"],next:"closet_diseno_ciudad"},
{label:"Aún no lo sé",keywords:["no sé", "por definir", "después"],next:"closet_diseno_ciudad"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["closet_diseno_ciudad"]={message:"¿En qué ciudad o municipio se realizará el proyecto? Puedes escribirlo libremente.",any:true,next:'salida'};
nodes["closet_ideas_situacion"]={message:"¿Cómo está el espacio actualmente?",options:[
{label:"Ya está listo para instalar",keywords:["listo", "terminado", "listo para instalar"],next:"closet_ideas_medidas"},
{label:"Quiero remodelar uno existente",keywords:["remodelar", "remodelación", "cambiar", "reemplazar"],next:"closet_ideas_medidas"},
{label:"Es una obra nueva",keywords:["obra nueva", "construcción", "nuevo"],next:"closet_ideas_medidas"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["closet_ideas_medidas"]={message:"¿Ya tienes las medidas aproximadas?",options:[
{label:"Sí, tengo las medidas",keywords:["sí", "tengo medidas", "ya medí", "medidas listas"],next:"closet_ideas_estilo"},
{label:"Todavía no las tengo",keywords:["no", "todavía no", "no tengo medidas", "necesito medir"],next:"closet_ideas_estilo"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["closet_ideas_estilo"]={message:"¿Qué estilo te gustaría?",options:[
{label:"Moderno",keywords:["moderno", "minimalista", "moderno"],next:"closet_ideas_acabado"},
{label:"Clásico",keywords:["clásico", "tradicional"],next:"closet_ideas_acabado"},
{label:"Elegante",keywords:["elegante", "contemporáneo", "sofisticado"],next:"closet_ideas_acabado"},
{label:"Quiero recomendaciones",keywords:["recomiéndame", "no sé", "asesoría"],next:"closet_ideas_acabado"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["closet_ideas_acabado"]={message:"¿Tienes algún color o acabado en mente?",options:[
{label:"Madera",keywords:["madera", "tonos madera", "roble", "nogal"],next:"closet_ideas_extras"},
{label:"Colores claros",keywords:["blanco", "beige", "claro", "crema"],next:"closet_ideas_extras"},
{label:"Colores oscuros",keywords:["negro", "gris", "oscuro"],next:"closet_ideas_extras"},
{label:"Quiero ver el catálogo",keywords:["catálogo", "colores", "referencias", "ver colores"],next:"closet_ideas_extras"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["closet_ideas_extras"]={message:"¿Qué elementos te gustaría incluir?",options:[
{label:"Solo el mueble",keywords:["solo mueble", "únicamente el mueble"],next:"closet_ideas_ciudad"},
{label:"Cajones y accesorios",keywords:["cajones", "accesorios", "herrajes"],next:"closet_ideas_ciudad"},
{label:"Iluminación",keywords:["iluminación", "luces", "led"],next:"closet_ideas_ciudad"},
{label:"Aún no lo sé",keywords:["no sé", "por definir", "después"],next:"closet_ideas_ciudad"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["closet_ideas_ciudad"]={message:"¿En qué ciudad o municipio se realizará el proyecto? Puedes escribirlo libremente.",any:true,next:'salida'};
nodes["closet_informacion_situacion"]={message:"¿Cómo está el espacio actualmente?",options:[
{label:"Ya está listo para instalar",keywords:["listo", "terminado", "listo para instalar"],next:"closet_informacion_medidas"},
{label:"Quiero remodelar uno existente",keywords:["remodelar", "remodelación", "cambiar", "reemplazar"],next:"closet_informacion_medidas"},
{label:"Es una obra nueva",keywords:["obra nueva", "construcción", "nuevo"],next:"closet_informacion_medidas"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["closet_informacion_medidas"]={message:"¿Ya tienes las medidas aproximadas?",options:[
{label:"Sí, tengo las medidas",keywords:["sí", "tengo medidas", "ya medí", "medidas listas"],next:"closet_informacion_estilo"},
{label:"Todavía no las tengo",keywords:["no", "todavía no", "no tengo medidas", "necesito medir"],next:"closet_informacion_estilo"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["closet_informacion_estilo"]={message:"¿Qué estilo te gustaría?",options:[
{label:"Moderno",keywords:["moderno", "minimalista", "moderno"],next:"closet_informacion_acabado"},
{label:"Clásico",keywords:["clásico", "tradicional"],next:"closet_informacion_acabado"},
{label:"Elegante",keywords:["elegante", "contemporáneo", "sofisticado"],next:"closet_informacion_acabado"},
{label:"Quiero recomendaciones",keywords:["recomiéndame", "no sé", "asesoría"],next:"closet_informacion_acabado"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["closet_informacion_acabado"]={message:"¿Tienes algún color o acabado en mente?",options:[
{label:"Madera",keywords:["madera", "tonos madera", "roble", "nogal"],next:"closet_informacion_extras"},
{label:"Colores claros",keywords:["blanco", "beige", "claro", "crema"],next:"closet_informacion_extras"},
{label:"Colores oscuros",keywords:["negro", "gris", "oscuro"],next:"closet_informacion_extras"},
{label:"Quiero ver el catálogo",keywords:["catálogo", "colores", "referencias", "ver colores"],next:"closet_informacion_extras"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["closet_informacion_extras"]={message:"¿Qué elementos te gustaría incluir?",options:[
{label:"Solo el mueble",keywords:["solo mueble", "únicamente el mueble"],next:"closet_informacion_ciudad"},
{label:"Cajones y accesorios",keywords:["cajones", "accesorios", "herrajes"],next:"closet_informacion_ciudad"},
{label:"Iluminación",keywords:["iluminación", "luces", "led"],next:"closet_informacion_ciudad"},
{label:"Aún no lo sé",keywords:["no sé", "por definir", "después"],next:"closet_informacion_ciudad"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["closet_informacion_ciudad"]={message:"¿En qué ciudad o municipio se realizará el proyecto? Puedes escribirlo libremente.",any:true,next:'salida'};
nodes.serv_bano={message:"¡Perfecto! Te ayudaremos con muebles de baño. ¿Qué necesitas en este momento?",options:[
{label:"Quiero cotizar",keywords:["cotizar", "cotización", "presupuesto", "precio"],next:"bano_cotizar_situacion"},
{label:"Necesito ayuda con el diseño",keywords:["diseño", "diseñar", "asesoría", "asesoramiento"],next:"bano_diseno_situacion"},
{label:"Estoy buscando ideas",keywords:["ideas", "inspiración", "referencias", "ejemplos"],next:"bano_ideas_situacion"},
{label:"Solo quiero información",keywords:["información", "información general", "saber más"],next:"bano_informacion_situacion"},
],fallback:'Puedes elegir cotizar, recibir ayuda con el diseño, ver ideas o conocer información.'};
nodes["bano_cotizar_situacion"]={message:"¿Cómo está el espacio actualmente?",options:[
{label:"Ya está listo para instalar",keywords:["listo", "terminado", "listo para instalar"],next:"bano_cotizar_medidas"},
{label:"Quiero remodelar uno existente",keywords:["remodelar", "remodelación", "cambiar", "reemplazar"],next:"bano_cotizar_medidas"},
{label:"Es una obra nueva",keywords:["obra nueva", "construcción", "nuevo"],next:"bano_cotizar_medidas"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["bano_cotizar_medidas"]={message:"¿Ya tienes las medidas aproximadas?",options:[
{label:"Sí, tengo las medidas",keywords:["sí", "tengo medidas", "ya medí", "medidas listas"],next:"bano_cotizar_estilo"},
{label:"Todavía no las tengo",keywords:["no", "todavía no", "no tengo medidas", "necesito medir"],next:"bano_cotizar_estilo"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["bano_cotizar_estilo"]={message:"¿Qué estilo te gustaría?",options:[
{label:"Moderno",keywords:["moderno", "minimalista", "moderno"],next:"bano_cotizar_acabado"},
{label:"Clásico",keywords:["clásico", "tradicional"],next:"bano_cotizar_acabado"},
{label:"Elegante",keywords:["elegante", "contemporáneo", "sofisticado"],next:"bano_cotizar_acabado"},
{label:"Quiero recomendaciones",keywords:["recomiéndame", "no sé", "asesoría"],next:"bano_cotizar_acabado"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["bano_cotizar_acabado"]={message:"¿Tienes algún color o acabado en mente?",options:[
{label:"Madera",keywords:["madera", "tonos madera", "roble", "nogal"],next:"bano_cotizar_extras"},
{label:"Colores claros",keywords:["blanco", "beige", "claro", "crema"],next:"bano_cotizar_extras"},
{label:"Colores oscuros",keywords:["negro", "gris", "oscuro"],next:"bano_cotizar_extras"},
{label:"Quiero ver el catálogo",keywords:["catálogo", "colores", "referencias", "ver colores"],next:"bano_cotizar_extras"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["bano_cotizar_extras"]={message:"¿Qué elementos te gustaría incluir?",options:[
{label:"Solo el mueble",keywords:["solo mueble", "únicamente el mueble"],next:"bano_cotizar_ciudad"},
{label:"Cajones y accesorios",keywords:["cajones", "accesorios", "herrajes"],next:"bano_cotizar_ciudad"},
{label:"Iluminación",keywords:["iluminación", "luces", "led"],next:"bano_cotizar_ciudad"},
{label:"Aún no lo sé",keywords:["no sé", "por definir", "después"],next:"bano_cotizar_ciudad"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["bano_cotizar_ciudad"]={message:"¿En qué ciudad o municipio se realizará el proyecto? Puedes escribirlo libremente.",any:true,next:'salida'};
nodes["bano_diseno_situacion"]={message:"¿Cómo está el espacio actualmente?",options:[
{label:"Ya está listo para instalar",keywords:["listo", "terminado", "listo para instalar"],next:"bano_diseno_medidas"},
{label:"Quiero remodelar uno existente",keywords:["remodelar", "remodelación", "cambiar", "reemplazar"],next:"bano_diseno_medidas"},
{label:"Es una obra nueva",keywords:["obra nueva", "construcción", "nuevo"],next:"bano_diseno_medidas"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["bano_diseno_medidas"]={message:"¿Ya tienes las medidas aproximadas?",options:[
{label:"Sí, tengo las medidas",keywords:["sí", "tengo medidas", "ya medí", "medidas listas"],next:"bano_diseno_estilo"},
{label:"Todavía no las tengo",keywords:["no", "todavía no", "no tengo medidas", "necesito medir"],next:"bano_diseno_estilo"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["bano_diseno_estilo"]={message:"¿Qué estilo te gustaría?",options:[
{label:"Moderno",keywords:["moderno", "minimalista", "moderno"],next:"bano_diseno_acabado"},
{label:"Clásico",keywords:["clásico", "tradicional"],next:"bano_diseno_acabado"},
{label:"Elegante",keywords:["elegante", "contemporáneo", "sofisticado"],next:"bano_diseno_acabado"},
{label:"Quiero recomendaciones",keywords:["recomiéndame", "no sé", "asesoría"],next:"bano_diseno_acabado"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["bano_diseno_acabado"]={message:"¿Tienes algún color o acabado en mente?",options:[
{label:"Madera",keywords:["madera", "tonos madera", "roble", "nogal"],next:"bano_diseno_extras"},
{label:"Colores claros",keywords:["blanco", "beige", "claro", "crema"],next:"bano_diseno_extras"},
{label:"Colores oscuros",keywords:["negro", "gris", "oscuro"],next:"bano_diseno_extras"},
{label:"Quiero ver el catálogo",keywords:["catálogo", "colores", "referencias", "ver colores"],next:"bano_diseno_extras"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["bano_diseno_extras"]={message:"¿Qué elementos te gustaría incluir?",options:[
{label:"Solo el mueble",keywords:["solo mueble", "únicamente el mueble"],next:"bano_diseno_ciudad"},
{label:"Cajones y accesorios",keywords:["cajones", "accesorios", "herrajes"],next:"bano_diseno_ciudad"},
{label:"Iluminación",keywords:["iluminación", "luces", "led"],next:"bano_diseno_ciudad"},
{label:"Aún no lo sé",keywords:["no sé", "por definir", "después"],next:"bano_diseno_ciudad"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["bano_diseno_ciudad"]={message:"¿En qué ciudad o municipio se realizará el proyecto? Puedes escribirlo libremente.",any:true,next:'salida'};
nodes["bano_ideas_situacion"]={message:"¿Cómo está el espacio actualmente?",options:[
{label:"Ya está listo para instalar",keywords:["listo", "terminado", "listo para instalar"],next:"bano_ideas_medidas"},
{label:"Quiero remodelar uno existente",keywords:["remodelar", "remodelación", "cambiar", "reemplazar"],next:"bano_ideas_medidas"},
{label:"Es una obra nueva",keywords:["obra nueva", "construcción", "nuevo"],next:"bano_ideas_medidas"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["bano_ideas_medidas"]={message:"¿Ya tienes las medidas aproximadas?",options:[
{label:"Sí, tengo las medidas",keywords:["sí", "tengo medidas", "ya medí", "medidas listas"],next:"bano_ideas_estilo"},
{label:"Todavía no las tengo",keywords:["no", "todavía no", "no tengo medidas", "necesito medir"],next:"bano_ideas_estilo"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["bano_ideas_estilo"]={message:"¿Qué estilo te gustaría?",options:[
{label:"Moderno",keywords:["moderno", "minimalista", "moderno"],next:"bano_ideas_acabado"},
{label:"Clásico",keywords:["clásico", "tradicional"],next:"bano_ideas_acabado"},
{label:"Elegante",keywords:["elegante", "contemporáneo", "sofisticado"],next:"bano_ideas_acabado"},
{label:"Quiero recomendaciones",keywords:["recomiéndame", "no sé", "asesoría"],next:"bano_ideas_acabado"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["bano_ideas_acabado"]={message:"¿Tienes algún color o acabado en mente?",options:[
{label:"Madera",keywords:["madera", "tonos madera", "roble", "nogal"],next:"bano_ideas_extras"},
{label:"Colores claros",keywords:["blanco", "beige", "claro", "crema"],next:"bano_ideas_extras"},
{label:"Colores oscuros",keywords:["negro", "gris", "oscuro"],next:"bano_ideas_extras"},
{label:"Quiero ver el catálogo",keywords:["catálogo", "colores", "referencias", "ver colores"],next:"bano_ideas_extras"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["bano_ideas_extras"]={message:"¿Qué elementos te gustaría incluir?",options:[
{label:"Solo el mueble",keywords:["solo mueble", "únicamente el mueble"],next:"bano_ideas_ciudad"},
{label:"Cajones y accesorios",keywords:["cajones", "accesorios", "herrajes"],next:"bano_ideas_ciudad"},
{label:"Iluminación",keywords:["iluminación", "luces", "led"],next:"bano_ideas_ciudad"},
{label:"Aún no lo sé",keywords:["no sé", "por definir", "después"],next:"bano_ideas_ciudad"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["bano_ideas_ciudad"]={message:"¿En qué ciudad o municipio se realizará el proyecto? Puedes escribirlo libremente.",any:true,next:'salida'};
nodes["bano_informacion_situacion"]={message:"¿Cómo está el espacio actualmente?",options:[
{label:"Ya está listo para instalar",keywords:["listo", "terminado", "listo para instalar"],next:"bano_informacion_medidas"},
{label:"Quiero remodelar uno existente",keywords:["remodelar", "remodelación", "cambiar", "reemplazar"],next:"bano_informacion_medidas"},
{label:"Es una obra nueva",keywords:["obra nueva", "construcción", "nuevo"],next:"bano_informacion_medidas"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["bano_informacion_medidas"]={message:"¿Ya tienes las medidas aproximadas?",options:[
{label:"Sí, tengo las medidas",keywords:["sí", "tengo medidas", "ya medí", "medidas listas"],next:"bano_informacion_estilo"},
{label:"Todavía no las tengo",keywords:["no", "todavía no", "no tengo medidas", "necesito medir"],next:"bano_informacion_estilo"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["bano_informacion_estilo"]={message:"¿Qué estilo te gustaría?",options:[
{label:"Moderno",keywords:["moderno", "minimalista", "moderno"],next:"bano_informacion_acabado"},
{label:"Clásico",keywords:["clásico", "tradicional"],next:"bano_informacion_acabado"},
{label:"Elegante",keywords:["elegante", "contemporáneo", "sofisticado"],next:"bano_informacion_acabado"},
{label:"Quiero recomendaciones",keywords:["recomiéndame", "no sé", "asesoría"],next:"bano_informacion_acabado"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["bano_informacion_acabado"]={message:"¿Tienes algún color o acabado en mente?",options:[
{label:"Madera",keywords:["madera", "tonos madera", "roble", "nogal"],next:"bano_informacion_extras"},
{label:"Colores claros",keywords:["blanco", "beige", "claro", "crema"],next:"bano_informacion_extras"},
{label:"Colores oscuros",keywords:["negro", "gris", "oscuro"],next:"bano_informacion_extras"},
{label:"Quiero ver el catálogo",keywords:["catálogo", "colores", "referencias", "ver colores"],next:"bano_informacion_extras"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["bano_informacion_extras"]={message:"¿Qué elementos te gustaría incluir?",options:[
{label:"Solo el mueble",keywords:["solo mueble", "únicamente el mueble"],next:"bano_informacion_ciudad"},
{label:"Cajones y accesorios",keywords:["cajones", "accesorios", "herrajes"],next:"bano_informacion_ciudad"},
{label:"Iluminación",keywords:["iluminación", "luces", "led"],next:"bano_informacion_ciudad"},
{label:"Aún no lo sé",keywords:["no sé", "por definir", "después"],next:"bano_informacion_ciudad"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["bano_informacion_ciudad"]={message:"¿En qué ciudad o municipio se realizará el proyecto? Puedes escribirlo libremente.",any:true,next:'salida'};
nodes.serv_otro={message:"¡Perfecto! Te ayudaremos con muebles personalizados. ¿Qué necesitas en este momento?",options:[
{label:"Quiero cotizar",keywords:["cotizar", "cotización", "presupuesto", "precio"],next:"otro_cotizar_situacion"},
{label:"Necesito ayuda con el diseño",keywords:["diseño", "diseñar", "asesoría", "asesoramiento"],next:"otro_diseno_situacion"},
{label:"Estoy buscando ideas",keywords:["ideas", "inspiración", "referencias", "ejemplos"],next:"otro_ideas_situacion"},
{label:"Solo quiero información",keywords:["información", "información general", "saber más"],next:"otro_informacion_situacion"},
],fallback:'Puedes elegir cotizar, recibir ayuda con el diseño, ver ideas o conocer información.'};
nodes["otro_cotizar_situacion"]={message:"¿Cómo está el espacio actualmente?",options:[
{label:"Ya está listo para instalar",keywords:["listo", "terminado", "listo para instalar"],next:"otro_cotizar_medidas"},
{label:"Quiero remodelar uno existente",keywords:["remodelar", "remodelación", "cambiar", "reemplazar"],next:"otro_cotizar_medidas"},
{label:"Es una obra nueva",keywords:["obra nueva", "construcción", "nuevo"],next:"otro_cotizar_medidas"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["otro_cotizar_medidas"]={message:"¿Ya tienes las medidas aproximadas?",options:[
{label:"Sí, tengo las medidas",keywords:["sí", "tengo medidas", "ya medí", "medidas listas"],next:"otro_cotizar_estilo"},
{label:"Todavía no las tengo",keywords:["no", "todavía no", "no tengo medidas", "necesito medir"],next:"otro_cotizar_estilo"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["otro_cotizar_estilo"]={message:"¿Qué estilo te gustaría?",options:[
{label:"Moderno",keywords:["moderno", "minimalista", "moderno"],next:"otro_cotizar_acabado"},
{label:"Clásico",keywords:["clásico", "tradicional"],next:"otro_cotizar_acabado"},
{label:"Elegante",keywords:["elegante", "contemporáneo", "sofisticado"],next:"otro_cotizar_acabado"},
{label:"Quiero recomendaciones",keywords:["recomiéndame", "no sé", "asesoría"],next:"otro_cotizar_acabado"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["otro_cotizar_acabado"]={message:"¿Tienes algún color o acabado en mente?",options:[
{label:"Madera",keywords:["madera", "tonos madera", "roble", "nogal"],next:"otro_cotizar_extras"},
{label:"Colores claros",keywords:["blanco", "beige", "claro", "crema"],next:"otro_cotizar_extras"},
{label:"Colores oscuros",keywords:["negro", "gris", "oscuro"],next:"otro_cotizar_extras"},
{label:"Quiero ver el catálogo",keywords:["catálogo", "colores", "referencias", "ver colores"],next:"otro_cotizar_extras"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["otro_cotizar_extras"]={message:"¿Qué elementos te gustaría incluir?",options:[
{label:"Solo el mueble",keywords:["solo mueble", "únicamente el mueble"],next:"otro_cotizar_ciudad"},
{label:"Cajones y accesorios",keywords:["cajones", "accesorios", "herrajes"],next:"otro_cotizar_ciudad"},
{label:"Iluminación",keywords:["iluminación", "luces", "led"],next:"otro_cotizar_ciudad"},
{label:"Aún no lo sé",keywords:["no sé", "por definir", "después"],next:"otro_cotizar_ciudad"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["otro_cotizar_ciudad"]={message:"¿En qué ciudad o municipio se realizará el proyecto? Puedes escribirlo libremente.",any:true,next:'salida'};
nodes["otro_diseno_situacion"]={message:"¿Cómo está el espacio actualmente?",options:[
{label:"Ya está listo para instalar",keywords:["listo", "terminado", "listo para instalar"],next:"otro_diseno_medidas"},
{label:"Quiero remodelar uno existente",keywords:["remodelar", "remodelación", "cambiar", "reemplazar"],next:"otro_diseno_medidas"},
{label:"Es una obra nueva",keywords:["obra nueva", "construcción", "nuevo"],next:"otro_diseno_medidas"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["otro_diseno_medidas"]={message:"¿Ya tienes las medidas aproximadas?",options:[
{label:"Sí, tengo las medidas",keywords:["sí", "tengo medidas", "ya medí", "medidas listas"],next:"otro_diseno_estilo"},
{label:"Todavía no las tengo",keywords:["no", "todavía no", "no tengo medidas", "necesito medir"],next:"otro_diseno_estilo"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["otro_diseno_estilo"]={message:"¿Qué estilo te gustaría?",options:[
{label:"Moderno",keywords:["moderno", "minimalista", "moderno"],next:"otro_diseno_acabado"},
{label:"Clásico",keywords:["clásico", "tradicional"],next:"otro_diseno_acabado"},
{label:"Elegante",keywords:["elegante", "contemporáneo", "sofisticado"],next:"otro_diseno_acabado"},
{label:"Quiero recomendaciones",keywords:["recomiéndame", "no sé", "asesoría"],next:"otro_diseno_acabado"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["otro_diseno_acabado"]={message:"¿Tienes algún color o acabado en mente?",options:[
{label:"Madera",keywords:["madera", "tonos madera", "roble", "nogal"],next:"otro_diseno_extras"},
{label:"Colores claros",keywords:["blanco", "beige", "claro", "crema"],next:"otro_diseno_extras"},
{label:"Colores oscuros",keywords:["negro", "gris", "oscuro"],next:"otro_diseno_extras"},
{label:"Quiero ver el catálogo",keywords:["catálogo", "colores", "referencias", "ver colores"],next:"otro_diseno_extras"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["otro_diseno_extras"]={message:"¿Qué elementos te gustaría incluir?",options:[
{label:"Solo el mueble",keywords:["solo mueble", "únicamente el mueble"],next:"otro_diseno_ciudad"},
{label:"Cajones y accesorios",keywords:["cajones", "accesorios", "herrajes"],next:"otro_diseno_ciudad"},
{label:"Iluminación",keywords:["iluminación", "luces", "led"],next:"otro_diseno_ciudad"},
{label:"Aún no lo sé",keywords:["no sé", "por definir", "después"],next:"otro_diseno_ciudad"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["otro_diseno_ciudad"]={message:"¿En qué ciudad o municipio se realizará el proyecto? Puedes escribirlo libremente.",any:true,next:'salida'};
nodes["otro_ideas_situacion"]={message:"¿Cómo está el espacio actualmente?",options:[
{label:"Ya está listo para instalar",keywords:["listo", "terminado", "listo para instalar"],next:"otro_ideas_medidas"},
{label:"Quiero remodelar uno existente",keywords:["remodelar", "remodelación", "cambiar", "reemplazar"],next:"otro_ideas_medidas"},
{label:"Es una obra nueva",keywords:["obra nueva", "construcción", "nuevo"],next:"otro_ideas_medidas"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["otro_ideas_medidas"]={message:"¿Ya tienes las medidas aproximadas?",options:[
{label:"Sí, tengo las medidas",keywords:["sí", "tengo medidas", "ya medí", "medidas listas"],next:"otro_ideas_estilo"},
{label:"Todavía no las tengo",keywords:["no", "todavía no", "no tengo medidas", "necesito medir"],next:"otro_ideas_estilo"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["otro_ideas_estilo"]={message:"¿Qué estilo te gustaría?",options:[
{label:"Moderno",keywords:["moderno", "minimalista", "moderno"],next:"otro_ideas_acabado"},
{label:"Clásico",keywords:["clásico", "tradicional"],next:"otro_ideas_acabado"},
{label:"Elegante",keywords:["elegante", "contemporáneo", "sofisticado"],next:"otro_ideas_acabado"},
{label:"Quiero recomendaciones",keywords:["recomiéndame", "no sé", "asesoría"],next:"otro_ideas_acabado"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["otro_ideas_acabado"]={message:"¿Tienes algún color o acabado en mente?",options:[
{label:"Madera",keywords:["madera", "tonos madera", "roble", "nogal"],next:"otro_ideas_extras"},
{label:"Colores claros",keywords:["blanco", "beige", "claro", "crema"],next:"otro_ideas_extras"},
{label:"Colores oscuros",keywords:["negro", "gris", "oscuro"],next:"otro_ideas_extras"},
{label:"Quiero ver el catálogo",keywords:["catálogo", "colores", "referencias", "ver colores"],next:"otro_ideas_extras"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["otro_ideas_extras"]={message:"¿Qué elementos te gustaría incluir?",options:[
{label:"Solo el mueble",keywords:["solo mueble", "únicamente el mueble"],next:"otro_ideas_ciudad"},
{label:"Cajones y accesorios",keywords:["cajones", "accesorios", "herrajes"],next:"otro_ideas_ciudad"},
{label:"Iluminación",keywords:["iluminación", "luces", "led"],next:"otro_ideas_ciudad"},
{label:"Aún no lo sé",keywords:["no sé", "por definir", "después"],next:"otro_ideas_ciudad"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["otro_ideas_ciudad"]={message:"¿En qué ciudad o municipio se realizará el proyecto? Puedes escribirlo libremente.",any:true,next:'salida'};
nodes["otro_informacion_situacion"]={message:"¿Cómo está el espacio actualmente?",options:[
{label:"Ya está listo para instalar",keywords:["listo", "terminado", "listo para instalar"],next:"otro_informacion_medidas"},
{label:"Quiero remodelar uno existente",keywords:["remodelar", "remodelación", "cambiar", "reemplazar"],next:"otro_informacion_medidas"},
{label:"Es una obra nueva",keywords:["obra nueva", "construcción", "nuevo"],next:"otro_informacion_medidas"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["otro_informacion_medidas"]={message:"¿Ya tienes las medidas aproximadas?",options:[
{label:"Sí, tengo las medidas",keywords:["sí", "tengo medidas", "ya medí", "medidas listas"],next:"otro_informacion_estilo"},
{label:"Todavía no las tengo",keywords:["no", "todavía no", "no tengo medidas", "necesito medir"],next:"otro_informacion_estilo"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["otro_informacion_estilo"]={message:"¿Qué estilo te gustaría?",options:[
{label:"Moderno",keywords:["moderno", "minimalista", "moderno"],next:"otro_informacion_acabado"},
{label:"Clásico",keywords:["clásico", "tradicional"],next:"otro_informacion_acabado"},
{label:"Elegante",keywords:["elegante", "contemporáneo", "sofisticado"],next:"otro_informacion_acabado"},
{label:"Quiero recomendaciones",keywords:["recomiéndame", "no sé", "asesoría"],next:"otro_informacion_acabado"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["otro_informacion_acabado"]={message:"¿Tienes algún color o acabado en mente?",options:[
{label:"Madera",keywords:["madera", "tonos madera", "roble", "nogal"],next:"otro_informacion_extras"},
{label:"Colores claros",keywords:["blanco", "beige", "claro", "crema"],next:"otro_informacion_extras"},
{label:"Colores oscuros",keywords:["negro", "gris", "oscuro"],next:"otro_informacion_extras"},
{label:"Quiero ver el catálogo",keywords:["catálogo", "colores", "referencias", "ver colores"],next:"otro_informacion_extras"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["otro_informacion_extras"]={message:"¿Qué elementos te gustaría incluir?",options:[
{label:"Solo el mueble",keywords:["solo mueble", "únicamente el mueble"],next:"otro_informacion_ciudad"},
{label:"Cajones y accesorios",keywords:["cajones", "accesorios", "herrajes"],next:"otro_informacion_ciudad"},
{label:"Iluminación",keywords:["iluminación", "luces", "led"],next:"otro_informacion_ciudad"},
{label:"Aún no lo sé",keywords:["no sé", "por definir", "después"],next:"otro_informacion_ciudad"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["otro_informacion_ciudad"]={message:"¿En qué ciudad o municipio se realizará el proyecto? Puedes escribirlo libremente.",any:true,next:'salida'};
nodes.serv_proyecto={message:"¡Perfecto! Te ayudaremos con proyectos completos. ¿Qué necesitas en este momento?",options:[
{label:"Quiero cotizar",keywords:["cotizar", "cotización", "presupuesto", "precio"],next:"proyecto_cotizar_situacion"},
{label:"Necesito ayuda con el diseño",keywords:["diseño", "diseñar", "asesoría", "asesoramiento"],next:"proyecto_diseno_situacion"},
{label:"Estoy buscando ideas",keywords:["ideas", "inspiración", "referencias", "ejemplos"],next:"proyecto_ideas_situacion"},
{label:"Solo quiero información",keywords:["información", "información general", "saber más"],next:"proyecto_informacion_situacion"},
],fallback:'Puedes elegir cotizar, recibir ayuda con el diseño, ver ideas o conocer información.'};
nodes["proyecto_cotizar_situacion"]={message:"¿Cómo está el espacio actualmente?",options:[
{label:"Ya está listo para instalar",keywords:["listo", "terminado", "listo para instalar"],next:"proyecto_cotizar_medidas"},
{label:"Quiero remodelar uno existente",keywords:["remodelar", "remodelación", "cambiar", "reemplazar"],next:"proyecto_cotizar_medidas"},
{label:"Es una obra nueva",keywords:["obra nueva", "construcción", "nuevo"],next:"proyecto_cotizar_medidas"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["proyecto_cotizar_medidas"]={message:"¿Ya tienes las medidas aproximadas?",options:[
{label:"Sí, tengo las medidas",keywords:["sí", "tengo medidas", "ya medí", "medidas listas"],next:"proyecto_cotizar_estilo"},
{label:"Todavía no las tengo",keywords:["no", "todavía no", "no tengo medidas", "necesito medir"],next:"proyecto_cotizar_estilo"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["proyecto_cotizar_estilo"]={message:"¿Qué estilo te gustaría?",options:[
{label:"Moderno",keywords:["moderno", "minimalista", "moderno"],next:"proyecto_cotizar_acabado"},
{label:"Clásico",keywords:["clásico", "tradicional"],next:"proyecto_cotizar_acabado"},
{label:"Elegante",keywords:["elegante", "contemporáneo", "sofisticado"],next:"proyecto_cotizar_acabado"},
{label:"Quiero recomendaciones",keywords:["recomiéndame", "no sé", "asesoría"],next:"proyecto_cotizar_acabado"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["proyecto_cotizar_acabado"]={message:"¿Tienes algún color o acabado en mente?",options:[
{label:"Madera",keywords:["madera", "tonos madera", "roble", "nogal"],next:"proyecto_cotizar_extras"},
{label:"Colores claros",keywords:["blanco", "beige", "claro", "crema"],next:"proyecto_cotizar_extras"},
{label:"Colores oscuros",keywords:["negro", "gris", "oscuro"],next:"proyecto_cotizar_extras"},
{label:"Quiero ver el catálogo",keywords:["catálogo", "colores", "referencias", "ver colores"],next:"proyecto_cotizar_extras"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["proyecto_cotizar_extras"]={message:"¿Qué elementos te gustaría incluir?",options:[
{label:"Solo el mueble",keywords:["solo mueble", "únicamente el mueble"],next:"proyecto_cotizar_ciudad"},
{label:"Cajones y accesorios",keywords:["cajones", "accesorios", "herrajes"],next:"proyecto_cotizar_ciudad"},
{label:"Iluminación",keywords:["iluminación", "luces", "led"],next:"proyecto_cotizar_ciudad"},
{label:"Aún no lo sé",keywords:["no sé", "por definir", "después"],next:"proyecto_cotizar_ciudad"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["proyecto_cotizar_ciudad"]={message:"¿En qué ciudad o municipio se realizará el proyecto? Puedes escribirlo libremente.",any:true,next:'salida'};
nodes["proyecto_diseno_situacion"]={message:"¿Cómo está el espacio actualmente?",options:[
{label:"Ya está listo para instalar",keywords:["listo", "terminado", "listo para instalar"],next:"proyecto_diseno_medidas"},
{label:"Quiero remodelar uno existente",keywords:["remodelar", "remodelación", "cambiar", "reemplazar"],next:"proyecto_diseno_medidas"},
{label:"Es una obra nueva",keywords:["obra nueva", "construcción", "nuevo"],next:"proyecto_diseno_medidas"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["proyecto_diseno_medidas"]={message:"¿Ya tienes las medidas aproximadas?",options:[
{label:"Sí, tengo las medidas",keywords:["sí", "tengo medidas", "ya medí", "medidas listas"],next:"proyecto_diseno_estilo"},
{label:"Todavía no las tengo",keywords:["no", "todavía no", "no tengo medidas", "necesito medir"],next:"proyecto_diseno_estilo"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["proyecto_diseno_estilo"]={message:"¿Qué estilo te gustaría?",options:[
{label:"Moderno",keywords:["moderno", "minimalista", "moderno"],next:"proyecto_diseno_acabado"},
{label:"Clásico",keywords:["clásico", "tradicional"],next:"proyecto_diseno_acabado"},
{label:"Elegante",keywords:["elegante", "contemporáneo", "sofisticado"],next:"proyecto_diseno_acabado"},
{label:"Quiero recomendaciones",keywords:["recomiéndame", "no sé", "asesoría"],next:"proyecto_diseno_acabado"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["proyecto_diseno_acabado"]={message:"¿Tienes algún color o acabado en mente?",options:[
{label:"Madera",keywords:["madera", "tonos madera", "roble", "nogal"],next:"proyecto_diseno_extras"},
{label:"Colores claros",keywords:["blanco", "beige", "claro", "crema"],next:"proyecto_diseno_extras"},
{label:"Colores oscuros",keywords:["negro", "gris", "oscuro"],next:"proyecto_diseno_extras"},
{label:"Quiero ver el catálogo",keywords:["catálogo", "colores", "referencias", "ver colores"],next:"proyecto_diseno_extras"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["proyecto_diseno_extras"]={message:"¿Qué elementos te gustaría incluir?",options:[
{label:"Solo el mueble",keywords:["solo mueble", "únicamente el mueble"],next:"proyecto_diseno_ciudad"},
{label:"Cajones y accesorios",keywords:["cajones", "accesorios", "herrajes"],next:"proyecto_diseno_ciudad"},
{label:"Iluminación",keywords:["iluminación", "luces", "led"],next:"proyecto_diseno_ciudad"},
{label:"Aún no lo sé",keywords:["no sé", "por definir", "después"],next:"proyecto_diseno_ciudad"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["proyecto_diseno_ciudad"]={message:"¿En qué ciudad o municipio se realizará el proyecto? Puedes escribirlo libremente.",any:true,next:'salida'};
nodes["proyecto_ideas_situacion"]={message:"¿Cómo está el espacio actualmente?",options:[
{label:"Ya está listo para instalar",keywords:["listo", "terminado", "listo para instalar"],next:"proyecto_ideas_medidas"},
{label:"Quiero remodelar uno existente",keywords:["remodelar", "remodelación", "cambiar", "reemplazar"],next:"proyecto_ideas_medidas"},
{label:"Es una obra nueva",keywords:["obra nueva", "construcción", "nuevo"],next:"proyecto_ideas_medidas"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["proyecto_ideas_medidas"]={message:"¿Ya tienes las medidas aproximadas?",options:[
{label:"Sí, tengo las medidas",keywords:["sí", "tengo medidas", "ya medí", "medidas listas"],next:"proyecto_ideas_estilo"},
{label:"Todavía no las tengo",keywords:["no", "todavía no", "no tengo medidas", "necesito medir"],next:"proyecto_ideas_estilo"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["proyecto_ideas_estilo"]={message:"¿Qué estilo te gustaría?",options:[
{label:"Moderno",keywords:["moderno", "minimalista", "moderno"],next:"proyecto_ideas_acabado"},
{label:"Clásico",keywords:["clásico", "tradicional"],next:"proyecto_ideas_acabado"},
{label:"Elegante",keywords:["elegante", "contemporáneo", "sofisticado"],next:"proyecto_ideas_acabado"},
{label:"Quiero recomendaciones",keywords:["recomiéndame", "no sé", "asesoría"],next:"proyecto_ideas_acabado"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["proyecto_ideas_acabado"]={message:"¿Tienes algún color o acabado en mente?",options:[
{label:"Madera",keywords:["madera", "tonos madera", "roble", "nogal"],next:"proyecto_ideas_extras"},
{label:"Colores claros",keywords:["blanco", "beige", "claro", "crema"],next:"proyecto_ideas_extras"},
{label:"Colores oscuros",keywords:["negro", "gris", "oscuro"],next:"proyecto_ideas_extras"},
{label:"Quiero ver el catálogo",keywords:["catálogo", "colores", "referencias", "ver colores"],next:"proyecto_ideas_extras"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["proyecto_ideas_extras"]={message:"¿Qué elementos te gustaría incluir?",options:[
{label:"Solo el mueble",keywords:["solo mueble", "únicamente el mueble"],next:"proyecto_ideas_ciudad"},
{label:"Cajones y accesorios",keywords:["cajones", "accesorios", "herrajes"],next:"proyecto_ideas_ciudad"},
{label:"Iluminación",keywords:["iluminación", "luces", "led"],next:"proyecto_ideas_ciudad"},
{label:"Aún no lo sé",keywords:["no sé", "por definir", "después"],next:"proyecto_ideas_ciudad"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["proyecto_ideas_ciudad"]={message:"¿En qué ciudad o municipio se realizará el proyecto? Puedes escribirlo libremente.",any:true,next:'salida'};
nodes["proyecto_informacion_situacion"]={message:"¿Cómo está el espacio actualmente?",options:[
{label:"Ya está listo para instalar",keywords:["listo", "terminado", "listo para instalar"],next:"proyecto_informacion_medidas"},
{label:"Quiero remodelar uno existente",keywords:["remodelar", "remodelación", "cambiar", "reemplazar"],next:"proyecto_informacion_medidas"},
{label:"Es una obra nueva",keywords:["obra nueva", "construcción", "nuevo"],next:"proyecto_informacion_medidas"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["proyecto_informacion_medidas"]={message:"¿Ya tienes las medidas aproximadas?",options:[
{label:"Sí, tengo las medidas",keywords:["sí", "tengo medidas", "ya medí", "medidas listas"],next:"proyecto_informacion_estilo"},
{label:"Todavía no las tengo",keywords:["no", "todavía no", "no tengo medidas", "necesito medir"],next:"proyecto_informacion_estilo"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["proyecto_informacion_estilo"]={message:"¿Qué estilo te gustaría?",options:[
{label:"Moderno",keywords:["moderno", "minimalista", "moderno"],next:"proyecto_informacion_acabado"},
{label:"Clásico",keywords:["clásico", "tradicional"],next:"proyecto_informacion_acabado"},
{label:"Elegante",keywords:["elegante", "contemporáneo", "sofisticado"],next:"proyecto_informacion_acabado"},
{label:"Quiero recomendaciones",keywords:["recomiéndame", "no sé", "asesoría"],next:"proyecto_informacion_acabado"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["proyecto_informacion_acabado"]={message:"¿Tienes algún color o acabado en mente?",options:[
{label:"Madera",keywords:["madera", "tonos madera", "roble", "nogal"],next:"proyecto_informacion_extras"},
{label:"Colores claros",keywords:["blanco", "beige", "claro", "crema"],next:"proyecto_informacion_extras"},
{label:"Colores oscuros",keywords:["negro", "gris", "oscuro"],next:"proyecto_informacion_extras"},
{label:"Quiero ver el catálogo",keywords:["catálogo", "colores", "referencias", "ver colores"],next:"proyecto_informacion_extras"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["proyecto_informacion_extras"]={message:"¿Qué elementos te gustaría incluir?",options:[
{label:"Solo el mueble",keywords:["solo mueble", "únicamente el mueble"],next:"proyecto_informacion_ciudad"},
{label:"Cajones y accesorios",keywords:["cajones", "accesorios", "herrajes"],next:"proyecto_informacion_ciudad"},
{label:"Iluminación",keywords:["iluminación", "luces", "led"],next:"proyecto_informacion_ciudad"},
{label:"Aún no lo sé",keywords:["no sé", "por definir", "después"],next:"proyecto_informacion_ciudad"},
],fallback:'Elige una de las opciones o cuéntame brevemente tu respuesta.'};
nodes["proyecto_informacion_ciudad"]={message:"¿En qué ciudad o municipio se realizará el proyecto? Puedes escribirlo libremente.",any:true,next:'salida'};
nodes.precio_inicio={message:'¡Claro! Los precios dependen de las medidas, materiales, diseño y accesorios. ¿Sobre qué mueble deseas conocer el precio?',options:[{label:'Cocina',keywords:['cocina','cocinas'],next:'serv_cocina'},{label:'Closet',keywords:['closet','clóset'],next:'serv_closet'},{label:'Baño',keywords:['baño'],next:'serv_bano'},{label:'Otro mueble',keywords:['otro','mueble'],next:'serv_otro'}],fallback:'Dime si buscas cocina, closet, mueble de baño u otro mueble.'};
nodes.promo_inicio={message:'🎁 ¡Tenemos promociones especiales! Pregunta por la promoción vigente para tu proyecto. ¿Qué mueble te interesa?',options:[{label:'Cocina',keywords:['cocina'],next:'serv_cocina'},{label:'Closet',keywords:['closet','clóset'],next:'serv_closet'},{label:'Baño',keywords:['baño'],next:'serv_bano'},{label:'Proyecto completo',keywords:['proyecto','varios'],next:'serv_proyecto'}],fallback:'Cuéntame qué mueble deseas aprovechar con promoción.'};
nodes.salida={message:'¡Muchas gracias por compartir la información! 🙌 Para que nuestro equipo comercial pueda continuar, déjanos tu número de WhatsApp (si aún no lo has registrado), tu nombre y cualquier detalle adicional. Nuestro equipo revisará tu solicitud y se pondrá en contacto contigo lo antes posible. 🏡',end:true};
window.TE_CHAT_FLOW={start:'inicio',nodes};
})();