import {getStore} from '@netlify/blobs';
const DEF='102eadf5a95f7d262edefb1f2888cb8ded09635c5d71fa6c21d2def3902c299e';
const J=(o,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{'content-type':'application/json','cache-control':'no-store'}});
const KS=['proyectos','herrajes','electro','mesones','colores','promos'];
const HEX=/^#[0-9a-fA-F]{6}$/,DAY=/^\d{4}-\d\d-\d\d$/;
const FONTS='Poppins, Montserrat, Playfair Display, Lora, Oswald, Raleway, Inter, Merriweather, Arial, Georgia';
const str=(v,n=300)=>String(v??'').slice(0,n);

// Variables de entorno en Netlify (Site settings > Environment variables):
//   LLM_API_KEY   (obligatoria)  clave gratis de Groq, Gemini u OpenRouter
//   LLM_BASE_URL  (opcional)     por defecto https://api.groq.com/openai/v1
//   LLM_MODEL     (opcional)     por defecto llama-3.3-70b-versatile
//   PIXABAY_KEY   (opcional)     para que la IA busque fotos de stock

function limpiar(arr){
  const out=[];
  const set=s=>{const r={};if(s&&typeof s==='object')for(const [k,v] of Object.entries(s).slice(0,12))r[str(k,12)]=str(v,600);return r};
  for(const o of (Array.isArray(arr)?arr:[]).slice(0,15)){
    if(!o||typeof o!=='object')continue;
    const k=KS.includes(o.k)?o.k:'';
    const foto=/^(adjunta|(buscar|ia):[\s\S]{2,200})$/.test(o.foto||'')?o.foto:'';
    if(o.op==='add'&&k&&o.n)out.push({op:'add',k,n:str(o.n,80),s:str(o.s,60),d:str(o.d,400),c:str(o.c,60),x:HEX.test(o.x)?o.x:'',v:DAY.test(o.v)?o.v:'',foto});
    else if(o.op==='edit'&&k&&o.n)out.push({op:'edit',k,n:str(o.n,80),set:set(o.set),foto});
    else if(o.op==='delete'&&k&&o.n)out.push({op:'delete',k,n:str(o.n,80)});
    else if(o.op==='theme'||o.op==='empresa')out.push({op:o.op,set:set(o.set)});
  }
  return out;
}

async function foto(st,b){
  let key=process.env.PIXABAY_KEY;
  if(!key){const d=await st.get('datos',{type:'json'}).catch(()=>null);key=d&&d.px}
  if(!key)return J({e:'Falta la clave de Pixabay (variable PIXABAY_KEY o pestaña Búsqueda y guardado).'},400);
  const q=str(b.q,100).trim();if(!q)return J({e:'Sin texto de búsqueda'},400);
  try{
    const r=await fetch('https://pixabay.com/api/?key='+encodeURIComponent(key)+'&per_page=5&safesearch=true&image_type=photo&q='+encodeURIComponent(q));
    const h=((await r.json()).hits||[])[0];if(!h)return J({e:'Sin resultados para «'+q+'»'},404);
    let im=await fetch(h.largeImageURL);
    if(!im.ok||+(im.headers.get('content-length')||0)>4e6)im=await fetch(h.webformatURL);
    const t=im.headers.get('content-type')||'';if(!im.ok||!t.startsWith('image/'))throw 0;
    const buf=Buffer.from(await im.arrayBuffer());if(buf.length>5e6)throw 1;
    const id=crypto.randomUUID();
    await st.set('img-'+id,'data:'+t.split(';')[0]+';base64,'+buf.toString('base64'));
    return J({url:'/.netlify/functions/datos?r=img&id='+id});
  }catch{return J({e:'No se pudo traer la foto'},502)}
}

