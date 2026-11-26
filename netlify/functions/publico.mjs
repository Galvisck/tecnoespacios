// Endpoints públicos: solicitudes del personalizador, seguimiento de proyectos y medición anónima
import {J,store,str,txt,tel,digits,MAIL,num,codigo,hoy,entorno,rd,wr,ipHash,limite,upsertCliente,copiaDiaria,estimar,opciones,ESTADOS_PROY,TIPOS,PARTES} from './lib/negocio.mjs';

const PAGINAS=['inicio','proyectos','mesones','colores','promos','resenas','contacto','shop','personalizador','seguimiento'];
const CANALES=['cotizacion','whatsapp','chat','guardada'];

export default async req=>{
  if(req.method!=='POST')return J({e:'Método no permitido'},405);
  let b;try{b=await req.json()}catch{return J({e:'Solicitud inválida'},400)}
  const st=store();
  if(b.a==='evento')return evento(st,req,b);
  if(b.a==='solicitud')return solicitud(st,req,b);
  if(b.a==='seguimiento')return seguimiento(st,req,b);
  return J({e:'Acción desconocida'},400);
};

/* ---------- Medición anónima (sin datos personales; solo contadores) ---------- */
async function evento(st,req,b){
  const key='stats-'+entorno(req),s=await rd(st,key,null)||{desde:hoy(),dias:{},nombres:{}},k=hoy();
  const d=s.dias[k]=s.dias[k]||{v:0,u:0,n:0,ua:0,p:{},it:{},a:{}};
  if(b.t==='view'&&PAGINAS.includes(b.page)){d.v++;d.p[b.page]=(d.p[b.page]||0)+1;if(b.u)d.u++;if(b.n)d.n++}
  else if(b.t==='item'&&['proyectos','promos','colores','mesones','shop'].includes(b.kind)){
    const id=str(b.id,40),nm=str(b.name,80);if(!id)return J({ok:1});
    d.it[b.kind]=d.it[b.kind]||{};d.it[b.kind][id]=(d.it[b.kind][id]||0)+1;if(nm)s.nombres[b.kind+':'+id]=nm;
  }else if(b.t==='act'&&['wa','contacto','cotiz','form','pers'].includes(b.act)){
    if(b.act==='wa'||b.act==='contacto')d.a[b.act]=(d.a[b.act]||0)+1;
    if(b.ua)d.ua++;
  }else return J({ok:1});
  const ks=Object.keys(s.dias).sort();for(const x of ks.slice(0,Math.max(0,ks.length-800)))delete s.dias[x];
  const nn=Object.keys(s.nombres);if(nn.length>1500)for(const x of nn.slice(0,nn.length-1500))delete s.nombres[x];
  await wr(st,key,s);return J({ok:1});
}

