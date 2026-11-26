import {
  J,body,limite,leer,escribir,now,uid,clean,texto,limit,hash,phone,emailOk,hexOk,num,
  autorizado,principal,tienda,visitante,entorno,esPrueba,claveContacto,ESTADOS_CRM,ORIGENES,
  proyectoBasico,PESTANAS
} from './_comun.mjs';

const ESTADOS=ESTADOS_CRM(),ORIG=ORIGENES;
const imgOk=v=>{const s=String(v||'');return s.length<=120000&&(/^https?:\/\//i.test(s)||/^\/(?!\/)/.test(s)||/^img\//i.test(s)||/^data:image\/[a-z0-9.+-]+;base64,/i.test(s))};

async function addEvento(tipo,meta={},sid=''){
  const a=limit(await leer('eventos',[]),9990);
  a.push({id:uid(),tipo,at:now(),env:entorno(),visitor:visitante(null,sid),meta});
  await escribir('eventos',a);
}
function colorValido(c){
  if(!c||typeof c!=='object')return null;
  const n=clean(c.n,80),s=clean(c.s||c.ref||'',80),x=clean(c.x||'',16),img=clean(c.img||'',120000);
  if(!n||!/^#[0-9a-f]{6}$/i.test(x))return null;
  if(img&&!imgOk(img))return null;
  return {catalogId:clean(c.catalogId||'',120)||'colores|'+n,n,s,x,img,source:clean(c.source||'catalogo',20)||'catalogo',parte:clean(c.parte||'',30)};
}
function medidasValidas(m){
  if(!m||typeof m!=='object')return {};
  const o={};['ancho','alto','profundo'].forEach(k=>{const v=Number(m[k]);if(Number.isFinite(v)&&v>0&&v<=3000)o[k]=v});
  o.unidad=clean(m.unidad||'cm',10)||'cm';return o;
}
function encontrar(lista,c){
  const e=String(c.email||'').toLowerCase().trim(),t=phone(c.tel),r=String(c.ref||'');
  return lista.find(x=>(e&&String(x.email||'').toLowerCase().trim()===e)||(t&&t.length>=10&&phone(x.tel)===t)||(r&&String(x.ref||'')===r))||null;
}
async function upsertContacto(datos,origen){
  const lista=await leer('contactos',[]),e=String(datos.email||'').toLowerCase().trim(),t=phone(datos.tel);
  const ref=datos.ref||'';
  const c=encontrar(lista,{email:e,tel:t,ref})||{
    id:uid(),estado:'Nuevo interesado',fechaPrimerContacto:now(),historial:[],notas:[],tareas:[],llamadas:[],
    cotizaciones:[],proyectos:[],valorOportunidad:0,origen,verificado:false
  };
  if(!c.historial)c.historial=[];if(!c.notas)c.notas=[];if(!c.tareas)c.tareas=[];
  if(!c.llamadas)c.llamadas=[];if(!c.cotizaciones)c.cotizaciones=[];if(!c.proyectos)c.proyectos=[];
  Object.assign(c,{
    nombre:clean(datos.nombre||c.nombre||'Contacto',90),
    email:e||c.email||'',tel:t?String(datos.tel).replace(/\D/g,''):(c.tel||''),
    ciudad:clean(datos.ciudad||c.ciudad||'',80),
    tipoProyecto:clean(datos.tipo||c.tipoProyecto||'',80),
    origen:c.origen||origen,ultimoContacto:now(),updated:now()
  });
  if(!c.ref&&ref)c.ref=ref;
  if(datos.configuracion)c.configuracion=datos.configuracion;
  c.historial.push({at:now(),tipo:'solicitud',detalle:'Solicitud recibida desde '+origen+'.'});
  c.historial=limit(c.historial,200);
  const ix=lista.findIndex(x=>x.id===c.id);if(ix>=0)lista[ix]=c;else lista.push(c);
  await escribir('contactos',limit(lista,4000));
  return c;
}
async function nuevaSolicitud(b,req){
  if(b.hp)return J({ok:1});
  const nombre=clean(b.nombre,90),email=clean(b.email,120).toLowerCase(),tel=clean(b.tel,40);
  if(nombre.length<2)return J({e:'Escribe tu nombre para poder registrar la solicitud.'},400);
  if(!emailOk(email)&&phone(tel).length<10)return J({e:'Deja un correo válido o un teléfono de al menos 10 dígitos.'},400);
  const origen=ORIG.includes(b.origen)?b.origen:'web';
  const colores=Array.isArray(b.colores)?b.colores.map(colorValido).filter(Boolean).slice(0,40):[];
  const medidas=medidasValidas(b.medidas);
  const config={
    tipo:clean(b.tipo,80),modelo:clean(b.modelo,80),estilo:clean(b.estilo,80),
    puerta:clean(b.puerta,80),cajon:clean(b.cajon,80),herraje:clean(b.herraje,80),
    material:clean(b.material,80),medidas,colores,
    observaciones:texto(b.observaciones,2000)
  };
  const c=await upsertContacto({nombre,email,tel,ciudad:b.ciudad,tipo:config.tipo,ref:b.session?('chat:'+hash(b.session)):'',configuracion:config},origen);
  const solicitudes=await leer('solicitudes',[]);
  const sol={id:uid(),codigo:'SOL-'+Date.now().toString(36).toUpperCase(),contactId:c.id,cliente:nombre,origen,created:now(),atendida:false,datos:config};
  solicitudes.push(sol);await escribir('solicitudes',limit(solicitudes,2000));
  c.cotizaciones.push({id:sol.id,codigo:sol.codigo,at:sol.created,origen});
  let proyecto=null;
  if(b.crearProyecto){
    const proyectos=await leer('proyectos',[]);
    proyecto=proyectoBasico({contactId:c.id,cliente:nombre,nombre:config.tipo||'Proyecto a medida',tipo:config.tipo,modelo:config.modelo,medidas,colores,materiales:config.material?[config.material]:[],herrajes:config.herraje?[config.herraje]:[],observaciones:config.observaciones,email,tel,origen,solicitudId:sol.id});
    proyectos.push(proyecto);await escribir('proyectos',limit(proyectos,2000));
    c.proyectos.push({id:proyecto.id,codigo:proyecto.codigo,at:proyecto.created});
  }
  const cs=await leer('contactos',[]),ci=cs.findIndex(x=>x.id===c.id);if(ci>=0)cs[ci]=c;await escribir('contactos',cs);
  await addEvento('cotizacion',{origen,proyecto:proyecto?proyecto.codigo:''},b.sid);
  if(origen==='personalizador')await addEvento('personalizador',{origen,modelo:config.modelo},b.sid);
  if(origen==='formulario')await addEvento('formulario',{origen},b.sid);
  if(origen==='whatsapp')await addEvento('whatsapp',{origen},b.sid);
  if(origen==='chat')await addEvento('chat',{origen},b.sid);
  return J({ok:1,solicitud:sol,proyecto:proyecto?{codigo:proyecto.codigo,estado:proyecto.estado}:null,prueba:esPrueba()});
}

async function migrar(){
  const meta=await leer('meta',{});
  if(meta.migrado)return J({ok:1,ya:true,resultado:meta.resultado||{}});
  const contactos=await leer('contactos',[]),resultado={tienda:0,chat:0,resena:0};
  const agregar=async(datos,origen)=>{
    const c=encontrar(contactos,datos);
    if(c){if(!c.origen)c.origen=origen;return c}
    const n={id:uid(),estado:'Nuevo interesado',fechaPrimerContacto:datos.created||now(),ultimoContacto:datos.updated||datos.created||now(),historial:[],notas:[],tareas:[],llamadas:[],cotizaciones:[],proyectos:[],valorOportunidad:0,origen,verificado:origen==='tienda',...datos};
    contactos.push(n);return n;
  };
  try{
    const idx=await tienda().get('users-index',{type:'json'})||[];
    for(const email of idx){
      const u=await tienda().get('user-'+hash(String(email).toLowerCase()),{type:'json'});
      if(!u)continue;
      await agregar({ref:'tienda:'+hash(String(email).toLowerCase()),nombre:clean(u.name,90),email:String(email).toLowerCase(),tel:clean(u.phone,40),ciudad:'',tipoProyecto:'',created:u.created,updated:u.created,compras:u.purchases||0,historial:[{at:u.created,tipo:'tienda',detalle:'Cliente registrado en TECNO SHOP.'}]},'tienda');
      resultado.tienda++;
    }
  }catch(e){}
  try{
    const msgs=await principal().get('chat-mensajes',{type:'json'})||[];
    const grupos={};for(const m of msgs){if(!m||!m.session)continue;(grupos[m.session]=grupos[m.session]||[]).push(m)}
    for(const [session,list] of Object.entries(grupos)){
      const l=list.slice().sort((a,b)=>String(a.at).localeCompare(String(b.at)));
      const primero=l[0],ultimo=l[l.length-1];
      await agregar({ref:'chat:'+hash(session),nombre:clean(primero.name||'Visitante',90),email:'',tel:'',ciudad:'',tipoProyecto:'',created:primero.at,updated:ultimo.at,historial:l.slice(-20).map(x=>({at:x.at,tipo:'chat',detalle:String(x.message||'').slice(0,300)}))},'chat');
      resultado.chat++;
    }
  }catch(e){}
  try{
    const rs=await principal().get('resenas',{type:'json'})||[];
    for(const r of rs){
      await agregar({ref:'resena:'+r.id,nombre:clean(r.n,90),email:'',tel:'',ciudad:'',tipoProyecto:'',created:r.f,updated:r.f,verificado:false,historial:[{at:r.f,tipo:'resena',detalle:'Dejó una reseña de '+num(r.e,1,5)+' estrellas.'}]},'reseña');
      resultado.resena++;
    }
  }catch(e){}
  await escribir('contactos',limit(contactos,4000));
  await escribir('meta',{...meta,migrado:true,migradoAt:now(),resultado});
  return J({ok:1,resultado});
}

export default async req=>{
  if(req.method!=='POST')return J({e:'Método no permitido'},405);
  const b=await body(req);if(!b)return J({e:'Solicitud inválida'},400);
  const accion=clean(b.accion||'',40);

  if(accion==='solicitud'){
    if(!(await limite(req,'solicitudes',20)))return J({e:'Demasiadas solicitudes. Intenta más tarde.'},429);
    return nuevaSolicitud(b,req);
  }
  // Las opciones de selección son públicas y no contienen datos personales.
  if(accion==='listar'&&clean(b.que||'',30)==='config'){
    if(!(await limite(req,'config',120)))return J({e:'Demasiadas solicitudes. Intenta más tarde.'},429);
    return J({ok:1,config:await leer('config',{listas:{},actualizado:''})});
  }
  if(!(await autorizado(b)))return J({e:'No autorizado'},401);

  if(accion==='listar'){
    const que=clean(b.que||'solicitudes',30);
    if(que==='meta')return J({ok:1,meta:await leer('meta',{})});
    if(que==='contactos')return J({ok:1,contactos:await leer('contactos',[])});
    if(que==='solicitudes')return J({ok:1,solicitudes:await leer('solicitudes',[])});
    return J({e:'Lista desconocida'},400);
  }
  if(accion==='configSet'){
    const actual=await leer('config',{listas:{}}),listas={};
    const fuente=b.listas&&typeof b.listas==='object'?b.listas:{};
    for(const k of ['estilos','tiposPuerta','tiposCajon','tiradores','materiales','modelos','ocultos']){
      const v=Array.isArray(fuente[k])?fuente[k]:String(fuente[k]||'').split('\n');
      listas[k]=[...new Set(v.map(x=>clean(x,80)).filter(Boolean))].slice(0,60);
    }
    await escribir('config',{listas,actualizado:now()});return J({ok:1,config:{listas,actualizado:now()}});
  }
  if(accion==='solicitudAtender'){
    const a=await leer('solicitudes',[]),s=a.find(x=>x.id===b.id);if(!s)return J({e:'No se encontró la solicitud.'},404);
    s.atendida=!!b.atendida;s.atendidaAt=now();await escribir('solicitudes',a);return J({ok:1,solicitud:s});
  }
  if(accion==='crmGuardar'){
    const a=await leer('contactos',[]),id=clean(b.id,60),datos=b.contacto||{};
    const nombre=clean(datos.nombre,90),email=clean(datos.email,120).toLowerCase(),tel=clean(datos.tel,40);
    if(nombre.length<2)return J({e:'El nombre debe tener al menos 2 caracteres.'},400);
    if(email&&!emailOk(email))return J({e:'El correo no parece válido.'},400);
    const dup=a.find(x=>x.id!==id&&encontrar([x],{email,tel,ref:datos.ref||''}));
    if(dup)return J({e:'Ya existe un cliente con ese correo, teléfono o referencia. Edítalo desde el listado para no duplicarlo.'},409);
    const ix=a.findIndex(x=>x.id===id);
    const c=ix>=0?a[ix]:{id:uid(),estado:'Nuevo interesado',fechaPrimerContacto:now(),historial:[],notas:[],tareas:[],llamadas:[],cotizaciones:[],proyectos:[],valorOportunidad:0,origen:'otro',verificado:false};
    Object.assign(c,{nombre,email,tel,ciudad:clean(datos.ciudad,80),tipoProyecto:clean(datos.tipoProyecto,80),origen:ORIG.includes(datos.origen)?datos.origen:c.origen,estado:ESTADOS.includes(datos.estado)?datos.estado:c.estado,valorOportunidad:num(datos.valorOportunidad,0,1e12),updated:now(),ultimoContacto:c.ultimoContacto||now()});
    if(!c.historial)c.historial=[];c.historial.push({at:now(),tipo:'edicion',detalle:'Datos actualizados desde el panel.'});c.historial=limit(c.historial,200);
    if(ix>=0)a[ix]=c;else a.push(c);
    await escribir('contactos',limit(a,4000));return J({ok:1,contacto:c});
  }
  if(accion==='crmEliminar'){
    const a=await leer('contactos',[]),id=clean(b.id,60),c=a.find(x=>x.id===id);
    if(!c)return J({e:'No se encontró el cliente.'},404);
    await escribir('contactos',a.filter(x=>x.id!==id));return J({ok:1});
  }
  if(accion==='crmEstado'){
    const a=await leer('contactos',[]),c=a.find(x=>x.id===b.id);if(!c)return J({e:'No se encontró el cliente.'},404);
    const e=clean(b.estado,40);if(!ESTADOS.includes(e))return J({e:'Estado no válido.'},400);
    c.estado=e;c.updated=now();c.historial=c.historial||[];c.historial.push({at:now(),tipo:'estado',detalle:'Estado cambiado a «'+e+'».'});c.historial=limit(c.historial,200);
    await escribir('contactos',a);return J({ok:1,contacto:c});
  }
  if(accion==='crmNota'){
    const a=await leer('contactos',[]),c=a.find(x=>x.id===b.id);if(!c)return J({e:'No se encontró el cliente.'},404);
    const t=clean(b.tipo,'nota')==='llamada'?'llamada':clean(b.tipo,'nota')==='tarea'?'tarea':'nota';
    const txt=texto(b.texto,1000);if(!txt)return J({e:'Escribe el detalle.'},400);
    const item={id:uid(),at:now(),texto:txt,fecha:t==='tarea'?clean(b.fecha,30):'',hecho:false};
    if(t==='nota')c.notas=c.notas||[],c.notas.unshift(item);
    if(t==='llamada')c.llamadas=c.llamadas||[],c.llamadas.unshift(item);
    if(t==='tarea')c.tareas=c.tareas||[],c.tareas.unshift(item);
    c.ultimoContacto=now();c.historial=c.historial||[];c.historial.push({at:now(),tipo:t,detalle:txt});c.historial=limit(c.historial,200);
    await escribir('contactos',a);return J({ok:1,contacto:c});
  }
  if(accion==='crmVincular'){
    const a=await leer('contactos',[]),c=a.find(x=>x.id===b.id);if(!c)return J({e:'No se encontró el cliente.'},404);
    const campo=b.tipo==='proyecto'?'proyectos':b.tipo==='solicitud'?'cotizaciones':'';
    if(!campo)return J({e:'Vinculación no válida.'},400);
    c[campo]=c[campo]||[];
    const v={id:clean(b.refId,60),codigo:clean(b.codigo,40),at:now()};
    if(!c[campo].some(x=>x.id===v.id))c[campo].push(v);
    await escribir('contactos',a);return J({ok:1,contacto:c});
  }
  if(accion==='crmMigrar')return migrar();
  return J({e:'Acción desconocida'},400);
};
