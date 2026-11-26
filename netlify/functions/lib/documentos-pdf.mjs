import {readFile} from 'node:fs/promises';
import {PDFDocument, StandardFonts, rgb} from 'pdf-lib';
import calculo from '../../../public/calculo-documentos.js';

const {moneda} = calculo;
const tinta = rgb(.10,.15,.20);
const gris = rgb(.30,.37,.42);
const verde = rgb(.14,.33,.30);
const fondo = rgb(.93,.96,.95);
const linea = rgb(.84,.88,.89);
const blanco = rgb(1,1,1);
const ancho = 595, alto = 842, margen = 42;
export const tituloDocumento = tipo => tipo === 'factura' ? 'Factura comercial' : 'Cotización';
const seguro = txt => String(txt ?? '').normalize('NFC')
 .replace(/[\u2018\u2019]/g,"'").replace(/[\u201c\u201d]/g,'"').replace(/[\u2013\u2014]/g,'-')
 .replace(/[^\x20-\x7e\xa0-\xff\n]/gu,'?').replace(/\u00a0/g,' ');

function texto(page,font,val,x,y,size=10,color=tinta) {
 const text = seguro(val).replace(/\n/g,' ');
 if (text) page.drawText(text,{x,y,size,font,color});
}
function derecha(page,font,val,x,y,size=10,color=tinta) {
 const text = seguro(val);
 texto(page,font,text,x-font.widthOfTextAtSize(text,size),y,size,color);
}
function lineas(font,val,max,size) {
 const out = [];
 for (const parrafo of seguro(val).split('\n')) {
  let r = '';
  for (const palabra of parrafo.split(/ +/).filter(Boolean)) {
   const juntos = r ? r+' '+palabra : palabra;
   if (font.widthOfTextAtSize(juntos,size) <= max) { r=juntos; continue; }
   if (r) out.push(r);
   r='';
   for (const letra of palabra) {
    if (font.widthOfTextAtSize(r+letra,size)>max) {out.push(r);r='';}
    r+=letra;
   }
  }
  out.push(r);
 }
 return out;
}
function colocarImagen(page,img,x,y,w,h) {
 if (!img) return;
 const d=img.scaleToFit(w,h);
 page.drawImage(img,{x:x+(w-d.width)/2,y:y+(h-d.height)/2,width:d.width,height:d.height});
}
const embed = (pdf,imagen) => imagen.tipo==='png' ? pdf.embedPng(imagen.bytes) : pdf.embedJpg(imagen.bytes);

async function imagen(datos,store) {
 if (typeof datos !== 'string') return null;
 if (datos.startsWith('/.netlify/functions/datos?')) {
  const id = new URL(datos,'https://local.invalid').searchParams.get('id');
  if (!/^[0-9a-f-]{36}$/i.test(id||'')) return null;
  datos = await store.get('img-'+id);
 }
 if (typeof datos !== 'string' || datos.length>4_000_000) return null;
 const m=datos.match(/^data:image\/(png|jpe?g);base64,([\w+/=]+)$/i);
 return m ? {tipo:m[1].toLowerCase(),bytes:Buffer.from(m[2],'base64')} : null;
}
async function imagenLocal(nombre,tipo) {
 const bytes=await readFile('public/img/'+nombre)
  .catch(()=>readFile(new URL('../../../public/img/'+nombre,import.meta.url)));
 return {tipo,bytes};
}
export async function identidadVisual(datos,store) {
 const logo = await imagen(datos.logo,store) || await imagenLocal('logo.png','png');
 const vistas = await Promise.all([['t','tarjeta-frente.jpg'],['t2','tarjeta-dorso.jpg']].map(([id,nombre])=>
  datos.f?.[id]?.u ? imagen(datos.f[id].u,store) : imagenLocal(nombre,'jpg')));
 if (vistas.some(v=>!v)) throw new Error('Vuelve a cargar la tarjeta de presentación como imagen JPG o PNG en Sitio web → Tarjeta de presentación.');
 return {logo,tarjeta:vistas};
}

