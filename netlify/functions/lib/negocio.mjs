// Utilidades compartidas: CRM, solicitudes, proyectos y estadísticas (almacén Netlify Blobs)
import {getStore} from '@netlify/blobs';

export const DEF='102eadf5a95f7d262edefb1f2888cb8ded09635c5d71fa6c21d2def3902c299e';
export const J=(o,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{'content-type':'application/json','cache-control':'no-store'}});
export const store=()=>getStore({name:'tecnoespacios',consistency:'strong'});
export const str=(v,n)=>String(v??'').replace(/[\u0000-\u001f<>]/g,' ').replace(/\s+/g,' ').trim().slice(0,n);
export const txt=(v,n)=>String(v??'').replace(/[\u0000-\u0009\u000b-\u001f<>]/g,' ').replace(/[ \t]+/g,' ').replace(/\n{3,}/g,'\n\n').trim().slice(0,n);
export const digits=s=>String(s??'').replace(/\D/g,'');
export const tel=s=>digits(s).slice(-10);
export const MAIL=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const num=(v,min,max)=>{const n=Number(String(v??'').replace(',','.'));return Number.isFinite(n)&&n>=min&&n<=max?n:null};
const ALFA='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const codigo=(pref,n=6)=>pref+'-'+Array.from(crypto.getRandomValues(new Uint8Array(n)),b=>ALFA[b%ALFA.length]).join('');
export const esAdmin=async(st,auth)=>!!auth&&auth===((await st.get('cred'))||DEF);
export const hoy=()=>new Date(Date.now()-5*36e5).toISOString().slice(0,10); // día en hora de Colombia
// Solo el dominio publicado cuenta como datos reales; local y vistas previas son «prueba».
export const entorno=req=>{let h='';try{h=new URL(req.url).hostname}catch{}return process.env.ENTORNO==='produccion'||/^(www\.)?tecnoespacios\.homes$/.test(h)?'produccion':'prueba'};
export const rd=async(st,k,def=[])=>(await st.get(k,{type:'json'}).catch(()=>null))??def;
export const wr=(st,k,v)=>st.setJSON(k,v);
export const hx=async s=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(String(s))))].map(b=>b.toString(16).padStart(2,'0')).join('').slice(0,16);
export const ipHash=async req=>{const ip=req.headers.get('x-nf-client-connection-ip')||req.headers.get('x-forwarded-for')||'';return ip?hx(ip):''};

export const ESTADOS_CLI=['nuevo','contactado','negociacion','cotizacion','pendiente','vendido','perdido'];
export const ESTADOS_PROY=['Solicitud recibida','En revisión','Diseño y planificación','Cotización enviada','Cotización aprobada','En fabricación','En preparación para instalación','En instalación','Proyecto finalizado'];
export const TIPOS={cocina:'Cocina integral',closet:'Closet',bano:'Mueble de baño',entretenimiento:'Centro de entretenimiento',personalizado:'Muebles personalizados'};
export const PARTES=['puertas','estructura','cajones','laterales','divisiones'];

// Límite de intentos por conexión (ventana deslizante) guardado en el almacén
export async function limite(st,clave,h,max,ventanaMs){
  if(!h)return true;
  const m=await rd(st,clave,{}),now=Date.now();
  for(const k of Object.keys(m)){m[k]=m[k].filter(t=>now-t<ventanaMs);if(!m[k].length)delete m[k]}
  const l=m[h]||[];if(l.length>=max)return false;
  l.push(now);m[h]=l;await wr(st,clave,m);return true;
}

