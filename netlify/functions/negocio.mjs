// Administración: CRM de clientes, solicitudes, proyectos, estadísticas y copias. Solo con la clave del panel.
import {J,store,str,txt,tel,digits,MAIL,num,codigo,hoy,entorno,rd,wr,esAdmin,copiaDiaria,datosNegocio,ESTADOS_CLI,ESTADOS_PROY} from './lib/negocio.mjs';

const ORIGENES=['pagina','whatsapp','chat','formulario','personalizador','otro'];
const ESTADOS_SOL=['nueva','revisada','cotizada','proyecto','descartada'];
const KINDS=['notas','recordatorios','contactos','cotizaciones'];
const FECHA=/^\d{4}-\d{2}-\d{2}$/;
const fecha=v=>FECHA.test(String(v||''))?String(v):'';
const dia=iso=>new Date(Date.parse(iso)-5*36e5).toISOString().slice(0,10);
const ahora=()=>new Date().toISOString();
const err=(e,s=400,x={})=>J({e,...x},s);
const URL_OK=u=>/^\/\.netlify\/functions\/datos\?r=img&id=[\w-]+$/.test(u)||/^img\/[\w./-]+$/.test(u);

export default async req=>{
  if(req.method!=='POST')return J({e:'Método no permitido'},405);
  let b;try{b=await req.json()}catch{return J({e:'Solicitud inválida'},400)}
  const st=store();
  if(!(await esAdmin(st,b.auth)))return J({e:'No autorizado'},401);
  const h=H[b.a];if(!h)return J({e:'Acción desconocida'},400);
  try{const r=await h(st,b,req);const out=r instanceof Response?r:J({ok:1,...r});await copiaDiaria(st);return out}
  catch(e){return J({e:'No se pudo completar la acción.'},500)}
};

const limpiarCliente=b=>({nombre:str(b.nombre,90),telefono:str(b.telefono,30),correo:str(b.correo,120),ciudad:str(b.ciudad,80),tipo:str(b.tipo,80),
  origen:ORIGENES.includes(b.origen)?b.origen:'otro',estado:ESTADOS_CLI.includes(b.estado)?b.estado:'nuevo',valor:num(b.valor,0,1e12)||0,obs:txt(b.obs,1500)});
const dupDe=(all,d,idx)=>all.find(x=>x.id!==idx&&((tel(d.telefono).length>=7&&tel(x.telefono)===tel(d.telefono))||(d.correo&&String(x.correo||'').toLowerCase()===d.correo.toLowerCase())));
const hist=(c,tipo,texto)=>{c.hist=[...(c.hist||[]),{at:ahora(),tipo,texto:str(texto,200)}].slice(-200)};
const atendido=c=>{c.ultimoAdmin=c.ultimo=ahora();c.sinAtender=false};

