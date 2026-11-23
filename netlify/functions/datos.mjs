import {getStore} from '@netlify/blobs';
const DEF='102eadf5a95f7d262edefb1f2888cb8ded09635c5d71fa6c21d2def3902c299e';
const J=(o,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{'content-type':'application/json','cache-control':'no-store'}});
const imgUrl=id=>'/.netlify/functions/datos?r=img&id='+id;
async function guardar(st,dataUrl){if(!/^data:image\/[\w.+-]+;base64,/.test(dataUrl)||dataUrl.length>6e6)return null;const id=crypto.randomUUID();await st.set('img-'+id,dataUrl);return imgUrl(id)}
export default async req=>{
  const st=getStore('tecnoespacios'),u=new URL(req.url);
  if(req.method==='GET'){
    if(u.searchParams.get('r')==='img'){const v=await st.get('img-'+u.searchParams.get('id'));const m=v&&v.match(/^data:([^;]+);base64,(.*)$/s);if(!m)return new Response('no',{status:404});return new Response(Buffer.from(m[2],'base64'),{headers:{'content-type':m[1],'cache-control':'public,max-age=31536000,immutable'}})}
    return J(await st.get('datos',{type:'json'}))
  }
  let b;try{b=await req.json()}catch{return J({e:'Solicitud inválida'},400)}
  const c=(await st.get('cred'))||DEF;
  if(b.auth!==c)return J({e:'Usuario o contraseña incorrectos.'},401);
  if(b.newCred&&/^[a-f0-9]{64}$/.test(b.newCred))await st.set('cred',b.newCred);
  if(b.a==='img'){const url=await guardar(st,b.data||'');return url?J({url}):J({e:'Imagen no válida o muy grande'},400)}
  if(b.a==='fetch'){try{const r=await fetch(b.url,{headers:{'user-agent':'Mozilla/5.0'}});const t=r.headers.get('content-type')||'';if(!r.ok||!t.startsWith('image/'))throw 0;const buf=Buffer.from(await r.arrayBuffer());if(buf.length>4e6)throw 1;const url=await guardar(st,'data:'+t.split(';')[0]+';base64,'+buf.toString('base64'));return url?J({url}):J({e:'Imagen no válida'},400)}catch{return J({e:'No se pudo traer esa imagen. Prueba con otra o súbela desde tu equipo.'},400)}}
  if(b.data){delete b.data.cred;await st.setJSON('datos',b.data);await st.delete('llm').catch(()=>{})}
  return J({ok:1})
}