/* ---------- Solicitud del personalizador ---------- */
async function solicitud(st,req,b){
  if(b.hp)return J({ok:1,codigo:'—'});
  const co=b.contacto||{},s=b.sel||{};
  const ct={nombre:str(co.nombre,90),telefono:str(co.telefono,30),correo:str(co.correo,120),ciudad:str(co.ciudad,80)};
  if(ct.nombre.length<2)return J({e:'Escribe tu nombre completo.'},400);
  if(digits(ct.telefono).length<7)return J({e:'Escribe un teléfono válido (mínimo 7 dígitos).'},400);
  if(ct.correo&&!MAIL.test(ct.correo))return J({e:'El correo no es válido.'},400);
  if(!TIPOS[s.tipo])return J({e:'Elige el tipo de mueble.'},400);
  const canal=CANALES.includes(b.canal)?b.canal:'cotizacion';
  const datos=await rd(st,'datos',{}),pz=datos.pz||{},items=Array.isArray(datos.items)?datos.items:[];
  // Colores y mesón: SOLO del catálogo vigente; se guardan nombre, categoría, referencia e imagen reales
  const colores={};
  for(const p of PARTES){
    const id=s.colores&&s.colores[p];if(id==null||id==='')continue;
    const it=items.find(x=>x.k==='colores'&&String(x.id)===String(id));
    if(!it)return J({e:'Uno de los colores elegidos ya no está disponible. Revisa tu selección.',color:String(id)},409);
    colores[p]={id:it.id,nombre:str(it.n,120),categoria:str(it.s,80),ref:str(it.ref,60),img:str((it.img&&it.img[0])||'',300),hex:str(it.x,12)};
  }
  let meson=null;
  if(s.meson!=null&&s.meson!==''){
    const it=items.find(x=>x.k==='mesones'&&String(x.id)===String(s.meson));
    if(!it)return J({e:'El mesón elegido ya no está disponible. Revisa tu selección.'},409);
    meson={id:it.id,nombre:str(it.n,120),categoria:str(it.s,80),ref:str(it.ref,60),img:str((it.img&&it.img[0])||'',300)};
  }
  const lista=(k,v)=>{v=str(v,100);if(!v)return '';const o=opciones(pz[k]);return !o.length||o.some(x=>x.n===v)?v:null};
  const sel={tipo:s.tipo,estilo:lista('estilos',s.estilo),material:lista('materiales',s.material),puertas:lista('puertas',s.puertas),cajones:lista('cajones',s.cajones),tiradores:lista('tiradores',s.tiradores),herrajes:lista('herrajes',s.herrajes)};
  for(const k of Object.keys(sel))if(sel[k]===null)return J({e:'Una de las opciones elegidas ya no está disponible. Revisa tu selección.'},409);
  const m=s.medidas||{},med={ancho:num(m.ancho,0,2000),alto:num(m.alto,0,400),prof:num(m.prof,0,200)};
  for(const [k,v] of Object.entries({ancho:m.ancho,alto:m.alto,prof:m.prof}))if(v!==''&&v!=null&&med[k]==null)return J({e:'Revisa las medidas: ancho hasta 2000 cm, alto hasta 400 cm y profundidad hasta 200 cm.'},400);
  sel.medidas={ancho:med.ancho||0,alto:med.alto||0,prof:med.prof||0};
  const ip=await ipHash(req);
  if(!(await limite(st,'rl-sol',ip,10,36e5)))return J({e:'Enviaste varias solicitudes seguidas. Intenta de nuevo en un rato o escríbenos por WhatsApp.'},429);
  const lista0=await rd(st,'crm-solicitudes'),firma=JSON.stringify([sel,colores,meson,s.obs]);
  const dup=lista0.find(x=>tel(x.contacto.telefono)===tel(ct.telefono)&&x.firma===firma&&Date.now()-Date.parse(x.creada)<6e5);
  if(dup)return J({ok:1,codigo:dup.codigo,duplicado:true,estimado:dup.estimado});
  const sol={id:crypto.randomUUID(),codigo:codigo('SOL'),creada:new Date().toISOString(),canal,estado:'nueva',entorno:entorno(req),
    contacto:ct,...sel,colores,meson,descripcion:str(s.descripcion,300),obs:txt(s.obs,1200),estimado:estimar(pz,sel),firma,nota:'',clienteId:'',proyectoId:''};
  const {c,nuevo}=await upsertCliente(st,{...ct,tipo:TIPOS[sel.tipo],origen:'personalizador',solicitud:sol.id,evento:'Solicitud del personalizador ('+TIPOS[sel.tipo]+') por '+(canal==='whatsapp'?'WhatsApp':canal==='chat'?'chat':canal==='guardada'?'guardado':'cotización')});
  sol.clienteId=c.id;sol.cliente_nuevo=nuevo;
  lista0.push(sol);await wr(st,'crm-solicitudes',lista0.slice(-3000));
  await copiaDiaria(st);
  return J({ok:1,codigo:sol.codigo,estimado:sol.estimado});
}

/* ---------- Seguimiento para el cliente (código + teléfono o correo) ---------- */
async function seguimiento(st,req,b){
  const cod=str(b.codigo,20).toUpperCase(),dato=str(b.dato,120);
  const falla=()=>J({e:'No encontramos un proyecto con esos datos. Revisa el código y el teléfono o correo registrado.'},404);
  if(cod.length<5||dato.length<5)return falla();
  const ip=await ipHash(req);
  // Protección contra adivinar códigos: máximo 10 intentos fallidos cada 15 minutos
  const fl=await rd(st,'rl-seg',{}),now=Date.now(),mine=(fl[ip]||[]).filter(t=>now-t<9e5);
  if(ip&&mine.length>=10)return J({e:'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.'},429);
  const p=(await rd(st,'crm-proyectos')).find(x=>x.codigo===cod);
  const cl=p&&(await rd(st,'crm-clientes')).find(x=>x.id===p.clienteId);
  const ok=!!(p&&cl&&(dato.includes('@')?String(cl.correo||'').toLowerCase()===dato.toLowerCase():(digits(dato).length>=7&&tel(dato)===tel(cl.telefono))));
  if(!ok){if(ip){mine.push(now);fl[ip]=mine;for(const k of Object.keys(fl))if(!fl[k].some(t=>now-t<9e5))delete fl[k];await wr(st,'rl-seg',fl)}return falla()}
  return J({ok:1,proyecto:{codigo:p.codigo,nombre:p.nombre,tipo:p.tipo,inicio:p.inicio,entrega:p.entrega,estado:p.estado,estados:ESTADOS_PROY,
    fotos:(p.fotos||[]).map(f=>({url:f.url,at:f.at,nota:f.nota||''})),novedad:p.novedad||'',
    historial:(p.hist||[]).filter(h=>h.pub).map(h=>({at:h.at,estado:h.estado,texto:h.texto||''}))}});
}
