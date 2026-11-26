import {getStore} from '@netlify/blobs';
import {upsertCliente,atenderPorSesion,digits,str,esAdmin} from './lib/negocio.mjs';
import {respond} from './lib/chat-asistente.mjs';
const J=(o,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{'content-type':'application/json','cache-control':'no-store'}});
const clean=(v,n=1200)=>String(v??'').replace(/[<>]/g,'').trim().slice(0,n);
const TTL=30*60*1000, MAX=2000;
// Conversación abierta de una sesión: los últimos mensajes sin pausas mayores a 30 min.
// Si ya pasaron 30 min desde el último mensaje, el visitante ve el chat vacío; el historial se conserva.
const abierta=(list,now=Date.now())=>{
 if(!list.length||now-Date.parse(list[list.length-1].at)>TTL)return [];
 let i=list.length-1;
 while(i>0&&Date.parse(list[i].at)-Date.parse(list[i-1].at)<=TTL)i--;
 return list.slice(i);
};
const handoffActive=items=>items.some(x=>x.handoff||(x.from==='admin'&&!x.automatic));
const transcript=items=>({messages:items.slice(-100),handoff:handoffActive(items)});
export default async req=>{
 // Lectura fuerte: un borrado se refleja de inmediato y no reaparece por datos desactualizados.
 const st=getStore({name:'tecnoespacios',consistency:'strong'});
 if(req.method==='GET') return J({ok:true,online:true});
 let b; try{b=await req.json()}catch{return J({e:'Solicitud inválida'},400)}
 if(!b || typeof b!=='object')return J({e:'Solicitud inválida'},400);
 const all=await st.get('chat-mensajes',{type:'json'})||[];
 if(b.action==='visitor-list'){
  const session=clean(b.session,80), mine=all.filter(x=>x.session===session), cur=abierta(mine);
  return J({ok:true,...transcript(cur),expired:mine.length>0&&!cur.length});
 }
 if(b.action==='send'){
  const session=clean(b.session,80), message=clean(b.message,1000), phone=str(b.phone,30);
  const name=clean(b.name,80)||'Visitante', requestId=clean(b.requestId,80);
  if(!message||!session)return J({e:'Escribe un mensaje.'},400);
  if(phone&&digits(phone).length<7)return J({e:'Revisa el número de WhatsApp.'},400);
  const mine=all.filter(x=>x.session===session), history=abierta(mine);
  if(mine.length&&!history.length)return J({e:'La conversación anterior venció.',expired:true},409);
  const prior=requestId&&history.find(x=>x.from==='visitor'&&x.requestId===requestId);
  if(prior)return J({ok:true,...transcript(history)});
  const item={id:crypto.randomUUID(),session,name,message,from:'visitor',at:new Date().toISOString(),read:false,requestId};
  const inHandoff=handoffActive(history);
  const settings=inHandoff?null:await st.get('datos',{type:'json'});
  const response=respond(message,history,settings,b.intent==='advisor');
  const automatic=response&&{...response,id:crypto.randomUUID(),session,name:'TECNO ESPACIOS',
   message:clean(response.message,1800),from:'admin',at:item.at,read:true,automatic:true};
  all.push(item);
  if(automatic)all.push(automatic);
  await st.setJSON('chat-mensajes',all.slice(-MAX));

  if(phone||automatic?.handoff){
   try{
    if(phone)await upsertCliente(st,{nombre:name,telefono:phone,origen:'chat',sesion:session,evento:'Contacto desde el chat'});
    const contacts=(await st.get('contacto-mensajes',{type:'json'}))||[];
    const existing=contacts.find(x=>x.origen==='chat'&&x.sesion===session);
    if(existing){
     if(phone)existing.telefono=phone;
     if(name!=='Visitante')existing.nombre=name;
    }else{
     contacts.push({id:crypto.randomUUID(),at:item.at,nombre:name,correo:'',telefono:phone,
      asunto:'Chat en vivo',mensaje:message,origen:'chat',sesion:session,emailed:false});
    }
    await st.setJSON('contacto-mensajes',contacts.slice(-500));
   }catch(error){console.error('No se pudo guardar el contacto del chat',error)}
  }
  return J({ok:true,message:item,automatic,...transcript([...history,item,...(automatic?[automatic]:[])])});
 }
 if(!await esAdmin(st,b.auth))return J({e:'No autorizado'},401);
 if(b.action==='list') return J({ok:true,messages:all.slice(-MAX)});
 if(b.action==='reply'){
  const session=clean(b.session,80),message=clean(b.message,1000); if(!session||!message)return J({e:'Respuesta vacía'},400);
  all.push({id:crypto.randomUUID(),session,name:'TECNO ESPACIOS',message,from:'admin',at:new Date().toISOString(),read:true});
  await st.setJSON('chat-mensajes',all.slice(-MAX)); await atenderPorSesion(st,session); return J({ok:true});
 }
 if(b.action==='delete'){
  const session=clean(b.session,80); if(!session)return J({e:'Conversación no indicada'},400);
  const resto=all.filter(x=>x.session!==session);
  await st.setJSON('chat-mensajes',resto); return J({ok:true,borrados:all.length-resto.length});
 }
 if(b.action==='read'){
  const session=clean(b.session,80); all.forEach(x=>{if(x.session===session)x.read=true}); await st.setJSON('chat-mensajes',all); return J({ok:true});
 }
 return J({e:'Acción desconocida'},400);
};
