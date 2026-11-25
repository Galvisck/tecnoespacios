import {getStore} from '@netlify/blobs';
const DEF='102eadf5a95f7d262edefb1f2888cb8ded09635c5d71fa6c21d2def3902c299e';
const J=(o,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{'content-type':'application/json','cache-control':'no-store'}});
const clean=(v,n)=>String(v??'').replace(/[<>]/g,'').trim().slice(0,n);
const MAIL=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export default async req=>{
  if(req.method!=='POST')return J({e:'Método no permitido'},405);
  const st=getStore({name:'tecnoespacios',consistency:'strong'});
  let b;try{b=await req.json()}catch{return J({e:'Solicitud inválida'},400)}
  const all=(await st.get('contacto-mensajes',{type:'json'}))||[];
  // Administración: listar o borrar (requiere la misma clave del panel)
  if(b.action==='list'||b.action==='delete'){
    const cred=(await st.get('cred'))||DEF;
    if(b.auth!==cred)return J({e:'No autorizado'},401);
    if(b.action==='list')return J({ok:true,messages:all});
    await st.setJSON('contacto-mensajes',all.filter(m=>m.id!==b.id));return J({ok:true});
  }
  // Envío desde la página pública
  if(b.hp)return J({ok:true,emailed:true}); // campo trampa anti-spam
  const m={nombre:clean(b.nombre,90),correo:MAIL.test(clean(b.correo,120))?clean(b.correo,120):'',telefono:clean(b.telefono,30),asunto:clean(b.asunto,120),mensaje:clean(b.mensaje,1500)};
  if(m.nombre.length<2)return J({e:'Escribe tu nombre completo.'},400);
  if(m.telefono.replace(/\D/g,'').length<7)return J({e:'Escribe un teléfono válido.'},400);
  if(m.asunto.length<3||m.mensaje.length<5)return J({e:'Completa el asunto y el mensaje.'},400);
  const dup=all.find(x=>x.telefono===m.telefono&&x.mensaje===m.mensaje&&Date.now()-Date.parse(x.at)<60000);
  if(dup)return J({ok:true,emailed:dup.emailed,duplicado:true});
  const item={id:crypto.randomUUID(),at:new Date().toISOString(),...m,emailed:false};
  // Correo de destino configurable en el panel (Empresa); CONTACTO_TEST_TO lo reemplaza en pruebas
  const datos=(await st.get('datos',{type:'json'}))||{};
  const dest=process.env.CONTACTO_TEST_TO||clean(datos.e&&(datos.e.destino||datos.e.mail),120);
  const key=process.env.RESEND_API_KEY;
  if(key&&MAIL.test(dest)){
    try{
      const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{authorization:'Bearer '+key,'content-type':'application/json'},body:JSON.stringify({
        from:process.env.CONTACTO_FROM||'TECNO ESPACIOS <onboarding@resend.dev>',to:[dest],...(m.correo?{reply_to:m.correo}:{}),
        subject:'[Web] '+m.asunto,text:`Nuevo mensaje desde el formulario de contacto\n\nNombre: ${m.nombre}\nTeléfono: ${m.telefono}\nAsunto: ${m.asunto}\n\n${m.mensaje}\n`})});
      item.emailed=r.ok;
    }catch{item.emailed=false}
  }
  all.push(item);await st.setJSON('contacto-mensajes',all.slice(-500));
  return J({ok:true,emailed:item.emailed});
};
