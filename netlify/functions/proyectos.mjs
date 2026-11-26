import {
  J,body,limite,leer,escribir,now,uid,clean,texto,limit,phone,emailOk,
  autorizado,verifHash,proyectoBasico,PESTANAS
} from './_comun.mjs';

const ESTADOS=PESTANAS();
const urlOk=v=>{const s=String(v||'');return s.length<=120000&&(/^https?:\/\//i.test(s)||/^\/(?!\/)/.test(s)||/^img\//i.test(s)||/^data:image\/[a-z0-9.+-]+;base64,/i.test(s))};
function registrar(p,tipo,detalle,actor='admin'){
  p.historial=p.historial||[];p.historial.push({at:now(),estado:p.estado,tipo,nota:detalle,actor});
  p.historial=limit(p.historial,300);p.updated=now();
}
function seguro(p){
  return {
    id:p.id,codigo:p.codigo,nombre:p.nombre,tipo:p.tipo,modelo:p.modelo,
    fechaInicio:p.fechaInicio,estado:p.estado,estadoIndex:p.estadoIndex||0,fechaEntrega:p.fechaEntrega||'',
    fotos:(p.fotos||[]).slice(-30),notas:(p.notas||[]).slice(-50),
    historial:(p.historial||[]).map(h=>({at:h.at,estado:h.estado,nota:h.nota||''})).slice(-50),
    colores:(p.colores||[]).slice(0,40),medidas:p.medidas||{},updated:p.updated
  };
}
async function vincularContacto(p,b){
  const contactos=await leer('contactos',[]);
  let c=contactos.find(x=>x.id===b.contactId)||null;
  const e=String(b.email||'').toLowerCase().trim(),t=phone(b.tel);
  if(!c&&e)c=contactos.find(x=>String(x.email||'').toLowerCase().trim()===e)||null;
  if(!c&&t&&t.length>=10)c=contactos.find(x=>phone(x.tel)===t)||null;
  if(c){
    p.contactId=c.id;p.cliente=c.nombre||p.cliente;
    c.proyectos=c.proyectos||[];
    if(!c.proyectos.some(x=>x.id===p.id))c.proyectos.push({id:p.id,codigo:p.codigo,at:p.created});
    c.ultimoContacto=now();
    await escribir('contactos',contactos);
  }
}
export default async req=>{
  if(req.method!=='POST')return J({e:'Método no permitido'},405);
  const b=await body(req);if(!b)return J({e:'Solicitud inválida'},400);
  const accion=clean(b.accion||'',30);

  if(accion==='verificar'){
    if(!(await limite(req,'seguimiento',20)))return J({e:'Demasiadas consultas. Intenta más tarde.'},429);
    const codigo=clean(b.codigo,40).toUpperCase(),ver=clean(b.verificacion,120);
    if(!codigo||!ver)return J({e:'Escribe el código y tu teléfono o correo.'},400);
    const proyectos=await leer('proyectos',[]),p=proyectos.find(x=>String(x.codigo).toUpperCase()===codigo);
    if(!p)return J({e:'No encontramos ese código de seguimiento.'},404);
    const h=verifHash(p.id,ver),email=emailOk(ver)?verifHash(p.id,emailOk(ver)?ver.toLowerCase().trim():''):'';
    if(!(p.verif||[]).includes(h)&&!(email&&(p.verif||[]).includes(email)))return J({e:'El dato de verificación no coincide con este proyecto.'},403);
    return J({ok:1,proyecto:seguro(p)});
  }

  if(!(await autorizado(b)))return J({e:'No autorizado'},401);
  const proyectos=await leer('proyectos',[]);

  if(accion==='listar')return J({ok:1,proyectos});

  if(accion==='crear'){
    const cliente=clean(b.cliente,90),tipo=clean(b.tipo,80);
    if(cliente.length<2)return J({e:'Escribe el nombre del cliente.'},400);
    const p=proyectoBasico({
      contactId:b.contactId,cliente,nombre:clean(b.nombre||tipo||'Proyecto a medida',120),tipo,modelo:clean(b.modelo,80),
      medidas:b.medidas||{},colores:Array.isArray(b.colores)?b.colores.slice(0,40):[],
      observaciones:texto(b.observaciones,2000),email:b.email,tel:b.tel,origen:'panel',
      fechaEntrega:clean(b.fechaEntrega,30),fechaInicio:clean(b.fechaInicio,30)||now()
    });
    const lista=limit(proyectos,2000);lista.push(p);
    await escribir('proyectos',lista);
    await vincularContacto(p,b);
    registrar(p,'creacion','Proyecto creado desde el panel con código '+p.codigo+'.','admin');
    await escribir('proyectos',lista);
    return J({ok:1,proyecto:p});
  }
  if(accion==='eliminar'){
    const i=proyectos.findIndex(x=>x.id===b.id);if(i<0)return J({e:'No se encontró el proyecto.'},404);
    const [p]=proyectos.splice(i,1);await escribir('proyectos',proyectos);
    const contactos=await leer('contactos',[]);
    for(const c of contactos)if(Array.isArray(c.proyectos))c.proyectos=c.proyectos.filter(x=>x.id!==p.id);
    await escribir('contactos',contactos);
    return J({ok:1});
  }
  const p=proyectos.find(x=>x.id===b.id);if(!p)return J({e:'No se encontró el proyecto.'},404);

  if(accion==='actualizar'){
    const cambios=[];
    for(const [k,v] of [['nombre',clean(b.nombre,120)],['tipo',clean(b.tipo,80)],['modelo',clean(b.modelo,80)],['fechaInicio',clean(b.fechaInicio,30)],['fechaEntrega',clean(b.fechaEntrega,30)],['observaciones',texto(b.observaciones,2000)]]){
      if(v&&p[k]!==v){p[k]=v;cambios.push(k)}
    }
    if(!cambios.length)return J({ok:1,proyecto:p});
    registrar(p,'edicion','Datos actualizados: '+cambios.join(', ')+'.','admin');
    await escribir('proyectos',proyectos);return J({ok:1,proyecto:p});
  }
  if(accion==='estado'){
    const e=clean(b.estado,60);if(!ESTADOS.includes(e))return J({e:'Estado no válido.'},400);
    if(p.estado===e)return J({ok:1,proyecto:p});
    p.estado=e;p.estadoIndex=ESTADOS.indexOf(e);
    registrar(p,'estado','Cambio de estado a «'+e+'».',clean(b.nota,300)||'admin');
    await escribir('proyectos',proyectos);return J({ok:1,proyecto:p});
  }
  if(accion==='nota'){
    const t=texto(b.texto,2000);if(!t)return J({e:'Escribe la novedad.'},400);
    p.notas=p.notas||[];p.notas.push({id:uid(),at:now(),texto:t,actor:'admin'});p.notas=limit(p.notas,200);
    registrar(p,'nota',t,'admin');await escribir('proyectos',proyectos);return J({ok:1,proyecto:p});
  }
  if(accion==='foto'){
    const u=clean(b.url,120000);if(!urlOk(u))return J({e:'La imagen no es válida.'},400);
    p.fotos=p.fotos||[];p.fotos.push({id:uid(),u,at:now()});p.fotos=limit(p.fotos,100);
    registrar(p,'foto','Se agregó una fotografía del avance.','admin');
    await escribir('proyectos',proyectos);return J({ok:1,proyecto:p});
  }
  return J({e:'Acción desconocida'},400);
};
