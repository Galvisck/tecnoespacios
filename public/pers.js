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
const TIPOS=[['cocina','Cocina integral','🍳'],['closet','Clóset','🚪'],['bano','Mueble de baño','🛁'],['entretenimiento','Centro de entretenimiento','📺'],['personalizado','Muebles personalizados','✏️']];
const DISENOS={
 cocina:[['cocina-lineal','Cocina lineal','Distribución recta: muebles altos y bajos en una sola pared.','▰'],['cocina-l','Cocina en L','Aprovecha dos paredes y libera el centro del espacio.','⌞'],['cocina-isla','Cocina con isla','Muebles perimetrales y una isla central multifuncional.','▦']],
 closet:[['closet-corredizo','Clóset corredizo','Frente limpio con puertas deslizables y distribución interior.','▥'],['closet-abatible','Clóset abatible','Puertas tradicionales, cajonera y entrepaños accesibles.','▤'],['closet-vestier','Vestier abierto','Distribución abierta con módulos, repisas y cajones.','▦']],
 bano:[['bano-flotante','Mueble flotante','Diseño suspendido con cajones y lavamanos superior.','▱'],['bano-doble','Lavamanos doble','Mueble amplio con dos zonas de almacenamiento.','▤'],['bano-torre','Mueble con torre','Vanity compacto acompañado de torre lateral.','▥']],
 entretenimiento:[['tv-panel','Panel para TV','Panel central para televisor con repisas laterales.','▣'],['tv-modular','Centro modular','Módulos bajos y superiores para equipos y decoración.','▤'],['tv-flotante','Mueble flotante','Diseño suspendido con panel decorativo y cajones.','▱']],
 personalizado:[['personalizado-base','Diseño a medida','Partimos de una idea libre y la adaptamos a tu espacio.','✎'],['personalizado-almacenaje','Mueble de almacenamiento','Prioriza puertas, cajones y entrepaños según tu necesidad.','▤'],['personalizado-decorativo','Mueble decorativo','Combina paneles, nichos y repisas a tu gusto.','▦']]
};
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
const pasos=()=>{const s=[['tipo','Tipo'],['diseno','Diseño']];if(opts('estilos').length)s.push(['estilo','Estilo']);s.push(['color','Colores']);if(grupos().length||hasMeson())s.push(['mat','Materiales']);s.push(['med','Medidas'],['res','Resumen']);return s};
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
function ilustracionDiseno(id){
 const wood='#b88b5e',wood2='#d4b18a',dark='#51463d',light='#eee9e1',top='#f7f5f0',line='#786b5d';
 const rect=(x,y,w,h,fill=wood,rx=2)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${line}" stroke-width="1.4"/>`;
 const knob=(x,y)=>`<circle cx="${x}" cy="${y}" r="2" fill="#eee8dc" stroke="#6b5b4b" stroke-width=".8"/>`;
 const door=(x,y,w,h,fill=wood2)=>rect(x,y,w,h,fill,1);
 const drawer=(x,y,w,h)=>rect(x,y,w,h,'#c69b70',1)+`<path d="M${x+w/2-5} ${y+h/2}h10" stroke="#5e5145" stroke-width="2" stroke-linecap="round"/>`;
 const wall=`<rect width="240" height="150" fill="#f2eee8"/><path d="M0 130H240" stroke="#d3c9bc" stroke-width="2"/>`;
 let a=wall;
 switch(id){
 case 'cocina-lineal':
   a+=rect(18,66,204,12,top)+rect(20,78,200,38,wood)+door(23,81,42,32)+door(68,81,42,32)+rect(113,81,47,32,'#e2d8c9')+door(163,81,53,32);
   a+=rect(20,33,200,30,light)+door(24,36,58,24)+door(85,36,58,24)+door(146,36,70,24);
   a+=rect(119,84,33,4,'#9aa6a8')+rect(128,89,14,20,'#9aa6a8')+knob(61,96)+knob(106,96)+knob(177,96);
   a+=`<path d="M18 65H222" stroke="#a69b8e" stroke-width="2"/>`;break;
 case 'cocina-l':
   a+=rect(24,66,190,12,top)+rect(24,78,190,39,wood)+door(28,81,42,32)+door(73,81,42,32)+door(118,81,42,32)+door(163,81,47,32);
   a+=rect(24,35,190,27,light)+door(28,38,55,20)+door(86,38,55,20)+door(144,38,66,20);
   a+=rect(24,78,48,39,wood)+rect(18,67,12,50,top)+rect(18,78,12,39,wood);
   a+=knob(62,97)+knob(107,97)+knob(152,97)+knob(197,97);break;
 case 'cocina-isla':
   a+=rect(13,42,214,10,top)+rect(16,52,208,34,wood)+door(20,55,46,28)+door(70,55,46,28)+door(120,55,46,28)+door(170,55,50,28);
   a+=rect(62,96,116,10,top)+rect(66,106,108,26,wood)+door(70,109,45,20)+door(119,109,49,20)+knob(91,119)+knob(143,119);
   a+=rect(80,30,32,10,'#c5c0b7')+rect(84,19,24,11,'#aab3b4');break;
 case 'closet-corredizo':
   a+=rect(27,16,186,112,'#8b6a4c')+rect(34,22,172,100,'#e1d0ba');
   a+=rect(36,24,82,96,'#c7a27a')+rect(122,24,82,96,'#b78b60');
   a+=`<path d="M119 23V121M121 23V121" stroke="#6e5844" stroke-width="2"/>`+rect(108,66,4,16,'#eee8df',2)+rect(126,66,4,16,'#eee8df',2);
   a+=rect(42,30,70,5,'#eee5d9')+rect(128,30,70,5,'#eee5d9');break;
 case 'closet-abatible':
   a+=rect(27,16,186,112,'#8b6a4c')+door(34,22,54,100,'#d3b18b')+door(91,22,54,100,'#c39a6d')+door(148,22,58,100,'#d3b18b');
   a+=knob(79,73)+knob(99,73)+knob(136,73)+knob(156,73);break;
 case 'closet-vestier':
   a+=rect(25,16,190,112,'#a17b56')+rect(32,23,176,98,'#f0e8dc');
   a+=rect(35,25,52,4,dark)+rect(35,29,4,89,wood)+rect(83,29,4,89,wood);
   a+=rect(94,25,108,4,dark)+rect(94,29,4,89,wood)+rect(198,29,4,89,wood);
   a+=rect(39,48,43,4,wood)+rect(98,54,96,4,wood)+drawer(39,91,43,24)+drawer(98,91,96,24);
   a+=`<path d="M43 34h34m-27 0v12m12-12v12m45-12h80" stroke="#8b7762" stroke-width="2"/>`;break;
 case 'bano-flotante':
   a+=rect(39,43,162,12,top)+rect(43,55,154,54,wood)+door(48,60,46,44)+door(98,60,46,44)+door(148,60,44,44);
   a+=`<ellipse cx="120" cy="48" rx="29" ry="5" fill="#fff" stroke="#aaa" stroke-width="1.5"/><path d="M120 43v-9m-7 0h14" stroke="#aaa" stroke-width="2"/>`;
   a+=drawer(53,73,35,14)+drawer(103,73,35,14)+drawer(153,73,34,14);break;
 case 'bano-doble':
   a+=rect(20,44,200,12,top)+rect(24,56,192,55,wood)+door(29,61,42,44)+door(77,61,42,44)+door(125,61,42,44)+door(173,61,38,44);
   a+=`<ellipse cx="73" cy="47" rx="22" ry="5" fill="#fff" stroke="#aaa"/><ellipse cx="166" cy="47" rx="22" ry="5" fill="#fff" stroke="#aaa"/><path d="M73 41v-9m-5 0h10M166 41v-9m-5 0h10" stroke="#aaa" stroke-width="2"/>`;break;
 case 'bano-torre':
   a+=rect(26,52,144,12,top)+rect(30,64,136,47,wood)+door(35,68,39,38)+door(77,68,40,38)+door(120,68,41,38);
   a+=rect(179,18,38,93,'#a67b52')+door(184,23,28,25,'#d7bd9d')+door(184,51,28,25,'#d7bd9d')+door(184,79,28,27,'#d7bd9d');
   a+=`<ellipse cx="99" cy="56" rx="25" ry="5" fill="#fff" stroke="#aaa"/>`;break;
 case 'tv-panel':
   a+=rect(49,13,142,101,'#b88b5e')+rect(70,23,100,61,'#252a30')+rect(74,27,92,53,'#343b42');
   a+=rect(21,100,198,10,top)+rect(26,110,188,22,wood)+door(31,113,57,16)+door(91,113,57,16)+door(152,113,57,16);
   a+=rect(20,28,34,64,light)+rect(186,28,34,64,light)+`<path d="M26 38h22M26 47h22M192 38h22M192 47h22" stroke="#b18b65" stroke-width="3"/>`;break;
 case 'tv-modular':
   a+=rect(21,22,198,9,top)+rect(25,31,190,31,wood)+door(30,35,55,23)+door(91,35,58,23)+door(155,35,55,23);
   a+=rect(15,83,210,10,top)+rect(20,93,200,37,wood)+door(25,98,57,27)+door(88,98,60,27)+door(154,98,61,27);
   a+=rect(85,67,70,9,light)+rect(91,76,58,7,'#d4c2aa');break;
 case 'tv-flotante':
   a+=rect(58,12,124,88,'#b88b5e')+rect(77,22,86,54,'#242a30')+rect(81,26,78,46,'#41484e');
   a+=rect(30,103,180,9,top)+rect(35,112,170,18,wood)+door(41,115,48,12)+door(96,115,48,12)+door(151,115,48,12);
   a+=`<path d="M45 132v3m150-3v3" stroke="#b3a99e" stroke-width="2"/>`;break;
 default:
   a+=rect(35,30,170,85,wood)+door(42,36,48,73)+door(94,36,52,73)+door(150,36,48,73);
 }
 return `<svg viewBox="0 0 240 150" role="img" aria-label="Vista ilustrativa de ${id}" xmlns="http://www.w3.org/2000/svg">${a}</svg>`;
}
function pasoDiseno(){
 const lista=DISENOS[S.tipo]||[];
 return `<p class="pz-help">Escoge el modelo que más se parece a lo que buscas. Cada tarjeta muestra una ilustración del mueble; después podrás personalizarlo.</p><div class="pz-disenos">${lista.map(([id,n,d])=>`<button type="button" class="pz-diseno${S.diseno===id?' on':''}" data-pz="diseno" data-v="${id}"><span class="pz-diseno-art">${ilustracionDiseno(id)}</span><span class="pz-diseno-copy"><b>${n}</b><small>${d}</small></span><i>${S.diseno===id?'✓ Seleccionado':'Elegir diseño'}</i></button>`).join('')}</div>`;
}
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
  const dn=(DISENOS[S.tipo]||[]).find(x=>x[0]===S.diseno);const f=[['Mueble',tipoN(S.tipo)+(S.descripcion?' — '+S.descripcion:'')],['Diseño',dn?dn[1]:''],['Estilo',S.estilo],['Material',S.material],['Puertas',S.puertas],['Cajones',S.cajones],['Tiradores',S.tiradores],['Herrajes',S.herrajes]];
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
  if(id==='diseno')body=`<h3>Elige un diseño de referencia</h3>${pasoDiseno()}`;
  if(id==='estilo')body=`<h3>Elige un estilo</h3><div class="pz-opts">${opts('estilos').map(x=>opt('estilo',x.n,S.estilo===x.n)).join('')}</div>`;
  if(id==='color')body=`<h3>Colores y acabados</h3>${pasoColor()}`;
  if(id==='mat')body=`<h3>Materiales, puertas y herrajes</h3>${pasoMat()}`;
  if(id==='med')body=`<h3>Medidas y observaciones</h3>${pasoMed()}`;
  if(id==='res')body=`<h3>${S.enviado?'Solicitud enviada':'Revisa tu diseño'}</h3>${pasoRes()}`;
  const ultimo=S.paso===ps.length-1;
  root.innerHTML=`<div class="pz-wrap"><div class="pz-main"><ol class="pz-steps">${ps.map(([k,n],i)=>`<li class="${i===S.paso?'on':i<S.paso?'done':''}"><button type="button" data-pz="ir" data-v="${i}" ${i>S.paso&&(!S.tipo||(ps.some((x,j)=>x[0]==='diseno'&&j<i)&&!S.diseno))?'disabled':''}><i>${i<S.paso?'✓':i+1}</i><span>${n}</span></button></li>`).join('')}</ol>
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
  if(a==='tipo'){S.tipo=v;S.diseno='';S.aviso='';paint()}
  else if(a==='diseno'){S.diseno=v;S.aviso='';paint()}
  else if(a==='opt'){S[b.dataset.k]=S[b.dataset.k]===b.dataset.v?'':b.dataset.v;S.aviso='';paint()}
  else if(a==='parte'){S.parte=v;paint()}
  else if(a==='cat'){S.cat=v;paint()}
  else if(a==='color'){aplicar(b.dataset.id);paint()}
  else if(a==='meson'){S.meson=b.dataset.id;paint()}
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
  view:()=>`<section class="pz"><div class="section-kicker">DISEÑA · PERSONALIZA · COTIZA</div><h2>Personaliza tu mueble</h2><p class="big">Elige el mueble, los colores y las medidas. Revisamos tu diseño y te enviamos la cotización.</p><div class="pz-benefits"><span>✦ Diseña a tu gusto</span><span>▦ Explora acabados</span><span>✓ Solicita tu cotización</span></div><div id="pz-root"></div></section>`,
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
