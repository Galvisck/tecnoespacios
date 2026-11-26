import {getStore} from 'netlify-blobs-condicional';
import {J,store,esAdmin,str,txt,hoy,MAIL} from './lib/negocio.mjs';
import {identidadVisual,pdfDocumento,pdfTarjeta,tituloDocumento} from './lib/documentos-pdf.mjs';
import {configWhatsApp,enviarAdjunto} from './lib/documentos-whatsapp.mjs';
import calculo from '../../public/calculo-documentos.js';

const {calcular,precioCentavos,mediosAbono}=calculo;
const prefijo='documentos/';
const llave=id=>prefijo+id;
const piezas=['documento','tarjeta'];
const documentoId=id=>typeof id==='string'&&/^[a-z0-9]{8,10}-[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/.test(id);
const texto=desde=>str(desde,120);
const estadoInicial=()=>({estado:'pendiente'});
const numeroWhatsApp=valor=>{
 const original=String(valor??'').trim();
 if(!/^\+?[\d().\s-]+$/.test(original))return '';
 const digits=original.replace(/\D/g,'');
 if(!original.startsWith('+')&&/^3\d{9}$/.test(digits))return '57'+digits;
 if((original.startsWith('+')||/^573\d{9}$/.test(digits))&&/^[1-9]\d{7,14}$/.test(digits))return digits;
 return '';
};
const fechaValida=fecha=>/^\d{4}-\d{2}-\d{2}$/.test(fecha)&&
 !Number.isNaN(Date.parse(fecha))&&new Date(fecha).toISOString().slice(0,10)===fecha;
const tiposId=['Cédula','NIT','Cédula de extranjería','Pasaporte','Otro'];
const nitValido=nit=>/^\d[\d.-]{4,31}$/.test(nit);

function datosEmpresa(a={}) {
 return {nombre:texto(a.nombre),nit:str(a.nit,32),telefono:str(a.telefono,60),correo:str(a.correo,120),
  direccion:str(a.direccion,160),ciudad:str(a.ciudad,60),web:str(a.web,100)};
}
function empresaGuardada(datos,config) {
 const e=datos.e||{};
 return datosEmpresa({nombre:e.nombre||'TECNO ESPACIOS',telefono:e.tel,
  direccion:e.dir,correo:e.mail,web:e.web,...config});
}
function resumir(item){
 return {
  id:item.id,numero:item.numero,tipo:item.tipo,fecha:item.fecha,
  nombre:item.cliente.nombre,whatsapp:item.cliente.whatsapp,total:item.total,
  envios:item.envios,consentimiento:Boolean(item.consentimiento)
 };
}
function metadata(item){
 const {envios,consentimiento,...resumen}=resumir(item);
 return {...resumen,consentimiento,envios:Object.fromEntries(piezas.map(p=>[p,{
  estado:envios[p].estado,fecha:envios[p].fecha
 }]))};
}
const error=(e,status=400)=>J({e},status);
const guardar=(docs,item,options)=>docs.setJSON(llave(item.id),item,{...options,metadata:metadata(item)});

function validar(b,empresa){
 if(!['factura','cotizacion'].includes(b.tipo))return 'Selecciona factura comercial o cotización.';
 const c=b.cliente||{}, nombre=texto(c.nombre), tipoId=tiposId.includes(c.tipoId)?c.tipoId:'';
 const identificacion=str(c.identificacion,32), correo=str(c.correo,120), whatsapp=numeroWhatsApp(c.whatsapp);
 if(nombre.length<2)return 'Escribe el nombre completo del cliente.';
 if((b.tipo==='factura'||identificacion)&&(!tipoId||!identificacion.match(/^[\p{L}\d.\- ]{3,32}$/u)))return 'Indica el tipo y número de identificación del cliente.';
 if(!whatsapp)return 'Escribe un celular colombiano de 10 dígitos o un número internacional con + y código de país.';
 if(correo&&!MAIL.test(correo))return 'Revisa el correo del cliente.';
 if(empresa.nombre.length<2||b.tipo==='factura'&&(!nitValido(empresa.nit)||!empresa.direccion||!empresa.ciudad))return 'Completa la razón social, el NIT, la dirección y la ciudad en Datos de la empresa.';
 const totales=calcular(b.partidas);
 if(!totales||!b.partidas.every(p=>txt(p?.concepto,260)))return 'Agrega al menos un concepto con cantidad, precio e IVA válidos.';
 const vencimiento=str(b.vencimiento,10), fecha=hoy();
 if(vencimiento&&(!fechaValida(vencimiento)||vencimiento<fecha))return 'La fecha de vencimiento debe ser igual o posterior a la de emisión.';
 return {
  tipo:b.tipo,fecha,empresa,cliente:{nombre,tipoId:identificacion?tipoId:'',identificacion,correo,
   whatsapp,direccion:str(c.direccion,150),ciudad:str(c.ciudad,60)},
  vencimiento,formaPago:str(b.formaPago,100),notas:txt(b.notas,800),
  partidas:totales.lineas.map((l,i)=>({...l,concepto:txt(b.partidas[i].concepto,260)})),
  subtotal:totales.subtotal,impuesto:totales.impuesto,total:totales.total
 };
}

async function crear(docs,principal,b){
 const anterior=await docs.get(llave(b.id),{type:'json'});
 if(anterior)return J({ok:1,item:resumir(anterior)});
 const [datos,config]=await Promise.all([principal.get('datos',{type:'json'}),docs.get('empresa',{type:'json'})]);
 const doc=validar(b,empresaGuardada(datos||{},config));
 if(typeof doc==='string')return error(doc);
 const sufijo=b.id.slice(b.id.indexOf('-')+1).replace(/-/g,'').slice(0,14).toUpperCase();
 const numero=(doc.tipo==='factura'?'FAC':'COT')+'-'+doc.fecha.replace(/-/g,'')+'-'+sufijo;
 const item={...doc,id:b.id,numero,envios:{documento:estadoInicial(),tarjeta:estadoInicial()}};
 let visual;
 try {visual=await identidadVisual(datos||{},principal);}
 catch(error){
  if(error instanceof Error&&error.message.startsWith('Vuelve a cargar'))return J({e:error.message},400);
  throw error;
 }
 const [pdf,tarjeta]=await Promise.all([pdfDocumento(item,visual),pdfTarjeta(item.empresa,visual)]);
 item.archivos={
  documento:{nombre:tituloDocumento(item.tipo).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ /g,'-')+'-'+numero+'.pdf',bytes:Buffer.from(pdf).toString('base64')},
  tarjeta:{nombre:'Tarjeta-TECNO-ESPACIOS.pdf',bytes:Buffer.from(tarjeta).toString('base64')}
 };
 const escrito=await guardar(docs,item,{onlyIfNew:true});
 const resultado=escrito.modified?item:await docs.get(llave(b.id),{type:'json'});
 return resultado?J({ok:1,item:resumir(resultado)}):error('Vuelve a intentar la generación.',409);
}