const H={
/* ---------- CRM ---------- */
async 'c-list'(st){
  const l=await rd(st,'crm-clientes');
  return {clientes:l.map(({hist,notas,mensajes,sesiones,...c})=>({...c,nNotas:notas.length}))};
},
async 'c-get'(st,b){
  const c=(await rd(st,'crm-clientes')).find(x=>x.id===b.id);if(!c)return err('Cliente no encontrado.',404);
  const chat=(await rd(st,'chat-mensajes')).filter(x=>(c.sesiones||[]).includes(x.session));
  const t=tel(c.telefono),mensajes=(await rd(st,'contacto-mensajes')).filter(m=>(c.mensajes||[]).includes(m.id)||(t.length>=7&&tel(m.telefono)===t));
  const sol=(await rd(st,'crm-solicitudes')).filter(x=>x.clienteId===c.id||(c.solicitudes||[]).includes(x.id));
  const proy=(await rd(st,'crm-proyectos')).filter(x=>x.clienteId===c.id);
  return {cliente:c,chat,mensajes,solicitudes:sol,proyectos:proy};
},
async 'c-save'(st,b){
  const all=await rd(st,'crm-clientes'),d=limpiarCliente(b);
  if(d.nombre.length<2)return err('Escribe el nombre del cliente.');
  if(!d.telefono&&!d.correo)return err('Escribe al menos un teléfono o un correo.');
  if(d.telefono&&digits(d.telefono).length<7)return err('El teléfono no es válido.');
  if(d.correo&&!MAIL.test(d.correo))return err('El correo no es válido.');
  const dup=dupDe(all,d,b.id||'');
  if(dup)return err('Ya existe un cliente con ese teléfono o correo: '+dup.nombre+'.',409,{dup:{id:dup.id,nombre:dup.nombre}});
  let c=b.id&&all.find(x=>x.id===b.id);
  if(c){
    if(d.estado!==c.estado)hist(c,'estado','Estado: '+c.estado+' → '+d.estado);
    Object.assign(c,d);
  }else{
    const now=ahora();
    c={id:crypto.randomUUID(),...d,origenes:[d.origen],creado:now,ultimo:now,ultimoCliente:'',ultimoAdmin:now,sinAtender:false,notas:[],recordatorios:[],contactos:[],cotizaciones:[],solicitudes:[],proyectos:[],sesiones:[],mensajes:[],hist:[{at:now,tipo:'otro',texto:'Cliente creado manualmente'}]};
    all.push(c);
  }
  await wr(st,'crm-clientes',all);return {id:c.id};
},
async 'c-del'(st,b){
  const all=await rd(st,'crm-clientes');if(!all.some(x=>x.id===b.id))return err('Cliente no encontrado.',404);
  await wr(st,'crm-clientes',all.filter(x=>x.id!==b.id));return {};
},
async 'c-mover'(st,b){
  if(!ESTADOS_CLI.includes(b.estado))return err('Estado no válido.');
  const all=await rd(st,'crm-clientes'),c=all.find(x=>x.id===b.id);if(!c)return err('Cliente no encontrado.',404);
  if(c.estado!==b.estado){hist(c,'estado','Estado: '+c.estado+' → '+b.estado);c.estado=b.estado}
  atendido(c);await wr(st,'crm-clientes',all);return {};
},
async 'c-add'(st,b){
  if(!KINDS.includes(b.kind))return err('Acción no válida.');
  const all=await rd(st,'crm-clientes'),c=all.find(x=>x.id===b.id);if(!c)return err('Cliente no encontrado.',404);
  const i=b.item||{},id=crypto.randomUUID(),at=ahora();let it;
  if(b.kind==='notas'){const t=txt(i.texto,1500);if(!t)return err('Escribe la nota.');it={id,at,texto:t}}
  if(b.kind==='recordatorios'){const f=fecha(i.fecha),t=str(i.texto,300);if(!f)return err('Elige la fecha del recordatorio.');if(!t)return err('Escribe de qué trata el recordatorio.');it={id,at,fecha:f,texto:t,hecho:false}}
  if(b.kind==='contactos'){const t=txt(i.texto,1000);if(!t)return err('Escribe qué se habló.');it={id,at:fecha(i.fecha)?i.fecha+'T12:00:00.000Z':at,tipo:['llamada','whatsapp','visita','correo','otro'].includes(i.tipo)?i.tipo:'llamada',texto:t}}
  if(b.kind==='cotizaciones'){const v=num(i.valor,0,1e12);if(v==null)return err('El valor de la cotización no es válido.');it={id,at:fecha(i.fecha)?i.fecha+'T12:00:00.000Z':at,numero:str(i.numero,40),valor:v,nota:str(i.nota,300),estado:['enviada','aprobada','rechazada'].includes(i.estado)?i.estado:'enviada',proyectoId:str(i.proyectoId,60)}}
  c[b.kind].push(it);
  if(b.kind!=='recordatorios'){atendido(c);hist(c,b.kind==='contactos'?it.tipo:'otro',({notas:'Nota agregada',contactos:'Contacto registrado ('+it.tipo+')',cotizaciones:'Cotización registrada'+(it.numero?' '+it.numero:'')})[b.kind])}
  await wr(st,'crm-clientes',all);return {item:it};
},
async 'c-upd'(st,b){
  if(!KINDS.includes(b.kind))return err('Acción no válida.');
  const all=await rd(st,'crm-clientes'),c=all.find(x=>x.id===b.id),it=c&&c[b.kind].find(x=>x.id===b.itemId);if(!it)return err('No encontrado.',404);
  const p=b.patch||{};
  if(b.kind==='recordatorios'){if('hecho'in p)it.hecho=!!p.hecho;if(p.fecha&&fecha(p.fecha))it.fecha=p.fecha;if(p.texto)it.texto=str(p.texto,300)}
  if(b.kind==='cotizaciones'){if(['enviada','aprobada','rechazada'].includes(p.estado))it.estado=p.estado;if('valor'in p&&num(p.valor,0,1e12)!=null)it.valor=num(p.valor,0,1e12);if('nota'in p)it.nota=str(p.nota,300);if('numero'in p)it.numero=str(p.numero,40);if('proyectoId'in p)it.proyectoId=str(p.proyectoId,60)}
  if(b.kind==='notas'&&p.texto)it.texto=txt(p.texto,1500);
  await wr(st,'crm-clientes',all);return {};
},
async 'c-rm'(st,b){
  if(!KINDS.includes(b.kind))return err('Acción no válida.');
  const all=await rd(st,'crm-clientes'),c=all.find(x=>x.id===b.id);if(!c)return err('Cliente no encontrado.',404);
  c[b.kind]=c[b.kind].filter(x=>x.id!==b.itemId);await wr(st,'crm-clientes',all);return {};
},

/* ---------- Solicitudes del personalizador ---------- */
async 's-list'(st){return {solicitudes:(await rd(st,'crm-solicitudes')).map(({firma,...s})=>s).reverse()}},
async 's-upd'(st,b){
  const all=await rd(st,'crm-solicitudes'),s=all.find(x=>x.id===b.id);if(!s)return err('Solicitud no encontrada.',404);
  if(b.estado){if(!ESTADOS_SOL.includes(b.estado))return err('Estado no válido.');s.estado=b.estado}
  if('nota'in b)s.nota=txt(b.nota,1000);
  if(b.clienteId&&b.clienteId!==s.clienteId){
    const cl=await rd(st,'crm-clientes'),nuevo=cl.find(x=>x.id===b.clienteId);if(!nuevo)return err('Cliente no encontrado.',404);
    const viejo=cl.find(x=>x.id===s.clienteId);if(viejo)viejo.solicitudes=viejo.solicitudes.filter(x=>x!==s.id);
    if(!nuevo.solicitudes.includes(s.id))nuevo.solicitudes.push(s.id);hist(nuevo,'personalizador','Solicitud '+s.codigo+' relacionada manualmente');
    s.clienteId=nuevo.id;await wr(st,'crm-clientes',cl);
  }
  await wr(st,'crm-solicitudes',all);return {};
},
async 's-del'(st,b){
  const all=await rd(st,'crm-solicitudes'),s=all.find(x=>x.id===b.id);if(!s)return err('Solicitud no encontrada.',404);
  await wr(st,'crm-solicitudes',all.filter(x=>x.id!==b.id));
  const cl=await rd(st,'crm-clientes');cl.forEach(c=>{c.solicitudes=(c.solicitudes||[]).filter(x=>x!==s.id)});await wr(st,'crm-clientes',cl);return {};
},

/* ---------- Proyectos y seguimiento ---------- */
async 'p-list'(st){return {proyectos:(await rd(st,'crm-proyectos')).reverse(),estados:ESTADOS_PROY}},
async 'p-save'(st,b){
  const all=await rd(st,'crm-proyectos'),cl=await rd(st,'crm-clientes');
  const nombre=str(b.nombre,120),tipo=str(b.tipo,80),inicio=fecha(b.inicio),entrega=fecha(b.entrega),est=num(b.estado,0,ESTADOS_PROY.length-1);
  if(nombre.length<2)return err('Escribe el nombre del proyecto.');
  const c=cl.find(x=>x.id===b.clienteId);if(!c)return err('Elige el cliente del proyecto.');
  if(est==null)return err('Estado no válido.');
  const novedad=txt(b.novedad,1000),nota=txt(b.notaInterna,1500),now=ahora();
  let p=b.id&&all.find(x=>x.id===b.id);
  if(!p){
    let cod;do{cod=codigo('TE')}while(all.some(x=>x.codigo===cod));
    p={id:crypto.randomUUID(),codigo:cod,nombre,tipo,clienteId:c.id,solicitudId:str(b.solicitudId,60),inicio:inicio||hoy(),entrega,estado:est,novedad,notaInterna:nota,fotos:[],creado:now,actualizado:now,
      hist:[{at:now,estado:est,texto:novedad||'Proyecto creado',pub:true}]};
    all.push(p);c.proyectos=[...new Set([...(c.proyectos||[]),p.id])];hist(c,'otro','Proyecto creado: '+nombre+' ('+cod+')');
    if(p.solicitudId){const sl=await rd(st,'crm-solicitudes'),s=sl.find(x=>x.id===p.solicitudId);if(s){s.proyectoId=p.id;s.estado='proyecto';await wr(st,'crm-solicitudes',sl)}}
  }else{
    if(est!==p.estado)p.hist.push({at:now,estado:est,texto:novedad||'',pub:true});
    else if(novedad&&novedad!==p.novedad)p.hist.push({at:now,estado:est,texto:novedad,pub:true});
    if(entrega!==p.entrega&&(entrega||p.entrega))p.hist.push({at:now,estado:est,texto:entrega?'Nueva fecha estimada de entrega: '+entrega:'Se retiró la fecha estimada de entrega',pub:true});
    Object.assign(p,{nombre,tipo,inicio:inicio||p.inicio,entrega,estado:est,novedad,notaInterna:nota,actualizado:now});
    if(p.clienteId!==c.id){const v=cl.find(x=>x.id===p.clienteId);if(v)v.proyectos=v.proyectos.filter(x=>x!==p.id);c.proyectos=[...new Set([...(c.proyectos||[]),p.id])];p.clienteId=c.id}
  }
  p.hist=p.hist.slice(-300);
  await wr(st,'crm-proyectos',all);await wr(st,'crm-clientes',cl);return {id:p.id,codigo:p.codigo};
},
async 'p-foto'(st,b){
  const all=await rd(st,'crm-proyectos'),p=all.find(x=>x.id===b.id);if(!p)return err('Proyecto no encontrado.',404);
  if(!URL_OK(String(b.url||'')))return err('Imagen no válida.');
  if((p.fotos||[]).length>=60)return err('Este proyecto ya tiene el máximo de fotografías.');
  const nota=str(b.nota,200),now=ahora();p.fotos.push({url:b.url,at:now,nota});p.hist.push({at:now,estado:p.estado,texto:'Nueva fotografía de avance'+(nota?': '+nota:''),pub:true});p.actualizado=now;
  await wr(st,'crm-proyectos',all);return {};
},
async 'p-fotodel'(st,b){
  const all=await rd(st,'crm-proyectos'),p=all.find(x=>x.id===b.id);if(!p)return err('Proyecto no encontrado.',404);
  p.fotos=p.fotos.filter((_,i)=>i!==+b.idx);await wr(st,'crm-proyectos',all);return {};
},
async 'p-del'(st,b){
  const all=await rd(st,'crm-proyectos');if(!all.some(x=>x.id===b.id))return err('Proyecto no encontrado.',404);
  await wr(st,'crm-proyectos',all.filter(x=>x.id!==b.id));
  const cl=await rd(st,'crm-clientes');cl.forEach(c=>{c.proyectos=(c.proyectos||[]).filter(x=>x!==b.id)});await wr(st,'crm-clientes',cl);return {};
},

/* ---------- Estadísticas ---------- */
async 'st-get'(st,b,req){
  const env=entorno(req),s=await rd(st,'stats-'+env,null)||{desde:'',dias:{},nombres:{}};
  const d1=fecha(b.desde)||'0000-00-00',d2=fecha(b.hasta)||'9999-99-99',dias={};
  for(const [k,v] of Object.entries(s.dias))if(k>=d1&&k<=d2)dias[k]=v;
  const reg={};
  const suma=(k,c)=>{if(k>=d1&&k<=d2){reg[k]=reg[k]||{cotiz:0,pers:0,form:0};reg[k][c]++}};
  for(const x of await rd(st,'crm-solicitudes')){const k=dia(x.creada);suma(k,'pers');if(x.canal!=='guardada')suma(k,'cotiz')}
  for(const m of await rd(st,'contacto-mensajes'))suma(dia(m.at),'form');
  return {entorno:env,desde:s.desde,dias,nombres:s.nombres,registros:reg};
},

/* ---------- Copias de seguridad ---------- */
async 'bk-list'(st){
  const l=((await st.list({prefix:'bk-'})).blobs||[]).map(x=>x.key).sort().reverse();return {copias:l};
},
async 'bk-make'(st){const k='bk-'+hoy();await st.setJSON(k,{creada:ahora(),...(await datosNegocio(st))});return {key:k}},
async 'bk-get'(st,b){
  if(!/^bk-[\w-]+$/.test(String(b.key||'')))return err('Copia no válida.');
  const d=await rd(st,b.key,null);if(!d)return err('Copia no encontrada.',404);return {copia:d};
},
async 'bk-all'(st){return {copia:{creada:ahora(),...(await datosNegocio(st))}}},
async 'bk-restore'(st,b){
  const d=b.copia;if(!d||!Array.isArray(d.clientes)||!Array.isArray(d.solicitudes)||!Array.isArray(d.proyectos))return err('El archivo no es una copia válida.');
  await st.setJSON('bk-antes-de-restaurar',{creada:ahora(),...(await datosNegocio(st))});
  await wr(st,'crm-clientes',d.clientes.slice(-5000));await wr(st,'crm-solicitudes',d.solicitudes.slice(-3000));await wr(st,'crm-proyectos',d.proyectos.slice(-2000));
  return {clientes:d.clientes.length,solicitudes:d.solicitudes.length,proyectos:d.proyectos.length};
},
};
