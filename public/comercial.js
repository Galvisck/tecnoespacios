/* TECNO ESPACIOS — módulo comercial.
   Se carga después de app.js. Reutiliza D, AUTH, openOverlay y el sistema de rutas existente. */
(() => {
'use strict';
const esc=s=>String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const datos=()=>{try{return D||window.TE_DATA||{}}catch(e){return window.TE_DATA||{}}};
const auth=()=>{try{return AUTH||''}catch(e){return''}};
const EU='/.netlify/functions/eventos',EC='/.netlify/functions/comercial',EP='/.netlify/functions/proyectos',EE='/.netlify/functions/estadisticas';
const ESTADOS=['Solicitud recibida','En revisión','Diseño y planificación','Cotización enviada','Cotización aprobada','En fabricación','En preparación para instalación','En instalación','Proyecto finalizado'];
const ESTADOS_CRM=['Nuevo interesado','Contactado','En negociación','Cotización enviada','Pendiente de respuesta','Venta concretada','Cliente perdido'];
const PARTES=[['puertas','Puertas'],['estructura','Estructura'],['cajones','Cajones'],['laterales','Laterales'],['divisiones','Divisiones']];
const TIPOS=[['cocina','Cocina integral'],['closet','Clóset'],['banio','Mueble de baño'],['personalizado','Muebles personalizados']];
const COM={paso:1,tipo:'cocina',parte:'puertas',buscar:'',categoria:'',medidas:{ancho:'',alto:'',profundo:'',unidad:'cm'},contacto:{nombre:'',tel:'',email:'',ciudad:''},obs:'',crearProyecto:false,modelo:'',estilo:'',material:'',puerta:'',cajon:'',tirador:'',mensaje:'',seg:null};
const DATA={},LOAD={};
let COM_TAB='',STATS_DIAS=30,CRM_BUSCAR='',CRM_ESTADO='',CRM_SEL='';

// Las rutas nuevas pasan a formar parte del enrutador existente (P) sin reescribir app.js.
try{
  if(Array.isArray(P)){
    if(!P.some(x=>x[0]==='personalizador'))P.push(['personalizador','Personaliza tu mueble','🎨']);
    if(!P.some(x=>x[0]==='seguimiento'))P.push(['seguimiento','Seguimiento','📦']);
  }
}catch(e){}

async function com(body,url,pub=false){
  try{
    const r=await fetch(url,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(pub?body:{auth:auth(),...body})});
    const j=await r.json().catch(()=>({}));
    return {ok:r.ok,...j};
  }catch(e){return {ok:false,e:'Sin conexión con Netlify. Ejecuta npm run dev para probar las funciones.'}}
}
function sid(){let s;try{s=localStorage.te_sid}catch(e){}if(!s){s='vis-'+(globalThis.crypto&&crypto.randomUUID?crypto.randomUUID():Math.random().toString(36).slice(2)+Date.now());try{localStorage.te_sid=s}catch(e){}}return s}
function consent(){try{return localStorage.te_analytics||''}catch(e){return''}}
function track(tipo,meta){if(consent()!=='on')return;com({tipo,meta,sid:sid()},EU,true)}
function aviso(m,tipo='ok'){COM.mensaje=m;COM.mensajeTipo=tipo;const e=document.querySelector('#comMsg');if(e){e.textContent=m;e.className='com-msg '+tipo}}

async function load(que,force=false){
  if(!force&&DATA[que])return DATA[que];
  if(LOAD[que])return null;
  LOAD[que]=true;
  let r;
  if(que==='config')r=await com({accion:'listar',que:'config'},EC);
  else if(que==='meta')r=await com({accion:'listar',que:'meta'},EC);
  else if(que==='solicitudes')r=await com({accion:'listar',que:'solicitudes'},EC);
  else if(que==='contactos')r=await com({accion:'listar',que:'contactos'},EC);
  else if(que==='proyectos')r=await com({accion:'listar'},EP);
  else if(que.startsWith('stats'))r=await com({accion:'stats'/* placeholder */},EE);
  LOAD[que]=false;
  if(!r.ok){DATA[que]={_error:r.e||'No se pudo cargar.'};return DATA[que]}
  DATA[que]=que==='config'?r.config:que==='meta'?r.meta:que==='solicitudes'?r.solicitudes:que==='contactos'?r.contactos:que==='proyectos'?r.proyectos:r;
  render();
  return DATA[que];
}
async function loadStats(){
  const key='stats-'+STATS_DIAS;
  if(DATA[key]&&!LOAD[key])return DATA[key];
  if(LOAD[key])return null;
  LOAD[key]=true;
  const r=await com({dias:STATS_DIAS},EE);
  LOAD[key]=false;
  DATA[key]=r.ok?r:{_error:r.e||'No se pudieron cargar las estadísticas.'};
  render();
  return DATA[key];
}

/* ---------- Catálogo de colores: única fuente ---------- */
function coloresCatalogo(){
  const d=datos(),out=[],seen=new Set();
  const base=Array.isArray(window.TE_CAT)?window.TE_CAT.filter(r=>Array.isArray(r)&&String(r[0])==='colores'):[];
  base.forEach(r=>{
    const key='colores|'+r[1];
    if(seen.has(key))return;
    seen.add(key);
    out.push({key,catalogId:key,n:String(r[1]||''),s:String(r[2]||''),d:String(r[3]||''),x:String(r[4]||'#c9a77c'),img:String(r[5]||''),source:'catalogo'});
  });
  (d.items||[]).filter(i=>i&&i.k==='colores').forEach(i=>{
    const esBase=base.some(r=>String(r[1])===String(i.n));
    const key=esBase?'colores|'+i.n:'custom|'+i.id;
    const existente=out.find(c=>c.key===key);
    if(existente){
      Object.assign(existente,{n:String(i.n||existente.n),s:String(i.s||existente.s),d:String(i.d||existente.d),x:String(i.x||existente.x),img:(i.img&&i.img[0])||existente.img,source:'catalogo',customId:i.id});
    }else{
      seen.add(key);
      out.push({key,catalogId:key,n:String(i.n||''),s:String(i.s||''),d:String(i.d||''),x:String(i.x||'#c9a77c'),img:(i.img&&i.img[0])||'',source:'catalogo',customId:i.id});
    }
  });
  return out;
}
function colorDisponible(key){const ocultos=((DATA.config&&DATA.config.listas&&DATA.config.listas.ocultos)||[]);return !ocultos.includes(key)}
function colorDe(parte){const x=(COM[parte]||[])[0];return x||null}
function hexParte(parte){const c=colorDe(parte);return c?c.x:'#c9a77c'}
function opciones(){
  const d=datos(),l=(DATA.config&&DATA.config.listas)||{},items=d.items||[];
  const unicos=k=>[...new Set(items.filter(i=>i&&i.k===k).map(i=>String(i.n||'')).filter(Boolean))];
  const cats=(d.cats||[]).filter(Boolean).map(String);
  const gen=a=>a.length?a:['A definir con el asesor'];
  return {
    modelos:gen(l.modelos||cats),estilos:gen(l.estilos||cats),
    materiales:gen([...(l.materiales||[]),...unicos('mesones')]),
    puertas:gen([...(l.tiposPuerta||[]),...unicos('herrajes')]),
    cajones:gen([...(l.tiposCajon||[]),...unicos('herrajes')]),
    tiradores:gen([...(l.tiradores||[]),...unicos('herrajes')])
  };
}
function validateColor(c){
  return {catalogId:String(c.catalogId||c.key||''),n:String(c.n||''),s:String(c.s||''),x:String(c.x||''),img:String(c.img||''),source:'catalogo'};
}

/* ---------- Vista pública del personalizador ---------- */
function vistaSVG(){
  const p=hexParte('puertas'),e=hexParte('estructura'),c=hexParte('cajones'),l=hexParte('laterales');
  return `<svg viewBox="0 0 760 430" role="img" aria-label="Vista ilustrativa del mueble personalizado"><rect x="18" y="18" width="724" height="394" rx="16" fill="#e9e4dc"/><rect x="72" y="62" width="616" height="290" rx="6" fill="${esc(e)}"/><rect x="88" y="78" width="584" height="258" fill="${esc(p)}"/>${[0,1,2,3].map(i=>`<rect x="${100+i*143}" y="94" width="128" height="226" rx="3" fill="none" stroke="#fff" stroke-opacity=".65" stroke-width="3"/>`).join('')}<rect x="88" y="330" width="584" height="14" fill="${esc(c)}"/>${[0,1,2,3].map(i=>`<rect x="${100+i*143}" y="344" width="128" height="34" rx="2" fill="${esc(c)}" stroke="#fff" stroke-opacity=".55" stroke-width="2"/>`).join('')}<rect x="72" y="62" width="16" height="290" fill="${esc(l)}"/><rect x="672" y="62" width="16" height="290" fill="${esc(l)}"/><text x="380" y="402" text-anchor="middle" fill="#50483f" font-size="13">VISTA ILUSTRATIVA · EL DISEÑO FINAL SE AJUSTA A TUS MEDIDAS</text></svg>`;
}
function colorGrid(){
  const q=COM.buscar.trim().toLowerCase(),cat=COM.categoria;
  const cats=[...new Set(coloresCatalogo().filter(colorDisponible).map(c=>c.s).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));
  const filtrados=coloresCatalogo().filter(c=>colorDisponible(c.key)&&(!cat||c.s===cat)&&(!q||[c.n,c.s,c.d,c.x].join(' ').toLowerCase().includes(q)));
  const grupos={};filtrados.forEach(c=>{const g=c.s||'Sin referencia';(grupos[g]=grupos[g]||[]).push(c)});
  return `<div class="com-cat-filters"><button class="${cat?'':'on'}" data-com-cat="">Todos</button>${cats.map(c=>`<button class="${cat===c?'on':''}" data-com-cat="${esc(c)}">${esc(c)}</button>`).join('')}</div>
  <div class="com-color-grid">${Object.entries(grupos).map(([g,list])=>`<div class="com-color-group"><h4>${esc(g)}</h4><div class="com-color-row">${list.map(c=>{
    const sel=(COM[COM.parte]||[]).some(x=>x.catalogId===c.catalogId);
    return `<article class="com-color-card ${sel?'on':''}"><button type="button" class="com-color-main" data-com-color="${esc(c.catalogId)}" aria-pressed="${sel}">${c.img?`<img src="${esc(c.img)}" alt="Textura de ${esc(c.n)}, referencia ${esc(c.s)}" loading="lazy">`:''}<span class="com-color-swatch" style="background:${esc(c.x)}" aria-hidden="true"></span><b>${esc(c.n)}</b><small>${esc(c.s||'Sin referencia')}</small><code>${esc(c.x)}</code></button>${c.img?`<button type="button" class="com-color-zoom" data-com-zoom="${esc(c.catalogId)}" aria-label="Ampliar ${esc(c.n)}">↗</button>`:''}</article>`;
  }).join('')}</div></div>`).join('')||'<p>No hay colores con ese filtro.</p>'}</div>`;
}
function resumenCom(){
  const sel=PARTES.map(([k,n])=>`<li><b>${n}:</b> ${(COM[k]||[]).length?(COM[k]||[]).map(c=>esc(c.n)+' · '+esc(c.s||'—')+' · '+esc(c.x)).join('; '):'Sin seleccionar'}</li>`).join('');
  return `<ul class="com-summary-list"><li><b>Tipo:</b> ${esc(TIPOS.find(x=>x[0]===COM.tipo)?.[1]||COM.tipo)}</li><li><b>Modelo:</b> ${esc(COM.modelo||'A definir con el asesor')}</li><li><b>Estilo:</b> ${esc(COM.estilo||'A definir con el asesor')}</li><li><b>Material:</b> ${esc(COM.material||'A definir con el asesor')}</li><li><b>Puertas:</b> ${esc(COM.puerta||'A definir con el asesor')}</li><li><b>Cajones:</b> ${esc(COM.cajon||'A definir con el asesor')}</li><li><b>Tiradores:</b> ${esc(COM.tirador||'A definir con el asesor')}</li><li><b>Medidas:</b> ${esc([COM.medidas.ancho&&COM.medidas.ancho+' ancho',COM.medidas.alto&&COM.medidas.alto+' alto',COM.medidas.profundo&&COM.medidas.profundo+' profundo'].filter(Boolean).join(' × ')||'Por confirmar')} ${esc(COM.medidas.unidad||'cm')}</li>${sel}<li><b>Observaciones:</b> ${esc(COM.obs||'Ninguna')}</li><li><b>Valor:</b> Sujeto a cotización</li></ul>`;
}
function selectCom(label,field,opts){
  return `<label>${label}<select data-com-field="${field}"><option value="">A definir con el asesor</option>${opts.map(o=>`<option value="${esc(o)}" ${COM[field]===o?'selected':''}>${esc(o)}</option>`).join('')}</select></label>`;
}
function stepNav(){
  return `<div class="com-steps" role="tablist" aria-label="Pasos del personalizador">${[1,2,3].map((n,i)=>`<button role="tab" aria-selected="${COM.paso===n}" class="${COM.paso===n?'on':''}" data-com-step="${n}">${String(n).padStart(2,'0')} · ${['Tipo y diseño','Colores','Resumen'][i]}</button>`).join('')}</div>`;
}
function step1(){
  const o=opciones();
  return `<section class="com-panel"><h2>Cuéntanos qué quieres construir.</h2><div class="com-grid2"><div class="com-field"><small>01 · TIPO DE MUEBLE</small><div class="com-type-list">${TIPOS.map(([v,n])=>`<button class="${COM.tipo===v?'on':''}" data-com-type="${v}" aria-pressed="${COM.tipo===v}">${n}</button>`).join('')}</div></div><div class="com-field"><small>02 · MODELO Y ESTILO</small>${selectCom('Modelo','modelo',o.modelos)}${selectCom('Estilo','estilo',o.estilos)}</div><div class="com-field"><small>03 · MATERIALES Y HERRAJES</small>${selectCom('Material / mesón','material',o.materiales)}${selectCom('Tipo de puerta','puerta',o.puertas)}${selectCom('Tipo de cajón','cajon',o.cajones)}${selectCom('Tirador / herraje','tirador',o.tiradores)}</div><div class="com-field"><small>04 · MEDIDAS (cm)</small><div class="com-measures">${[['ancho','Ancho'],['alto','Alto'],['profundo','Profundidad']].map(([k,n])=>`<label>${n}<input type="number" min="1" max="3000" data-com-med="${k}" value="${esc(COM.medidas[k])}" placeholder="0"></label>`).join('')}</div><label>Observaciones<textarea rows="3" data-com-obs maxlength="1200" placeholder="Necesidades especiales, distribución, etc.">${esc(COM.obs)}</textarea></label></div></div><div class="com-actions"><button class="b" data-com-step="2">Elegir colores →</button></div></section>`;
}
function step2(){
  return `<section class="com-panel"><h2>Selecciona los colores del catálogo.</h2><p class="com-source">Fuente única: catálogo de colores y acabados de TECNO ESPACIOS. Los nombres, referencias, códigos e imágenes son los registrados en el catálogo.</p><div class="com-layout"><div><div class="com-part-list" role="group" aria-label="Parte del mueble">${PARTES.map(([k,n])=>`<button class="${COM.parte===k?'on':''}" data-com-part="${k}" aria-pressed="${COM.parte===k}">${n}${COM[k]?.length?` <i>${COM[k].length}</i>`:''}</button>`).join('')}</div><div class="com-color-search"><label>Buscar color o referencia<input id="comBuscar" type="search" value="${esc(COM.buscar)}" placeholder="Ej. Vetta, Terranta, #b9855a"></label></div><div id="comColorGrid">${colorGrid()}</div></div><aside class="com-preview"><div class="com-preview-top"><span>VISTA PREVIA</span><small>ILUSTRATIVA</small></div><div id="comDrawing">${vistaSVG()}</div><h4>Colores asignados</h4><ul>${PARTES.map(([k,n])=>`<li><b>${n}:</b> ${(COM[k]||[]).length?COM[k].map(c=>`<span class="com-chip" style="--chip:${esc(c.x)}">${esc(c.n)} <button data-com-unassign="${k}|${esc(c.catalogId)}" aria-label="Quitar ${esc(c.n)}">×</button></span>`).join(' '):'Sin seleccionar'}</li>`).join('')}</ul><p class="com-note">Puedes asignar varios colores a una misma parte y colores distintos a cada parte.</p></aside></div><div class="com-actions"><button class="b o" data-com-step="1">← Volver</button><button class="b" data-com-step="3">Revisar solicitud →</button></div></section>`;
}
function step3(){
  return `<section class="com-panel"><h2>Revisa tu diseño y envíalo.</h2><div class="com-layout"><div>${resumenCom()}<div id="comDrawingSmall">${vistaSVG()}</div></div><div class="com-send"><div class="fm"><h3>Tus datos de contacto</h3><label>Nombre completo<input data-com-contact="nombre" value="${esc(COM.contacto.nombre)}" maxlength="90" autocomplete="name" required></label><label>Teléfono<input data-com-contact="tel" value="${esc(COM.contacto.tel)}" maxlength="40" autocomplete="tel"></label><label>Correo electrónico<input data-com-contact="email" value="${esc(COM.contacto.email)}" maxlength="120" autocomplete="email"></label><label>Ciudad o zona<input data-com-contact="ciudad" value="${esc(COM.contacto.ciudad)}" maxlength="80" autocomplete="address-level2"></label><label class="ck"><input type="checkbox" data-com-crear ${COM.crearProyecto?'checked':''}> Guardar también como solicitud de proyecto con código de seguimiento</label><small>Necesitamos al menos un nombre y un teléfono o correo válidos. El valor está sujeto a cotización; no mostramos precios estimados.</small><div class="com-actions"><button class="b" data-com-send="cotizacion">Solicitar cotización</button><button class="b o" data-com-send="whatsapp">Enviar por WhatsApp ↗</button><button class="b o" data-com-send="chat">Enviar al chat en vivo</button><button class="b o" data-com-send="proyecto">Guardar como proyecto</button></div><p id="comMsg" class="com-msg ${esc(COM.mensajeTipo||'')}" role="status" aria-live="polite">${esc(COM.mensaje||'')}</p></div></div></div><div class="com-actions"><button class="b o" data-com-step="2">← Modificar colores</button><button class="b o" data-com-step="1">Modificar diseño</button></div></section>`;
}
function personalizadorView(){
  return `<section class="com-hero"><div class="section-kicker">PERSONALIZA TU MUEBLE</div><h1>Diseña tu espacio con los acabados reales.</h1><p>Elige el tipo de mueble, asigna colores por partes desde nuestro catálogo y envíanos tu solicitud. Todo queda registrado para que podamos cotizar con precisión.</p></section>${stepNav()}${COM.paso===1?step1():COM.paso===2?step2():step3()}<section class="com-note"><b>¿Prefieres que te ayudemos?</b><p><a href="/contacto">Habla con un asesor</a> o usa el chat en vivo. También puedes consultar el <a href="/seguimiento">estado de tu proyecto</a>.</p></section>`;
}

/* ---------- Seguimiento público ---------- */
function seguimientoView(){
  const p=COM.seg;
  return `<section class="com-hero"><div class="section-kicker">SEGUIMIENTO DE PROYECTOS</div><h1>Consulta el avance de tu proyecto.</h1><p>Ingresa el código que recibiste y el teléfono o correo registrado. Solo verás la información de ese proyecto.</p></section><section class="com-panel"><form id="segForm" class="fm com-inline"><label>Código de seguimiento<input id="segCode" required maxlength="40" placeholder="TE-20261125-ABCD" autocomplete="off"></label><label>Teléfono o correo registrado<input id="segVer" required maxlength="120" autocomplete="off"></label><button class="b">Consultar</button><p id="segMsg" role="status" aria-live="polite"></p></form></section>${p?`<section class="com-panel"><div class="seg-head"><div><div class="section-kicker">PROYECTO ${esc(p.codigo)}</div><h2>${esc(p.nombre||p.tipo||'Proyecto a medida')}</h2></div><span class="seg-status">${esc(p.estado)}</span></div><div class="com-grid2"><div><h3>Datos generales</h3><ul class="com-summary-list"><li><b>Tipo:</b> ${esc(p.tipo||'—')}</li><li><b>Modelo:</b> ${esc(p.modelo||'—')}</li><li><b>Fecha de inicio:</b> ${esc(p.fechaInicio||'—')}</li><li><b>Entrega estimada:</b> ${esc(p.fechaEntrega||'Por confirmar')}</li></ul><h3>Novedades</h3>${(p.notas||[]).length?(p.notas||[]).slice().reverse().map(n=>`<p class="seg-note">${esc(n.texto)}<small>${esc((n.at||'').slice(0,10))}</small></p>`).join(''):'<p>Aún no hay novedades registradas.</p>'}</div><div><h3>Avance</h3><ol class="seg-timeline">${ESTADOS.map((e,i)=>`<li class="${i<=(p.estadoIndex||0)?'done':''}">${esc(e)}</li>`).join('')}</ol></div></div>${(p.fotos||[]).length?`<h3>Fotografías del avance</h3><div class="seg-photos">${p.fotos.map(f=>`<button data-com-photo="${esc(f.u)}" aria-label="Ampliar fotografía del avance"><img src="${esc(f.u)}" alt="Avance del proyecto ${esc(p.codigo)}" loading="lazy"></button>`).join('')}</div>`:''}<h3>Historial</h3><div class="seg-history">${(p.historial||[]).slice().reverse().map(h=>`<p><b>${esc(h.estado||'')}</b> ${esc(h.nota||'')} <small>${esc((h.at||'').slice(0,10))}</small></p>`).join('')||'<p>Sin movimientos registrados.</p>'}</div></section>`:''}`;
}

/* ---------- Panel comercial ---------- */
function panelShell(body){
  const items=[['compersonalizador','Personalizador y solicitudes'],['comproyectos','Seguimiento de proyectos'],['comstats','Estadísticas'],['comcrm','CRM de clientes']];
  return `<h2>Panel comercial <small id="st" role="status" aria-live="polite"></small></h2><div class="ad"><aside aria-label="Secciones comerciales"><h4>Comercial</h4>${items.map(([k,n])=>`<button class="${COM_TAB===k?'on':''}" data-comtab="${k}" ${COM_TAB===k?'aria-current="page"':''}>${n}</button>`).join('')}<h4>General</h4><button data-com-exit>← Volver al panel</button></aside><section>${body}</section></div>`;
}
function loading(m){return `<p class="com-loading">${esc(m||'Cargando…')}</p>`}
function configView(){
  const cfg=DATA.config;
  if(!cfg) {load('config');return loading()}
  if(cfg._error)return `<div class="fm"><p role="alert">${esc(cfg._error)}</p></div>`;
  const l=cfg.listas||{},hidden=l.ocultos||[],cols=coloresCatalogo();
  const field=(k,label)=>`<label>${label}<textarea rows="5" data-com-config="${k}">${esc((l[k]||[]).join('\n'))}</textarea><small>Una opción por línea. Se mostrarán en el personalizador.</small></label>`;
  const sol=DATA.solicitudes;
  return `<div class="fm"><div class="section-kicker">OPCIONES DEL PERSONALIZADOR</div><h2>Configuración comercial</h2><p>Los colores NO se configuran aquí: se toman directamente del catálogo de colores de TECNO ESPACIOS. Puedes ocultar los que ya no estén disponibles sin borrar su registro original.</p><div class="com-grid2">${field('modelos','Modelos')}${field('estilos','Estilos')}${field('materiales','Materiales / mesones')}${field('tiposPuerta','Tipos de puerta')}${field('tiposCajon','Tipos de cajón')}${field('tiradores','Tiradores / herrajes')}</div><button class="b" data-com-save-config>Guardar opciones</button></div>
  <div class="fm"><h3>Colores del catálogo (${cols.length})</h3><p>Desde aquí puedes retirar temporalmente una referencia del personalizador. El catálogo original no se modifica.</p><div class="com-toggle-grid">${cols.map(c=>`<label class="ck"><input type="checkbox" data-com-hidden="${esc(c.catalogId)}" ${hidden.includes(c.catalogId)?'checked':''}> <span class="com-dot" style="background:${esc(c.x)}"></span> ${esc(c.n)} <small>${esc(c.s||'')}</small></label>`).join('')}</div><button class="b o" data-com-save-hidden>Guardar disponibilidad</button></div>
  <div class="fm"><h3>Solicitudes recibidas</h3><button class="b o" data-com-load="solicitudes">Actualizar</button>${sol===undefined?(load('solicitudes'),loading()):sol._error?`<p role="alert">${esc(sol._error)}</p>`:sol.length?sol.slice().reverse().map(s=>`<div class="com-row"><div><b>${esc(s.cliente)}</b> <small>${esc(s.origen)} · ${esc((s.created||'').slice(0,10))} · ${s.atendida?'Atendida':'Pendiente'}</small><br><small>${esc(s.datos?.tipo||'')} ${esc(s.datos?.modelo||'')} · ${(s.datos?.colores||[]).map(c=>esc(c.n)).join(', ')||'sin colores'}</small></div><button class="b o" data-com-detail-sol="${esc(s.id)}">Ver detalle</button>${!s.atendida?`<button class="b o" data-com-atender="${esc(s.id)}">Marcar atendida</button>`:''}<button class="b" data-com-sol-proyecto="${esc(s.id)}">Crear proyecto</button></div>`).join(''):'<p>Aún no hay solicitudes.</p>'}<div id="comSolDetail"></div></div>`;
}
function proyectosAdmin(){
  const ps=DATA.proyectos;
  if(!ps){load('proyectos');return loading()}
  if(ps._error)return `<div class="fm"><p role="alert">${esc(ps._error)}</p></div>`;
  return `<div class="fm"><div class="section-kicker">SEGUIMIENTO DE PROYECTOS</div><h2>Proyectos registrados</h2><button class="b o" data-com-load="proyectos">Actualizar</button><div class="com-grid2"><label>Cliente<input id="cpCliente" maxlength="90" placeholder="Nombre del cliente"></label><label>Teléfono o correo para verificar<input id="cpVer" maxlength="120" placeholder="Usuario podrá consultar con este dato"></label><label>Tipo de mueble<input id="cpTipo" maxlength="80"></label><label>Modelo<input id="cpModelo" maxlength="80"></label><label>Entrega estimada<input id="cpEntrega" maxlength="30" placeholder="AAAA-MM-DD o texto"></label><label>Observaciones<textarea id="cpObs" rows="2" maxlength="1200"></textarea></label></div><button class="b" data-com-proy-create>Crear proyecto y generar código</button></div>
  ${ps.length?ps.slice().reverse().map(p=>`<article class="com-project"><div class="seg-head"><div><b>${esc(p.cliente)}</b> · <code>${esc(p.codigo)}</code><h3>${esc(p.nombre||p.tipo||'Proyecto')}</h3></div><select data-com-proy-status="${esc(p.id)}" aria-label="Estado de ${esc(p.codigo)}">${ESTADOS.map(e=>`<option ${p.estado===e?'selected':''}>${esc(e)}</option>`).join('')}</select></div><p><small>Inicio: ${esc(p.fechaInicio||'')} · Entrega: ${esc(p.fechaEntrega||'Por confirmar')} · Actualizado: ${esc((p.updated||'').slice(0,10))}</small></p><div class="com-proy-actions"><input id="pn-${esc(p.id)}" placeholder="Novedad del avance" maxlength="1200"><button class="b o" data-com-proy-note="${esc(p.id)}">Agregar novedad</button><label class="b o">Agregar foto<input type="file" accept="image/*" data-com-proy-photo="${esc(p.id)}" hidden></label><button class="b o" data-com-proy-detail="${esc(p.id)}">Ver historial</button></div><div id="pd-${esc(p.id)}"></div></article>`).join(''):'<div class="fm"><p>Aún no hay proyectos. Créalos desde una solicitud o con el formulario superior.</p></div>'}`;
}
function statsView(){
  const s=DATA['stats-'+STATS_DIAS];
  if(!s){loadStats();return loading()}
  if(s._error)return `<div class="fm"><p role="alert">${esc(s._error)}</p></div>`;
  const r=s.resumen||{},max=Math.max(1,...(s.serie||[]).map(x=>x.total));
  const tarjetas=[['Visitas (periodo)',r.total],['Visitantes únicos',r.unicos],['Hoy',r.hoy],['Últimos 7 días',r.siete],['Últimos 30 días',r.treinta],['Solicitudes',r.solicitudes],['Conversión',(r.conversion||0)+'%']];
  const lista=o=>Object.entries(o||{}).map(([k,v])=>`<li><span>${esc(k)}</span><b>${v}</b></li>`).join('')||'<li><span>Sin datos</span><b>0</b></li>';
  return `<div class="fm"><div class="section-kicker">RENDIMIENTO COMERCIAL</div><h2>Estadísticas</h2>${s.esPrueba?'<p class="com-warning" role="status">Datos de prueba: este entorno no es producción.</p>':''}<p>Período: <select data-com-dias>${[7,30,90].map(d=>`<option value="${d}" ${STATS_DIAS===d?'selected':''}>Últimos ${d} días</option>`).join('')}</select> <button class="b o" data-com-load="stats">Actualizar</button></p><div class="com-stats-grid">${tarjetas.map(([n,v])=>`<div class="com-stat"><b>${v}</b><small>${n}</small></div>`).join('')}</div><h3>Visitas por día</h3><div class="com-chart" role="img" aria-label="Gráfico de visitas por día">${(s.serie||[]).map(x=>`<span style="height:${Math.max(2,Math.round(x.total/max*100))}%" title="${esc(x.dia)}: ${x.total} visitas"></span>`).join('')}</div><p class="com-comp">Actual: <b>${s.comparacion?.actual||0}</b> · Anterior: <b>${s.comparacion?.anterior||0}</b> · Variación: <b>${s.comparacion?.variacion===null?'—':(s.comparacion?.variacion||0)+'%'}</b></p><div class="com-grid2"><div><h3>Acciones comerciales</h3><ul class="com-list">${lista(s.comercial?.porTipo)}</ul></div><div><h3>Secciones populares</h3><ul class="com-list">${(s.top?.secciones||[]).map(x=>`<li><span>${esc(x.clave)}</span><b>${x.total}</b></li>`).join('')||'<li><span>Sin datos</span><b>0</b></li>'}</ul></div><div><h3>CRM</h3><ul class="com-list">${lista(s.crm?.porEstado)}</ul><p>Pendientes: <b>${s.crm?.pendientes||0}</b></p></div><div><h3>Proyectos por estado</h3><ul class="com-list">${lista(s.proyectosEstado)}</ul></div><div><h3>Datos existentes</h3><ul class="com-list"><li><span>Conversaciones de chat</span><b>${s.existentes?.chatConversaciones||0}</b></li><li><span>Reseñas publicadas</span><b>${s.existentes?.resenasPublicadas||0}</b></li><li><span>Cuentas de tienda</span><b>${s.existentes?.cuentasTienda||0}</b></li></ul></div><div><h3>Origen de los datos</h3><ul class="com-list">${lista(s.porEnv)}</ul><small>${esc(s.aviso||'Los eventos se registran sin datos personales y solo después del consentimiento del visitante.')}</small></div></div></div>`;
}
function crmView(){
  const cs=DATA.contactos,meta=DATA.meta;
  if(!cs||!meta){if(!cs)load('contactos');if(!meta)load('meta');return loading()}
  if(cs._error)return `<div class="fm"><p role="alert">${esc(cs._error)}</p></div>`;
  const q=CRM_BUSCAR.toLowerCase(),filtro=CRM_ESTADO;
  const lista=cs.filter(c=>!q||[c.nombre,c.email,c.tel,c.ciudad,c.tipoProyecto].join(' ').toLowerCase().includes(q)).filter(c=>!filtro||c.estado===filtro);
  const sel=cs.find(c=>c.id===CRM_SEL)||lista[0]||null;
  return `<div class="fm"><div class="section-kicker">ADMINISTRACIÓN DE CLIENTES</div><h2>CRM de clientes</h2><p>Los contactos se registran automáticamente cuando hay datos suficientes. Nunca se fusionan solo por nombre.</p><div class="com-toolbar"><input id="crmBuscar" type="search" value="${esc(CRM_BUSCAR)}" placeholder="Buscar por nombre, correo, teléfono o ciudad"><select data-com-crm-filter><option value="">Todos los estados</option>${ESTADOS_CRM.map(e=>`<option ${filtro===e?'selected':''}>${esc(e)}</option>`).join('')}</select><button class="b o" data-com-load="contactos">Actualizar</button><button class="b o" data-com-crm-migrar>${meta.migrado?'Migración ya realizada':'Importar contactos existentes'}</button><button class="b" data-com-crm-new>+ Nuevo cliente</button></div><div class="com-grid2">${lista.length?lista.map(c=>`<article class="com-contact ${sel&&sel.id===c.id?'on':''}"><button data-com-crm-select="${esc(c.id)}"><b>${esc(c.nombre)}</b><small>${esc(c.email||c.tel||'Sin datos de contacto')}</small><span class="com-badge">${esc(c.estado)}</span></button></article>`).join(''):'<p>No hay clientes con este filtro.</p>'}</div></div>
  ${sel?`<div class="fm"><h3>${esc(sel.nombre)}</h3><div class="com-grid2"><label>Nombre<input id="ceNombre" value="${esc(sel.nombre||'')}"></label><label>Teléfono<input id="ceTel" value="${esc(sel.tel||'')}"></label><label>Correo<input id="ceEmail" value="${esc(sel.email||'')}"></label><label>Ciudad / zona<input id="ceCiudad" value="${esc(sel.ciudad||'')}"></label><label>Tipo de proyecto<input id="ceTipo" value="${esc(sel.tipoProyecto||'')}"></label><label>Estado<select id="ceEstado">${ESTADOS_CRM.map(e=>`<option ${sel.estado===e?'selected':''}>${esc(e)}</option>`).join('')}</select></label><label>Valor de la oportunidad<input id="ceValor" type="number" min="0" value="${Number(sel.valorOportunidad||0)}"></label><label>Origen<select id="ceOrigen">${['web','formulario','whatsapp','chat','personalizador','tienda','reseña','otro'].map(o=>`<option ${sel.origen===o?'selected':''}>${o}</option>`).join('')}</select></label></div><div class="com-actions"><button class="b" data-com-crm-save="${esc(sel.id)}">Guardar cliente</button><button class="b o" data-com-crm-delete="${esc(sel.id)}">Eliminar cliente</button></div><div class="com-grid2"><div><h3>Agregar registro</h3><textarea id="cnTexto" rows="3" placeholder="Nota, llamada o recordatorio"></textarea><label>Fecha (recordatorio)<input id="cnFecha" type="date"></label><div class="com-actions"><button class="b o" data-com-crm-nota="${esc(sel.id)}" data-tipo="nota">Agregar nota</button><button class="b o" data-com-crm-nota="${esc(sel.id)}" data-tipo="llamada">Registrar llamada</button><button class="b o" data-com-crm-nota="${esc(sel.id)}" data-tipo="tarea">Programar recordatorio</button></div></div><div><h3>Historial</h3><div class="seg-history">${(sel.historial||[]).slice().reverse().slice(0,40).map(h=>`<p><b>${esc(h.tipo||'')}</b> ${esc(h.detalle||'')} <small>${esc((h.at||'').slice(0,16).replace('T',' '))}</small></p>`).join('')||'<p>Sin historial.</p>'}</div><h3>Recordatorios</h3>${(sel.tareas||[]).filter(t=>!t.hecho).map(t=>`<p>${esc(t.texto)} <small>${esc(t.fecha||'')}</small></p>`).join('')||'<p>Sin recordatorios pendientes.</p>'}<h3>Relaciones</h3><p>Cotizaciones: ${(sel.cotizaciones||[]).length} · Proyectos: ${(sel.proyectos||[]).map(p=>esc(p.codigo||p.id)).join(', ')||'ninguno'}</p></div></div></div>`:''}
  <div class="fm"><h3>Tablero de oportunidades</h3><p>Arrastra una tarjeta a otra columna o usa el selector de cada tarjeta. El historial queda guardado.</p><div class="com-kanban">${ESTADOS_CRM.map(e=>`<div class="com-kanban-col" data-com-kanban="${esc(e)}"><h4>${esc(e)}</h4>${cs.filter(c=>c.estado===e).map(c=>`<article class="com-kanban-card" draggable="true" data-com-drag="${esc(c.id)}"><b>${esc(c.nombre)}</b><small>${esc(c.email||c.tel||'')}</small><select data-com-crm-status="${esc(c.id)}">${ESTADOS_CRM.map(x=>`<option ${c.estado===x?'selected':''}>${esc(x)}</option>`).join('')}</select></article>`).join('')||'<small class="com-dim">Sin clientes</small>'}</div>`).join('')}</div></div>`;
}
function adminComercial(){
  if(COM_TAB==='compersonalizador')return panelShell(configView());
  if(COM_TAB==='comproyectos')return panelShell(proyectosAdmin());
  if(COM_TAB==='comstats')return panelShell(statsView());
  return panelShell(crmView());
}

/* ---------- Acciones públicas ---------- */
function payloadSolicitud(via){
  const c=COM.contacto;
  return {
    accion:'solicitud',origen:via==='chat'?'chat':via==='whatsapp'?'whatsapp':'personalizador',
    nombre:c.nombre,tel:c.tel,email:c.email,ciudad:c.ciudad,
    tipo:TIPOS.find(x=>x[0]===COM.tipo)?.[1]||COM.tipo,modelo:COM.modelo,estilo:COM.estilo,
    puerta:COM.puerta,cajon:COM.cajon,herraje:COM.tirador,material:COM.material,
    medidas:{...COM.medidas},colores:PARTES.flatMap(([p])=>(COM[p]||[]).map(c=>({...validateColor(c),parte:p}))),
    observaciones:COM.obs,crearProyecto:COM.crearProyecto||via==='proyecto',sid:sid(),
    session:(()=>{try{return localStorage.te_chat_session||''}catch(e){return''}})()
  };
}
function mensajeSolicitud(via){
  return `Hola, quiero cotizar un mueble personalizado.\n${resumenCom().replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim()}\nDatos: ${COM.contacto.nombre} · ${COM.contacto.tel||COM.contacto.email}`;
}
function abrirWhatsApp(texto){
  const tel=String(datos().e?.tel||'').split(',')[0].replace(/\D/g,'');const n=tel.length===10?'57'+tel:tel;
  window.open('https://wa.me/'+n+'?text='+encodeURIComponent(texto),'_blank','noopener');
}
async function enviar(via,btn){
  const c=COM.contacto;
  if(c.nombre.trim().length<2)return aviso('Escribe tu nombre completo.','error');
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.email.trim())&&c.tel.replace(/\D/g,'').length<10)return aviso('Deja un teléfono de al menos 10 dígitos o un correo válido.','error');
  btn.disabled=true;aviso('Enviando solicitud…','info');
  const r=await com(payloadSolicitud(via),EC,true);
  if(!r.ok){btn.disabled=false;return aviso(r.e||'No se pudo enviar la solicitud.','error')}
  let msg='✓ Solicitud registrada. Nos pondremos en contacto contigo.';
  if(r.proyecto?.codigo)msg+=' Tu código de seguimiento es '+r.proyecto.codigo+'. Consúltalo en /seguimiento con tu teléfono o correo.';
  aviso(msg,'ok');btn.disabled=false;
  if(via==='whatsapp')abrirWhatsApp(mensajeSolicitud(via));
  if(via==='chat'){
    try{
      let s=localStorage.te_chat_session;if(!s){s='chat-'+Math.random().toString(36).slice(2)+Date.now();localStorage.te_chat_session=s}
      await com({action:'send',name:c.nombre,message:mensajeSolicitud(via),session:s,rules:[]},'/.netlify/functions/chat',true);
    }catch(e){}
  }
}