async function listar(docs){
 const {blobs}=await docs.list({prefix:prefijo});
 const ultimos=blobs.sort((a,b)=>b.key.localeCompare(a.key)).slice(0,30);
 const registros=await Promise.all(ultimos.map(blob=>docs.getMetadata(blob.key)));
 return J({ok:1,items:registros.flatMap(r=>r?.metadata?.id?[r.metadata]:[])});
}

async function enviar(docs,b){
 const config=configWhatsApp();
 if(!config)return error('Configura WhatsApp Business para activar el envío automático.',503);
 if(b.autorizado!==true)return error('Confirma que el cliente autorizó recibir el documento por WhatsApp.');
 const key=llave(b.id);
 const current=await docs.getWithMetadata(key,{type:'json'});
 if(!current)return error('El documento no existe.',404);
 const item=current.data,pieza=b.pieza,estado=item.envios[pieza].estado;
 if(estado==='aceptado')return J({ok:1,item:resumir(item)});
 if(estado==='indeterminado'||estado==='procesando')return J({e:'El envío está pendiente de confirmar. Revisa WhatsApp antes de hacer un envío manual.',item:resumir(item)},409);
 if(pieza==='tarjeta'&&item.envios.documento.estado!=='aceptado')return error('Envía primero la factura o cotización.',409);
 if(!current.etag)return error('No se pudo reservar el envío. Inténtalo más tarde.',503);
 item.consentimiento=new Date().toISOString();
 item.envios[pieza]={estado:'procesando',fecha:item.consentimiento};
 const reservado=await guardar(docs,item,{onlyIfMatch:current.etag});
 if(!reservado.modified||!reservado.etag)return error('Ya hay una operación en curso. Abre el documento para consultar su estado.',409);
 let resultado;
 try{
  const id=await enviarAdjunto(config,item.cliente.whatsapp,pieza,item.archivos[pieza]);
  resultado={estado:'aceptado',id};
 }catch(err){
  resultado={estado:err.indeterminado?'indeterminado':'error',mensaje:err.message};
 }
 item.envios[pieza]={...resultado,fecha:new Date().toISOString()};
 const final=await guardar(docs,item,{onlyIfMatch:reservado.etag});
 if(!final.modified)return error('Consulta el estado de ese envío antes de repetirlo.',409);
 return J({ok:1,item:resumir(item)});
}

