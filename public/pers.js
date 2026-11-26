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
const PARTES=[['puertas','Puertas'],['estructura','Estructura'],['cajones','Cajones'],['laterales','Laterales'],['divisiones','Divisiones']];
const TIPOS=[['cocina','Cocina integral','🍳'],['closet','Closet','🚪'],['bano','Mueble de baño','🛁'],['personalizado','Muebles personalizados','✏️']];
const DEF={estilos:'Moderno\nClásico\nMinimalista\nRústico\nIndustrial',materiales:'Melamina\nMDF enchapado\nMadera maciza',puertas:'Abatibles\nCorredizas\nSin tirador (push to open)',cajones:'Sin cajones\nCajones estándar\nCajones con cierre suave',tiradores:'Tirador de borde\nTirador de barra\nPomo\nSin tirador',herrajes:'Bisagras estándar\nBisagras de cierre suave\nCorrederas de cierre suave',tarifas:{},diasAlerta:3};
const cfg=()=>({...DEF,...((typeof D!=='undefined'&&D&&D.pz)||{})});
const opts=k=>String(cfg()[k]||'').split('\n').map(l=>l.trim()).filter(Boolean).map(l=>{const [n,p]=l.split('|').map(x=>x.trim());return{n,p:Number(String(p||'').replace(/[^\d.]/g,''))||0}});
const colores=()=>D.items.filter(i=>i.k==='colores').sort((a,b)=>String(a.n).localeCompare(String(b.n),'es',{sensitivity:'base'}));
const mesones=()=>D.items.filter(i=>i.k==='mesones').sort((a,b)=>String(a.n).localeCompare(String(b.n),'es',{sensitivity:'base'}));
const imgOf=i=>(i&&i.img&&i.img[0])||'';
const blank=()=>({paso:0,tipo:'',estilo:'',colores:{},parte:'todas',cat:'',material:'',meson:'',puertas:'',cajones:'',tiradores:'',herrajes:'',medidas:{ancho:'',alto:'',prof:''},obs:'',descripcion:'',contacto:{nombre:'',telefono:'',correo:'',ciudad:''},enviado:null,aviso:'',err:'',busy:false});
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
  if(S.meson&&!ms.has(String(S.meson))){S.meson='';quitado++}
  for(const [k,l] of [['estilo','estilos'],['material','materiales'],['puertas','puertas'],['cajones','cajones'],['tiradores','tiradores'],['herrajes','herrajes']]){const o=opts(l);if(S[k]&&o.length&&!o.some(x=>x.n===S[k])){S[k]='';quitado++}}
  if(quitado)S.aviso='Quitamos de tu selección '+(quitado==1?'una opción que ya no está disponible':quitado+' opciones que ya no están disponibles')+'. Elige otra si lo deseas.';
}
const hasMeson=()=>S.tipo!=='closet'&&mesones().length>0;
const grupos=()=>[['material','Material','materiales'],['puertas','Tipo de puertas','puertas'],['cajones','Cajones','cajones'],['tiradores','Tiradores','tiradores'],['herrajes','Herrajes','herrajes']].filter(g=>opts(g[2]).length);
const pasos=()=>{const s=[['tipo','Tipo']];if(opts('estilos').length)s.push(['estilo','Estilo']);s.push(['color','Colores']);if(grupos().length||hasMeson())s.push(['mat','Materiales']);s.push(['med','Medidas'],['res','Resumen']);return s};
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
const colorDe=id=>D.items.find(x=>x.k==='colores'&&String(x.id)===String(id));
const mesonDe=id=>D.items.find(x=>x.k==='mesones'&&String(x.id)===String(id));
const lineaColor=c=>c?(c.n+' ('+[c.s,c.ref?'ref. '+c.ref:''].filter(Boolean).join(' · ')+')'):'';

