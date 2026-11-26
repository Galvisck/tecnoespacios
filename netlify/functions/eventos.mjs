import {J,body,limite,leer,escribir,now,uid,clean,limit,visitante,entorno,esPrueba} from './_comun.mjs';

const TIPOS=new Set(['visita','seccion','proyecto','producto','promo','whatsapp','contacto','formulario','cotizacion','personalizador','chat','pedido']);
const CLAVES=new Set(['slug','id','categoria','origen','destino','estado','fuente','proyecto','modelo']);

export default async req=>{
  if(req.method!=='POST')return J({e:'Método no permitido'},405);
  const b=await body(req);if(!b)return J({e:'Solicitud inválida'},400);
  if(!TIPOS.has(b.tipo))return J({e:'Evento no reconocido'},400);
  if(!(await limite(req,'eventos',180)))return J({e:'Demasiadas solicitudes. Intenta más tarde.'},429);
  const meta={};
  if(b.meta&&typeof b.meta==='object')for(const k of CLAVES){if(b.meta[k]!==undefined&&b.meta[k]!==null)meta[k]=clean(b.meta[k],80)}
  const ev={id:uid(),tipo:b.tipo,at:now(),env:entorno(),visitor:visitante(req,b.sid),meta};
  const eventos=limit(await leer('eventos',[]),9990);eventos.push(ev);
  await escribir('eventos',eventos);
  return J({ok:1,prueba:esPrueba()});
};