// Registra o actualiza un cliente evitando duplicados (mismo teléfono o correo)
export async function upsertCliente(st,d){
  const all=await rd(st,'crm-clientes'),t=tel(d.telefono),m=String(d.correo||'').toLowerCase();
  let c=all.find(x=>(t.length>=7&&tel(x.telefono)===t)||(m&&String(x.correo||'').toLowerCase()===m));
  const now=new Date().toISOString();let nuevo=false;
  if(!c){
    nuevo=true;
    c={id:crypto.randomUUID(),nombre:'',telefono:'',correo:'',ciudad:'',tipo:'',origen:d.origen||'otro',origenes:[],estado:'nuevo',valor:0,obs:'',creado:now,ultimo:now,ultimoCliente:now,ultimoAdmin:'',sinAtender:true,notas:[],recordatorios:[],contactos:[],cotizaciones:[],solicitudes:[],proyectos:[],sesiones:[],mensajes:[],hist:[]};
    all.push(c);
  }
  for(const k of ['nombre','telefono','correo','ciudad','tipo'])if(!c[k]&&d[k])c[k]=d[k];
  if(d.origen&&!c.origenes.includes(d.origen))c.origenes.push(d.origen);
  if(d.solicitud&&!c.solicitudes.includes(d.solicitud))c.solicitudes.push(d.solicitud);
  if(d.sesion&&!c.sesiones.includes(d.sesion))c.sesiones.push(d.sesion);
  if(d.mensaje&&!c.mensajes.includes(d.mensaje))c.mensajes.push(d.mensaje);
  c.ultimo=c.ultimoCliente=now;c.sinAtender=true;
  if(d.evento){c.hist.push({at:now,tipo:d.origen||'otro',texto:str(d.evento,200)});c.hist=c.hist.slice(-200)}
  await wr(st,'crm-clientes',all.slice(-5000));
  return {c,nuevo};
}

// Copia de seguridad diaria automática (se conservan las últimas 14)
export async function copiaDiaria(st){
  try{
    const k='bk-'+hoy();if(await st.get(k))return;
    const data=await datosNegocio(st);
    await st.setJSON(k,{creada:new Date().toISOString(),...data});
    const l=((await st.list({prefix:'bk-'})).blobs||[]).map(b=>b.key).sort();
    for(const x of l.slice(0,Math.max(0,l.length-14)))await st.delete(x);
  }catch{}
}
export async function datosNegocio(st){
  return {clientes:await rd(st,'crm-clientes'),solicitudes:await rd(st,'crm-solicitudes'),proyectos:await rd(st,'crm-proyectos'),
    contacto:await rd(st,'contacto-mensajes'),chat:await rd(st,'chat-mensajes'),'stats-produccion':await rd(st,'stats-produccion',null),'stats-prueba':await rd(st,'stats-prueba',null)};
}

// Interpreta «Nombre | precio» (una opción por línea)
export const opciones=t=>String(t||'').split('\n').map(l=>l.trim()).filter(Boolean).map(l=>{const [n,p]=l.split('|').map(x=>x.trim());return {n,p:Number(String(p||'').replace(/[^\d.]/g,''))||0}});
// Valor referencial SOLO con tarifas configuradas por el administrador
export function estimar(pz,sel){
  const tar=Number(pz&&pz.tarifas&&pz.tarifas[sel.tipo])||0,m=sel.medidas||{};
  if(!(tar>0)||!(m.ancho>0)||!(m.alto>0))return null;
  let v=tar*(m.ancho*m.alto/10000);
  for(const k of ['estilo','material','puertas','cajones','tiradores','herrajes']){const o=opciones(pz&&pz[k==='estilo'?'estilos':k==='material'?'materiales':k]).find(x=>x.n===sel[k]);if(o)v+=o.p}
  return Math.round(v);
}

// Cuando el administrador responde un chat, el cliente relacionado queda como «atendido»
export async function atenderPorSesion(st,session){
  try{const all=await rd(st,'crm-clientes'),c=all.find(x=>(x.sesiones||[]).includes(session));if(!c)return;c.ultimoAdmin=c.ultimo=new Date().toISOString();c.sinAtender=false;await wr(st,'crm-clientes',all)}catch{}
}