/* ---------- Vista previa (SVG) ---------- */
function svg(){
  const F={};
  for(const [p] of PARTES){const c=colorDe(S.colores[p]);if(!c)continue;F[p]=RES.get(imgOf(c))?`url(#pt-${p})`:(c.x||'#d9d3ca')}
  const m=mesonDe(S.meson);if(m)F.meson=RES.get(imgOf(m))?'url(#pt-meson)':'#cfc9c0';
  const f=p=>F[p]||'#ddd7ce',st='stroke="rgba(30,20,10,.3)" stroke-width="1.5"',hasH=!/^sin tirador/i.test(S.tiradores||'')&&S.tiradores!=='Sin tirador (push to open)';
  const R=(x,y,w,h,p)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f(p)}" ${st}/>`;
  const hd=(x,y,w,h)=>hasH?`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.5" fill="#f6f3ec" stroke="rgba(0,0,0,.4)" stroke-width=".8"/>`:'';
  let g='<rect width="560" height="360" fill="#efebe4"/><rect y="326" width="560" height="34" fill="#d8d1c6"/>';
  const closet=(x,y,w,h)=>{const cw=Math.round((w-24)/3);let o=R(x,y,w,h,'estructura');
    o+=R(x+8,y+6,cw,h-18,'puertas')+R(x+w-8-cw,y+6,cw,h-18,'puertas');
    const cx=x+8+cw+2,cwid=w-16-2*cw-4;o+=R(cx,y+6,cwid,h-18,'estructura');
    for(let i=1;i<=3;i++)o+=R(cx+2,y+6+i*Math.round((h-90)/4),cwid-4,6,'divisiones');
    o+=R(cx,y+6,4,h-18,'divisiones')+R(cx+cwid-4,y+6,4,h-18,'divisiones');
    o+=R(cx+2,y+h-72,cwid-4,28,'cajones')+R(cx+2,y+h-42,cwid-4,28,'cajones');
    o+=hd(cx+cwid/2-12,y+h-62,24,3)+hd(cx+cwid/2-12,y+h-32,24,3);
    o+=hd(x+8+cw-9,y+h/2-20,3,40)+hd(x+w-8-cw+6,y+h/2-20,3,40);
    o+=R(x,y,8,h,'laterales')+R(x+w-8,y,8,h,'laterales')+R(x,y+h,w,8,'estructura');return o};
  if(S.tipo==='cocina'){
    g+=R(40,28,480,112,'estructura');
    [[48,108],[160,108],[404,108]].forEach(([x,w])=>{g+=R(x,34,w,100,'puertas')+hd(x+w/2-14,124,28,3)});
    g+=R(272,34,128,100,'estructura')+R(272,62,128,6,'divisiones')+R(272,96,128,6,'divisiones')+R(334,34,6,100,'divisiones');
    g+=R(40,28,8,112,'laterales')+R(512,28,8,112,'laterales');
    g+=`<rect x="34" y="168" width="492" height="14" fill="${f('meson')}" ${st}/>`;
    g+=R(40,182,480,130,'estructura');
    [48,204,360].forEach(x=>{g+=R(x,188,148,42,'cajones')+hd(x+62,206,24,3)+R(x,234,148,72,'puertas')+hd(x+62,240,24,3)});
    g+=R(40,182,8,130,'laterales')+R(512,182,8,130,'laterales')+R(40,312,480,10,'estructura');
  }else if(S.tipo==='bano'){
    g+=`<rect x="170" y="28" width="220" height="120" rx="4" fill="#dfe7ea" ${st}/><ellipse cx="280" cy="188" rx="52" ry="9" fill="#f2f2f0" stroke="rgba(0,0,0,.25)"/><rect x="276" y="150" width="8" height="30" fill="#b9bdbf"/>`;
    g+=`<rect x="116" y="192" width="328" height="14" fill="${f('meson')}" ${st}/>`+R(126,206,308,108,'estructura');
    [134,284].forEach(x=>{g+=R(x,212,142,40,'cajones')+hd(x+59,228,24,3)+R(x,256,142,52,'puertas')+hd(x+59,262,24,3)});
    g+=R(277,212,6,96,'divisiones')+R(126,206,8,108,'laterales')+R(426,206,8,108,'laterales')+R(126,314,308,8,'estructura');
  }else if(S.tipo==='closet'){g+=closet(110,22,340,298)}
  else if(S.tipo==='personalizado'){g+=closet(130,70,300,250)}
  else g+=`<text x="280" y="180" text-anchor="middle" fill="#8a8176" font-size="16" font-family="sans-serif">Elige un tipo de mueble para ver tu diseño</text>`;
  let defs='';
  for(const [p] of [...PARTES,['meson']]){const s=p==='meson'?imgOf(mesonDe(S.meson)):imgOf(colorDe(S.colores[p])),u=RES.get(s);if(u)defs+=`<pattern id="pt-${p}" patternUnits="userSpaceOnUse" width="110" height="110"><image href="${u}" width="110" height="110"/></pattern>`}
  return `<svg viewBox="0 0 560 360" role="img" aria-label="Vista previa de tu mueble"><defs>${defs}</defs>${g}</svg>`;
}
async function crops(){
  const srcs=[...PARTES.map(([p])=>imgOf(colorDe(S.colores[p]))),imgOf(mesonDe(S.meson))].filter(Boolean);
  const nuevos=srcs.filter(s=>!RES.has(s));if(!nuevos.length)return;
  await Promise.all(nuevos.map(crop));side();
}
function side(){
  const el=$('#pz-side');if(!el)return;
  const e=estimar(),m=S.medidas,med=[m.ancho,m.alto,m.prof].some(Boolean)?`${m.ancho||'—'} × ${m.alto||'—'} × ${m.prof||'—'} cm`:'';
  const chips=[S.tipo&&tipoN(S.tipo),S.estilo,med].filter(Boolean).map(x=>`<span>${esc(x)}</span>`).join('');
  el.innerHTML=`<div class="pz-prev">${svg()}</div>${chips?`<div class="pz-chips">${chips}</div>`:''}<p class="pz-est">${e!=null?`<b>Valor estimado referencial: ${money(e)}</b><small>Se confirma en la cotización.</small>`:'<b>Valor sujeto a cotización</b>'}</p>`;
}

