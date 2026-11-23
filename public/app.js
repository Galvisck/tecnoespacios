const q=s=>document.querySelector(s),E=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const P=[['inicio','Inicio'],['proyectos','Proyectos'],['herrajes','Herrajes'],['electro','Electrodomésticos'],['mesones','Mesones'],['colores','Colores'],['promos','Promociones'],['contacto','Contacto']];
const FN=['Poppins','Montserrat','Playfair Display','Lora','Oswald','Raleway','Inter','Merriweather','Arial','Georgia'];
let D,ed=null,tab='emp',cat='',tm,adm=!!sessionStorage.te;
function rr(v,a){return v>>>a|v<<32-a}
function sha(s){s=unescape(encodeURIComponent(s));var m=Math,pw=m.pow,mx=pw(2,32),i,j,r='',w=[],al=s.length*8,h=[],k=[],pc=0,ic={};for(var c=2;pc<64;c++)if(!ic[c]){for(i=0;i<313;i+=c)ic[i]=c;h[pc]=pw(c,.5)*mx|0;k[pc++]=pw(c,1/3)*mx|0}
s+='\x80';while(s.length%64-56)s+='\x00';for(i=0;i<s.length;i++)w[i>>2]|=s.charCodeAt(i)<<(3-i)%4*8;w[w.length]=al/mx|0;w[w.length]=al;
for(j=0;j<w.length;){var W=w.slice(j,j+=16),o=h;h=h.slice(0,8);for(i=0;i<64;i++){var a=h[0],e=h[4],x=W[i-15],y=W[i-2],t1=h[7]+(rr(e,6)^rr(e,11)^rr(e,25))+(e&h[5]^~e&h[6])+k[i]+(W[i]=i<16?W[i]:W[i-16]+(rr(x,7)^rr(x,18)^x>>>3)+W[i-7]+(rr(y,17)^rr(y,19)^y>>>10)|0),t2=(rr(a,2)^rr(a,13)^rr(a,22))+(a&h[1]^a&h[2]^h[1]&h[2]);h=[t1+t2|0].concat(h);h[4]=h[4]+t1|0}for(i=0;i<8;i++)h[i]=h[i]+o[i]|0}
for(i=0;i<8;i++)for(j=3;j+1;j--){var b=h[i]>>j*8&255;r+=(b<16?'0':'')+b.toString(16)}return r}
const FNU='/.netlify/functions/datos';let AUTH=sessionStorage.te||'';
const api=async b=>{try{const r=await fetch(FNU,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({auth:AUTH,...b})});if(r.status==404)return{ok:false,e:'Las funciones de Netlify no están activas (revisa el despliegue).'};const j=await r.json().catch(()=>({}));return{ok:r.ok,...j}}catch(e){return{ok:false,e:'Sin conexión con Netlify'}}};
const stt=t=>{const e=q('#st');if(e)e.textContent=t};
async function sv(){stt('Guardando…');const r=await api({data:D});stt(r.ok?'✓ Guardado automáticamente':'⚠ '+(r.e||'No se pudo guardar'))}
const sd=()=>{clearTimeout(tm);stt('…');tm=setTimeout(sv,700)};
const cap=()=>{['n','s','d','c','x','v'].forEach(k=>{const e=q('#f-'+k);if(e&&ed)ed[k]=e.value})};
const get=p=>p.split('.').reduce((o,k)=>o[k],D),set=(p,v)=>{const a=p.split('.'),l=a.pop();a.reduce((o,k)=>o[k],D)[l]=v};
const today=()=>new Date().toISOString().slice(0,10),act=()=>D.items.filter(i=>i.k=='promos'&&(!i.v||i.v>=today()));
const seen=()=>JSON.parse(localStorage.te_seen||'[]');
function wa(){let n=(D.e.tel.split(',')[0]||'').replace(/\D/g,'');if(n.length==10)n='57'+n;return'https://wa.me/'+n+'?text='+encodeURIComponent('Buen día, '+D.e.nombre+'. Estoy interesado en cotizar un proyecto de muebles a medida. Quedo atento a su respuesta. Gracias.')}
function th(){const t=D.t,r=document.documentElement.style;[['bg','bg'],['sf','sf'],['ac','ac'],['tx','tx']].forEach(([a,b])=>r.setProperty('--'+a,t[b]));r.setProperty('--fh',"'"+t.fh+"'");r.setProperty('--fb',"'"+t.fb+"'");
let l=q('#fl');if(!l){l=document.createElement('link');l.id='fl';l.rel='stylesheet';document.head.append(l)}l.href='https://fonts.googleapis.com/css2?family='+[...new Set([t.fh,t.fb])].map(f=>f.replace(/ /g,'+')+':wght@300;400;600;700').join('&family=')+'&display=swap'}
const media=i=>i.img&&i.img[0]?`<img src="${i.img[0]}" alt="" loading="lazy">`:`<span style="background:${E(i.x||'#555')}"></span>`;
const card=i=>`<article class="c" data-g="${i.id}">${media(i)}<h3>${E(i.n)}</h3><b>${E(i.c||i.s||'')}</b><p>${E(i.d)}${i.v?' · Hasta '+E(i.v):''}</p></article>`;
function view(p){const e=D.e;
if(p=='inicio'){const pr=D.items.filter(i=>i.k=='proyectos').slice(0,3),ic=['🍳','🚪','📺','🏪','🎨','🪵','✏️'];return`<section class="hero"><div><h1>${E(e.nombre)}</h1><p class="lead">${E(e.eslogan)}</p><a class="b" href="#/proyectos">Ver proyectos</a><a class="b o" href="${wa()}" target="_blank">Cotizar por WhatsApp</a></div><img class="hi" src="img/hero.jpg" alt=""></section><section><h2>Quiénes somos</h2><p class="big">${E(e.desc)}</p><div class="g2"><div class="c"><h3>🎯 Misión</h3><p>${E(e.mision)}</p></div><div class="c"><h3>🔭 Visión</h3><p>${E(e.vision)}</p></div></div></section><section><h2>Nuestros servicios</h2><div class="gr">${D.srv.split('\n').filter(Boolean).map((s,i)=>`<div class="c sc"><div class="ic">${ic[i%7]}</div><h3>${E(s)}</h3></div>`).join('')}</div></section>${pr.length?`<section><h2>Proyectos destacados</h2><div class="gr">${pr.map(card).join('')}</div><p><a class="b o" href="#/proyectos">Ver todos →</a></p></section>`:''}<section class="cta"><h2>¿Listo para transformar tu espacio?</h2><a class="b" href="${wa()}" target="_blank">Cotizar por WhatsApp</a><a class="b o" href="#/contacto">Ver tarjeta de presentación</a></section>`}
if(p=='contacto')return`<h2>Contacto</h2><div class="g2"><div class="fm">${e.tel.split(',').map(t=>`<a href="tel:+57${t.replace(/\D/g,'')}">📞 ${E(t.trim())}</a>`).join('')}<a href="mailto:${E(e.mail)}">✉️ ${E(e.mail)}</a><span>🌐 ${E(e.web)}</span>${e.dir?`<span>📍 ${E(e.dir)}</span>`:''}${e.hor?`<span>🕘 ${E(e.hor)}</span>`:''}<a class="b" href="${wa()}" target="_blank">Escribir por WhatsApp</a></div><div><div class="fp"><div class="fc" id="fc" data-flip><img class="ff" src="${D.f.t?D.f.t.u:'img/tarjeta-frente.jpg'}" alt=""><div class="fb2"><img src="${D.f.t2?D.f.t2.u:'img/tarjeta-dorso.jpg'}" alt=""><canvas id="qr"></canvas></div></div></div><p><button class="b" data-flip>↻ Girar tarjeta</button></p></div></div>`;
if(p=='proyectos'){const l=D.items.filter(i=>i.k==p&&(!cat||i.c==cat));return`<h2>Proyectos</h2><div class="chips"><button class="${cat?'':'on'}" data-cat="">Todos</button>${D.cats.map(c=>`<button class="${cat==c?'on':''}" data-cat="${E(c)}">${E(c)}</button>`).join('')}</div><div class="gr">${l.map(card).join('')||'<p>Pronto publicaremos proyectos.</p>'}</div>`}
const l=D.items.filter(i=>i.k==p);return`<h2>${P.find(x=>x[0]==p)[1]}</h2><div class="gr">${l.map(card).join('')||'<p>Pronto publicaremos contenido aquí.</p>'}</div>`}
const fl=(l,p,t='text')=>`<label>${l}<input type="${t}" data-p="${p}" value="${E(get(p))}"></label>`,ta=(l,p)=>`<label>${l}<textarea rows="3" data-p="${p}">${E(get(p))}</textarea></label>`,sl=(l,p,o)=>`<label>${l}<select data-p="${p}">${o.map(x=>`<option ${get(p)==x?'selected':''}>${E(x)}</option>`).join('')}</select></label>`;
function admin(){
if(!adm)return`<form id="lg" class="fm"><h2>Acceso privado</h2><input name="u" placeholder="Usuario" autocomplete="username"><input name="p" type="password" placeholder="Contraseña" autocomplete="current-password"><button class="b">Entrar</button><p id="er"></p></form>`;
const T=[['emp','Empresa'],['apa','Apariencia'],['cats','Categorías'],...P.slice(1,7),['arch','Tarjeta'],['cta','Acceso'],['pub','Búsqueda y guardado']];
let b='';
if(tab=='emp')b=`<div class="fm">${fl('Nombre','e.nombre')}${fl('Eslogan','e.eslogan')}${ta('Quiénes somos','e.desc')}${ta('Misión','e.mision')}${ta('Visión','e.vision')}${ta('Servicios (uno por línea)','srv')}${fl('Teléfonos (separados por coma)','e.tel')}${fl('Correo','e.mail')}${fl('Web','e.web')}${fl('Dirección','e.dir')}${fl('Horario','e.hor')}</div>`;
else if(tab=='apa')b=`<div class="fm">${fl('Color de fondo','t.bg','color')}${fl('Color de tarjetas','t.sf','color')}${fl('Color de acento','t.ac','color')}${fl('Color del texto','t.tx','color')}${sl('Letra de títulos','t.fh',FN)}${sl('Letra del texto','t.fb',FN)}<label>Logo<input type="file" accept="image/*" data-logo></label></div>`;
else if(tab=='cats')b=`<div class="fm"><label>Tipos de proyecto (uno por línea: decoraciones, muebles macizos…)<textarea rows="8" data-cats>${E(D.cats.join('\n'))}</textarea></label></div>`;
else if(tab=='arch'){const r=(n,k)=>`<label>${n}<input type="file" data-f="${k}">${D.f[k]?`<span>Cargado: ${E(D.f[k].n)} <button class="b o" data-rf="${k}">Quitar</button></span>`:'<span>Sin archivo: se usa la tarjeta de ejemplo.</span>'}</label>`;b=`<div class="fm"><p>Sube imágenes para el frente y el dorso de la tarjeta; si no, se usan las de ejemplo.</p>${r('Tarjeta: frente','t')}${r('Tarjeta: dorso (el QR se pone encima)','t2')}</div>`}
else if(tab=='cta')b=`<div class="fm"><input id="nu" placeholder="Usuario nuevo"><input id="np" type="password" placeholder="Contraseña nueva"><button class="b" data-cred>Cambiar acceso</button></div>`;
else if(tab=='pub')b=`<div class="fm"><p>✅ Todo se guarda solo en Netlify cada vez que cambias algo.</p>${fl('Clave de Pixabay (opcional y gratis) para buscar fotos aquí mismo','px')}<p>Sin clave, el botón de búsqueda abre Google Imágenes y pegas el enlace de la foto.</p></div>`;
else if(ed){const k=tab;b=`<div class="fm"><h3>${ed.id?'Editar':'Nuevo'}</h3><label>Nombre<input id="f-n" value="${E(ed.n)}"></label><label>${k=='promos'?'Oferta (ej. 20% dto.)':'Subtítulo'}<input id="f-s" value="${E(ed.s)}"></label><label>Descripción<textarea id="f-d" rows="3">${E(ed.d)}</textarea></label>${k=='proyectos'?`<label>Tipo<select id="f-c">${D.cats.map(c=>`<option ${ed.c==c?'selected':''}>${E(c)}</option>`).join('')}</select></label>`:''}${k=='colores'?`<label>Color<input type="color" id="f-x" value="${ed.x||'#c9a77c'}"></label>`:''}${k=='promos'?`<label>Vigente hasta<input type="date" id="f-v" value="${ed.v||''}"></label>`:''}<div class="th">${ed.img.map((m,i)=>`<div><img src="${m}"><button data-rm="${i}">×</button></div>`).join('')}</div><label>Fotos (desde tu equipo)<input type="file" accept="image/*" multiple data-im></label><label>Buscar imagen en internet<span class="sr"><input id="sq" placeholder="ej. bisagra cierre suave"><button class="b o" data-sr>🔍 Buscar</button></span></label><div class="th" id="sres"></div><label>…o pegar enlace de una imagen<span class="sr"><input id="su" placeholder="https://…"><button class="b o" data-url>Agregar</button></span></label><div><button class="b" data-save>Guardar</button><button class="b o" data-cancel>Cancelar</button></div></div>`}
else b=`<button class="b" data-add>+ Agregar</button>${D.items.filter(i=>i.k==tab).map(i=>`<div class="row">${i.img[0]?`<img src="${i.img[0]}">`:`<i style="background:${E(i.x||'#555')}"></i>`}<span>${E(i.n)}</span><button data-ed="${i.id}">Editar</button><button data-del="${i.id}">Borrar</button></div>`).join('')}`;
return`<h2>Panel <small id="st"></small></h2><div class="tabs">${T.map(([k,v])=>`<button class="${tab==k?'on':''}" data-tab="${k}">${v}</button>`).join('')}<button data-out>Salir</button></div>${b}`}
function render(){th();const p=(location.hash.replace('#/','')||'inicio');q('#logo').src=D.logo;q('#nm').textContent=D.e.nombre;q('#ft').textContent='© '+new Date().getFullYear()+' '+D.e.nombre;document.title=D.e.nombre;
q('#nav').innerHTML=P.map(([k,v])=>`<a href="#/${k}" class="${p==k?'on':''}">${v}</a>`).join('');
q('#app').innerHTML=p=='admin'?admin():view(P.some(x=>x[0]==p)?p:'inicio');bell();drawQR()}
function bell(){const a=act(),n=a.filter(i=>!seen().includes(i.id)).length;q('#bd').textContent=n||'';q('#bell').classList.toggle('ring',n>0);q('#bell').style.display=a.length?'':'none';
q('#dd').innerHTML=a.map(i=>`<p><a href="#/promos"><b>${E(i.n)}</b> ${E(i.s)}</a></p>`).join('')}
const up=async f=>{const u=await rz(f),r=await api({a:'img',data:u});if(!r.ok){alert(r.e||'No se pudo subir la imagen');return''}return r.url};
const rd=f=>new Promise(r=>{const a=new FileReader();a.onload=()=>r(a.result);a.readAsDataURL(f)});
const rz=async f=>{const u=await rd(f);return new Promise(r=>{const m=new Image();m.onload=()=>{const s=Math.min(1,1400/Math.max(m.width,m.height)),c=document.createElement('canvas');c.width=m.width*s;c.height=m.height*s;c.getContext('2d').drawImage(m,0,0,c.width,c.height);r(c.toDataURL('image/jpeg',.82))};m.onerror=()=>r(u);m.src=u})};
function dl(u,n){const a=document.createElement('a');a.href=u;a.download=n;a.click()}

