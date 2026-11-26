export function configWhatsApp(env=process.env) {
 const config={
  token:env.WA_ACCESS_TOKEN,
  phone:env.WA_PHONE_NUMBER_ID,
  documento:env.WA_TEMPLATE_DOCUMENTO,
  tarjeta:env.WA_TEMPLATE_TARJETA,
  language:env.WA_TEMPLATE_LANGUAGE||'es_CO',
  version:env.WA_GRAPH_VERSION||'v23.0'
 };
 const configurado=Boolean(config.token&&/^\d+$/.test(config.phone||'')&&
  /^[a-z0-9_]+$/.test(config.documento||'')&&/^[a-z0-9_]+$/.test(config.tarjeta||'')&&
  /^[a-z]{2}(?:_[A-Z]{2})?$/.test(config.language)&&/^v\d{1,2}\.0$/.test(config.version));
 return configurado?config:null;
}

export class ErrorWhatsApp extends Error {
 constructor(message,{indeterminado=false}={}) {
  super(message);
  this.indeterminado=indeterminado;
 }
}

export async function enviarAdjunto(config,numero,pieza,archivo) {
 const url='https://graph.facebook.com/'+config.version+'/'+config.phone;
 const headers={Authorization:'Bearer '+config.token};
 const form=new FormData();
 form.append('messaging_product','whatsapp');
 form.append('type','application/pdf');
 form.append('file',new Blob([Buffer.from(archivo.bytes,'base64')],{type:'application/pdf'}),archivo.nombre);
 let media;
 try {
  const r=await fetch(url+'/media',{method:'POST',headers,body:form,signal:AbortSignal.timeout(7000)});
  const j=await r.json();
  if(r.ok&&typeof j.id==='string')media=j.id;
  else throw new ErrorWhatsApp('WhatsApp no aceptó el PDF. Revisa la conexión de WhatsApp Business.');
 } catch(error) {
  if(error instanceof ErrorWhatsApp)throw error;
  throw new ErrorWhatsApp('No se pudo cargar el PDF en WhatsApp. Puedes reintentar.');
 }
 try {
  const r=await fetch(url+'/messages',{
   method:'POST',headers:{...headers,'Content-Type':'application/json'},signal:AbortSignal.timeout(8000),
   body:JSON.stringify({messaging_product:'whatsapp',recipient_type:'individual',to:numero,type:'template',
    template:{name:config[pieza],language:{code:config.language},components:[
     {type:'header',parameters:[{type:'document',document:{id:media,filename:archivo.nombre}}]}
    ]}})
  });
  const j=await r.json();
  if(r.ok&&typeof j.messages?.[0]?.id==='string')return j.messages[0].id;
  if(r.status>=500||r.ok)throw new ErrorWhatsApp('WhatsApp no confirmó la recepción. Revisa el envío antes de repetirlo.',{indeterminado:true});
  const code=Number(j.error?.code);
  throw new ErrorWhatsApp('WhatsApp rechazó el envío'+(Number.isInteger(code)?' (código '+code+')':'')+
   '. Verifica el número y la plantilla aprobada.');
 } catch(error) {
  if(error instanceof ErrorWhatsApp)throw error;
  throw new ErrorWhatsApp('WhatsApp no confirmó la recepción. Revisa el envío antes de repetirlo.',{indeterminado:true});
 }
}
