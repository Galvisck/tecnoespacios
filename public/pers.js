/* TECNO ESPACIOS · Personalizador, seguimiento de proyectos y medición anónima (parte pública)
   Usa las funciones globales de app.js (D, E, q, waTo, money) solo cuando se ejecutan. */
(()=>{
const API='/.netlify/functions/publico';
const pub=async b=>{try{const r=await fetch(API,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(b)});const j=await r.json().catch(()=>({}));return{ok:r.ok&&!!j.ok,status:r.status,...j}}catch(e){return{ok:false,e:'Sin conexión. Inténtalo de nuevo.'}}};
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const $=s=>document.querySelector(s);

/* =============== MEDICIÓN ANÓNIMA (solo con consentimiento) =============== */
const TRK={
  on:()=>{try{return localStorage.te_consent==='si'&&navigator.doNotTrack!=='1'&&!sessionStorage.te}catch{return false}},
  send(b){if(!TRK.on())return;try{fetch(API,{method:'POST',keepalive:true,headers:{'content-type':'application/json'},body:JSON.stringify(b)}).catch(()=>{})}catch{}},
  flag(k){const t=new Date().toISOString().slice(0,10);try{if(localStorage[k]===t)return 0;localStorage[k]=t;return 1}catch{return 0}},
  route(){const p=(location.hash.replace('#/','')||location.pathname.replace(/^\//,'').replace(/\/$/,'')||'inicio');return p.split(/[?/]/)[0]||'inicio'},
  page(){
    if(!TRK.on())return;const p=TRK.route();if(p==='admin'||p===TRK.last)return;TRK.last=p;
    const n=localStorage.te_v?0:1;try{localStorage.te_v='1'}catch{}
    TRK.send({a:'evento',t:'view',page:p,u:TRK.flag('te_vd'),n});
  },
  act(act){TRK.send({a:'evento',t:'act',act,ua:TRK.flag('te_ad')})},
  item(kind,id,name){TRK.send({a:'evento',t:'item',kind,id:String(id),name})},
  banner(forzar){
    if(!forzar&&(localStorage.te_consent||sessionStorage.te||$('#cb')))return;
    const old=$('#cb');if(old)old.remove();
    const d=document.createElement('div');d.id='cb';d.className='cb';d.setAttribute('role','dialog');d.setAttribute('aria-label','Medición anónima');
    d.innerHTML=`<p><b>Medición anónima de visitas.</b> Solo contamos visitas y clics para mejorar el sitio. No guardamos tu nombre, IP ni datos personales, y no usamos cookies de seguimiento.</p><div><button class="b sm" data-cb="si" type="button">Aceptar</button><button class="b o sm" data-cb="no" type="button">Rechazar</button></div>`;
    document.body.append(d);
  }
};
document.addEventListener('click',e=>{
  const cb=e.target.closest('[data-cb]');
  if(cb){localStorage.te_consent=cb.dataset.cb;$('#cb')&&$('#cb').remove();TRK.last='';if(cb.dataset.cb==='si')TRK.page();return}
  if(e.target.closest('#consentBtn')){TRK.banner(true);return}
  if(!TRK.on())return;
  if(e.target.closest('a[href*="wa.me"]'))TRK.act('wa');
  if(e.target.closest('a[href="#/contacto"]'))TRK.act('contacto');
  const g=e.target.closest('[data-g]');
  if(g&&typeof D!=='undefined'&&D){const i=D.items.find(x=>x.id==g.dataset.g);if(i&&['proyectos','promos','colores','mesones'].includes(i.k))TRK.item(i.k,i.id,i.n)}
  const sd=e.target.closest('[data-shop-detail]');
  if(sd&&typeof D!=='undefined'&&D){const p=(D.shopProducts||[]).find(x=>String(x.id)===sd.dataset.shopDetail);if(p)TRK.item('shop',p.id,p.name)}
},true);
const _open=window.open;window.open=function(u,...r){try{if(/wa\.me/.test(String(u)))TRK.act('wa')}catch{}return _open.call(window,u,...r)};
addEventListener('hashchange',()=>TRK.page());
addEventListener('DOMContentLoaded',()=>{TRK.banner();TRK.page()});

/* =============== PERSONALIZADOR =============== */
const {tipos:TIPOS,partes:PARTES,modelos:DISENOS,nombres:DISENO_N,conMeson,dibujar}=window.TE_MUEBLES;
const partesTipo=()=>PARTES.filter(([p])=>p!=='superiores'||['cocina','lavadero'].includes(S.tipo));
const DEF={estilos:'Moderno\nClásico\nMinimalista\nRústico\nIndustrial',materiales:'Melamina\nMDF enchapado\nMadera maciza',puertas:'Abatibles\nCorredizas\nSin tirador (push to open)',cajones:'Sin cajones\nCajones estándar\nCajones con cierre suave',tiradores:'Tirador de borde\nTirador de barra\nPomo\nSin tirador',herrajes:'Bisagras estándar\nBisagras de cierre suave\nCorrederas de cierre suave',tarifas:{},diasAlerta:3};
const cfg=()=>({...DEF,...((typeof D!=='undefined'&&D&&D.pz)||{})});
const opts=k=>String(cfg()[k]||'').split('\n').map(l=>l.trim()).filter(Boolean).map(l=>{const [n,p]=l.split('|').map(x=>x.trim());return{n,p:Number(String(p||'').replace(/[^\d.]/g,''))||0}});
const catalogoColores=()=>{
  const publicados=D.items.filter(i=>i.k==='colores');
  return publicados.length?publicados:window.TE_PALETA_REFERENCIA;
};
const colores=()=>catalogoColores().slice().sort((a,b)=>String(a.n).localeCompare(String(b.n),'es',{sensitivity:'base'}));
const mesones=()=>D.items.filter(i=>i.k==='mesones'&&i.disponible!==false).sort((a,b)=>String(a.n).localeCompare(String(b.n),'es',{sensitivity:'base'}));
const imgOf=i=>(i&&i.img&&i.img[0])||'';
const blank=()=>({paso:0,tipo:'',diseno:'',estilo:'',colores:{},parte:'todas',cat:'',material:'',meson:'',buscarColor:'',puertas:'',cajones:'',tiradores:'',herrajes:'',medidas:{ancho:'',alto:'',prof:''},obs:'',descripcion:'',contacto:{nombre:'',telefono:'',correo:'',ciudad:''},enviado:null,aviso:'',err:'',busy:false});
let S;try{S={...blank(),...JSON.parse(sessionStorage.te_pz||'{}')}}catch{S=blank()}
S.busy=false;
const keep=()=>{try{const {busy,err,aviso,...r}=S;sessionStorage.te_pz=JSON.stringify(r)}catch{}};

/* Recorte de 220×220 px del centro de la foto (evita las letras de los bordes) */
const RES=new Map(),PEND=new Map();
const PIX='data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
function crop(src){
  if(!src)return Promise.resolve('');if(PEND.has(src))return PEND.get(src);
  const p=new Promise(res=>{const im=new Image();im.onload=()=>{try{const s=Math.min(220,im.naturalWidth,im.naturalHeight),c=document.createElement('canvas');c.width=c.height=220;c.getContext('2d').drawImage(im,(im.naturalWidth-s)/2,(im.naturalHeight-s)/2,s,s,0,0,220,220);const u=c.toDataURL('image/jpeg',.9);RES.set(src,u);res(u)}catch(e){res('')}};im.onerror=()=>res('');im.src=src});
  PEND.set(src,p);return p;
}
const hydrate=root=>{(root||document).querySelectorAll('img[data-crop]').forEach(im=>{const s=im.dataset.crop;if(RES.has(s)){im.src=RES.get(s);return}crop(s).then(u=>{if(u)im.src=u})})};

/* Validar la selección contra el catálogo vigente */
function validar(){
  const cs=new Set(colores().map(c=>String(c.id))),ms=new Set(mesones().map(c=>String(c.id)));let quitado=0;
  for(const p of Object.keys(S.colores))if(!cs.has(String(S.colores[p]))){delete S.colores[p];quitado++}
  if(S.meson&&(!conMeson(S.tipo)||!ms.has(String(S.meson)))){S.meson='';quitado++}
  if(S.parte!=='todas'&&!partesTipo().some(([p])=>p===S.parte))S.parte='todas';
  if(S.diseno&&!DISENOS[S.tipo]?.some(([id])=>id===S.diseno))S.diseno='';
  for(const [k,l] of [['estilo','estilos'],['material','materiales'],['puertas','puertas'],['cajones','cajones'],['tiradores','tiradores'],['herrajes','herrajes']]){const o=opts(l);if(S[k]&&o.length&&!o.some(x=>x.n===S[k])){S[k]='';quitado++}}
  if(quitado)S.aviso='Quitamos de tu selección '+(quitado==1?'una opción que ya no está disponible':quitado+' opciones que ya no están disponibles')+'. Elige otra si lo deseas.';
}
const grupos=()=>[['material','Material','materiales'],['puertas','Tipo de puertas','puertas'],['cajones','Cajones','cajones'],['tiradores','Tiradores','tiradores'],['herrajes','Herrajes','herrajes']].filter(g=>opts(g[2]).length);
const pasos=()=>{const s=[['tipo','Tipo'],['diseno','Diseño']];if(opts('estilos').length)s.push(['estilo','Estilo']);s.push(['color','Colores']);if(grupos().length)s.push(['mat','Materiales']);s.push(['med','Medidas'],['res','Resumen']);return s};
const tipoN=t=>(TIPOS.find(x=>x[0]===t)||[])[1]||'';
const medOk=v=>v===''||(Number(String(v).replace(',','.'))>0);
const medN=v=>Number(String(v||'').replace(',','.'))||0;

function estimar(){
  const t=Number((cfg().tarifas||{})[S.tipo])||0,a=medN(S.medidas.ancho),h=medN(S.medidas.alto);
  if(!(t>0)||!(a>0)||!(h>0))return null;
  let v=t*(a*h/10000);
  for(const [k,l] of [['estilo','estilos'],['material','materiales'],['puertas','puertas'],['cajones','cajones'],['tiradores','tiradores'],['herrajes','herrajes']]){const o=opts(l).find(x=>x.n===S[k]);if(o)v+=o.p}
  return Math.round(v);
}
const colorDe=id=>id?catalogoColores().find(x=>String(x.id)===String(id)):undefined;
const mesonDe=id=>D.items.find(x=>x.k==='mesones'&&x.disponible!==false&&String(x.id)===String(id));
const lineaColor=c=>{
  const ref=[c?.s,c?.ref?'ref. '+c.ref:''].filter(Boolean).join(' · ');
  return c?c.n+(ref?' ('+ref+')':''):'';
};
const hex=(value,fallback)=>/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value||'')?value:fallback;
const textura=src=>{
  if(!src)return '';
  try{const u=new URL(src,location.href);return ['http:','https:'].includes(u.protocol)?u.href:''}
  catch{return ''}
};

/* ---------- Vista previa (SVG) ---------- */
function svg(){
  const id=S.diseno||DISENOS[S.tipo]?.[0]?.[0];
  if(!id)return '<p class="pz-prev-empty">Elige un tipo de mueble para ver la vista previa.</p>';
  const acabados={};
  let definiciones='';
  const muestras=partesTipo().map(([p])=>[p,colorDe(S.colores[p])]);
  if(conMeson(S.tipo))muestras.push(['meson',mesonDe(S.meson)]);
  for(const [parte,item] of muestras){
    if(!item)continue;
    const src=imgOf(item),imagen=RES.get(src)||textura(src);
    const fondo=hex(item.x,parte==='meson'?'#cfc9c0':'#d9d3ca');
    acabados[parte]=fondo;
    if(imagen){
      acabados[parte]='url(#pz-textura-'+parte+')';
      definiciones+=`<pattern id="pz-textura-${parte}" patternUnits="userSpaceOnUse" width="128" height="128">
        <rect width="128" height="128" fill="${fondo}"/><image href="${esc(imagen)}" width="128" height="128" preserveAspectRatio="xMidYMid slice"/>
      </pattern>`;
    }
  }
  return dibujar(id,{acabados,definiciones,tiradores:!/^sin tirador/i.test(S.tiradores||''),
    etiqueta:'Vista previa de '+DISENO_N[id]});
}
async function crops(){
  const srcs=[...partesTipo().map(([p])=>imgOf(colorDe(S.colores[p]))),imgOf(mesonDe(S.meson))].filter(Boolean);
  const nuevos=srcs.filter(s=>!RES.has(s));if(!nuevos.length)return;
  await Promise.all(nuevos.map(crop));side();
}
function side(){
  const el=$('#pz-side');if(!el)return;
  const e=estimar(),m=S.medidas,med=[m.ancho,m.alto,m.prof].some(Boolean)?`${m.ancho||'—'} × ${m.alto||'—'} × ${m.prof||'—'} cm`:'';
  const chips=[S.diseno?DISENO_N[S.diseno]:tipoN(S.tipo),mesonDe(S.meson)?.n,med].filter(Boolean).map(x=>`<span>${esc(x)}</span>`).join('');
  el.innerHTML=`<h3>Vista previa</h3><div class="pz-prev">${svg()}</div>${chips?`<div class="pz-chips">${chips}</div>`:''}<p class="pz-est">${e!=null?`<b>Valor estimado referencial: ${money(e)}</b><small>Se confirma en la cotización.</small>`:'<b>Valor sujeto a cotización</b>'}</p>`;
}

/* ---------- Pasos ---------- */
const opt=(k,v,sel)=>`<button type="button" class="pz-opt${sel?' on':''}" data-pz="opt" data-k="${k}" data-v="${esc(v)}">${esc(v)}</button>`;
function pasoDiseno(){
 const lista=DISENOS[S.tipo]||[];
 return `<p class="pz-help">Escoge el modelo que más se parece a lo que buscas. Cada tarjeta muestra una ilustración del mueble; después podrás personalizarlo.</p><div class="pz-disenos">${lista.map(([id,n,d])=>`<button type="button" class="pz-diseno${S.diseno===id?' on':''}" data-pz="diseno" data-v="${id}" aria-pressed="${S.diseno===id}"><span class="pz-diseno-art">${dibujar(id)}</span><span class="pz-diseno-copy"><b>${n}</b><small>${d}</small></span><i>${S.diseno===id?'✓ Seleccionado':'Elegir diseño'}</i></button>`).join('')}</div>`;
}
function selectorMeson(){
  if(!conMeson(S.tipo))return '';
  const lista=mesones(),m=mesonDe(S.meson);
  return `<div class="pz-meson-combina">
    ${m?`<img class="pz-tex" src="${esc(imgOf(m)||PIX)}" alt="" style="background:${hex(m.x,'#ddd7ce')}">`:''}
    <label>Acabado del mesón<select id="pz-meson" ${lista.length?'':'disabled'}>
      <option value="">${lista.length?'Sin acabado seleccionado':'No hay mesones disponibles'}</option>
      ${lista.map(c=>`<option value="${esc(c.id)}" ${String(S.meson)===String(c.id)?'selected':''}>${esc(lineaColor(c))}</option>`).join('')}
    </select></label></div>`;
}
function pasoColor(){
  const all=colores(),selector=selectorMeson();
  const muestra=all[0]?.referencia===true;
  const cats=[...new Set(all.map(c=>c.s||'Otros'))].sort((a,b)=>a.localeCompare(b,'es'));
  const partes=[['todas','Todas las partes'],...partesTipo()];
  const sw=p=>{const c=colorDe(S.colores[p]);return c?`<i style="background:${hex(c.x,'#ccc')}"></i>`:''};
  return `${selector}<p class="pz-help">${muestra?'Estás usando colores de referencia. El equipo confirma el acabado al cotizar.':'Elige una parte y aplica un color para combinarlo con los demás acabados.'}</p>
  <div class="pz-parts" role="group" aria-label="Parte del mueble">${partes.map(([k,l])=>`<button type="button" class="${S.parte===k?'on':''}" data-pz="parte" data-v="${k}" aria-pressed="${S.parte===k}">${k==='todas'?'':sw(k)}${l}</button>`).join('')}</div>
  <div class="pz-cats"><button type="button" class="${S.cat?'':'on'}" data-pz="cat" data-v="">Todos <i>${all.length}</i></button>${cats.map(c=>`<button type="button" class="${S.cat===c?'on':''}" data-pz="cat" data-v="${esc(c)}">${esc(c)} <i>${all.filter(x=>(x.s||'Otros')===c).length}</i></button>`).join('')}</div>
  <input id="pz-q" class="pz-q" type="search" placeholder="Buscar color…" aria-label="Buscar color" value="${esc(S.buscarColor)}"><div class="pz-grid" id="pz-colors">${gridColores(S.buscarColor)}</div>`;
}
function gridColores(q=''){
  const s=q.trim().toLowerCase(),l=colores().filter(c=>(!S.cat||(c.s||'Otros')===S.cat)&&(!s||[c.n,c.s,c.ref].join(' ').toLowerCase().includes(s)));
  const act=S.parte==='todas'?null:S.colores[S.parte];
  return l.map(c=>{const usos=partesTipo().filter(([p])=>String(S.colores[p])===String(c.id)).map(([,n])=>n),on=act!=null&&String(act)===String(c.id)||(S.parte==='todas'&&usos.length===partesTipo().length);
    return `<article class="pz-card${on?' on':''}"><button type="button" class="pz-pick" data-pz="color" data-id="${esc(c.id)}" aria-label="Elegir ${esc(c.n)}" aria-pressed="${on}"><img class="pz-tex" data-crop="${esc(imgOf(c))}" src="${RES.get(imgOf(c))||PIX}" alt="" style="background:${esc(c.x||'#ddd')}"><b>${esc(c.n)}</b><small>${esc([c.ref,c.s].filter(Boolean).join(' · '))}</small></button><button type="button" class="pz-zbtn" data-pz="zoom" data-id="${c.id}" aria-label="Ampliar ${esc(c.n)}">🔍</button>${usos.length?`<span class="pz-uso">${esc(usos.length>2?usos.length+' partes':usos.join(', '))}</span>`:''}</article>`}).join('')||'<p class="pz-vacio">Sin resultados.</p>';
}
function pasoMat(){
  let h='';
  for(const [k,l] of grupos().map(g=>[g[0],g[1]])){const o=opts(grupos().find(g=>g[0]===k)[2]);h+=`<div class="pz-grp"><h4>${l}</h4><div class="pz-opts">${o.map(x=>opt(k,x.n,S[k]===x.n)).join('')}</div></div>`}
  return h||'<p class="pz-vacio">No hay opciones adicionales por elegir.</p>';
}
const inp=(l,p,v,x='')=>`<label>${l}<input data-pz-in="${p}" value="${esc(v)}" ${x}></label>`;
function pasoMed(){
  const m=S.medidas;
  return `<div class="pz-med">${inp('Ancho (cm)','medidas.ancho',m.ancho,'inputmode="decimal" placeholder="Ej. 300"')}${inp('Alto (cm)','medidas.alto',m.alto,'inputmode="decimal" placeholder="Ej. 240"')}${inp('Profundidad (cm)','medidas.prof',m.prof,'inputmode="decimal" placeholder="Ej. 60"')}</div>
  ${S.tipo==='personalizado'?`<label>¿Qué mueble necesitas?<input data-pz-in="descripcion" maxlength="300" value="${esc(S.descripcion)}" placeholder="Ej. Centro de entretenimiento"></label>`:''}
  <label>Observaciones y necesidades especiales<textarea data-pz-in="obs" rows="4" maxlength="1200" placeholder="Ej. Espacio para horno, tomas eléctricas, nevera de 80 cm…">${esc(S.obs)}</textarea></label>`;
}
function filas(){
  const dn=(DISENOS[S.tipo]||[]).find(x=>x[0]===S.diseno);const f=[['Mueble',tipoN(S.tipo)+(S.descripcion?' — '+S.descripcion:'')],['Diseño',dn?dn[1]:''],['Estilo',S.estilo],['Material',S.material],['Puertas',S.puertas],['Cajones',S.cajones],['Tiradores',S.tiradores],['Herrajes',S.herrajes]];
  const m=mesonDe(S.meson);if(m)f.splice(2,0,['Mesón',lineaColor(m)]);
  const me=S.medidas;if([me.ancho,me.alto,me.prof].some(Boolean))f.push(['Medidas',`${me.ancho||'—'} × ${me.alto||'—'} × ${me.prof||'—'} cm (ancho × alto × profundidad)`]);
  if(S.obs)f.push(['Observaciones',S.obs]);
  return f.filter(x=>x[1]);
}
function pasoRes(){
  if(S.enviado)return pasoOk();
  const c=S.contacto,cp=partesTipo().map(([p,l])=>[l,colorDe(S.colores[p])]).filter(x=>x[1]);
  return `<div class="pz-res"><dl>${filas().map(([k,v])=>`<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
  ${cp.length?`<h4>Colores elegidos</h4><div class="pz-rescol">${cp.map(([l,x])=>`<div><img class="pz-tex" data-crop="${esc(imgOf(x))}" src="${RES.get(imgOf(x))||PIX}" alt="" style="background:${esc(x.x||'#ddd')}"><span><b>${l}</b>${esc(x.n)}<small>${esc([x.ref,x.s].filter(Boolean).join(' · '))}</small></span></div>`).join('')}</div>`:''}
  <p class="pz-est">${estimar()!=null?`<b>Valor estimado referencial: ${money(estimar())}</b><small>Se confirma en la cotización.</small>`:'<b>Valor sujeto a cotización</b>'}</p>
  <h4>Tus datos de contacto</h4><div class="pz-med pz-contact">${inp('Nombre completo','contacto.nombre',c.nombre,'autocomplete="name" maxlength="90"')}${inp('Teléfono o WhatsApp','contacto.telefono',c.telefono,'type="tel" autocomplete="tel" maxlength="30"')}${inp('Ciudad o zona','contacto.ciudad',c.ciudad,'autocomplete="address-level2" maxlength="80"')}${inp('Correo (opcional)','contacto.correo',c.correo,'type="email" autocomplete="email" maxlength="120"')}</div>
  <input class="hp" id="pz-hp" tabindex="-1" autocomplete="off" aria-hidden="true">
  <p id="pz-err" class="pz-err" role="alert">${esc(S.err)}</p>
  <div class="pz-send"><button class="b" data-pz="enviar" data-canal="cotizacion" type="button" ${S.busy?'disabled':''}>Solicitar cotización</button><button class="b o" data-pz="enviar" data-canal="whatsapp" type="button" ${S.busy?'disabled':''}>Enviar por WhatsApp</button><button class="b o" data-pz="enviar" data-canal="chat" type="button" ${S.busy?'disabled':''}>Enviar al chat</button><button class="b o" data-pz="enviar" data-canal="guardada" type="button" ${S.busy?'disabled':''}>Guardar como solicitud</button></div></div>`;
}
function pasoOk(){
  const e=S.enviado;
  return `<div class="pz-ok"><div class="pz-check">✓</div><h3>¡Recibimos tu diseño!</h3><p>Tu código de solicitud es <b class="pz-code">${esc(e.codigo)}</b>. Nuestro equipo la revisará y te contactará.</p>
  <div class="pz-send">${e.canal!=='whatsapp'?`<a class="b o" data-i="wa" target="_blank" rel="noopener" href="${waTo(resumenTxt(e.codigo))}">Enviar también por WhatsApp</a>`:`<a class="b o" target="_blank" rel="noopener" href="${waTo(resumenTxt(e.codigo))}">Abrir WhatsApp</a>`}<button class="b o" data-pz="nuevo" type="button">Hacer otro diseño</button><button class="b o" data-pz="editar" type="button">Modificar este diseño</button></div></div>`;
}
function resumenTxt(cod){
  const l=['Hola, quiero cotizar este diseño de TECNO ESPACIOS'+(cod?' (solicitud '+cod+')':'')+':'];
  filas().forEach(([k,v])=>l.push('• '+k+': '+v));
  const cp=partesTipo().map(([p,n])=>[n,colorDe(S.colores[p])]).filter(x=>x[1]);if(cp.length)l.push('• Colores: '+cp.map(([n,c])=>n+': '+lineaColor(c)).join('; '));
  l.push('Soy '+S.contacto.nombre+' · Tel. '+S.contacto.telefono+(S.contacto.ciudad?' · '+S.contacto.ciudad:''));
  return l.join('\n');
}

/* ---------- Pintado ---------- */
function paint(){
  const root=$('#pz-root');if(!root)return;
  const foco=root.contains(document.activeElement)?document.activeElement:null;
  const pasosScroll=root.querySelector('.pz-steps')?.scrollLeft||0;
  validar();const ps=pasos();if(S.paso>=ps.length)S.paso=ps.length-1;if(S.paso<0)S.paso=0;
  const id=ps[S.paso][0];let body='';
  if(id==='tipo')body=`<h3>¿Qué mueble quieres diseñar?</h3><div class="pz-tipos">${TIPOS.map(([k,n,ic])=>`<button type="button" class="pz-tipo${S.tipo===k?' on':''}" data-pz="tipo" data-v="${k}" aria-pressed="${S.tipo===k}"><span>${ic}</span><b>${n}</b></button>`).join('')}</div>`;
  if(id==='diseno')body=`<h3>Elige un diseño de referencia</h3>${pasoDiseno()}`;
  if(id==='estilo')body=`<h3>Elige un estilo</h3><div class="pz-opts">${opts('estilos').map(x=>opt('estilo',x.n,S.estilo===x.n)).join('')}</div>`;
  if(id==='color')body=`<h3>Colores y acabados</h3>${pasoColor()}`;
  if(id==='mat')body=`<h3>Materiales, puertas y herrajes</h3>${pasoMat()}`;
  if(id==='med')body=`<h3>Medidas y observaciones</h3>${pasoMed()}`;
  if(id==='res')body=`<h3>${S.enviado?'Solicitud enviada':'Revisa tu diseño'}</h3>${pasoRes()}`;
  const ultimo=S.paso===ps.length-1;
  root.innerHTML=`<div class="pz-wrap" data-etapa="${id}"><div class="pz-main"><ol class="pz-steps">${ps.map(([k,n],i)=>`<li class="${i===S.paso?'on':i<S.paso?'done':''}"><button type="button" data-pz="ir" data-v="${i}" ${i>S.paso&&(!S.tipo||(ps.some((x,j)=>x[0]==='diseno'&&j<i)&&!S.diseno))?'disabled':''}><i>${i<S.paso?'✓':i+1}</i><span>${n}</span></button></li>`).join('')}</ol>
  ${S.aviso?`<p class="pz-aviso" role="status">${esc(S.aviso)}</p>`:''}<div class="pz-body">${body}</div>
  ${!S.enviado?`<div class="pz-nav">${S.paso>0?'<button class="b o" data-pz="atras" type="button">Atrás</button>':'<span></span>'}${!ultimo?`<button class="b" data-pz="sig" type="button" ${id==='tipo'&&!S.tipo?'disabled':''}>Siguiente</button>`:''}</div>`:''}</div><aside class="pz-side" id="pz-side"></aside></div>`;
  side();hydrate(root);crops();keep();
  root.querySelector('.pz-steps').scrollLeft=pasosScroll;
  if(foco?.id)document.getElementById(foco.id)?.focus({preventScroll:true});
  else if(foco?.dataset.pz){
    const {pz,v,id,k}=foco.dataset;
    const nuevo=[...root.querySelectorAll('[data-pz]')].find(b=>b.dataset.pz===pz&&b.dataset.v===v&&b.dataset.id===id&&b.dataset.k===k);
    nuevo?.focus({preventScroll:true});
  }
}
const set=(p,v)=>{const a=p.split('.'),l=a.pop();a.reduce((o,k)=>o[k],S)[l]=v};

document.addEventListener('input',e=>{
  const t=e.target;
  if(t.dataset&&t.dataset.pzIn){set(t.dataset.pzIn,t.value);keep();if(t.dataset.pzIn.startsWith('medidas'))side()}
  else if(t.id==='pz-q'){S.buscarColor=t.value;keep();const g=$('#pz-colors');if(g){g.innerHTML=gridColores(t.value);hydrate(g)}}
});
document.addEventListener('change',e=>{
  if(e.target.id!=='pz-meson')return;
  S.meson=e.target.value;S.aviso='';paint();
});
function zoom(c){
  const u=RES.get(imgOf(c));const o=document.createElement('div');o.className='pz-zoom';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');
  const parte=S.parte==='todas'?'todas las partes':partesTipo().find(([p])=>p===S.parte)[1].toLowerCase();
  o.innerHTML=`<div class="pz-zbox"><button class="pz-zx" type="button" data-pz="zclose" aria-label="Cerrar">×</button><img src="${u||PIX}" alt="${esc(c.n)}" data-crop="${esc(imgOf(c))}" style="background:${esc(c.x||'#ddd')}"><h4>${esc(c.n)}</h4><p>${esc([c.ref?'Ref. '+c.ref:'',c.s].filter(Boolean).join(' · '))}</p><button class="b" type="button" data-pz="usezoom" data-id="${c.id}">Usar en ${parte}</button></div>`;
  o.onclick=ev=>{if(ev.target===o)o.remove()};document.body.append(o);hydrate(o);
}
const aplicar=id=>{if(S.parte==='todas')partesTipo().forEach(([p])=>S.colores[p]=id);else S.colores[S.parte]=id;S.aviso=''};

document.addEventListener('click',async e=>{
  const b=e.target.closest('[data-pz]');if(!b)return;const a=b.dataset.pz,v=b.dataset.v,ps=pasos();
  if(a==='zclose'){document.querySelector('.pz-zoom')&&document.querySelector('.pz-zoom').remove();return}
  if(a==='usezoom'){aplicar(b.dataset.id);document.querySelector('.pz-zoom')&&document.querySelector('.pz-zoom').remove();paint();return}
  if(a==='zoom'){const c=colorDe(b.dataset.id);if(c)zoom(c);return}
  if(a==='tipo'&&v!==S.tipo){
    S.tipo=v;S.diseno='';S.aviso='';delete S.colores.superiores;paint();
  }
  else if(a==='diseno'){S.diseno=v;S.aviso='';paint()}
  else if(a==='opt'){S[b.dataset.k]=S[b.dataset.k]===b.dataset.v?'':b.dataset.v;S.aviso='';paint()}
  else if(a==='parte'){S.parte=v;paint()}
  else if(a==='cat'){S.cat=v;paint()}
  else if(a==='color'){aplicar(b.dataset.id);paint()}
  else if(a==='ir'){S.paso=+v;S.aviso='';paint();scrollTo({top:$('#pz-root').offsetTop-70,behavior:'smooth'})}
  else if(a==='sig'){
    const id=ps[S.paso][0];
    if(id==='tipo'&&!S.tipo){S.aviso='Selecciona el tipo de mueble.';paint();return}
    if(id==='diseno'&&!S.diseno){S.aviso='Selecciona uno de los diseños de referencia.';paint();return}
    if(id==='med'&&!['ancho','alto','prof'].every(k=>medOk(S.medidas[k]))){S.aviso='Revisa las medidas: usa solo números mayores que cero.';paint();return}
    S.paso++;S.aviso='';paint();scrollTo({top:$('#pz-root').offsetTop-70,behavior:'smooth'})}
  else if(a==='atras'){S.paso--;S.aviso='';paint();scrollTo({top:$('#pz-root').offsetTop-70,behavior:'smooth'})}
  else if(a==='nuevo'){S=blank();keep();paint()}
  else if(a==='editar'){S.enviado=null;S.paso=0;paint()}
  else if(a==='enviar')await enviar(b.dataset.canal);
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){const z=document.querySelector('.pz-zoom');if(z)z.remove()}});

async function enviar(canal){
  const c=S.contacto,err=m=>{S.err=m;const el=$('#pz-err');if(el)el.textContent=m};
  if(S.busy)return;
  if((c.nombre||'').trim().length<2)return err('Escribe tu nombre completo.');
  if(String(c.telefono||'').replace(/\D/g,'').length<7)return err('Escribe un teléfono válido (mínimo 7 dígitos).');
  if(c.correo&&!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.correo))return err('El correo no es válido.');
  if(!S.tipo)return err('Elige el tipo de mueble.');
  if(!['ancho','alto','prof'].every(k=>medOk(S.medidas[k])))return err('Revisa las medidas.');
  S.err='';S.busy=true;paint();
  let w=null;if(canal==='whatsapp'){try{w=_open.call(window,'','_blank')}catch{}}
  const r=await pub({a:'solicitud',canal,hp:($('#pz-hp')||{}).value||'',contacto:c,sel:{tipo:S.tipo,diseno:S.diseno,estilo:S.estilo,colores:S.colores,material:S.material,meson:S.meson,puertas:S.puertas,cajones:S.cajones,tiradores:S.tiradores,herrajes:S.herrajes,medidas:S.medidas,obs:S.obs,descripcion:S.descripcion}});
  S.busy=false;
  if(!r.ok){if(w)w.close();S.err=r.e||'No se pudo enviar. Inténtalo de nuevo o escríbenos por WhatsApp.';if(r.status===409){await syncTick();validar();S.aviso=r.e;S.err=''}paint();return}
  S.enviado={codigo:r.codigo,canal};TRK.act('pers');TRK.act('cotiz');
  if(canal==='whatsapp'){const url=waTo(resumenTxt(r.codigo));TRK.act('wa');if(w)w.location=url}
  if(canal==='chat'){
    try{
      let ses=localStorage.te_chat_session;if(!ses){ses='chat-'+Math.random().toString(36).slice(2)+Date.now();localStorage.te_chat_session=ses}
      await fetch('/.netlify/functions/chat',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:'send',name:c.nombre.trim().slice(0,80),phone:c.telefono,message:resumenTxt(r.codigo).slice(0,990),session:ses,rules:[]})});
      localStorage.te_chat_last=Date.now();const bx=$('#chatBox');if(bx&&bx.hidden)$('#chatLaunch').click();
    }catch{}
  }
  keep();paint();
}

const PZ={
  view:()=>`<section class="pz"><h2>Personaliza tu mueble</h2><p class="big">Elige el mueble, los colores y las medidas. Revisamos tu diseño y te enviamos la cotización.</p><div id="pz-root"></div></section>`,
  paint,cfg,DEF,reset:()=>{S=blank();try{sessionStorage.removeItem('te_pz')}catch{};const root=$('#pz-root');if(root)root.innerHTML=''}
};

/* =============== SEGUIMIENTO DE PROYECTOS =============== */
const SG_S={cod:'',dato:'',res:null,err:'',busy:false};
const fd=d=>d?new Date(String(d).length>10?d:d+'T12:00:00').toLocaleDateString('es-CO',{day:'numeric',month:'long',year:'numeric'}):'';
function sgPaint(){
  const root=$('#sg-root');if(!root)return;const p=SG_S.res;
  const form=`<form class="fm sg-form" id="sgForm" autocomplete="off"><label>Código del proyecto<input id="sgCod" value="${esc(SG_S.cod)}" maxlength="20" placeholder="Ej. TE-7K3QX9" autocapitalize="characters" required></label><label>Teléfono o correo registrado<input id="sgDato" value="${esc(SG_S.dato)}" maxlength="120" placeholder="El que nos diste al contratar" required></label><button class="b" type="submit" ${SG_S.busy?'disabled':''}>${SG_S.busy?'Consultando…':'Consultar'}</button><p class="pz-err" role="alert">${esc(SG_S.err)}</p></form>`;
  if(!p){root.innerHTML=form;return}
  const idx=p.estado;
  root.innerHTML=`<div class="sg-head"><div><small>${esc(p.codigo)}</small><h3>${esc(p.nombre)}</h3><span>${esc(p.tipo||'')}</span></div><button class="b o sm" id="sgOtro" type="button">Consultar otro</button></div>
  <ol class="sg-line">${p.estados.map((n,i)=>`<li class="${i<idx?'done':i===idx?'now':''}"><i>${i<idx?'✓':i+1}</i><span>${esc(n)}</span></li>`).join('')}</ol>
  <div class="sg-cards"><div><small>Estado actual</small><b>${esc(p.estados[idx])}</b></div><div><small>Fecha de inicio</small><b>${fd(p.inicio)||'—'}</b></div><div><small>Entrega estimada</small><b>${fd(p.entrega)||'Por confirmar'}</b></div></div>
  ${p.novedad?`<div class="sg-nov"><small>Novedades</small><p>${esc(p.novedad)}</p></div>`:''}
  ${p.fotos.length?`<h4>Fotografías del avance</h4><div class="sg-fotos">${p.fotos.map(f=>`<figure><img loading="lazy" src="${esc(f.url)}" alt="Avance del proyecto" data-sgz="${esc(f.url)}"><figcaption>${fd(f.at)}${f.nota?' · '+esc(f.nota):''}</figcaption></figure>`).join('')}</div>`:''}
  <h4>Historial</h4><ul class="sg-hist">${p.historial.slice().reverse().map(h=>`<li><time>${fd(h.at)}</time><b>${esc(p.estados[h.estado]||'')}</b>${h.texto?`<p>${esc(h.texto)}</p>`:''}</li>`).join('')||'<li>Aún no hay novedades.</li>'}</ul>`;
}
document.addEventListener('submit',async e=>{
  if(e.target.id!=='sgForm')return;e.preventDefault();
  SG_S.cod=$('#sgCod').value.trim().toUpperCase();SG_S.dato=$('#sgDato').value.trim();SG_S.err='';SG_S.busy=true;sgPaint();
  const r=await pub({a:'seguimiento',codigo:SG_S.cod,dato:SG_S.dato});SG_S.busy=false;
  if(r.ok){SG_S.res=r.proyecto;SG_S.dato=''}else SG_S.err=r.e||'No se pudo consultar.';sgPaint();
});
document.addEventListener('click',e=>{
  if(e.target.id==='sgOtro'){SG_S.res=null;SG_S.cod='';sgPaint();return}
  const z=e.target.closest('[data-sgz]');if(z){const o=document.createElement('div');o.className='pz-zoom';o.innerHTML=`<div class="pz-zbox sg-zbox"><button class="pz-zx" type="button" data-pz="zclose" aria-label="Cerrar">×</button><img src="${z.dataset.sgz}" alt="Avance"></div>`;o.onclick=ev=>{if(ev.target===o)o.remove()};document.body.append(o)}
});
const SG={view:()=>`<section class="pz"><div class="section-kicker">SEGUIMIENTO</div><h2>Consulta el avance de tu proyecto</h2><p class="big">Ingresa tu código y el teléfono o correo con el que te registramos.</p><div id="sg-root"></div></section>`,paint:sgPaint};

window.TRK=TRK;window.PZ=PZ;window.SG=SG;window.NU={pub,esc,crop,fd};
window.NEGAFTER=p=>{if(p==='personalizador')PZ.paint();else if(p==='seguimiento')SG.paint()};
})();