async function asistente(b){
  const key=process.env.LLM_API_KEY;
  if(!key)return J({e:'Falta configurar LLM_API_KEY en Netlify (mira el LEEME).'},400);
  const base=(process.env.LLM_BASE_URL||'https://api.groq.com/openai/v1').replace(/\/$/,'');
  const model=process.env.LLM_MODEL||'llama-3.3-70b-versatile';
  const texto=str(b.texto,1500).trim();if(!texto)return J({e:'Escribe una instrucción'},400);
  const L=b.lista&&typeof b.lista==='object'?b.lista:{},V=b.vig&&typeof b.vig==='object'?b.vig:{};
  const lista=KS.map(k=>k+': '+(Array.isArray(L[k])?L[k].slice(0,200).map(n=>str(n,60)+(k==='promos'&&V[n]?' (hasta '+str(V[n],10)+')':'')).join('; '):'')).join('\n').slice(0,7000);
  const hoy=DAY.test(b.hoy)?b.hoy:new Date().toISOString().slice(0,10);
  const cats=Array.isArray(b.cats)?b.cats.slice(0,20).map(c=>str(c,40)).join(', '):'';
  const sys=`Eres el asistente del panel de TecnoEspacios (muebles a medida, Colombia). Conviertes la instrucción del dueño en cambios para su sitio web. Responde SOLO un JSON: {"msg":"resumen corto en español","ops":[...]}.
Operaciones (máximo 15):
{"op":"add","k":K,"n":"nombre","s":"subtítulo","d":"descripción","c":"tipo (solo proyectos)","x":"#rrggbb (solo colores)","v":"AAAA-MM-DD (solo promos: vigente hasta)","foto":F}
{"op":"edit","k":K,"n":"nombre actual exacto","set":{"n":"","s":"","d":"","c":"","x":"","v":""},"foto":F}
{"op":"delete","k":K,"n":"nombre exacto"}
{"op":"theme","set":{"bg":"#rrggbb","sf":"#rrggbb","ac":"#rrggbb","tx":"#rrggbb","fh":"fuente","fb":"fuente"}}  (bg=fondo, sf=tarjetas, ac=acento, tx=texto; fuentes permitidas: ${FONTS})
{"op":"empresa","set":{"nombre":"","eslogan":"","desc":"","mision":"","vision":"","tel":"","mail":"","web":"","dir":"","hor":"","srv":"servicios, uno por línea"}}
K es uno de: proyectos (trabajos realizados), herrajes, electro (electrodomésticos), mesones, colores (acabados de tablero), promos (promociones).
F es opcional: "adjunta" si el dueño adjuntó fotos y quiere usarlas; "buscar:palabras clave" para traer una foto de stock; "ia:descripción en inglés" para generar una imagen. Omítelo si no piden foto.
Reglas: para edit y delete usa solo nombres que existan en la lista (el texto "(hasta …)" es información, no parte del nombre). Los colores siempre en hex #rrggbb. Calcula las fechas AAAA-MM-DD a partir de la fecha de hoy. En promociones: n = título corto, s = oferta corta (ej. "25% dto."), d = condiciones. No inventes precios ni datos de contacto. En set incluye solo los campos que cambian. Si la instrucción es ambigua o no tiene que ver con el sitio, devuelve ops [] y pide la aclaración en msg.
Hoy: ${hoy}. Fotos adjuntas por el dueño: ${Math.min(+b.fotos||0,10)}. Tipos de proyecto: ${cats}.
Elementos actuales:
${lista}`;
  const llamar=rf=>fetch(base+'/chat/completions',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+key},
    body:JSON.stringify({model,temperature:.2,max_tokens:1500,...(rf?{response_format:{type:'json_object'}}:{}),messages:[{role:'system',content:sys},{role:'user',content:texto}]}),
    signal:AbortSignal.timeout(8000)});
  let r;
  try{r=await llamar(true);if(r.status===400)r=await llamar(false)}
  catch{return J({e:'La IA tardó demasiado. Intenta de nuevo.'},504)}
  if(!r.ok)return J({e:r.status===429?'Se agotó el límite gratis por ahora; espera un minuto e intenta otra vez.':r.status===401?'La clave LLM_API_KEY no es válida.':'Error de la IA ('+r.status+').'},502);
  const j=await r.json().catch(()=>({}));
  const t=str(j.choices?.[0]?.message?.content,20000).replace(/^\s*```(?:json)?/i,'').replace(/```\s*$/,'').trim();
  let p;
  try{p=JSON.parse(t)}catch{try{p=JSON.parse(t.match(/\{[\s\S]*\}/)[0])}catch{return J({e:'La IA no respondió en un formato válido. Reformula la instrucción.'},502)}}
  return J({ok:1,msg:str(p.msg,400),ops:limpiar(p.ops)});
}

export default async req=>{
  if(req.method!=='POST')return J({e:'Método no permitido'},405);
  let b;try{b=await req.json()}catch{return J({e:'Solicitud inválida'},400)}
  const st=getStore('tecnoespacios');
  const c=(await st.get('cred'))||DEF;
  if(b.auth!==c)return J({e:'Usuario o contraseña incorrectos.'},401);
  return b.a==='foto'?foto(st,b):asistente(b);
}
