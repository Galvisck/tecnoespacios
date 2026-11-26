import {getStore} from '@netlify/blobs';
import {createHash,randomUUID,randomBytes} from 'node:crypto';

// Utilidades compartidas por los módulos comerciales nuevos.
// No modifica ni reemplaza los stores existentes: solo crea claves en un store propio.
export const DEF='102eadf5a95f7d262edefb1f2888cb8ded09635c5d71fa6c21d2def3902c299e';
export const STORE='tecnoespacios-comercial';
export const J=(o,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{'content-type':'application/json','cache-control':'no-store'}});
export const st=()=>getStore(STORE);
export const principal=()=>getStore('tecnoespacios');
export const tienda=()=>getStore('tecnoespacios-shop');
export const uid=()=>randomUUID();
export const now=()=>new Date().toISOString();
export const day=s=>String(s||now()).slice(0,10);
export const hash=s=>createHash('sha256').update(String(s??'')).digest('hex');
export const clean=(v,n=200)=>String(v??'').replace(/[<>]/g,'').replace(/\s+/g,' ').trim().slice(0,n);
export const texto=(v,n=2000)=>String(v??'').replace(/[<>]/g,'').trim().slice(0,n);
export const emailOk=v=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v||''));
export const phone=v=>{const d=String(v||'').replace(/\D/g,'');return d.length>=10?d.slice(-10):d};
export const hexOk=v=>/^#[0-9a-f]{6}$/i.test(String(v||''));
export const num=(v,a,b)=>{const n=Number(v);return Number.isFinite(n)?Math.min(b,Math.max(a,n)):a};
export const limit=(a,n)=>Array.isArray(a)?a.slice(-n):[];

export function entorno(){const c=String(process.env.CONTEXT||'').toLowerCase();if(c==='production')return'produccion';if(c&&c!=='dev')return'vista-previa';return'desarrollo'}
export const esPrueba=()=>entorno()!=='produccion';
export function ip(req){return clean(req.headers.get('x-nf-client-connection-ip')||req.headers.get('cf-connecting-ip')||req.headers.get('x-forwarded-for')||'local',80)}
export function visitante(req,sid){const sal=process.env.TE_ANALYTICS_SALT||'te-analytics-local';return hash(String(sid||'anon')+'|'+day()+'|'+sal).slice(0,20)}

export async function autorizado(b){try{const c=(await principal().get('cred'))||DEF;return b.auth===c}catch{return false}}
export async function leer(k,def){const s=st();try{const v=await s.get(k,{type:'json'});return v===null||v===undefined?def:v}catch{return def}}
export async function escribir(k,v){await st().setJSON(k,v);return v}
export async function borrar(k){await st().delete(k).catch(()=>{})}

export async function limite(req,accion,max){
  const s=st(),k=hash(ip(req)+'|'+accion+'|'+now().slice(0,13));
  let r=await leer('limites',{});if(!r||typeof r!=='object'||Array.isArray(r))r={};
  const hora=Date.now();let x=r[k];
  if(!x||hora-Date.parse(x.h)>3600000)x={n:0,h:now()};
  x.n++;r[k]=x;
  if(Object.keys(r).length>600)r=Object.fromEntries(Object.entries(r).sort((a,b)=>String(a[1].h).localeCompare(String(b[1].h))).slice(-400));
  await escribir('limites',r);
  return x.n<=max;
}

export async function body(req){
  try{const b=await req.json();return b&&typeof b==='object'&&!Array.isArray(b)?b:null}catch{return null}
}
export async function metodo(req,permitido='POST'){return req.method===permitido}

export function claveContacto(c){
  const e=String(c.email||'').toLowerCase().trim(),t=phone(c.tel),r=String(c.ref||'');
  if(e)return 'email:'+e;
  if(t&&t.length>=10)return 'tel:'+t;
  if(r)return 'ref:'+r;
  return 'id:'+(c.id||uid());
}
export function PESTANAS(){return['Solicitud recibida','En revisión','Diseño y planificación','Cotización enviada','Cotización aprobada','En fabricación','En preparación para instalación','En instalación','Proyecto finalizado']}
export function ESTADOS_CRM(){return['Nuevo interesado','Contactado','En negociación','Cotización enviada','Pendiente de respuesta','Venta concretada','Cliente perdido']}
export const ORIGENES=['web','formulario','whatsapp','chat','personalizador','tienda','reseña','otro'];

export function codigoProyecto(){
  const d=new Date(),ymd=d.toISOString().slice(0,10).replace(/-/g,'');
  return 'TE-'+ymd+'-'+randomBytes(2).toString('hex').toUpperCase();
}
export function verifHash(id,valor){
  const v=emailOk(valor)?'email:'+String(valor).toLowerCase().trim():'tel:'+phone(valor);
  return hash(id+'|'+v+'|'+(process.env.TE_TRACK_SALT||'te-seguimiento-local'));
}
export function proyectoBasico(o){
  const id=uid(),codigo=codigoProyecto(),at=now();
  return {
    id,codigo,
    contactId:o.contactId||'',
    cliente:clean(o.cliente||o.nombre||'Cliente',90),
    nombre:clean(o.nombre||o.tipo||'Proyecto a medida',120),
    tipo:clean(o.tipo||'',80),modelo:clean(o.modelo||'',80),
    medidas:o.medidas||{},colores:limit(o.colores||[],40),
    materiales:o.materiales||[],herrajes:o.herrajes||[],
    observaciones:texto(o.observaciones||'',2000),
    fechaInicio:day(o.fechaInicio||at),fechaEntrega:clean(o.fechaEntrega||'',30),
    estado:PESTANAS()[0],estadoIndex:0,
    fotos:[],notas:[],historial:[{at,estado:PESTANAS()[0],nota:'Solicitud recibida.',actor:'sistema'}],
    verif:[verifHash(id,o.email||''),verifHash(id,o.tel||'')].filter((v,i,a)=>v&&a.indexOf(v)===i),
    created:at,updated:at,origen:clean(o.origen||'web',40),solicitudId:o.solicitudId||''
  };
}