const llaveAbonos=id=>'abonos/'+id;
function resumenAbonos(item,abonos){
 const pagado=abonos.reduce((s,a)=>s+a.monto,0);
 return {abonos,pagado,saldo:item.total-pagado};
}
async function registrarAbono(docs,item,b){
 if(item.tipo!=='factura')return error('Los abonos se registran en la factura.',409);
 const a=b.abono||{}, monto=precioCentavos(a.monto,Number.MAX_SAFE_INTEGER);
 const fecha=str(a.fecha,10), referencia=str(a.referencia,120);
 if(typeof a.id!=='string'||!/^[-a-f0-9]{36}$/.test(a.id))return error('Identificador de abono inválido.');
 if(!monto)return error('Escribe un valor de abono mayor que cero.');
 if(!fechaValida(fecha)||fecha>hoy())return error('Indica una fecha de pago válida, hasta hoy.');
 if(!mediosAbono.includes(a.medio))return error('Selecciona el medio de pago.');
 const key=llaveAbonos(item.id);
 for(let intento=0;intento<4;intento++){
  const actual=await docs.getWithMetadata(key,{type:'json'});
  const abonos=actual?.data||[], resumen=resumenAbonos(item,abonos);
  const previo=abonos.find(p=>p.id===a.id);
  if(previo){
   if(previo.monto!==monto||previo.fecha!==fecha||previo.medio!==a.medio||previo.referencia!==referencia){
    return J({e:'El abono anterior ya quedó registrado. Verifica el historial antes de ingresar otro.',pagos:resumen},409);
   }
   return J({ok:1,pagos:resumen});
  }
  if(monto>resumen.saldo)return J({e:'El abono supera el saldo pendiente.',pagos:resumen},409);
  if(actual&&!actual.etag)return error('No se pudo reservar el registro del abono.',503);
  const nuevos=[...abonos,{id:a.id,monto,fecha,medio:a.medio,referencia}];
  const escrito=await docs.setJSON(key,nuevos,actual?{onlyIfMatch:actual.etag}:{onlyIfNew:true});
  if(escrito.modified)return J({ok:1,pagos:resumenAbonos(item,nuevos)});
 }
 return error('Hubo cambios simultáneos. Vuelve a intentar el registro.',409);
}

export default async function documentos(req){
 if(req.method!=='POST')return error('Método no permitido.',405);
 let b;
 try {b=await req.json();} catch {return error('Solicitud inválida.');}
 if(!b||typeof b!=='object')return error('Solicitud inválida.');
 try{
  const principal=store();
  if(!await esAdmin(principal,b.auth))return error('Acceso no autorizado.',401);
  const docs=getStore({name:'tecnoespacios-documentos',consistency:'strong'});
  if(b.a==='config'){
   const [datos,config]=await Promise.all([principal.get('datos',{type:'json'}),docs.get('empresa',{type:'json'})]);
   return J({ok:1,empresa:empresaGuardada(datos||{},config),whatsapp:Boolean(configWhatsApp())});
  }
  if(b.a==='empresa'){
   const empresa=datosEmpresa(b.empresa||{});
   if(empresa.nombre.length<2||empresa.correo&&!MAIL.test(empresa.correo)||empresa.nit&&!nitValido(empresa.nit))return error('Revisa la razón social, el NIT y el correo de la empresa.');
   await docs.setJSON('empresa',empresa);
   return J({ok:1,empresa});
  }
  if(b.a==='listar')return await listar(docs);
  if(!documentoId(b.id))return error('Identificador de documento inválido.');
  if(b.a==='crear')return await crear(docs,principal,b);
  if(b.a==='enviar'&&piezas.includes(b.pieza))return await enviar(docs,b);
  const item=await docs.get(llave(b.id),{type:'json'});
  if(!item)return error('El documento no existe.',404);
  if(b.a==='abonar')return await registrarAbono(docs,item,b);
  if(b.a==='detalle'){
   const pagos=item.tipo==='factura'?resumenAbonos(item,await docs.get(llaveAbonos(item.id),{type:'json'})||[]):null;
   return J({ok:1,item:resumir(item),pagos});
  }
  if(b.a==='pdf'&&piezas.includes(b.pieza)){
   const {bytes,nombre}=item.archivos[b.pieza];
   return new Response(Buffer.from(bytes,'base64'),{headers:{
    'Content-Type':'application/pdf','Cache-Control':'private, no-store','Content-Disposition':'attachment; filename="'+nombre+'"'
   }});
  }
  return error('Acción desconocida.');
 }catch{
  return error('No se pudo completar la operación. Revisa el estado del documento e inténtalo de nuevo.',500);
 }
}