function drawQR(){const c=q('#qr');if(!c)return;const o=new QRCode(-1,1);o.addData('https://'+D.e.web.replace(/^https?:\/\//,''));o.make();const n=o.getModuleCount(),s=8;c.width=c.height=(n+4)*s;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.fillStyle='#000';for(let r=0;r<n;r++)for(let k=0;k<n;k++)if(o.isDark(r,k))x.fillRect((k+2)*s,(r+2)*s,s,s)}

document.addEventListener('click',async ev=>{const d=ev.target.closest('[data-g],[data-flip],[data-sr],[data-url],[data-pick],[data-cat],[data-dl],[data-tab],[data-add],[data-ed],[data-del],[data-rm],[data-save],[data-cancel],[data-bell],[data-out],[data-pub],[data-reset],[data-cred],[data-rf]'),dd=q('#dd');if(!d){dd.hidden=true;return}const s=d.dataset;
if('flip'in s){q('#fc').classList.toggle('v');return}
if('bell'in s){dd.hidden=!dd.hidden;localStorage.te_seen=JSON.stringify(act().map(i=>i.id));bell();return}
if('g'in s){const i=D.items.find(x=>x.id==s.g);if(i&&i.img.length){const o=document.createElement('div');o.id='lb';o.innerHTML=i.img.map(m=>`<img src="${m}">`).join('');o.onclick=()=>o.remove();document.body.append(o)}}
else if('cat'in s){cat=s.cat;render()}
else if('tab'in s){tab=s.tab;ed=null;render()}
else if('add'in s){ed={id:0,k:tab,n:'',s:'',d:'',c:D.cats[0],x:'',v:'',img:[]};render()}
else if('ed'in s){ed=JSON.parse(JSON.stringify(D.items.find(x=>x.id==s.ed)));render()}
else if('del'in s){if(confirm('¿Borrar?')){D.items=D.items.filter(x=>x.id!=s.del);await sv();render()}}
else if('rm'in s){cap();ed.img.splice(+s.rm,1);render()}
else if('sr'in s){const t=(q('#sq').value||(q('#f-n')||{}).value||'').trim();if(!t)return alert('Escribe qué buscar');if(!D.px){window.open('https://www.google.com/search?tbm=isch&q='+encodeURIComponent(t));alert('Se abrió Google Imágenes: copia la dirección de la foto y pégala en "enlace de imagen".');return}
const r=await fetch('https://pixabay.com/api/?key='+D.px+'&per_page=12&image_type=photo&q='+encodeURIComponent(t)).then(r=>r.json()).catch(()=>({}));q('#sres').innerHTML=(r.hits||[]).map(h=>`<div><img src="${h.previewURL}" data-pick="${E(h.largeImageURL)}"></div>`).join('')||'Sin resultados'}
else if('pick'in s||'url'in s){const u='pick'in s?s.pick:q('#su').value.trim();if(!u)return;const r=await api({a:'fetch',url:u});if(r.ok&&r.url){cap();ed.img.push(r.url);render()}else alert(r.e||'No se pudo traer la imagen')}
else if('cancel'in s){ed=null;render()}
else if('save'in s){const g=i=>(q('#f-'+i)||{}).value||'';if(!g('n').trim())return alert('Escribe un nombre');Object.assign(ed,{n:g('n').trim(),s:g('s'),d:g('d'),c:g('c'),x:g('x'),v:g('v')});if(ed.id)D.items[D.items.findIndex(x=>x.id==ed.id)]=ed;else{ed.id=Date.now();D.items.push(ed)}ed=null;await sv();render()}
else if('out'in s){adm=false;AUTH='';sessionStorage.te='';location.hash='#/inicio'}
else if('rf'in s){delete D.f[s.rf];await sv();render()}
else if('cred'in s){const u=q('#nu').value.trim().toLowerCase(),p=q('#np').value;if(!u||p.length<6)return alert('Usuario y contraseña (mín. 6)');const n=sha(u+':'+p),r=await api({newCred:n});if(!r.ok)return alert(r.e||'Error');AUTH=n;sessionStorage.te=n;alert('Acceso actualizado.')}
else if('pub'in s)dl(URL.createObjectURL(new Blob(['window.TE_DATA='+JSON.stringify(D)+';'],{type:'text/javascript'})),'datos.js');
else if('reset'in s){if(confirm('Se borrarán los cambios hechos en este navegador.')){try{indexedDB.deleteDatabase('te')}catch(e){}setTimeout(()=>location.reload(),300)}}});
document.addEventListener('input',ev=>{const t=ev.target;if(t.dataset.p){set(t.dataset.p,t.value);th();sd()}else if('cats'in t.dataset){D.cats=t.value.split('\n').map(x=>x.trim()).filter(Boolean);sd()}});
document.addEventListener('change',async ev=>{const t=ev.target,f=t.files&&t.files[0];if(!f)return;
if('im'in t.dataset){cap();for(const x of t.files){const u=await up(x);if(u)ed.img.push(u)}render()}
else if('logo'in t.dataset){const u=await up(f);if(u){D.logo=u;await sv();render()}}
else if(t.dataset.f){const u=await up(f);if(u){D.f[t.dataset.f]={n:f.name,u};await sv();render()}}
else if(t.dataset.p){render()}});
document.addEventListener('submit',async ev=>{if(ev.target.id!='lg')return;ev.preventDefault();const f=ev.target;AUTH=sha(f.u.value.trim().toLowerCase()+':'+f.p.value);const r=await api({});if(r.ok){adm=true;sessionStorage.te=AUTH;render()}else{AUTH='';q('#er').textContent=r.e||'Usuario o contraseña incorrectos.'}});
addEventListener('hashchange',()=>{ed=null;render()});
(async()=>{let j=null;try{const r=await Promise.race([fetch(FNU),new Promise((_,x)=>setTimeout(x,3000))]);if(r.ok)j=await r.json()}catch(e){}D=j||window.TE_DATA;D.f=D.f||{};D.px=D.px||'';render()})();