/* ---------- Pasos ---------- */
const opt=(k,v,sel)=>`<button type="button" class="pz-opt${sel?' on':''}" data-pz="opt" data-k="${k}" data-v="${esc(v)}">${esc(v)}</button>`;
function pasoColor(){
  const all=colores();
  if(!all.length)return '<p class="pz-vacio">Aún no hay colores publicados en el catálogo.</p>';
  const cats=[...new Set(all.map(c=>c.s||'Otros'))].sort((a,b)=>a.localeCompare(b,'es'));
  const partes=[['todas','Todas las partes'],...PARTES];
  const sw=p=>{const c=colorDe(S.colores[p]);return c?`<i style="background:${esc(c.x||'#ccc')}"></i>`:''};
  return `<div class="pz-parts" role="tablist">${partes.map(([k,l])=>`<button type="button" class="${S.parte===k?'on':''}" data-pz="parte" data-v="${k}">${k==='todas'?'':sw(k)}${l}</button>`).join('')}</div>
  <div class="pz-cats"><button type="button" class="${S.cat?'':'on'}" data-pz="cat" data-v="">Todos <i>${all.length}</i></button>${cats.map(c=>`<button type="button" class="${S.cat===c?'on':''}" data-pz="cat" data-v="${esc(c)}">${esc(c)} <i>${all.filter(x=>(x.s||'Otros')===c).length}</i></button>`).join('')}</div>
  <input id="pz-q" class="pz-q" type="search" placeholder="Buscar color…" aria-label="Buscar color"><div class="pz-grid" id="pz-colors">${gridColores()}</div>`;
}
function gridColores(q=''){
  const s=q.trim().toLowerCase(),l=colores().filter(c=>(!S.cat||(c.s||'Otros')===S.cat)&&(!s||[c.n,c.s,c.ref].join(' ').toLowerCase().includes(s)));
  const act=S.parte==='todas'?null:S.colores[S.parte];
  return l.map(c=>{const usos=PARTES.filter(([p])=>String(S.colores[p])===String(c.id)).map(([,n])=>n),on=act!=null&&String(act)===String(c.id)||(S.parte==='todas'&&usos.length===PARTES.length);
    return `<article class="pz-card${on?' on':''}"><button type="button" class="pz-pick" data-pz="color" data-id="${c.id}" aria-label="Elegir ${esc(c.n)}"><img class="pz-tex" data-crop="${esc(imgOf(c))}" src="${RES.get(imgOf(c))||PIX}" alt="" style="background:${esc(c.x||'#ddd')}"><b>${esc(c.n)}</b><small>${esc([c.ref,c.s].filter(Boolean).join(' · '))}</small></button><button type="button" class="pz-zbtn" data-pz="zoom" data-id="${c.id}" aria-label="Ampliar ${esc(c.n)}">🔍</button>${usos.length?`<span class="pz-uso">${esc(usos.length>2?usos.length+' partes':usos.join(', '))}</span>`:''}</article>`}).join('')||'<p class="pz-vacio">Sin resultados.</p>';
}
function pasoMat(){
  let h='';
  for(const [k,l] of grupos().map(g=>[g[0],g[1]])){const o=opts(grupos().find(g=>g[0]===k)[2]);h+=`<div class="pz-grp"><h4>${l}</h4><div class="pz-opts">${o.map(x=>opt(k,x.n,S[k]===x.n)).join('')}</div></div>`}
  if(hasMeson()){h+=`<div class="pz-grp"><h4>Mesón</h4><div class="pz-grid pz-grid-s"><article class="pz-card${S.meson?'':' on'}"><button type="button" class="pz-pick" data-pz="meson" data-id=""><span class="pz-tex pz-none">Sin mesón</span><b>Ninguno</b></button></article>${mesones().map(c=>`<article class="pz-card${String(S.meson)===String(c.id)?' on':''}"><button type="button" class="pz-pick" data-pz="meson" data-id="${c.id}"><img class="pz-tex" data-crop="${esc(imgOf(c))}" src="${RES.get(imgOf(c))||PIX}" alt="" style="background:${esc(c.x||'#ddd')}"><b>${esc(c.n)}</b><small>${esc([c.ref,c.s].filter(Boolean).join(' · '))}</small></button></article>`).join('')}</div></div>`}
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
  const f=[['Mueble',tipoN(S.tipo)+(S.descripcion?' — '+S.descripcion:'')],['Estilo',S.estilo],['Material',S.material],['Puertas',S.puertas],['Cajones',S.cajones],['Tiradores',S.tiradores],['Herrajes',S.herrajes]];
  const m=mesonDe(S.meson);if(m)f.splice(2,0,['Mesón',lineaColor(m)]);
  const me=S.medidas;if([me.ancho,me.alto,me.prof].some(Boolean))f.push(['Medidas',`${me.ancho||'—'} × ${me.alto||'—'} × ${me.prof||'—'} cm (ancho × alto × profundidad)`]);
  if(S.obs)f.push(['Observaciones',S.obs]);
  return f.filter(x=>x[1]);
}
function pasoRes(){
  if(S.enviado)return pasoOk();
  const c=S.contacto,cp=PARTES.map(([p,l])=>[l,colorDe(S.colores[p])]).filter(x=>x[1]);
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
  const cp=PARTES.map(([p,n])=>[n,colorDe(S.colores[p])]).filter(x=>x[1]);if(cp.length)l.push('• Colores: '+cp.map(([n,c])=>n+': '+lineaColor(c)).join('; '));
  l.push('Soy '+S.contacto.nombre+' · Tel. '+S.contacto.telefono+(S.contacto.ciudad?' · '+S.contacto.ciudad:''));
  return l.join('\n');
}