/* ---------- Acciones de administración ---------- */
async function refrescar(que){delete DATA[que];await load(que,true)}
async function guardarConfig(){
  const l={};document.querySelectorAll('[data-com-config]').forEach(t=>{l[t.dataset.comConfig]=t.value.split('\n').map(x=>x.trim()).filter(Boolean)});
  l.ocultos=[...document.querySelectorAll('[data-com-hidden]:checked')].map(x=>x.dataset.comHidden);
  const r=await com({accion:'configSet',listas:l},EC);
  if(r.ok){delete DATA.config;avisoGlobal('Opciones guardadas.');render()}else avisoGlobal(r.e||'No se pudo guardar.','error');
}
function avisoGlobal(m,tipo='ok'){const e=document.querySelector('#st');if(e)e.textContent=(tipo==='error'?'⚠ ':'✓ ')+m}
async function crearProyectoDesdeSol(id){
  const sol=(DATA.solicitudes||[]).find(s=>s.id===id);if(!sol)return;
  const cs=DATA.contactos||await load('contactos'),c=cs.find(x=>x.id===sol.contactId)||{};
  const d=sol.datos||{};
  const r=await com({accion:'crear',contactId:sol.contactId,cliente:sol.cliente||c.nombre,nombre:d.tipo||'Proyecto a medida',tipo:d.tipo,modelo:d.modelo,medidas:d.medidas,colores:d.colores,observaciones:d.observaciones,email:c.email,tel:c.tel},EP);
  if(r.ok){delete DATA.proyectos;avisoGlobal('Proyecto creado: '+r.proyecto.codigo);render()}else avisoGlobal(r.e||'No se pudo crear.','error');
}
async function verSol(id){
  const box=document.querySelector('#comSolDetail');if(!box)return;
  const s=(DATA.solicitudes||[]).find(x=>x.id===id);if(!s)return;
  const d=s.datos||{};
  box.innerHTML=`<div class="com-detail"><h4>Solicitud ${esc(s.codigo||s.id)}</h4>${resumenComTexto(d)}<p><small>${esc(s.created||'')}</small></p></div>`;
}
function resumenComTexto(d){
  return `<ul class="com-summary-list"><li><b>Tipo:</b> ${esc(d.tipo||'—')}</li><li><b>Modelo:</b> ${esc(d.modelo||'—')}</li><li><b>Medidas:</b> ${esc(JSON.stringify(d.medidas||{}))}</li><li><b>Colores:</b> ${(d.colores||[]).map(c=>esc(c.parte+': '+c.n+' · '+c.s+' · '+c.x+' · '+(c.img||'sin imagen'))).join('<br>')||'—'}</li><li><b>Observaciones:</b> ${esc(d.observaciones||'—')}</li></ul>`;
}
async function proyDetail(id){
  const box=document.querySelector('#pd-'+CSS.escape(id));if(!box)return;
  const ps=DATA.proyectos||[],p=ps.find(x=>x.id===id);if(!p)return;
  box.innerHTML=`<div class="seg-history">${(p.historial||[]).slice().reverse().map(h=>`<p><b>${esc(h.estado||h.tipo||'')}</b> ${esc(h.nota||'')} <small>${esc((h.at||'').slice(0,16).replace('T',' '))}</small></p>`).join('')}</div>${(p.fotos||[]).length?`<div class="seg-photos">${p.fotos.map(f=>`<button data-com-photo="${esc(f.u)}"><img src="${esc(f.u)}" alt="Foto del avance"></button>`).join('')}</div>`:''}`;
}
async function guardarCrm(id){
  const g=s=>document.querySelector(s)?.value||'';
  const contacto={nombre:g('#ceNombre'),tel:g('#ceTel'),email:g('#ceEmail'),ciudad:g('#ceCiudad'),tipoProyecto:g('#ceTipo'),estado:g('#ceEstado'),valorOportunidad:Number(g('#ceValor')||0),origen:g('#ceOrigen')};
  const r=await com({accion:'crmGuardar',id,contacto},EC);
  if(r.ok){delete DATA.contactos;avisoGlobal('Cliente guardado.');render()}else avisoGlobal(r.e||'No se pudo guardar.','error');
}
async function cambiarEstadoCrm(id,estado){
  const r=await com({accion:'crmEstado',id,estado},EC);
  if(r.ok){delete DATA.contactos;render()}else avisoGlobal(r.e||'No se pudo cambiar el estado.','error');
}

