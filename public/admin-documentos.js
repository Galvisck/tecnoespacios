window.TE_DOCS=(()=>{
 const {calcular,moneda,mediosAbono}=window.TE_CALC_DOC;
 const url='/.netlify/functions/documentos';
 const tiposId=['Cédula','NIT','Cédula de extranjería','Pasaporte','Otro'];
 const estados={pendiente:'Pendiente',procesando:'En proceso',aceptado:'Aceptado por WhatsApp',error:'Rechazado',indeterminado:'Por confirmar'};
 const nuevaLinea=()=>({concepto:'',cantidad:'1',precio:'',iva:'0'});
 const nuevo=()=>({id:Date.now().toString(36)+'-'+crypto.randomUUID(),tipo:'cotizacion',vencimiento:'',formaPago:'',notas:'',
  cliente:{nombre:'',tipoId:'Cédula',identificacion:'',whatsapp:'',correo:'',direccion:'',ciudad:''},partidas:[nuevaLinea()],autorizado:false});
 let state, authSession;
 function init(){
  if(authSession===AUTH&&state)return;
  authSession=AUTH;
  state={config:null,historia:[],loading:false,busy:false,pantalla:'nuevo',borrador:nuevo(),item:null,pagos:null,abono:nuevoAbono(),
   confirmar:false,empresaDraft:null,empresaAbierta:false,mensaje:'',error:false,iniciado:false};
 }
 async function api(body){
  let r;
  try{
   r=await fetch(url,{method:'POST',headers:{'content-type':'application/json'},
    body:JSON.stringify({auth:AUTH,...body}),signal:AbortSignal.timeout(28000)});
  }catch(error){
   if(error.name==='TimeoutError')throw new Error('La facturación tardó en responder. Consulta el historial o vuelve a intentar.');
   throw new Error('No se pudo conectar con la facturación. Abre el sitio publicado o ejecútalo con iniciar-local.bat.');
  }
  const tipo=(r.headers.get('Content-Type')||'').toLowerCase();
  if(r.ok&&body.a==='pdf'&&tipo.includes('application/pdf')){
   return {blob:await r.blob(),nombre:r.headers.get('content-disposition')?.match(/filename="([^"]+)"/)?.[1]};
  }
  if(!tipo.includes('application/json')){
   if(r.status===404||r.ok&&tipo.includes('text/html')){
    throw new Error('La función de facturación no está publicada. Despliega el proyecto completo en Netlify o ejecútalo con iniciar-local.bat.');
   }
   throw new Error('La función de facturación respondió con el código '+r.status+'. Revisa el último despliegue de Netlify.');
  }
  const j=await r.json().catch(()=>({}));
  if(!r.ok||!j.ok)throw Object.assign(new Error(j.e||'No se pudo completar la operación.'),{item:j.item,pagos:j.pagos});
  return j;
 }
 const root=()=>document.querySelector('#adminDocumentos');
 function paint(){const r=root();if(r)r.innerHTML=contenido();}
 function avisar(texto,error=false){state.mensaje=texto;state.error=error;}
 function enfocar(el){
  if(!el)return;
  el.focus({preventScroll:true});
  el.scrollIntoView({block:'center'});
 }
 function faltantesEmpresa(){
  const {nombre,nit,direccion,ciudad}=state.config.empresa;
  return [
   ['nombre','razón social',nombre?.trim().length>=2],
   ['nit','NIT',/^\d[\d.-]{4,31}$/.test(nit||'')],
   ['direccion','dirección',Boolean(direccion?.trim())],
   ['ciudad','ciudad',Boolean(ciudad?.trim())]
  ].filter(([, ,valido])=>!valido);
 }
 function abrirEmpresa(){
  state.empresaAbierta=true;paint();
  const campo=faltantesEmpresa()[0]?.[0]||'nombre';
  enfocar(root()?.querySelector('#docCompanyForm [name="'+campo+'"]'));
 }
 const estadoTexto=envio=>estados[envio?.estado]||estados.pendiente;
 const titulo=t=>t==='factura'?'Factura comercial':'Cotización';
 const off=()=>state.busy?'disabled':'';
 const field=(label,name,v,attrs='')=>`<label>${label}<input name="${name}" value="${E(v)}" ${attrs}></label>`;
 const select=(label,name,v,opts)=>`<label>${label}<select name="${name}">${opts.map(([key,text])=>
  `<option value="${E(key)}" ${String(key)===String(v)?'selected':''}>${text}</option>`).join('')}</select></label>`;
 const fecha=x=>x?x.split('-').reverse().join('/'):'';
 const instruccionesTarjeta='<p class="doc-hint">El PDF de la tarjeta usa el frente y el reverso que aparecen en Contacto. Puedes actualizarlos en <button class="doc-inline" type="button" data-tab="arch">Tarjeta de presentación</button>.</p>';
 function empresa(){
  const e=state.empresaDraft||state.config.empresa;
  return `<details class="fm doc-company" id="docEmpresa" ${state.empresaAbierta?'open':''}>
   <summary>Datos de la empresa</summary>
   <form id="docCompanyForm">
    <div class="doc-fields">
     ${field('Razón social o nombre','nombre',e.nombre,'required maxlength="120"')}
     ${field('NIT con dígito de verificación','nit',e.nit,'maxlength="32"')}
     ${field('Dirección','direccion',e.direccion,'maxlength="160"')}
     ${field('Ciudad','ciudad',e.ciudad,'maxlength="60"')}
     ${field('Teléfono','telefono',e.telefono,'type="tel" maxlength="60"')}
     ${field('Correo','correo',e.correo,'type="email" maxlength="120"')}
     ${field('Sitio web','web',e.web,'maxlength="100"')}
    </div>
    <button class="b o" type="submit" ${off()}>Guardar datos de la empresa</button>
   </form>
   ${instruccionesTarjeta}
  </details>`;
 }
 function lineas(){
  return state.borrador.partidas.map((p,i)=>`<div class="doc-row" data-doc-row="${i}">
   <label>Concepto ${i+1}<input data-campo="concepto" value="${E(p.concepto)}" maxlength="260" required placeholder="Ej. Fabricación de mueble a medida"></label>
   <label>Cantidad<input data-campo="cantidad" value="${E(p.cantidad)}" inputmode="decimal" maxlength="8" required></label>
   <label>Precio unitario (COP)<input data-campo="precio" value="${E(p.precio)}" inputmode="decimal" maxlength="24" required placeholder="Ej. 250.000"></label>
   <label>IVA<select data-campo="iva">${[0,5,19].map(i=>`<option value="${i}" ${String(i)===String(p.iva)?'selected':''}>${i} %</option>`).join('')}</select></label>
   <button class="b o sm doc-remove" aria-label="Quitar concepto ${i+1}" type="button" data-doc-action="quitar" data-i="${i}" ${state.borrador.partidas.length===1?'disabled':off()}>Quitar</button>
  </div>`).join('');
 }
 function totales(){
  const t=calcular(state.borrador.partidas);
  return `<dl><div><dt>Subtotal</dt><dd>${t?moneda(t.subtotal):'—'}</dd></div>
   <div><dt>IVA</dt><dd>${t?moneda(t.impuesto):'—'}</dd></div>
   <div><dt>Total COP</dt><dd>${t?moneda(t.total):'—'}</dd></div></dl>`;
 }
 function formulario(){
  const d=state.borrador,c=d.cliente,factura=d.tipo==='factura',faltantes=factura?faltantesEmpresa():[];
  return `${empresa()}
   <form id="docForm" class="doc-form">
    <fieldset ${off()}>
     <div class="fm doc-block">
      <h3>Documento y cliente</h3>
      ${faltantes.length?`<p class="doc-requisito">Para generar una factura, guarda ${faltantes.map(([,l])=>l).join(', ')} en <button class="doc-inline" type="button" data-doc-action="empresa">Datos de la empresa</button>.</p>`:''}
      <div class="doc-fields">
       ${select('Tipo de documento','tipo',d.tipo,[['cotizacion','Cotización'],['factura','Factura comercial']])}
       ${field(factura?'Fecha de vencimiento':'Válida hasta','vencimiento',d.vencimiento,'type="date"')}
       ${field('Nombre completo o razón social','nombre',c.nombre,'required maxlength="120"')}
       ${select('Tipo de identificación','tipoId',c.tipoId,tiposId.map(x=>[x,x]))}
       ${field('Número de identificación','identificacion',c.identificacion,'maxlength="32"'+(factura?' required':''))}
       ${field('WhatsApp del destinatario','whatsapp',c.whatsapp,'required maxlength="30" type="tel" placeholder="Ej. 314 123 4567 o +57 314 123 4567"')}
       ${field('Correo (opcional)','correo',c.correo,'type="email" maxlength="120"')}
       ${field('Ciudad','ciudad',c.ciudad,'maxlength="60"')}
       ${field('Dirección','direccion',c.direccion,'maxlength="150"')}
       ${field('Forma de pago','formaPago',d.formaPago,'maxlength="100" placeholder="Ej. Anticipo del 50 %"')}
      </div>
     </div>
     <div class="fm doc-block">
      <h3>Productos o servicios</h3>
      <div class="doc-lines">${lineas()}</div>
      <button class="b o sm" type="button" data-doc-action="agregar" ${d.partidas.length>=25?'disabled':''}>Añadir concepto</button>
      <div id="docTotales" class="doc-totales">${totales()}</div>
      <label>Observaciones<textarea name="notas" rows="3" maxlength="800" placeholder="Condiciones, alcance o plazo de entrega">${E(d.notas)}</textarea></label>
     </div>
     <div class="fm doc-block doc-submit">
      ${factura?'<p class="doc-hint">La factura comercial se genera en PDF. La facturación electrónica requiere una solución habilitada ante la DIAN.</p>':''}
      ${state.config.whatsapp?`<label class="ck"><input type="checkbox" name="autorizado" ${d.autorizado?'checked':''}> El cliente autorizó recibir estos archivos por WhatsApp.</label>`:''}
      <div class="adm-actions">
       <button class="b" type="submit" value="generar">Generar PDF</button>
       <button class="b o" type="submit" value="enviar" ${state.config.whatsapp?'':'disabled'}>Generar y enviar por WhatsApp</button>
      </div>
     </div>
    </fieldset>
   </form>`;
 }
 const nuevoAbono=()=>({id:crypto.randomUUID(),monto:'',fecha:new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Bogota'}).format(new Date()),medio:'Transferencia',referencia:''});
 function panelAbonos(total){
  const {abonos,pagado,saldo}=state.pagos||{abonos:[],pagado:0,saldo:total};
  const a=state.abono;
  return `<section class="doc-abonos" aria-label="Abonos">
   <h3>Abonos</h3>
   <p>Pagado <b>${moneda(pagado)}</b> · Saldo pendiente <b>${moneda(saldo)}</b></p>
   ${abonos.length?`<div class="adm-tablewrap"><table class="adm-ct"><thead><tr><th>Fecha</th><th>Medio</th><th>Referencia</th><th>Valor COP</th></tr></thead>
    <tbody>${abonos.map(p=>`<tr><td>${fecha(p.fecha)}</td><td>${E(p.medio)}</td><td>${E(p.referencia||'—')}</td><td>${moneda(p.monto)}</td></tr>`).join('')}</tbody></table></div>`:''}
   ${saldo>0?`<form id="docAbonoForm">
    <fieldset ${off()}><div class="doc-fields">
     ${field('Valor del abono (COP)','monto',a.monto,'required inputmode="decimal" maxlength="28" placeholder="Ej. 250.000"')}
     ${field('Fecha de pago','fecha',a.fecha,'required type="date"')}
     ${select('Medio de pago','medio',a.medio,mediosAbono.map(m=>[m,m]))}
     ${field('Referencia (opcional)','referencia',a.referencia,'maxlength="120"')}
    </div><button class="b" type="submit">Registrar abono</button></fieldset>
   </form>`:'<p><b>Factura pagada</b></p>'}
  </section>`;
 }
 function resultado(){
  const d=state.item;
  const estadosDoc=Object.values(d.envios).map(s=>s.estado);
  const puedeEnviar=state.config.whatsapp&&!estadosDoc.some(s=>['procesando','indeterminado'].includes(s))&&estadosDoc.some(s=>s!=='aceptado');
  const texto=encodeURIComponent('Hola, te compartimos '+(d.tipo==='factura'?'la factura comercial':'la cotización')+' '+d.numero+' y la tarjeta de TECNO ESPACIOS.');
  return `<div class="fm doc-result">
   <h3>${titulo(d.tipo)} <span>${E(d.numero)}</span></h3>
   <p>${E(d.nombre)} · +${E(d.whatsapp)} · ${fecha(d.fecha)}</p>
   <p class="doc-total-final">Total COP ${moneda(d.total)}</p>
   ${d.tipo==='factura'?panelAbonos(d.total):''}
   <ul class="doc-delivery">
    <li><b>Documento</b> <span>${estadoTexto(d.envios.documento)}</span>${d.envios.documento.mensaje?`<small>${E(d.envios.documento.mensaje)}</small>`:''}</li>
    <li><b>Tarjeta</b> <span>${estadoTexto(d.envios.tarjeta)}</span>${d.envios.tarjeta.mensaje?`<small>${E(d.envios.tarjeta.mensaje)}</small>`:''}</li>
   </ul>
   <div class="adm-actions">
    <button class="b o" type="button" data-doc-action="descargar" data-pieza="documento" ${off()}>Descargar ${d.tipo==='factura'?'factura':'cotización'}</button>
    <button class="b o" type="button" data-doc-action="descargar" data-pieza="tarjeta" ${off()}>Descargar tarjeta</button>
    <a class="b o" href="https://wa.me/${E(d.whatsapp)}?text=${texto}" target="_blank" rel="noopener noreferrer">Abrir WhatsApp</a>
   </div>
   <p class="doc-hint">Para un envío manual, descarga ambos PDF y adjúntalos en la conversación.</p>
   ${puedeEnviar?`<div class="doc-resend"><label class="ck"><input type="checkbox" id="docConfirmar" ${(state.confirmar||d.consentimiento)?'checked':''} ${off()}> El cliente autorizó recibir los archivos.</label>
    <button class="b" type="button" data-doc-action="enviar" ${off()}>${estadosDoc.includes('error')?'Reintentar envío pendiente':'Enviar por WhatsApp'}</button></div>`:''}
  </div>`;
 }
 function historial(){
  return `<div class="fm doc-history"><h3>Últimos documentos</h3>${state.historia.length?
   `<div class="adm-tablewrap"><table class="adm-ct"><thead><tr><th>Documento</th><th>Cliente</th><th>Fecha</th><th>Total COP</th><th>Envío</th><th></th></tr></thead><tbody>
    ${state.historia.map(d=>`<tr><td><b>${titulo(d.tipo)}</b><small>${E(d.numero)}</small></td><td>${E(d.nombre)}</td><td>${fecha(d.fecha)}</td><td>${moneda(d.total)}</td><td>${estadoTexto(d.envios.documento)}</td>
     <td><button class="b o sm" type="button" data-doc-action="abrir" data-id="${E(d.id)}" ${off()}>Abrir</button></td></tr>`).join('')}</tbody></table></div>`
   :'<p class="adm-empty">Todavía no hay documentos generados.</p>'}</div>`;
 }
 function contenido(){
  const msg=state.mensaje?`<p class="adm-msgbar ${state.error?'err':'ok'}" role="status" data-doc-aviso tabindex="-1">${E(state.mensaje)}</p>`:'';
  if(!state.config)return msg+(state.loading?'<p>Cargando facturación…</p>':'<button class="b o" type="button" data-doc-action="cargar">Cargar facturación</button>');
  return `<div class="doc-nav"><button class="b ${state.pantalla==='nuevo'?'':'o'}" type="button" data-doc-action="nuevo" ${off()}>Nuevo documento</button>
   <button class="b ${state.pantalla==='historial'?'':'o'}" type="button" data-doc-action="historial" ${off()}>Historial</button>
   <span class="doc-status ${state.config.whatsapp?'conectado':''}">${state.config.whatsapp?'WhatsApp Business configurado':'WhatsApp Business pendiente de configurar'}</span></div>
   ${msg}${state.pantalla==='historial'?historial():state.pantalla==='detalle'?resultado():formulario()}`;
 }
 async function cargar(){
  if(state.loading)return;
  const actual=state;
  state.loading=true;paint();
  try{const j=await api({a:'config'});if(state===actual){actual.config=j;avisar('');}}
  catch(error){if(state===actual)avisar(error.message,true);}
  finally{actual.loading=false;if(state===actual)paint();}
 }
 const camposCliente=['nombre','tipoId','identificacion','whatsapp','correo','ciudad','direccion'];
 function entrada(form){
  const values=new FormData(form),d=state.borrador;
  for(const k of camposCliente)d.cliente[k]=values.get(k)||'';
  for(const k of ['tipo','vencimiento','formaPago','notas'])d[k]=values.get(k)||'';
  d.autorizado=values.has('autorizado');
 }
 async function enviarActual(){
  const actual=state;
  for(const pieza of ['documento','tarjeta']){
   if(state.item.envios[pieza].estado==='aceptado')continue;
   const j=await api({a:'enviar',id:state.item.id,pieza,autorizado:true});
   if(state!==actual)return;
   state.item=j.item;paint();
   if(j.item.envios[pieza].estado!=='aceptado')throw new Error(j.item.envios[pieza].mensaje||'Falta confirmar el envío.');
  }
  avisar('WhatsApp aceptó el documento y la tarjeta para envío.');
 }
 async function conEstado(fn){
  if(state.busy)return;
  const actual=state;
  state.busy=true;avisar('Procesando…');paint();
  try{await fn(actual);}
  catch(error){if(state===actual){if(error.item)state.item=error.item;if(error.pagos)state.pagos=error.pagos;avisar(error.message||'No se pudo completar la operación.',true);}}
  finally{
   actual.busy=false;
   if(state===actual){
    paint();
    if(actual.error)enfocar(root()?.querySelector('[data-doc-aviso]'));
   }
  }
 }
 async function guardarDocumento(form,auto){
  entrada(form);
  if(state.borrador.tipo==='factura'&&faltantesEmpresa().length){
   avisar('Completa y guarda los datos de la empresa para generar la factura.',true);
   abrirEmpresa();
   return;
  }
  if(!calcular(state.borrador.partidas)){
   avisar('Revisa los conceptos. Escribe cantidades mayores que cero y precios como 250000 o 250.000,50.',true);
   paint();enfocar(root()?.querySelector('[data-doc-aviso]'));return;
  }
  if(auto&&!state.borrador.autorizado){avisar('Confirma que el cliente autorizó el envío por WhatsApp.',true);paint();enfocar(root()?.querySelector('[name="autorizado"]'));return;}
  await conEstado(async actual=>{
   const {item}=await api({a:'crear',...actual.borrador});
   if(state!==actual)return;
   state.item=item;state.pagos=null;state.abono=nuevoAbono();state.pantalla='detalle';state.confirmar=state.borrador.autorizado;
   if(item.tipo==='factura'){
    const {pagos}=await api({a:'detalle',id:item.id});
    if(state!==actual)return;
    actual.pagos=pagos;
   }
   if(auto){paint();await enviarActual();}
   else avisar('Documento y tarjeta listos para descargar.');
  });
 }
 function vuelo(a){
  const blobUrl=URL.createObjectURL(a.blob),link=document.createElement('a');
  link.href=blobUrl;link.download=a.nombre||'documento.pdf';
  document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(blobUrl),3000);
 }
 document.addEventListener('click',event=>{
  const btn=event.target.closest('#adminDocumentos [data-doc-action]');
  if(!btn||state.busy)return;
  const accion=btn.dataset.docAction;
  if(accion==='cargar'){cargar();return;}
  if(accion==='empresa'){abrirEmpresa();return;}
  if(accion==='nuevo'){state.borrador=nuevo();state.pantalla='nuevo';avisar('');paint();return;}
  if(accion==='historial'){conEstado(async actual=>{const {items}=await api({a:'listar'});if(state===actual){actual.historia=items;actual.pantalla='historial';avisar('');}});return;}
  if(accion==='abrir'){conEstado(async actual=>{const {item,pagos}=await api({a:'detalle',id:btn.dataset.id});if(state===actual){if(actual.item?.id!==item.id)actual.abono=nuevoAbono();actual.item=item;actual.pagos=pagos;actual.pantalla='detalle';actual.confirmar=false;avisar('');}});return;}
  if(accion==='descargar'){conEstado(async actual=>{const archivo=await api({a:'pdf',id:actual.item.id,pieza:btn.dataset.pieza});if(state===actual){vuelo(archivo);avisar('Archivo listo para descargar.');}});return;}
  if(accion==='enviar'){
   if(!document.querySelector('#docConfirmar')?.checked){avisar('Confirma que el cliente autorizó el envío por WhatsApp.',true);paint();return;}
   conEstado(enviarActual);return;
  }
  if(accion==='agregar'){
   state.borrador.partidas.push(nuevaLinea());paint();
   root().querySelector('.doc-row:last-child [data-campo="concepto"]').focus();
  }
  if(accion==='quitar'){state.borrador.partidas.splice(Number(btn.dataset.i),1);paint();}
 });
 document.addEventListener('input',event=>{
  const t=event.target;
  if(t.id==='docConfirmar'){state.confirmar=t.checked;return;}
  if(t.closest('#docAbonoForm')){Object.assign(state.abono,Object.fromEntries(new FormData(t.form)));return;}
  if(t.closest('#docCompanyForm')){state.empresaDraft=Object.fromEntries(new FormData(t.form));return;}
  if(!t.closest('#docForm'))return;
  const row=t.closest('[data-doc-row]');
  if(row&&t.dataset.campo){
   state.borrador.partidas[Number(row.dataset.docRow)][t.dataset.campo]=t.value;
   document.querySelector('#docTotales').innerHTML=totales();
   return;
  }
  if(t.name)entrada(t.form);
  if(t.name==='tipo'){paint();document.querySelector('#docForm [name="tipo"]').focus();}
 });
 document.addEventListener('toggle',event=>{
  if(event.target.id==='docEmpresa')state.empresaAbierta=event.target.open;
 },true);
 document.addEventListener('submit',event=>{
  if(event.target.id==='docForm'){event.preventDefault();guardarDocumento(event.target,event.submitter?.value==='enviar');}
  if(event.target.id==='docAbonoForm'){
   event.preventDefault();
   Object.assign(state.abono,Object.fromEntries(new FormData(event.target)));
   conEstado(async actual=>{
    const {pagos}=await api({a:'abonar',id:actual.item.id,abono:actual.abono});
    if(state===actual){actual.pagos=pagos;actual.abono=nuevoAbono();avisar('Abono registrado.');}
   });
  }
  if(event.target.id==='docCompanyForm'){
   event.preventDefault();
   const empresa=Object.fromEntries(new FormData(event.target));
   conEstado(async actual=>{const saved=await api({a:'empresa',empresa});if(state===actual){actual.config.empresa=saved.empresa;actual.empresaDraft=null;avisar('Datos de la empresa guardados.');}});
  }
 });
 return {
  view(){init();return `<div id="adminDocumentos">${contenido()}</div>`;},
  activar(){if(!state.iniciado){state.iniciado=true;cargar();}},
  salir(){state=null;authSession=undefined;}
 };
})();