/* ---------- Pintado ---------- */
function paint(){
  const root=$('#pz-root');if(!root)return;
  validar();const ps=pasos();if(S.paso>=ps.length)S.paso=ps.length-1;if(S.paso<0)S.paso=0;
  const id=ps[S.paso][0];let body='';
  if(id==='tipo')body=`<h3>¿Qué mueble quieres diseñar?</h3><div class="pz-tipos">${TIPOS.map(([k,n,ic])=>`<button type="button" class="pz-tipo${S.tipo===k?' on':''}" data-pz="tipo" data-v="${k}"><span>${ic}</span><b>${n}</b></button>`).join('')}</div>`;
  if(id==='estilo')body=`<h3>Elige un estilo</h3><div class="pz-opts">${opts('estilos').map(x=>opt('estilo',x.n,S.estilo===x.n)).join('')}</div>`;
  if(id==='color')body=`<h3>Colores y acabados</h3>${pasoColor()}`;
  if(id==='mat')body=`<h3>Materiales, puertas y herrajes</h3>${pasoMat()}`;
  if(id==='med')body=`<h3>Medidas y observaciones</h3>${pasoMed()}`;
  if(id==='res')body=`<h3>${S.enviado?'Solicitud enviada':'Revisa tu diseño'}</h3>${pasoRes()}`;
  const ultimo=S.paso===ps.length-1;
  root.innerHTML=`<div class="pz-wrap"><div class="pz-main"><ol class="pz-steps">${ps.map(([k,n],i)=>`<li class="${i===S.paso?'on':i<S.paso?'done':''}"><button type="button" data-pz="ir" data-v="${i}" ${i>S.paso&&!S.tipo?'disabled':''}><i>${i<S.paso?'✓':i+1}</i><span>${n}</span></button></li>`).join('')}</ol>
  ${S.aviso?`<p class="pz-aviso" role="status">${esc(S.aviso)}</p>`:''}<div class="pz-body">${body}</div>
  ${!S.enviado?`<div class="pz-nav">${S.paso>0?'<button class="b o" data-pz="atras" type="button">Atrás</button>':'<span></span>'}${!ultimo?`<button class="b" data-pz="sig" type="button" ${id==='tipo'&&!S.tipo?'disabled':''}>Siguiente</button>`:''}</div>`:''}</div><aside class="pz-side" id="pz-side"></aside></div>`;
  side();hydrate(root);crops();keep();
}
const set=(p,v)=>{const a=p.split('.'),l=a.pop();a.reduce((o,k)=>o[k],S)[l]=v};

