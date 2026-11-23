import {getStore} from '@netlify/blobs';
const DEF='102eadf5a95f7d262edefb1f2888cb8ded09635c5d71fa6c21d2def3902c299e';
const J=(o,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{'content-type':'application/json','cache-control':'no-store'}});
const str=(v,n)=>String(v??'').replace(/[\u0000-\u001f<>]/g,' ').replace(/\s+/g,' ').trim().slice(0,n);
const hx=async s=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))].map(b=>b.toString(16).padStart(2,'0')).join('').slice(0,16);

export default async req=>{
  const st=getStore('tecnoespacios');
  const lista=(await st.get('resenas',{type:'json'}).catch(()=>null))||[];
  if(req.method==='GET')return J({ok:1,r:lista.filter(x=>x.ok).map(({id,n,e,t,f})=>({id,n,e,t,f}))});
  if(req.method!=='POST')return J({e:'Método no permitido'},405);
  let b;try{b=await req.json()}catch{return J({e:'Solicitud inválida'},400)}

  // Reseña nueva (pública)
  if(b.a==='nueva'){
    if(b.hp)return J({ok:1,pub:false});
    const n=str(b.n,60),t=str(b.t,600),e=Math.round(+b.e);
    if(n.length<2||t.length<10||!(e>=1&&e<=5))return J({e:'Escribe tu nombre, las estrellas y tu opinión (mín. 10 letras).'},400);
    const ip=req.headers.get('x-nf-client-connection-ip')||req.headers.get('x-forwarded-for')||'';
    const h=ip?await hx(ip):'';
    if(h&&lista.filter(x=>x.h===h&&Date.now()-Date.parse(x.f)<36e5).length>=3)return J({e:'Ya enviaste varias reseñas. Intenta más tarde.'},429);
    if(lista.some(x=>x.n===n&&x.t===t))return J({ok:1,pub:false});
    const d=await st.get('datos',{type:'json'}).catch(()=>null),pub=!!(d&&d.rvAuto);
    lista.unshift({id:crypto.randomUUID(),n,e,t,f:new Date().toISOString(),ok:pub,h});
    await st.setJSON('resenas',lista.slice(0,300));
    return J({ok:1,pub});
  }

  // Moderación (solo el administrador)
  const c=(await st.get('cred'))||DEF;
  if(b.auth!==c)return J({e:'Usuario o contraseña incorrectos.'},401);
  if(b.a==='todas')return J({ok:1,r:lista.map(({h,...x})=>x)});
  const i=lista.findIndex(x=>x.id===b.id);
  if(i<0)return J({e:'No se encontró la reseña.'},404);
  if(b.a==='aprobar')lista[i].ok=!!b.v;
  else if(b.a==='borrar')lista.splice(i,1);
  else return J({e:'Acción no válida'},400);
  await st.setJSON('resenas',lista);
  return J({ok:1});
};
