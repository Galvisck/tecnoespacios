import {getStore} from '@netlify/blobs';
import {upsertCliente,atenderPorSesion,digits,str} from './lib/negocio.mjs';
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
export default async req=>{
 // Lectura fuerte: un borrado se refleja de inmediato y no reaparece por datos desactualizados.
 const st=getStore({name:'tecnoespacios',consistency:'strong'});
 if(req.method==='GET') return J({ok:true,online:true});
 let b; try{b=await req.json()}catch{return J({e:'Solicitud inválida'},400)}
 const cred=(await st.get('cred'))||'102eadf5a95f7d262edefb1f2888cb8ded09635c5d71fa6c21d2def3902c299e';
 const admin=b.auth===cred;
 const all=await st.get('chat-mensajes',{type:'json'})||[];
 if(b.action==='visitor-list'){
  const session=clean(b.session,80), mine=all.filter(x=>x.session===session), cur=abierta(mine);
  return J({ok:true,messages:cur.slice(-100),expired:mine.length>0&&!cur.length});
 }
 if(b.action==='send'){
  const name=clean(b.name,80), message=clean(b.message,1000), session=clean(b.session,80);
  if(name.length<2||message.length<1||!session)return J({e:'Completa tu nombre y mensaje.'},400);
  const primero=!all.some(x=>x.session===session&&x.from==='visitor');
  const item={id:crypto.randomUUID(),session,name,message,from:'visitor',at:new Date().toISOString(),read:false};
  all.push(item);
  // Si el visitante dejó su teléfono, queda registrado en el CRM (sin duplicados)
  const phone=str(b.phone,30);
  if(digits(phone).length>=7){try{await upsertCliente(st,{nombre:name,telefono:phone,origen:'chat',sesion:session,evento:primero?'Chat en vivo: primer mensaje':''})}catch{}}
  const norm=v=>String(v||'').toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[¿?¡!.,;:]/g,' ').replace(/\s+/g,' ').trim();
  const similarity=(a,b)=>{a=norm(a);b=norm(b);if(!a||!b)return 0;if(a===b)return 1;if(a.includes(b)||b.includes(a))return Math.min(a.length,b.length)/Math.max(a.length,b.length);const m=a.length,n=b.length;if(!m||!n)return 0;let prev=Array.from({length:n+1},(_,i)=>i),cur=[];for(let i=1;i<=m;i++){cur=[i];for(let j=1;j<=n;j++)cur[j]=Math.min(cur[j-1]+1,prev[j]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));prev=cur;}return 1-prev[n]/Math.max(m,n)};
  const matches=(text,words,index)=>{const t=norm(text);if(t===String(index+1))return true;return words.some(w=>{const k=norm(w);if(!k)return false;if(t===k||t.includes(k)||k.includes(t)&&t.length>=3)return true;const ta=t.split(' '),ka=k.split(' ');return Math.max(similarity(t,k),...ta.map(x=>Math.max(...ka.map(y=>similarity(x,y)))))>=0.75})};
  const flow=b.flow&&typeof b.flow==='object'&&b.flow.nodes&&typeof b.flow.nodes==='object'?b.flow:null;
  let automatic=null;
  if(flow){
    const stateKey='chat-flow-'+session;
    let state=await st.get(stateKey,{type:'json'}).catch(()=>null);
    const nodes=flow.nodes,makeReply=(msg,node)=>{const choices=node&&Array.isArray(node.options)&&node.options.length?'\n\n'+node.options.map((o,i)=>(i+1)+'. '+o.label).join('\n')+'\n\nPuedes escribir la opción o responder con tus propias palabras.':'';automatic={id:crypto.randomUUID(),session,name:'TECNO ESPACIOS',message:clean(msg+choices,1800),from:'admin',at:new Date().toISOString(),read:true,automatic:true};all.push(automatic)};
    if(!state||!state.node||!nodes[state.node]){
      state={node:flow.start||'inicio',done:false};
      const first=nodes[state.node],initialText=norm(message);
      const direct=first&&Array.isArray(first.options)?first.options.find((o,i)=>{
        const words=[o.label,...(Array.isArray(o.keywords)?o.keywords:[])];
        return matches(initialText,words,i);
      }):null;
      if(direct&&nodes[direct.next]){state.node=direct.next;const target=nodes[state.node];makeReply(target.message,target);if(target.end)state.done=true}
      else if(first)makeReply(first.message,first);
    }else if(!state.done){
      const current=nodes[state.node],text=norm(message);
      let chosen=null;
      if(current&&Array.isArray(current.options)){
        chosen=current.options.find((o,i)=>{
          const words=[o.label,...(Array.isArray(o.keywords)?o.keywords:[])];
          return matches(text,words,i);
        });
      }
      let next=null;
      if(current&&current.any)next=current.next;
      else if(chosen)next=chosen.next;
      if(next&&nodes[next]){
        state.node=next;const target=nodes[next];makeReply(target.message,target);if(target.end)state.done=true;
      }else{
        makeReply((current&&current.fallback)||'No alcancé a entenderte. ¿Puedes elegir una de las opciones o explicarlo de otra manera?');
      }
    }else{
      makeReply('Tu solicitud ya quedó registrada en esta conversación. Si deseas agregar algo más, escríbelo y nuestro equipo lo revisará.');
    }
    await st.setJSON(stateKey,state);
  }else{
    const rules=Array.isArray(b.rules)?b.rules.slice(0,50):[];
    const normalized=norm(message);
    const match=rules.find(r=>{const keyword=norm(r?.keyword);return keyword&&clean(r?.response,1000)&&normalized.includes(keyword)});
    if(match){automatic={id:crypto.randomUUID(),session,name:'TECNO ESPACIOS',message:clean(match.response,1000),from:'admin',at:new Date().toISOString(),read:true,automatic:true};all.push(automatic)}
  }
  await st.setJSON('chat-mensajes',all.slice(-MAX)); return J({ok:true,message:item,automatic});
 }
 if(!admin)return J({e:'No autorizado'},401);
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