document.addEventListener('input',e=>{
  const t=e.target;
  if(t.dataset&&t.dataset.pzIn){set(t.dataset.pzIn,t.value);keep();if(t.dataset.pzIn.startsWith('medidas'))side()}
  else if(t.id==='pz-q'){const g=$('#pz-colors');if(g){g.innerHTML=gridColores(t.value);hydrate(g)}}
});
function zoom(c){
  const u=RES.get(imgOf(c));const o=document.createElement('div');o.className='pz-zoom';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');
  const parte=S.parte==='todas'?'todas las partes':(PARTES.find(x=>x[0]===S.parte)||[])[1].toLowerCase();
  o.innerHTML=`<div class="pz-zbox"><button class="pz-zx" type="button" data-pz="zclose" aria-label="Cerrar">×</button><img src="${u||PIX}" alt="${esc(c.n)}" data-crop="${esc(imgOf(c))}" style="background:${esc(c.x||'#ddd')}"><h4>${esc(c.n)}</h4><p>${esc([c.ref?'Ref. '+c.ref:'',c.s].filter(Boolean).join(' · '))}</p><button class="b" type="button" data-pz="usezoom" data-id="${c.id}">Usar en ${parte}</button></div>`;
  o.onclick=ev=>{if(ev.target===o)o.remove()};document.body.append(o);hydrate(o);
}
const aplicar=id=>{if(S.parte==='todas')PARTES.forEach(([p])=>S.colores[p]=id);else S.colores[S.parte]=id;S.aviso=''};

document.addEventListener('click',async e=>{
  const b=e.target.closest('[data-pz]');if(!b)return;const a=b.dataset.pz,v=b.dataset.v,ps=pasos();
  if(a==='zclose'){document.querySelector('.pz-zoom')&&document.querySelector('.pz-zoom').remove();return}
  if(a==='usezoom'){aplicar(b.dataset.id);document.querySelector('.pz-zoom')&&document.querySelector('.pz-zoom').remove();paint();return}
  if(a==='zoom'){const c=colorDe(b.dataset.id);if(c)zoom(c);return}
  if(a==='tipo'){S.tipo=v;S.aviso='';paint()}
  else if(a==='opt'){S[b.dataset.k]=S[b.dataset.k]===b.dataset.v?'':b.dataset.v;S.aviso='';paint()}
  else if(a==='parte'){S.parte=v;paint()}
  else if(a==='cat'){S.cat=v;paint()}
  else if(a==='color'){aplicar(b.dataset.id);paint()}
  else if(a==='meson'){S.meson=b.dataset.id;paint()}
  else if(a==='ir'){S.paso=+v;S.aviso='';paint();scrollTo({top:$('#pz-root').offsetTop-70,behavior:'smooth'})}
  else if(a==='sig'){
    const id=ps[S.paso][0];
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
  const r=await pub({a:'solicitud',canal,hp:($('#pz-hp')||{}).value||'',contacto:c,sel:{tipo:S.tipo,estilo:S.estilo,colores:S.colores,material:S.material,meson:S.meson,puertas:S.puertas,cajones:S.cajones,tiradores:S.tiradores,herrajes:S.herrajes,medidas:S.medidas,obs:S.obs,descripcion:S.descripcion}});
  S.busy=false;
  if(!r.ok){if(w)w.close();S.err=r.e||'No se pudo enviar. Inténtalo de nuevo o escríbenos por WhatsApp.';if(r.status===409){validar();S.aviso=S.err;S.err=''}paint();return}
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
  view:()=>`<section class="pz"><div class="section-kicker">DISEÑA · PERSONALIZA · COTIZA</div><h2>Personaliza tu mueble</h2><p class="big">Elige el mueble, los colores y las medidas. Revisamos tu diseño y te enviamos la cotización.</p><div id="pz-root"></div></section>`,
  paint,cfg,DEF
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
