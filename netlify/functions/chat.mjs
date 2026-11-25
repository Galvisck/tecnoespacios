import {getStore} from '@netlify/blobs';
const J=(o,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{'content-type':'application/json','cache-control':'no-store'}});
const clean=(v,n=1200)=>String(v??'').replace(/[<>]/g,'').trim().slice(0,n);
export default async req=>{
 const st=getStore('tecnoespacios'), url=new URL(req.url);
 if(req.method==='GET') return J({ok:true,online:true});
 let b; try{b=await req.json()}catch{return J({e:'Solicitud inválida'},400)}
 const cred=(await st.get('cred'))||'102eadf5a95f7d262edefb1f2888cb8ded09635c5d71fa6c21d2def3902c299e';
 const admin=b.auth===cred;
 const all=await st.get('chat-mensajes',{type:'json'})||[];
 if(b.action==='visitor-list'){ const session=clean(b.session,80); return J({ok:true,messages:all.filter(x=>x.session===session).slice(-100)}); }
 if(b.action==='send'){
  const name=clean(b.name,80), message=clean(b.message,1000), session=clean(b.session,80);
  if(name.length<2||message.length<1||!session)return J({e:'Completa tu nombre y mensaje.'},400);
  const item={id:crypto.randomUUID(),session,name,message,from:'visitor',at:new Date().toISOString(),read:false};
  all.push(item);
  const rules=Array.isArray(b.rules)?b.rules.slice(0,50):[];
  const normalized=message.toLocaleLowerCase('es');
  const match=rules.find(r=>{const keyword=clean(r?.keyword,100).toLocaleLowerCase('es');return keyword&&clean(r?.response,1000)&&normalized.includes(keyword)});
  let automatic=null;
  if(match){automatic={id:crypto.randomUUID(),session,name:'TECNO ESPACIOS',message:clean(match.response,1000),from:'admin',at:new Date().toISOString(),read:true,automatic:true};all.push(automatic)}
  await st.setJSON('chat-mensajes',all.slice(-1000)); return J({ok:true,message:item,automatic});
 }
 if(!admin)return J({e:'No autorizado'},401);
 if(b.action==='list') return J({ok:true,messages:all.slice(-300)});
 if(b.action==='reply'){
  const session=clean(b.session,80),message=clean(b.message,1000); if(!session||!message)return J({e:'Respuesta vacía'},400);
  all.push({id:crypto.randomUUID(),session,name:'TECNO ESPACIOS',message,from:'admin',at:new Date().toISOString(),read:true});
  await st.setJSON('chat-mensajes',all.slice(-1000)); return J({ok:true});
 }
 if(b.action==='read'){
  const session=clean(b.session,80); all.forEach(x=>{if(x.session===session)x.read=true}); await st.setJSON('chat-mensajes',all); return J({ok:true});
 }
 return J({e:'Acción desconocida'},400);
};