/* ---------- Parches sobre app.js ---------- */
const _view=window.view,_admin=window.admin,_render=window.render;
if(typeof _view==='function')window.view=function(p){
  if(p==='personalizador'||p==='configurador')return personalizadorView();
  if(p==='seguimiento')return seguimientoView();
  return _view(p);
};
if(typeof _admin==='function')window.admin=function(){
  try{if(!adm)return _admin()}catch(e){return _admin()}
  if(COM_TAB)return adminComercial();
  const html=_admin();
  return typeof html==='string'
    ? html.replace('<aside aria-label="Secciones del panel">','<aside aria-label="Secciones del panel"><button data-comtab="compersonalizador">Panel comercial</button>')
    : html;
};
function afterRender(){
  const slug=(location.pathname.replace(/^\//,'').replace(/\/+$/,'')||'inicio');
  const ruta=slug==='configurador'?'personalizador':slug;
  if(ruta==='personalizador'||ruta==='seguimiento'){
    const app=document.querySelector('#app');
    if(app)app.innerHTML=ruta==='personalizador'?personalizadorView():seguimientoView();
    const meta=[
      ['personalizador','Personaliza tu mueble | TECNO ESPACIOS','Diseña cocinas, clósets y muebles a medida eligiendo acabados reales del catálogo de TECNO ESPACIOS. Solicita tu cotización.'],
      ['seguimiento','Seguimiento de proyectos | TECNO ESPACIOS','Consulta el avance de tu proyecto de muebles a medida con tu código de seguimiento y teléfono o correo registrado.']
    ].find(x=>x[0]===ruta);
    if(meta){
      document.title=meta[1];
      const md=document.querySelector('meta[name="description"]');if(md)md.content=meta[2];
      const c=document.querySelector('link[rel="canonical"]');if(c)c.href=location.origin+'/'+ruta;
      ['ogTitle','ogDescription','ogUrl'].forEach((id,i)=>{const e=document.getElementById(id);if(e)e.content=i===0?meta[1]:i===1?meta[2]:location.origin+'/'+ruta});
    }
  }
}
if(typeof _render==='function')window.render=function(){_render();afterRender()};

/* ---------- Eventos ---------- */
function slugActual(){return location.pathname.replace(/^\//,'').replace(/\/+$/,'')||'inicio'}
document.addEventListener('click',ev=>{
  const d=ev.target.closest('[data-comtab],[data-com-step],[data-com-type],[data-com-part],[data-com-color],[data-com-zoom],[data-com-cat],[data-com-unassign],[data-com-send],[data-com-clear],[data-com-send2],[data-com-load],[data-com-save-config],[data-com-save-hidden],[data-com-atender],[data-com-sol-proyecto],[data-com-detail-sol],[data-com-proy-create],[data-com-proy-note],[data-com-proy-detail],[data-com-crm-select],[data-com-crm-new],[data-com-crm-save],[data-com-crm-delete],[data-com-crm-nota],[data-com-crm-migrar],[data-com-photo],[data-com-exit],[data-com-ok]');
  if(!d)return;
  const s=d.dataset;
  if('comExit'in s){ev.preventDefault();ev.stopPropagation();COM_TAB='';render();return}
  if('comtab'in s){ev.preventDefault();ev.stopPropagation();COM_TAB=s.comtab;if(!DATA[COM_TAB==='comstats'?'stats-'+STATS_DIAS:COM_TAB==='compersonalizador'?'config':COM_TAB==='comproyectos'?'proyectos':'contactos'])render();else render();return}
  if('comStep'in s){COM.paso=Number(s.comStep);render();return}
  if('comType'in s){COM.tipo=s.comType;COM.modelo='';render();return}
  if('comPart'in s){COM.parte=s.comPart;render();return}
  if('comCat'in s){COM.categoria=s.comCat;const g=document.querySelector('#comColorGrid');if(g)g.innerHTML=colorGrid();return}
  if('comColor'in s){
    const c=coloresCatalogo().find(x=>x.catalogId===s.comColor);if(!c||!colorDisponible(c.catalogId))return;
    const arr=COM[COM.parte]=COM[COM.parte]||[],ix=arr.findIndex(x=>x.catalogId===c.catalogId);
    if(ix>=0)arr.splice(ix,1);else arr.push(validateColor(c));
    render();return;
  }
  if('comUnassign'in s){const [p,k]=s.comUnassign.split('|');COM[p]=(COM[p]||[]).filter(x=>x.catalogId!==k);render();return}
  if('comZoom'in s||'comPhoto'in s){
    const c=coloresCatalogo().find(x=>x.catalogId===s.comZoom),src=s.comPhoto||c?.img||'';if(!src)return;
    const o=document.createElement('div');o.className='card-lightbox com-lightbox';o.setAttribute('aria-label','Imagen ampliada');
    o.innerHTML='<button type="button" aria-label="Cerrar imagen ampliada">×</button><img src="'+esc(src)+'" alt="'+(c?esc('Textura ampliada de '+c.n+' · '+c.s):'Fotografía ampliada del avance')+'">';
    o.onclick=()=>{if(typeof closeOverlay==='function')closeOverlay(o);else o.remove()};
    if(typeof openOverlay==='function')openOverlay(o);else document.body.append(o);
    return;
  }
  if('comSend'in s){enviar(s.comSend,d);return}
  if('comClear'in s){COM.paso=1;COM.mensaje='';render();return}
  if('comLoad'in s){
    const q=s.comLoad;
    if(q==='stats'){delete DATA['stats-'+STATS_DIAS];loadStats()}
    else refrescar(q);
    return;
  }
  if('comSaveConfig'in s){guardarConfig();return}
  if('comSaveHidden'in s){guardarConfig();return}
  if('comAtender'in s){com({accion:'solicitudAtender',id:s.comAtender,atendida:true},EC).then(r=>{if(r.ok){refrescar('solicitudes')}else avisoGlobal(r.e||'Error','error')});return}
  if('comSolProyecto'in s){crearProyectoDesdeSol(s.comSolProyecto);return}
  if('comDetailSol'in s){verSol(s.comDetailSol);return}
  if('comProyCreate'in s){
    const v=id=>document.querySelector(id)?.value.trim()||'';
    const cliente=v('#cpCliente');if(!cliente)return avisoGlobal('Escribe el nombre del cliente.','error');
    com({accion:'crear',cliente,tel:v('#cpVer'),email:/@/.test(v('#cpVer'))?v('#cpVer'):'',tipo:v('#cpTipo'),modelo:v('#cpModelo'),fechaEntrega:v('#cpEntrega'),observaciones:v('#cpObs')},EP).then(r=>{if(r.ok){delete DATA.proyectos;avisoGlobal('Proyecto creado: '+r.proyecto.codigo);render()}else avisoGlobal(r.e||'Error','error')});return;
  }
  if('comProyNote'in s){const t=document.querySelector('#pn-'+CSS.escape(s.comProyNote))?.value.trim();if(!t)return avisoGlobal('Escribe la novedad.','error');com({accion:'nota',id:s.comProyNote,texto:t},EP).then(r=>{if(r.ok){delete DATA.proyectos;render()}else avisoGlobal(r.e||'Error','error')});return}
  if('comProyDetail'in s){proyDetail(s.comProyDetail);return}
  if('comCrmSelect'in s){CRM_SEL=s.comCrmSelect;render();return}
  if('comCrmNew'in s){
    const nombre=prompt('Nombre del nuevo cliente');if(!nombre||nombre.trim().length<2)return;
    com({accion:'crmGuardar',contacto:{nombre:nombre.trim(),estado:'Nuevo interesado',origen:'otro'}},EC).then(r=>{if(r.ok){CRM_SEL=r.contacto.id;delete DATA.contactos;render()}else avisoGlobal(r.e||'Error','error')});return;
  }
  if('comCrmSave'in s){guardarCrm(s.comCrmSave);return}
  if('comCrmDelete'in s){if(confirm('¿Eliminar este cliente del CRM? Esta acción no se puede deshacer.'))com({accion:'crmEliminar',id:s.comCrmDelete},EC).then(r=>{if(r.ok){CRM_SEL='';delete DATA.contactos;render()}else avisoGlobal(r.e||'Error','error')});return}
  if('comCrmNota'in s){const t=document.querySelector('#cnTexto')?.value.trim();if(!t)return avisoGlobal('Escribe el detalle.','error');com({accion:'crmNota',id:s.comCrmNota,tipo:s.tipo,texto:t,fecha:document.querySelector('#cnFecha')?.value||''},EC).then(r=>{if(r.ok){delete DATA.contactos;render()}else avisoGlobal(r.e||'Error','error')});return}
  if('comCrmMigrar'in s){if(confirm('Se importarán contactos existentes de chat, reseñas y tienda sin modificar los originales. ¿Continuar?'))com({accion:'crmMigrar'},EC).then(r=>{if(r.ok){delete DATA.contactos;delete DATA.meta;render();avisoGlobal('Importación terminada.')}else avisoGlobal(r.e||'Error','error')});return}
  if('comOk'in s){const e=document.querySelector('#teConsent');if(e)e.remove();return}
},true);

document.addEventListener('input',ev=>{
  const t=ev.target;
  if(t.dataset?.comField){COM[t.dataset.comField]=t.value;const d=document.querySelector('#comDrawing');if(d)d.innerHTML=vistaSVG();const ds=document.querySelector('#comDrawingSmall');if(ds)ds.innerHTML=vistaSVG();return}
  if(t.dataset?.comMed){COM.medidas[t.dataset.comMed]=t.value;return}
  if(t.dataset?.comObs){COM.obs=t.value;return}
  if(t.dataset?.comContact){COM.contacto[t.dataset.comContact]=t.value;return}
  if(t.dataset&&'comCrear' in t.dataset){COM.crearProyecto=!!t.checked;return}
  if(t.id==='comBuscar'){COM.buscar=t.value;const g=document.querySelector('#comColorGrid');if(g)g.innerHTML=colorGrid();return}
  if(t.id==='crmBuscar'){CRM_BUSCAR=t.value;const g=document.querySelector('.com-contact')?.parentElement;if(g){/* se aplica al volver a renderizar */}return}
  if(t.dataset?.comCrmStatus){cambiarEstadoCrm(t.dataset.comCrmStatus,t.value);return}
});
document.addEventListener('change',async ev=>{
  const t=ev.target;
  if(t.dataset?.comDias){STATS_DIAS=Number(t.value);delete DATA['stats-'+STATS_DIAS];loadStats();return}
  if(t.dataset?.comCrmFilter){CRM_ESTADO=t.value;render();return}
  if(t.dataset?.comProyStatus){
    const r=await com({accion:'estado',id:t.dataset.comProyStatus,estado:t.value},EP);
    if(r.ok){delete DATA.proyectos;render()}else avisoGlobal(r.e||'No se pudo actualizar el estado.','error');return;
  }
  if(t.dataset?.comProyPhoto){
    const f=t.files&&t.files[0];if(!f)return;
    const rd=new Promise(ok=>{const a=new FileReader();a.onload=()=>ok(a.result);a.readAsDataURL(f)});
    const data=await rd;
    const u=await (typeof up==='function'?up(new File([data],f.name,{type:f.type})):Promise.resolve(''));
    if(!u)return avisoGlobal('No se pudo subir la imagen.','error');
    const r=await com({accion:'foto',id:t.dataset.comProyPhoto,url:u},EP);
    if(r.ok){delete DATA.proyectos;render()}else avisoGlobal(r.e||'Error','error');return;
  }
});
document.addEventListener('keydown',ev=>{
  if(ev.target.id==='crmBuscar'&&ev.key==='Enter'){CRM_BUSCAR=ev.target.value;render()}
});
document.addEventListener('dragstart',ev=>{const c=ev.target.closest?.('[data-com-drag]');if(c)ev.dataTransfer.setData('text/plain',c.dataset.comDrag)});
document.addEventListener('dragover',ev=>{if(ev.target.closest?.('[data-com-kanban]'))ev.preventDefault()});
document.addEventListener('drop',ev=>{const z=ev.target.closest?.('[data-com-kanban]');if(!z)return;ev.preventDefault();const id=ev.dataTransfer.getData('text/plain');if(id)cambiarEstadoCrm(id,z.dataset.comKanban)});
document.addEventListener('submit',async ev=>{
  if(ev.target.id!=='segForm')return;
  ev.preventDefault();
  const code=document.querySelector('#segCode')?.value.trim(),ver=document.querySelector('#segVer')?.value.trim(),m=document.querySelector('#segMsg');
  if(!code||!ver){if(m)m.textContent='Escribe el código y tu teléfono o correo.';return}
  if(m)m.textContent='Consultando…';
  const r=await com({accion:'verificar',codigo:code,verificacion:ver},EP,true);
  if(!r.ok){if(m)m.textContent=r.e||'No se pudo consultar.';COM.seg=null;render();const x=document.querySelector('#segMsg');if(x)x.textContent=r.e||'No se pudo consultar.';return}
  COM.seg=r.proyecto;render();track('seccion',{slug:'seguimiento'});
});
addEventListener('hashchange',()=>{if(location.hash!=='#/admin')COM_TAB=''});

/* ---------- Consentimiento y medición ---------- */
function mountConsent(){
  if(consent()||document.querySelector('#teConsent'))return;
  const d=document.createElement('div');d.id='teConsent';d.className='com-consent';d.setAttribute('role','status');
  d.innerHTML='<div><b>Privacidad y estadísticas</b><p>Usamos medidas anónimas para mejorar el sitio. No recopilamos correos ni teléfonos en esas medidas. Puedes elegir solo lo esencial.</p></div><div class="com-consent-actions"><button data-com-ok="on" class="b">Aceptar medidas</button><button data-com-ok="off" class="b o">Solo esencial</button></div>';
  document.body.append(d);
}
document.addEventListener('click',ev=>{
  const b=ev.target.closest('[data-com-ok]');if(!b)return;
  try{localStorage.te_analytics=b.dataset.comOk}catch(e){}
  if(b.dataset.comOk==='on')track('visita',{slug:slugActual()});
  b.closest('#teConsent')?.remove();
},true);
document.addEventListener('click',ev=>{
  const a=ev.target.closest('a[href^="/"]');
  if(!a||a.getAttribute('href')==='#app')return;
  const href=a.getAttribute('href'),slug=href.replace(/^\//,'').split('/')[0]||'inicio';
  if(slug&&slug!=='admin')track('seccion',{slug});
  if(/wa\.me|api\.whatsapp/i.test(a.href))track('whatsapp',{origen:'enlace'});
});
document.addEventListener('click',ev=>{
  const d=ev.target.closest('[data-g],[data-buy],[data-shop-checkout],[data-config-quote]');
  if(!d)return;
  if(d.dataset.g){const i=(datos().items||[]).find(x=>String(x.id)===String(d.dataset.g));if(i)track(i.k==='proyectos'?'proyecto':i.k==='promos'?'promo':'producto',{id:String(i.id),categoria:String(i.c||i.s||'')})}
  else if(d.dataset.buy)track('producto',{id:d.dataset.buy});
  else track('whatsapp',{origen:d.hasAttribute('data-shop-checkout')?'carrito':'personalizador'});
});
document.addEventListener('submit',ev=>{if(ev.target.id==='contactForm')track('contacto',{origen:slugActual()})});

/* ---------- Arranque ---------- */
setTimeout(()=>{
  mountConsent();
  if(slugActual()==='personalizador'||slugActual()==='seguimiento'||location.hash==='#/admin'){
    if(slugActual()==='personalizador'&&!DATA.config)load('config');
  }
  if(consent()==='on')track('visita',{slug:slugActual()});
},900);
})();
