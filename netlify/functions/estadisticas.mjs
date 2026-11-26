import {createHash} from 'node:crypto';
import {
  J,body,num,leer,autorizado,principal,tienda,now,entorno,esPrueba,ESTADOS_CRM,PESTANAS,limit
} from './_comun.mjs';

const COM=new Set(['cotizacion','personalizador','whatsapp','contacto','formulario','chat','pedido']);
const dia=s=>String(s||'').slice(0,10);
const fechaHace=n=>new Date(Date.now()-n*86400000).toISOString();
const entre=(s,a,b)=>{const t=Date.parse(s);return Number.isFinite(t)&&t>=Date.parse(a)&&t<Date.parse(b)};
function conteo(lista,campo){const m={};for(const x of lista){const k=String(x??'')||'—';m[k]=(m[k]||0)+1}return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,12)}
function top(lista,tipo,campo){const m={};for(const e of lista){if(e.tipo!==tipo)continue;const k=e.meta&&e.meta[campo];if(!k)continue;m[k]=(m[k]||0)+1}return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([k,n])=>({clave:k,total:n}))}

export default async req=>{
  if(req.method!=='POST')return J({e:'Método no permitido'},405);
  const b=await body(req);if(!b)return J({e:'Solicitud inválida'},400);
  if(!(await autorizado(b)))return J({e:'No autorizado'},401);
  const dias=num(b.dias,30,7,90),eventos=limit(await leer('eventos',[]),10000);
  const solicitudes=await leer('solicitudes',[]),contactos=await leer('contactos',[]),proyectos=await leer('proyectos',[]);
  const inicio=fechaHace(dias),anterior=fechaHace(dias*2),fin=now();
  const actual=eventos.filter(e=>entre(e.at,inicio,fin)),previo=eventos.filter(e=>entre(e.at,anterior,inicio));
  const porTipo={};for(const e of actual)porTipo[e.tipo]=(porTipo[e.tipo]||0)+1;
  const visitantes=e=>new Set(e.map(x=>x.visitor).filter(Boolean)).size;
  const comerciales=actual.filter(e=>COM.has(e.tipo)),visitantesCom=new Set(comerciales.map(e=>e.visitor).filter(Boolean)),totVisit=visitantes(actual);
  const serie=[];
  for(let i=dias-1;i>=0;i--){
    const d=dia(fechaHace(i));const ev=actual.filter(e=>dia(e.at)===d);
    serie.push({dia:d,total:ev.length,unicos:visitantes(ev)});
  }
  const delta=(a,b)=>b?Math.round(((a-b)/b)*1000)/10:null;
  const resumen={
    total:actual.length,unicos:totVisit,hoy:actual.filter(e=>dia(e.at)===dia(now())).length,
    siete:eventos.filter(e=>entre(e.at,fechaHace(7),fin)).length,
    treinta:eventos.filter(e=>entre(e.at,fechaHace(30),fin)).length,
    porTipo,conversion:totVisit?Math.round(visitantesCom.size/totVisit*1000)/10:0,
    solicitudes:solicitudes.length,contactos:contactos.length,proyectos:proyectos.length,
    sinDatos:eventos.length===0
  };
  const comparacion={
    actual:actual.length,anterior:previo.length,variacion:delta(actual.length,previo.length),
    visitantesActual:visitantes(actual),visitantesAnterior:visitantes(previo)
  };
  let registrados=0,compras=0;
  try{
    const idx=await tienda().get('users-index',{type:'json'})||[];registrados=idx.length;
    for(const email of idx){
      const h=createHash('sha256').update(String(email).toLowerCase()).digest('hex');
      const u=await tienda().get('user-'+h,{type:'json'});
      if(u&&Number(u.purchases)>0)compras++;
    }
  }catch(e){}
  let chats=0,resenasPublicadas=0,resenasPendientes=0;
  try{const m=await principal().get('chat-mensajes',{type:'json'})||[];chats=new Set(m.map(x=>x.session).filter(Boolean)).size}catch(e){}
  try{const r=await principal().get('resenas',{type:'json'})||[];resenasPublicadas=r.filter(x=>x.ok).length;resenasPendientes=r.filter(x=>!x.ok).length}catch(e){}
  const estadosCRM={},estadosProy={};
  for(const e of ESTADOS_CRM())estadosCRM[e]=0;
  for(const e of PESTANAS())estadosProy[e]=0;
  for(const c of contactos)if(estadosCRM[c.estado]!==undefined)estadosCRM[c.estado]++;
  for(const p of proyectos)if(estadosProy[p.estado]!==undefined)estadosProy[p.estado]++;
  const pendientes=contactos.filter(c=>c.estado==='Pendiente de respuesta'||(c.tareas||[]).some(t=>!t.hecho)).length;
  const porEnv=conteo(actual.map(e=>e.env||'desarrollo'));
  return J({
    ok:1,periodo:{dias,desde:inicio,hasta:fin},entorno:entorno(),esPrueba:esPrueba(),
    aviso:esPrueba()?'Estos datos pertenecen a un entorno de desarrollo o vista previa, no a producción.':'',
    resumen,comparacion,serie,
    top:{secciones:top(actual,'seccion','slug').concat(top(actual,'visita','slug')),proyectos:top(actual,'proyecto','id'),productos:top(actual,'producto','id'),promos:top(actual,'promo','id')},
    comercial:{porTipo,solicitudesPendientes:solicitudes.filter(s=>!s.atendida).length,personalizador:porTipo.personalizador||0,whatsapp:porTipo.whatsapp||0,formularios:porTipo.formulario||0,chats:porTipo.chat||0},
    crm:{total:contactos.length,porEstado:estadosCRM,pendientes,tareas:(contactos||[]).reduce((n,c)=>n+((c.tareas||[]).filter(t=>!t.hecho)).length,0)},
    proyectosEstado:estadosProy,
    existentes:{chatConversaciones:chats,resenasPublicadas,resenasPendientes,cuentasTienda:registrados,comprasVerificadas:compras},
    porEnv
  });
};