export async function pdfDocumento(doc,visual) {
 const pdf=await PDFDocument.create();
 const regular=await pdf.embedFont(StandardFonts.Helvetica);
 const negrita=await pdf.embedFont(StandardFonts.HelveticaBold);
 const logo=await embed(pdf,visual.logo);
 const tipo=tituloDocumento(doc.tipo);
 pdf.setTitle(tipo+' '+doc.numero);
 pdf.setAuthor(doc.empresa.nombre);
 let page,y;
 function pagina(inicial=false) {
  page=pdf.addPage([ancho,alto]);y=783;
  page.drawRectangle({x:0,y:alto-8,width:ancho,height:8,color:verde});
  colocarImagen(page,logo,margen,y-30,65,55);
  const nombre=lineas(negrita,doc.empresa.nombre,240,15);
  nombre.forEach((l,i)=>texto(page,negrita,l,margen+78,y-i*17,15));
  texto(page,regular,doc.empresa.nit&&'NIT '+doc.empresa.nit,margen+78,y-nombre.length*17,9,gris);
  derecha(page,negrita,tipo,ancho-margen,y,17,verde);
  derecha(page,regular,doc.numero,ancho-margen,y-19,10);
  derecha(page,regular,'Emisión: '+doc.fecha,ancho-margen,y-34,9,gris);
  y=Math.min(y-66,y-nombre.length*17-24);
  if (!inicial) return;
  for (const campo of [doc.empresa.direccion||'', [doc.empresa.ciudad,doc.empresa.telefono,doc.empresa.correo,doc.empresa.web].filter(Boolean).join('  |  ')]) {
   if (!campo) continue;
   for (const l of lineas(regular,campo,510,9)) { texto(page,regular,l,margen,y,9,gris); y-=13; }
  }
  y-=16;
  const cliente=doc.cliente;
  texto(page,negrita,tipo==='Cotización'?'Cotizado a':'Facturado a',margen,y,10,verde);y-=17;
  for (const campo of [cliente.nombre,[cliente.tipoId,cliente.identificacion].filter(Boolean).join(' '),
   [cliente.direccion,cliente.ciudad].filter(Boolean).join(', '),[cliente.correo,'+'+cliente.whatsapp].filter(Boolean).join('  |  ')]) {
   if (!campo) continue;
   for (const l of lineas(regular,campo,508,10)){texto(page,regular,l,margen,y);y-=14;}
  }
  if (doc.vencimiento) { texto(page,regular,(doc.tipo==='factura'?'Vencimiento: ':'Válida hasta: ')+doc.vencimiento,margen,y);y-=14; }
  if (doc.formaPago) {
   for (const l of lineas(regular,'Forma de pago: '+doc.formaPago,508,10)){texto(page,regular,l,margen,y);y-=14;}
  }
  y-=13;
 }
 function encabezado() {
  page.drawRectangle({x:margen,y:y-20,width:ancho-2*margen,height:24,color:verde});
  texto(page,negrita,'Concepto',margen+8,y-11,10,blanco);
  for (const [l,x] of [['Cant.',306],['Precio unit.',397],['IVA',446],['Total COP',ancho-margen-8]]) {
   derecha(page,negrita,l,x,y-11,9,blanco);
  }
  y-=39;
 }
 pagina(true);encabezado();
 const cantidad=new Intl.NumberFormat('es-CO',{maximumFractionDigits:3});
 for (const partida of doc.partidas) {
  const detalle=lineas(regular,partida.concepto,202,10), espacio=Math.max(27,detalle.length*14+10);
  if (y-espacio<68) { pagina();encabezado(); }
  detalle.forEach((l,i)=>texto(page,regular,l,margen+8,y-i*14));
  derecha(page,regular,cantidad.format(partida.cantidad/1000),306,y,9);
  derecha(page,regular,moneda(partida.precio),397,y,9);
  derecha(page,regular,partida.tasa+' %',446,y,9);
  derecha(page,negrita,moneda(partida.total),ancho-margen-8,y,9);
  y-=espacio;
  page.drawLine({start:{x:margen,y:y+13},end:{x:ancho-margen,y:y+13},thickness:.7,color:linea});
 }
 if (y<160) pagina();
 y-=12;
 for (const [name,value] of [['Subtotal',doc.subtotal],['IVA',doc.impuesto],['Total COP',doc.total]]) {
  const total=name==='Total COP';
  if(total)page.drawRectangle({x:302,y:y-8,width:ancho-margen-302,height:24,color:fondo});
  texto(page,total?negrita:regular,name,311,y,10,total?verde:tinta);
  derecha(page,negrita,moneda(value),ancho-margen-8,y,10);
  y-=24;
 }
 if (doc.notas) {
  if(y<116) pagina();
  y-=5;texto(page,negrita,'Observaciones',margen,y,10,verde);y-=17;
  for(const l of lineas(regular,doc.notas,ancho-2*margen,9)){
   if(y<65)pagina();
   texto(page,regular,l,margen,y,9);y-=13;
  }
 }
 const pages=pdf.getPages();
 pages.forEach((p,i)=>{
  p.drawLine({start:{x:margen,y:51},end:{x:ancho-margen,y:51},thickness:.7,color:linea});
  if(doc.tipo==='factura')texto(p,regular,'Documento comercial sin validación de factura electrónica DIAN.',margen,34,8,gris);
  derecha(p,regular,(i+1)+' de '+pages.length,ancho-margen,34,8,gris);
 });
 return pdf.save();
}

export async function pdfTarjeta(empresa,visual) {
 const pdf=await PDFDocument.create();
 pdf.setTitle('Tarjeta de presentación - '+empresa.nombre);
 for (const i of visual.tarjeta) colocarImagen(pdf.addPage([480,320]),await embed(pdf,i),12,12,456,296);
 return pdf.save();
}
