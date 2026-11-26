/* TECNO ESPACIOS · Panel: Personalizador y solicitudes · Seguimiento de proyectos · Estadísticas · CRM de clientes */
(()=>{
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const $=s=>document.querySelector(s);
const NA=async(a,b={})=>{try{const r=await fetch('/.netlify/functions/negocio',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({a,auth:AUTH,...b})});const j=await r.json().catch(()=>({}));return{ok:r.ok&&!!j.ok,status:r.status,...j}}catch(e){return{ok:false,e:'Sin conexión con el servidor.'}}};
const CLI={nuevo:'Nuevo interesado',contactado:'Contactado',negociacion:'En negociación',cotizacion:'Cotización enviada',pendiente:'Pendiente de respuesta',vendido:'Venta concretada',perdido:'Cliente perdido'};
const ORIG={pagina:'Página web',whatsapp:'WhatsApp',chat:'Chat',formulario:'Formulario',personalizador:'Personalizador',otro:'Otro'};
const SOLE={nueva:'Nueva',revisada:'Revisada',cotizada:'Cotizada',proyecto:'Convertida en proyecto',descartada:'Descartada'};
const CANAL={cotizacion:'Cotización',whatsapp:'WhatsApp',chat:'Chat',guardada:'Guardada'};
const {tipos,partes:PARTES,nombres:DISENOS}=window.TE_MUEBLES;
const nombresTipo=Object.fromEntries(tipos);
const TIPOS=[...new Set([...tipos.map(([,n])=>n),'Closet','Centro de entretenimiento'])];
const PROY=['Solicitud recibida','En revisión','Diseño y planificación','Cotización enviada','Cotización aprobada','En fabricación','En preparación para instalación','En instalación','Proyecto finalizado'];
const NS={sol:null,cli:null,pro:null,st:null,bk:null,det:null,err:'',msg:'',pzV:'sol',solSel:'',solF:{estado:'',canal:''},cliV:'tablero',cliSel:'',cliForm:null,cliF:{q:'',estado:'',origen:'',tipo:'',desde:''},proSel:'',proForm:null,stR:'30',stD:'',stH:''};
const LD={};
const rerender=()=>{if(location.hash.startsWith('#/admin'))render()};
const hoy=()=>new Date(Date.now()-5*36e5).toISOString().slice(0,10);
const fdt=i=>i?new Date(i).toLocaleString('es-CO',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}):'—';
const fdd=i=>i?new Date(String(i).length>10?i:i+'T12:00:00').toLocaleDateString('es-CO',{day:'numeric',month:'short',year:'numeric'}):'—';
const dias=i=>i?Math.floor((Date.now()-Date.parse(i))/864e5):0;
const telWa=t=>{let n=String(t||'').replace(/\D/g,'');if(n.length===10)n='57'+n;return n};
const waLink=(t,m)=>'https://wa.me/'+telWa(t)+(m?'?text='+encodeURIComponent(m):'');
const pz=()=>({...PZ.DEF,...(D.pz||{})});
const diasAlerta=()=>Math.max(1,Number(pz().diasAlerta)||3);
const msgBar=()=>NS.msg||NS.err?`<p class="adm-msgbar ${NS.err?'err':'ok'}" role="status">${esc(NS.err||NS.msg)}</p>`:'';
const flash=(m,err)=>{NS.msg=err?'':m;NS.err=err?m:'';rerender();clearTimeout(flash.t);flash.t=setTimeout(()=>{NS.msg=NS.err='';rerender()},4000)};
function need(k,a,body,fn){
  if(NS[k]!==null)return true;
  if(!LD[k]){LD[k]=1;NA(a,body).then(r=>{LD[k]=0;if(r.ok)fn(r);else{NS.err=r.e||'No se pudo cargar la información.';fn({})}rerender()})}
  return false;
}
const needCli=()=>need('cli','c-list',{},r=>{NS.cli=r.clientes||[]});
const needSol=()=>need('sol','s-list',{},r=>{NS.sol=r.solicitudes||[]});
const needPro=()=>need('pro','p-list',{},r=>{NS.pro=r.proyectos||[]});
const cliName=id=>{const c=(NS.cli||[]).find(x=>x.id===id);return c?c.nombre:'Cliente eliminado'};
const load='<p class="adm-empty">Cargando…</p>';
const fld=(l,id,v,x='')=>`<label>${l}<input id="${id}" value="${esc(v)}" ${x}></label>`;
const sel=(l,id,o,v)=>`<label>${l}<select id="${id}">${o.map(([k,n])=>`<option value="${esc(k)}" ${String(k)===String(v)?'selected':''}>${esc(n)}</option>`).join('')}</select></label>`;
const pill=(t,c='')=>`<span class="adm-pill ${c}">${esc(t)}</span>`;
const sub=(items,cur,k)=>`<div class="seg">${items.map(([v,n,c])=>`<button class="${cur===v?'on':''}" data-n="${k}" data-v="${v}" type="button">${n}${c!=null?` <i>${c}</i>`:''}</button>`).join('')}</div>`;

/* =============== PERSONALIZADOR Y SOLICITUDES =============== */
function pzView(){
  const head=`<div class="adm-head"><h3>Personalizador y solicitudes</h3></div>`;
  const tabs=sub([['sol','Solicitudes',NS.sol?NS.sol.filter(s=>s.estado==='nueva').length||null:null],['cfg','Configuración']],NS.pzV,'pzv');
  if(NS.pzV==='cfg')return head+tabs+pzCfg();
  if(!needSol()||!needCli())return head+tabs+load;
  if(NS.solSel){const s=NS.sol.find(x=>x.id===NS.solSel);if(s)return head+solDetail(s)}
  const f=NS.solF,l=NS.sol.filter(s=>(!f.estado||s.estado===f.estado)&&(!f.canal||s.canal===f.canal));
  return head+tabs+msgBar()+`<div class="adm-filters">${sel('Estado','n-fs',[['','Todos'],...Object.entries(SOLE)],f.estado)}${sel('Canal','n-fc',[['','Todos'],...Object.entries(CANAL)],f.canal)}<button class="b o sm" data-n="solrefresh" type="button">Actualizar</button></div>
  ${l.length?`<div class="adm-items">${l.map(s=>`<article class="adm-item adm-click" data-n="solopen" data-id="${s.id}"><div class="adm-item-body"><b>${esc(s.codigo)} · ${esc(s.contacto.nombre)}</b><small>${esc(nombresTipo[s.tipo]||s.tipo)} · ${esc(s.contacto.telefono)} · ${fdt(s.creada)}</small></div><div class="adm-item-act">${pill(CANAL[s.canal]||s.canal)}${pill(SOLE[s.estado]||s.estado,s.estado==='nueva'?'activas':s.estado==='descartada'?'vencidas':'proximas')}</div></article>`).join('')}</div>`:'<p class="adm-empty">Todavía no hay solicitudes del personalizador.</p>'}`;
}
function solDetail(s){
  const tn=nombresTipo[s.tipo]||s.tipo,m=s.medidas||{};
  const dn=DISENOS[s.diseno]||s.diseno;
  const filas=[['Mueble',tn+(s.descripcion?' — '+s.descripcion:'')],['Diseño',dn],['Estilo',s.estilo],['Material',s.material],['Puertas',s.puertas],['Cajones',s.cajones],['Tiradores',s.tiradores],['Herrajes',s.herrajes],['Medidas',(m.ancho||m.alto||m.prof)?`${m.ancho||'—'} × ${m.alto||'—'} × ${m.prof||'—'} cm`:''],['Observaciones',s.obs]].filter(x=>x[1]);
  const cols=PARTES.filter(([p])=>s.colores&&s.colores[p]);
  const c=(NS.cli||[]).find(x=>x.id===s.clienteId);
  return `<button class="b o sm" data-n="solback" type="button">← Volver a solicitudes</button>${msgBar()}
  <div class="adm-cols"><div class="fm"><h3>${esc(s.codigo)} <small>${fdt(s.creada)} · ${esc(CANAL[s.canal]||s.canal)}</small></h3>
    <dl class="adm-dl">${filas.map(([k,v])=>`<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}${s.meson?`<div><dt>Mesón</dt><dd>${esc(s.meson.nombre)}${s.meson.ref?' · ref. '+esc(s.meson.ref):''}${s.meson.categoria?' · '+esc(s.meson.categoria):''}</dd></div>`:''}<div><dt>Valor</dt><dd>${s.estimado!=null?money(s.estimado)+' (estimado referencial)':'Sujeto a cotización'}</dd></div></dl>
    ${cols.length?`<h4>Colores solicitados</h4><div class="adm-cols-sel">${cols.map(([p,l])=>{const x=s.colores[p];return `<figure>${x.img?`<img src="${esc(x.img)}" alt="${esc(x.nombre)}" loading="lazy">`:`<span style="background:${esc(x.hex||'#ccc')}"></span>`}<figcaption><b>${l}</b>${esc(x.nombre)}<small>${esc([x.ref?'Ref. '+x.ref:'','Cód. '+x.id,x.categoria].filter(Boolean).join(' · '))}</small></figcaption></figure>`}).join('')}</div>`:''}</div>
  <div class="fm"><h3>Gestión</h3>
    <p><b>${esc(s.contacto.nombre)}</b><br>📞 <a href="tel:${esc(String(s.contacto.telefono).replace(/[^\d+]/g,''))}">${esc(s.contacto.telefono)}</a>${s.contacto.correo?`<br>✉️ ${esc(s.contacto.correo)}`:''}${s.contacto.ciudad?`<br>📍 ${esc(s.contacto.ciudad)}`:''}</p>
    ${sel('Estado','n-se',Object.entries(SOLE),s.estado)}<label>Nota interna<textarea id="n-sn" rows="3" maxlength="1000">${esc(s.nota||'')}</textarea></label>
    <div class="adm-actions"><button class="b" data-n="solsave" data-id="${s.id}" type="button">Guardar</button><a class="b o" target="_blank" rel="noopener" href="${waLink(s.contacto.telefono,'Hola '+s.contacto.nombre+', recibimos tu diseño ('+s.codigo+') en TECNO ESPACIOS.')}">WhatsApp</a></div>
    <hr><label>Cliente relacionado${c?'':' <small>(no encontrado)</small>'}<select id="n-sc">${(NS.cli||[]).map(x=>`<option value="${x.id}" ${x.id===s.clienteId?'selected':''}>${esc(x.nombre)} · ${esc(x.telefono||x.correo||'')}</option>`).join('')}</select></label>
    <div class="adm-actions"><button class="b o sm" data-n="solassign" data-id="${s.id}" type="button">Relacionar con este cliente</button>${c?`<button class="b o sm" data-n="gocli" data-id="${c.id}" type="button">Ver cliente</button>`:''}</div>
    <div class="adm-actions">${s.proyectoId?`<button class="b o sm" data-n="goproy" data-id="${s.proyectoId}" type="button">Ver proyecto</button>`:`<button class="b" data-n="solproy" data-id="${s.id}" type="button">Crear proyecto</button>`}<button class="b o sm adm-del" data-n="soldel" data-id="${s.id}" type="button">Eliminar</button></div></div></div>`;
}
function pzCfg(){
  const c=pz();D.pz=Object.assign({},PZ.DEF,D.pz||{});D.pz.tarifas=D.pz.tarifas||{};
  const ta=(l,k)=>`<label>${l}<textarea rows="5" data-p="pz.${k}">${esc(D.pz[k])}</textarea></label>`;
  return `<div class="adm-cols"><div class="fm"><h3>Opciones del personalizador</h3>${ta('Estilos','estilos')}${ta('Materiales','materiales')}${ta('Tipos de puertas','puertas')}${ta('Cajones','cajones')}${ta('Tiradores','tiradores')}${ta('Herrajes','herrajes')}<small>Una opción por línea. Para sumar un valor: «Nombre | 50000».</small></div>
  <div class="fm"><h3>Tarifas por m²</h3>${tipos.map(([k,n])=>`<label>${n} (COP por m² de frente)<input type="number" min="0" data-p="pz.tarifas.${k}" value="${esc(D.pz.tarifas[k]||'')}" placeholder="Sin tarifa → sujeto a cotización"></label>`).join('')}<h3>CRM</h3><label>Días sin seguimiento para alertar<input type="number" min="1" max="60" data-p="pz.diasAlerta" value="${esc(D.pz.diasAlerta)}"></label>
  <p class="adm-hint">Los colores salen del catálogo. En Catálogo → Mesones puedes activar o desactivar cada acabado para el personalizador.</p></div></div>`;
}

/* =============== SEGUIMIENTO DE PROYECTOS =============== */
function proView(){
  const head=`<div class="adm-head"><h3>Seguimiento de proyectos</h3>${!NS.proSel?'<button class="b" data-n="pronew" type="button">+ Nuevo proyecto</button>':''}</div>`;
  if(!needPro()||!needCli())return head+load;
  if(NS.proSel==='form')return head+proForm();
  if(NS.proSel){const p=NS.pro.find(x=>x.id===NS.proSel);if(p)return head+proDetail(p)}
  return head+msgBar()+(NS.pro.length?`<div class="adm-items">${NS.pro.map(p=>`<article class="adm-item adm-click" data-n="proopen" data-id="${p.id}"><div class="adm-item-body"><b>${esc(p.nombre)}</b><small>${esc(p.codigo)} · ${esc(cliName(p.clienteId))} · Entrega: ${fdd(p.entrega)}</small></div><div class="adm-item-act">${pill(PROY[p.estado],p.estado===8?'activas':'proximas')}</div></article>`).join('')}</div>`:'<p class="adm-empty">Aún no hay proyectos. Crea uno desde una solicitud o con «Nuevo proyecto».</p>');
}
function proForm(){
  const f=NS.proForm;
  return `<button class="b o sm" data-n="proback" type="button">← Volver</button>${msgBar()}<div class="fm adm-wide"><h3>${f.id?'Editar proyecto':'Nuevo proyecto'}</h3><div class="adm-grid2">
  <label>Nombre del proyecto<input data-nf="proForm.nombre" value="${esc(f.nombre)}" maxlength="120"></label>
  <label>Tipo de mueble<input data-nf="proForm.tipo" list="n-tipos" value="${esc(f.tipo)}" maxlength="80"><datalist id="n-tipos">${TIPOS.map(t=>`<option value="${t}">`).join('')}</datalist></label>
  <label>Cliente<select data-nf="proForm.clienteId"><option value="">— Elegir —</option>${NS.cli.map(c=>`<option value="${c.id}" ${c.id===f.clienteId?'selected':''}>${esc(c.nombre)} · ${esc(c.telefono||c.correo||'')}</option>`).join('')}</select></label>
  <label>Estado<select data-nf="proForm.estado">${PROY.map((n,i)=>`<option value="${i}" ${+f.estado===i?'selected':''}>${i+1}. ${n}</option>`).join('')}</select></label>
  <label>Fecha de inicio<input type="date" data-nf="proForm.inicio" value="${esc(f.inicio)}"></label>
  <label>Entrega estimada<input type="date" data-nf="proForm.entrega" value="${esc(f.entrega)}"></label></div>
  <label>Novedad para el cliente (se muestra en su seguimiento)<textarea data-nf="proForm.novedad" rows="3" maxlength="1000">${esc(f.novedad)}</textarea></label>
  <label>Nota interna (el cliente no la ve)<textarea data-nf="proForm.notaInterna" rows="3" maxlength="1500">${esc(f.notaInterna)}</textarea></label>
  <div class="adm-actions"><button class="b" data-n="prosave" type="button">Guardar</button><button class="b o" data-n="proback" type="button">Cancelar</button></div></div>`;
}
function proDetail(p){
  const c=(NS.cli||[]).find(x=>x.id===p.clienteId),url=location.origin+'/#/seguimiento';
  return `<button class="b o sm" data-n="proback" type="button">← Volver</button>${msgBar()}
  <div class="adm-cols"><div class="fm"><h3>${esc(p.nombre)}</h3><div class="pcode"><small>Código de seguimiento</small><b>${esc(p.codigo)}</b><button class="b o sm" data-n="copy" data-v="${esc(p.codigo)}" type="button">Copiar</button></div>
    <dl class="adm-dl"><div><dt>Cliente</dt><dd>${esc(cliName(p.clienteId))}${c?' · '+esc(c.telefono||c.correo||''):''}</dd></div><div><dt>Tipo</dt><dd>${esc(p.tipo)||'—'}</dd></div><div><dt>Estado</dt><dd>${esc(PROY[p.estado])}</dd></div><div><dt>Inicio</dt><dd>${fdd(p.inicio)}</dd></div><div><dt>Entrega estimada</dt><dd>${fdd(p.entrega)}</dd></div>${p.novedad?`<div><dt>Novedad visible</dt><dd>${esc(p.novedad)}</dd></div>`:''}${p.notaInterna?`<div><dt>Nota interna</dt><dd>${esc(p.notaInterna)}</dd></div>`:''}</dl>
    <div class="adm-actions"><button class="b" data-n="proedit" data-id="${p.id}" type="button">Actualizar estado / novedad</button>${c&&c.telefono?`<a class="b o" target="_blank" rel="noopener" href="${waLink(c.telefono,'Hola '+c.nombre+', ya puedes consultar el avance de tu proyecto «'+p.nombre+'» en '+url+' con el código '+p.codigo+' y tu teléfono.')}">Enviar código por WhatsApp</a>`:''}<button class="b o sm adm-del" data-n="prodel" data-id="${p.id}" type="button">Eliminar</button></div></div>
  <div class="fm"><h3>Fotografías del avance</h3><label>Descripción (opcional)<input id="n-fnota" maxlength="200"></label><label class="b o">📷 Subir fotografías<input type="file" accept="image/*" multiple data-nfile="pfoto" data-id="${p.id}" hidden></label>
    <div class="adm-fotos">${(p.fotos||[]).map((f,i)=>`<figure><img src="${esc(f.url)}" alt=""><button class="adm-x" data-n="fotodel" data-id="${p.id}" data-v="${i}" type="button" aria-label="Quitar">×</button><figcaption>${fdd(f.at)}${f.nota?' · '+esc(f.nota):''}</figcaption></figure>`).join('')||'<p class="adm-empty">Sin fotografías.</p>'}</div>
    <h3>Historial</h3><ul class="sg-hist">${(p.hist||[]).slice().reverse().map(h=>`<li><time>${fdt(h.at)}</time><b>${esc(PROY[h.estado]||'')}</b>${h.texto?`<p>${esc(h.texto)}</p>`:''}</li>`).join('')}</ul></div></div>`;
}

/* =============== ESTADÍSTICAS =============== */
const ymd=d=>d.toISOString().slice(0,10);
const addD=(s,n)=>ymd(new Date(Date.parse(s+'T12:00:00Z')+n*864e5));
function rango(){
  const h=hoy();let d1,d2=h;
  if(NS.stR==='custom'){d1=NS.stD||addD(h,-29);d2=NS.stH||h;if(d1>d2)[d1,d2]=[d2,d1]}else d1=addD(h,-(+NS.stR-1));
  const n=Math.round((Date.parse(d2)-Date.parse(d1))/864e5)+1;
  return {d1,d2,n,p1:addD(d1,-n),p2:addD(d1,-1)};
}
const sumP=(dias,a,b,f)=>Object.entries(dias).reduce((s,[k,v])=>k>=a&&k<=b?s+(f(v,k)||0):s,0);
const tops=(dias,a,b,get)=>{const m={};for(const [k,v] of Object.entries(dias))if(k>=a&&k<=b)for(const [n,c] of Object.entries(get(v)||{}))m[n]=(m[n]||0)+c;return Object.entries(m).sort((x,y)=>y[1]-x[1]).slice(0,8)};
function bars(labels,cur,prev,color){
  const W=720,H=200,pad=26,max=Math.max(1,...cur,...(prev||[])),bw=(W-pad*2)/Math.max(1,labels.length),step=Math.ceil(labels.length/12);
  let o=`<svg class="st-chart" viewBox="0 0 ${W} ${H+26}" role="img">`;
  for(let i=0;i<=4;i++){const y=pad/2+(H-pad)*(1-i/4);o+=`<line x1="${pad}" x2="${W-4}" y1="${y}" y2="${y}" stroke="currentColor" opacity=".1"/><text x="${pad-4}" y="${y+4}" font-size="10" text-anchor="end" fill="currentColor" opacity=".55">${Math.round(max*i/4)}</text>`}
  cur.forEach((v,i)=>{const h=(H-pad)*v/max,x=pad+i*bw+bw*.15;o+=`<rect x="${x}" y="${pad/2+(H-pad)-h}" width="${Math.max(1,bw*.7)}" height="${h}" rx="2" fill="${color}"><title>${labels[i]}: ${v}</title></rect>`});
  if(prev&&prev.length){o+=`<polyline fill="none" stroke="currentColor" stroke-dasharray="4 3" opacity=".55" stroke-width="1.6" points="${prev.map((v,i)=>`${(pad+i*bw+bw/2).toFixed(1)},${(pad/2+(H-pad)-(H-pad)*v/max).toFixed(1)}`).join(' ')}"/>`}
  labels.forEach((l,i)=>{if(i%step===0)o+=`<text x="${pad+i*bw+bw/2}" y="${H+14}" font-size="10" text-anchor="middle" fill="currentColor" opacity=".6">${l.slice(5)}</text>`});
  return o+'</svg>';
}
function topList(t,names,kind,pref){
  if(!t.length)return '<p class="adm-empty">Sin datos en este período.</p>';
  const m=Math.max(...t.map(x=>x[1]));
  return `<ul class="st-top">${t.map(([k,c])=>`<li><span>${esc(kind?(names[kind+':'+k]||'Elemento '+k):(pref[k]||k))}</span><i style="width:${Math.max(4,c/m*100)}%"></i><b>${c}</b></li>`).join('')}</ul>`;
}
function statsView(){
  const head=`<div class="adm-head"><h3>Estadísticas</h3></div>`;
  if(!need('st','st-get',{},r=>{NS.st=r.dias?{entorno:r.entorno,desde:r.desde,dias:r.dias,nombres:r.nombres||{},reg:r.registros||{}}:{entorno:'',dias:{},nombres:{},reg:{}}}))return head+load;
  const S=NS.st,R=rango(),dias=S.dias,h=hoy();
  const v=(a,b)=>sumP(dias,a,b,x=>x.v),u=(a,b)=>sumP(dias,a,b,x=>x.u),nn=(a,b)=>sumP(dias,a,b,x=>x.n),ua=(a,b)=>sumP(dias,a,b,x=>x.ua),wa=(a,b)=>sumP(dias,a,b,x=>x.a&&x.a.wa),ct=(a,b)=>sumP(dias,a,b,x=>x.a&&x.a.contacto);
  const rg=(a,b,k)=>sumP(S.reg,a,b,x=>x[k]);
  const filas=[['Visitas',v(R.d1,R.d2),v(R.p1,R.p2)],['Visitantes únicos (por día)',u(R.d1,R.d2),u(R.p1,R.p2)],['Visitantes nuevos',nn(R.d1,R.d2),nn(R.p1,R.p2)],['Clics en WhatsApp',wa(R.d1,R.d2),wa(R.p1,R.p2)],['Clics en contacto',ct(R.d1,R.d2),ct(R.p1,R.p2)],['Solicitudes de cotización',rg(R.d1,R.d2,'cotiz'),rg(R.p1,R.p2,'cotiz')],['Formularios enviados',rg(R.d1,R.d2,'form'),rg(R.p1,R.p2,'form')],['Solicitudes del personalizador',rg(R.d1,R.d2,'pers'),rg(R.p1,R.p2,'pers')]];
  const lab=[],cv=[],pv=[],cq=[];for(let i=0;i<R.n;i++){const k=addD(R.d1,i);lab.push(k);cv.push((dias[k]||{}).v||0);pv.push((dias[addD(R.p1,i)]||{}).v||0);cq.push((S.reg[k]||{}).cotiz||0)}
  const pctU=u(R.d1,R.d2),pct=pctU?Math.min(100,Math.round(ua(R.d1,R.d2)/pctU*100)):0;
  const hay=Object.keys(dias).length>0;
  const ban=S.entorno==='prueba'?'<p class="st-ban test"><b>Entorno de pruebas.</b> Estos números NO corresponden a tu sitio publicado.</p>':`<p class="st-ban real">Datos reales registrados${S.desde?' desde el '+fdd(S.desde):''}. Solo se miden los visitantes que aceptan la medición anónima; las solicitudes, formularios y cotizaciones se cuentan siempre.</p>`;
  const kpi=(l,val,c)=>`<div class="st-kpi"><small>${l}</small><b>${val}</b>${c!=null?`<i class="${c>0?'up':c<0?'dn':''}">${c>0?'▲':c<0?'▼':'='} ${Math.abs(c)}%</i>`:''}</div>`;
  const ch=(a,b)=>b?Math.round((a-b)/b*100):(a?100:0);
  const todayV=v(h,h),w7=v(addD(h,-6),h),w30=v(addD(h,-29),h),tot=Object.values(dias).reduce((s,x)=>s+x.v,0);
  return head+ban+`<div class="adm-filters">${sel('Período','n-str',[['7','Últimos 7 días'],['30','Últimos 30 días'],['90','Últimos 90 días'],['custom','Personalizado']],NS.stR)}${NS.stR==='custom'?`<label>Desde<input type="date" id="n-std" value="${R.d1}"></label><label>Hasta<input type="date" id="n-sth" value="${R.d2}"></label>`:''}<button class="b o sm" data-n="strefresh" type="button">Actualizar</button></div>
  <div class="st-kpis">${kpi('Total de visitas',tot)}${kpi('Visitas hoy',todayV)}${kpi('Últimos 7 días',w7)}${kpi('Últimos 30 días',w30)}${kpi('Visitantes que hicieron una acción',pct+'%')}</div>
  ${hay?'':'<p class="adm-empty">Todavía no hay visitas registradas. Aparecerán cuando los visitantes acepten la medición.</p>'}
  <div class="fm adm-wide"><h3>Visitas por día <small>${fdd(R.d1)} – ${fdd(R.d2)} · línea punteada: período anterior</small></h3>${bars(lab,cv,pv,'var(--ac)')}</div>
  <div class="fm adm-wide"><h3>Comparación entre períodos</h3><table class="st-tab"><thead><tr><th></th><th>Este período</th><th>Anterior</th><th>Cambio</th></tr></thead><tbody>${filas.map(([n,a,b])=>`<tr><td>${n}</td><td><b>${a}</b></td><td>${b}</td><td class="${ch(a,b)>0?'up':ch(a,b)<0?'dn':''}">${b===0&&a===0?'—':(ch(a,b)>0?'+':'')+ch(a,b)+'%'}</td></tr>`).join('')}</tbody></table></div>
  <div class="adm-cols"><div class="fm"><h3>Secciones más visitadas</h3>${topList(tops(dias,R.d1,R.d2,x=>x.p),S.nombres,null,{inicio:'Inicio',proyectos:'Proyectos',mesones:'Mesones',colores:'Colores',promos:'Promociones',resenas:'Reseñas',contacto:'Contacto',shop:'TECNO SHOP',personalizador:'Personalizador',seguimiento:'Seguimiento'})}</div>
  <div class="fm"><h3>Proyectos más consultados</h3>${topList(tops(dias,R.d1,R.d2,x=>x.it&&x.it.proyectos),S.nombres,'proyectos')}</div>
  <div class="fm"><h3>Productos más vistos</h3>${topList(tops(dias,R.d1,R.d2,x=>x.it&&x.it.shop),S.nombres,'shop')}</div>
  <div class="fm"><h3>Promociones más visitadas</h3>${topList(tops(dias,R.d1,R.d2,x=>x.it&&x.it.promos),S.nombres,'promos')}</div></div>
  <div class="fm adm-wide"><h3>Evolución de solicitudes de cotización</h3>${bars(lab,cq,null,'#2e7d4f')}</div>`;
}

/* =============== CRM =============== */
const alertas=()=>{
  const h=hoy(),da=diasAlerta(),cl=NS.cli||[],act=['nuevo','contactado','negociacion','cotizacion','pendiente'];
  const rec=[];cl.forEach(c=>(c.recordatorios||[]).forEach(r=>{if(!r.hecho&&r.fecha<=addD(h,7))rec.push({c,r})}));rec.sort((a,b)=>a.r.fecha.localeCompare(b.r.fecha));
  const sin=cl.filter(c=>c.sinAtender&&!['vendido','perdido'].includes(c.estado)&&dias(c.ultimoCliente||c.creado)>=1).sort((a,b)=>Date.parse(a.ultimoCliente)-Date.parse(b.ultimoCliente));
  const pend=cl.filter(c=>act.includes(c.estado)&&!c.sinAtender&&dias(c.ultimoAdmin||c.ultimo||c.creado)>=da).sort((a,b)=>Date.parse(a.ultimoAdmin||a.creado)-Date.parse(b.ultimoAdmin||b.creado));
  return {rec,sin,pend,total:rec.filter(x=>x.r.fecha<=h).length+sin.length+pend.length};
};
function crmView(){
  if(!needCli())return `<div class="adm-head"><h3>CRM de clientes</h3></div>${load}`;
  const al=alertas();
  const head=`<div class="adm-head"><h3>CRM de clientes <span class="count-pill">${NS.cli.length}</span></h3><button class="b" data-n="clinew" type="button">+ Nuevo cliente</button></div>`;
  if(NS.cliSel==='form')return head+cliForm();
  if(NS.cliSel)return head+cliDetail();
  const f=NS.cliF,filt=NS.cli.filter(c=>(!f.estado||c.estado===f.estado)&&(!f.origen||(c.origenes||[c.origen]).includes(f.origen))&&(!f.tipo||String(c.tipo||'').toLowerCase().includes(f.tipo.toLowerCase()))&&(!f.desde||(c.creado||'').slice(0,10)>=f.desde)&&(!f.q||[c.nombre,c.telefono,c.correo,c.ciudad,c.tipo].join(' ').toLowerCase().includes(f.q.toLowerCase())));
  const tabs=sub([['tablero','Tablero'],['lista','Lista'],['alertas','Alertas',al.total||null],['copias','Copias']],NS.cliV,'cliv');
  let body='';
  const filtros=`<div class="adm-filters"><label>Buscar<input data-nf="cliF.q" value="${esc(f.q)}" placeholder="Nombre, teléfono, correo…"></label>${sel('Estado','n-cfe',[['','Todos'],...Object.entries(CLI)],f.estado)}${sel('Origen','n-cfo',[['','Todos'],...Object.entries(ORIG)],f.origen)}<label>Tipo de proyecto<input data-nf="cliF.tipo" value="${esc(f.tipo)}" placeholder="Ej. cocina"></label><label>Desde<input type="date" id="n-cfd" value="${esc(f.desde)}"></label></div>`;
  if(NS.cliV==='tablero')body=filtros+`<div class="kb">${Object.entries(CLI).map(([k,n])=>{const l=filt.filter(c=>c.estado===k),tot=l.reduce((s,c)=>s+(Number(c.valor)||0),0);return `<section class="kb-col" data-col="${k}"><header><b>${n}</b><span>${l.length}</span>${tot?`<small>${money(tot)}</small>`:''}</header><div class="kb-list">${l.map(kbCard).join('')||'<p class="kb-empty">Sin clientes</p>'}</div></section>`}).join('')}</div>`;
  if(NS.cliV==='lista')body=filtros+(filt.length?`<div class="adm-tablewrap"><table class="st-tab adm-ct"><thead><tr><th>Cliente</th><th>Contacto</th><th>Tipo</th><th>Origen</th><th>Estado</th><th>Valor</th><th>Último contacto</th></tr></thead><tbody>${filt.slice().sort((a,b)=>Date.parse(b.ultimo)-Date.parse(a.ultimo)).map(c=>`<tr data-n="cliopen" data-id="${c.id}" class="adm-click"><td><b>${esc(c.nombre)}</b>${c.sinAtender?' <span class="kb-dot" title="Sin responder"></span>':''}</td><td>${esc(c.telefono)}<br><small>${esc(c.correo)}</small></td><td>${esc(c.tipo)}</td><td>${esc(ORIG[c.origen]||c.origen)}</td><td>${pill(CLI[c.estado])}</td><td>${c.valor?money(c.valor):'—'}</td><td>${fdd(c.ultimo)}</td></tr>`).join('')}</tbody></table></div>`:'<p class="adm-empty">No hay clientes con esos filtros.</p>');
  if(NS.cliV==='alertas')body=alertasHtml(al);
  if(NS.cliV==='copias')body=copiasHtml();
  return head+tabs+msgBar()+body;
}
function kbCard(c){
  const d=dias(c.ultimo),rec=(c.recordatorios||[]).filter(r=>!r.hecho).sort((a,b)=>a.fecha.localeCompare(b.fecha))[0];
  return `<article class="kb-card" draggable="true" data-card="${c.id}" data-n="cliopen" data-id="${c.id}"><b>${esc(c.nombre)}</b>${c.sinAtender?'<span class="kb-dot" title="Sin responder"></span>':''}<small>${esc(c.tipo||'—')}</small><small>${esc(c.telefono||c.correo||'')}</small>${c.valor?`<em>${money(c.valor)}</em>`:''}<small class="kb-meta">${d===0?'Hoy':'Hace '+d+' d'}${rec?` · ⏰ ${fdd(rec.fecha)}`:''}</small><select data-nmove="${c.id}" aria-label="Mover a" onclick="event.stopPropagation()">${Object.entries(CLI).map(([k,n])=>`<option value="${k}" ${k===c.estado?'selected':''}>${n}</option>`).join('')}</select></article>`;
}
function alertasHtml(al){
  const h=hoy(),row=(c,t)=>`<div class="adm-item adm-click" data-n="cliopen" data-id="${c.id}"><div class="adm-item-body"><b>${esc(c.nombre)}</b><small>${t}</small></div><div class="adm-item-act">${pill(CLI[c.estado])}</div></div>`;
  return `<div class="adm-cols"><div class="fm"><h3>Recordatorios <span class="count-pill">${al.rec.length}</span></h3>${al.rec.map(({c,r})=>`<div class="adm-item"><div class="adm-item-body"><b>${esc(r.texto)}</b><small>${esc(c.nombre)} · ${r.fecha<h?'<b class="dn">Vencido</b> ':r.fecha===h?'<b class="dn">Hoy</b> ':''}${fdd(r.fecha)}</small></div><div class="adm-item-act"><button class="b o sm" data-n="remdone" data-id="${c.id}" data-v="${r.id}" type="button">Hecho</button><button class="b o sm" data-n="cliopen" data-id="${c.id}" type="button">Abrir</button></div></div>`).join('')||'<p class="adm-empty">Sin recordatorios para los próximos 7 días.</p>'}</div>
  <div class="fm"><h3>Sin responder <span class="count-pill">${al.sin.length}</span></h3>${al.sin.map(c=>row(c,'Escribió hace '+dias(c.ultimoCliente||c.creado)+' d y no se ha registrado respuesta')).join('')||'<p class="adm-empty">Todo respondido.</p>'}</div>
  <div class="fm"><h3>Pendientes de seguimiento <span class="count-pill">${al.pend.length}</span></h3>${al.pend.map(c=>row(c,'Sin contacto desde hace '+dias(c.ultimoAdmin||c.ultimo||c.creado)+' d')).join('')||'<p class="adm-empty">Sin oportunidades detenidas.</p>'}</div></div>`;
}
function copiasHtml(){
  if(!need('bk','bk-list',{},r=>{NS.bk=r.copias||[]}))return load;
  return `<div class="fm adm-wide"><h3>Copias de seguridad</h3><div class="adm-actions"><button class="b" data-n="bkmake" type="button">Crear copia ahora</button><button class="b o" data-n="bkdown" type="button">Descargar todo (JSON)</button><label class="b o">Restaurar desde archivo<input type="file" accept="application/json,.json" data-nfile="bkrestore" hidden></label></div>
  <h4>Copias automáticas (una por día, las últimas 14)</h4>${NS.bk.length?`<ul class="adm-bk">${NS.bk.map(k=>`<li><span>${esc(k.replace('bk-',''))}</span><button class="b o sm" data-n="bkget" data-v="${esc(k)}" type="button">Descargar</button></li>`).join('')}</ul>`:'<p class="adm-empty">Aún no hay copias automáticas.</p>'}</div>`;
}
function cliForm(){
  const f=NS.cliForm;
  return `<button class="b o sm" data-n="cliback" type="button">← Volver</button>${msgBar()}<div class="fm adm-wide"><h3>${f.id?'Editar cliente':'Nuevo cliente'}</h3><div class="adm-grid2">
  <label>Nombre completo<input data-nf="cliForm.nombre" value="${esc(f.nombre)}" maxlength="90"></label>
  <label>Teléfono<input data-nf="cliForm.telefono" value="${esc(f.telefono)}" maxlength="30" type="tel"></label>
  <label>Correo<input data-nf="cliForm.correo" value="${esc(f.correo)}" maxlength="120" type="email"></label>
  <label>Ciudad o zona<input data-nf="cliForm.ciudad" value="${esc(f.ciudad)}" maxlength="80"></label>
  <label>Tipo de proyecto<input data-nf="cliForm.tipo" list="n-tipos2" value="${esc(f.tipo)}" maxlength="80"><datalist id="n-tipos2">${TIPOS.map(t=>`<option value="${t}">`).join('')}</datalist></label>
  <label>Origen<select data-nf="cliForm.origen">${Object.entries(ORIG).map(([k,n])=>`<option value="${k}" ${f.origen===k?'selected':''}>${n}</option>`).join('')}</select></label>
  <label>Estado<select data-nf="cliForm.estado">${Object.entries(CLI).map(([k,n])=>`<option value="${k}" ${f.estado===k?'selected':''}>${n}</option>`).join('')}</select></label>
  <label>Valor de la oportunidad o venta (COP)<input data-nf="cliForm.valor" type="number" min="0" value="${esc(f.valor||'')}"></label></div>
  <label>Observaciones<textarea data-nf="cliForm.obs" rows="3" maxlength="1500">${esc(f.obs)}</textarea></label>
  <div class="adm-actions"><button class="b" data-n="clisave" type="button">Guardar</button><button class="b o" data-n="cliback" type="button">Cancelar</button>${f.dup?`<button class="b o" data-n="cliopen" data-id="${f.dup.id}" type="button">Abrir cliente existente</button>`:''}</div></div>`;
}
function cliDetail(){
  const d=NS.det;if(!d||d.cliente.id!==NS.cliSel){if(!LD.det){LD.det=1;NA('c-get',{id:NS.cliSel}).then(r=>{LD.det=0;if(r.ok)NS.det=r;else{NS.err=r.e||'No se pudo cargar el cliente.';NS.cliSel=''}rerender()})}return `<button class="b o sm" data-n="cliback" type="button">← Volver</button>${load}`}
  const c=d.cliente,pend=(c.recordatorios||[]).slice().sort((a,b)=>a.fecha.localeCompare(b.fecha));
  const conv=[...d.chat.map(m=>({at:m.at,t:'💬 Chat · '+(m.from==='admin'?'TECNO ESPACIOS':m.name),x:m.message})),...d.mensajes.map(m=>({at:m.at,t:'✉️ Formulario · '+m.asunto,x:m.mensaje}))].sort((a,b)=>Date.parse(a.at)-Date.parse(b.at));
  return `<button class="b o sm" data-n="cliback" type="button">← Volver</button>${msgBar()}
  <div class="adm-cols"><div class="fm"><h3>${esc(c.nombre)} ${pill(CLI[c.estado])}${c.sinAtender?' <span class="kb-dot" title="Sin responder"></span>':''}</h3>
   <dl class="adm-dl"><div><dt>Teléfono</dt><dd>${esc(c.telefono)||'—'}</dd></div><div><dt>Correo</dt><dd>${esc(c.correo)||'—'}</dd></div><div><dt>Ciudad</dt><dd>${esc(c.ciudad)||'—'}</dd></div><div><dt>Interés</dt><dd>${esc(c.tipo)||'—'}</dd></div><div><dt>Origen</dt><dd>${(c.origenes||[c.origen]).map(o=>esc(ORIG[o]||o)).join(', ')}</dd></div><div><dt>Primer contacto</dt><dd>${fdt(c.creado)}</dd></div><div><dt>Último contacto</dt><dd>${fdt(c.ultimo)}</dd></div><div><dt>Valor</dt><dd>${c.valor?money(c.valor):'—'}</dd></div>${c.obs?`<div><dt>Observaciones</dt><dd>${esc(c.obs)}</dd></div>`:''}</dl>
   <div class="adm-actions"><button class="b" data-n="cliedit" type="button">Editar</button>${c.telefono?`<a class="b o" target="_blank" rel="noopener" href="${waLink(c.telefono,'Hola '+c.nombre+', te escribimos de TECNO ESPACIOS.')}">WhatsApp</a>`:''}<button class="b o sm adm-del" data-n="clidel" type="button">Eliminar</button></div>
   <h4>Mover a</h4><select data-nmove="${c.id}">${Object.entries(CLI).map(([k,n])=>`<option value="${k}" ${k===c.estado?'selected':''}>${n}</option>`).join('')}</select></div>
  <div class="fm"><h3>Recordatorios</h3><div class="adm-grid2"><label>Fecha<input type="date" id="n-rf" value="${addD(hoy(),1)}"></label><label>Asunto<input id="n-rt" maxlength="300" placeholder="Ej. Llamar para confirmar medidas"></label></div><button class="b o sm" data-n="cadd" data-k="recordatorios" type="button">+ Agregar recordatorio</button>
   ${pend.map(r=>`<div class="adm-line ${r.hecho?'done':''}"><span><b>${fdd(r.fecha)}</b> ${esc(r.texto)}</span><button class="b o sm" data-n="remdone" data-id="${c.id}" data-v="${r.id}" data-h="${r.hecho?0:1}" type="button">${r.hecho?'Reabrir':'Hecho'}</button><button class="adm-x2" data-n="crm" data-k="recordatorios" data-v="${r.id}" type="button" aria-label="Eliminar">×</button></div>`).join('')}</div></div>
  <div class="adm-cols"><div class="fm"><h3>Registrar contacto</h3><div class="adm-grid2">${sel('Tipo','n-ct',[['llamada','Llamada'],['whatsapp','WhatsApp'],['visita','Visita'],['correo','Correo'],['otro','Otro']],'llamada')}<label>Fecha<input type="date" id="n-cf" value="${hoy()}"></label></div><label>¿Qué se habló?<textarea id="n-cx" rows="3" maxlength="1000"></textarea></label><button class="b o sm" data-n="cadd" data-k="contactos" type="button">+ Registrar</button>
   ${(c.contactos||[]).slice().reverse().map(x=>`<div class="adm-line"><span><b>${fdd(x.at)} · ${esc(x.tipo)}</b><br>${esc(x.texto)}</span><button class="adm-x2" data-n="crm" data-k="contactos" data-v="${x.id}" type="button" aria-label="Eliminar">×</button></div>`).join('')}</div>
  <div class="fm"><h3>Notas</h3><label><textarea id="n-nx" rows="3" maxlength="1500" placeholder="Escribe una nota"></textarea></label><button class="b o sm" data-n="cadd" data-k="notas" type="button">+ Agregar nota</button>
   ${(c.notas||[]).slice().reverse().map(x=>`<div class="adm-line"><span><b>${fdt(x.at)}</b><br>${esc(x.texto)}</span><button class="adm-x2" data-n="crm" data-k="notas" data-v="${x.id}" type="button" aria-label="Eliminar">×</button></div>`).join('')}</div></div>
  <div class="adm-cols"><div class="fm"><h3>Cotizaciones</h3><div class="adm-grid2"><label>Número<input id="n-qn" maxlength="40" placeholder="COT-001"></label><label>Valor (COP)<input id="n-qv" type="number" min="0"></label></div><label>Nota<input id="n-qo" maxlength="300"></label><button class="b o sm" data-n="cadd" data-k="cotizaciones" type="button">+ Registrar cotización</button>
   ${(c.cotizaciones||[]).slice().reverse().map(x=>`<div class="adm-line"><span><b>${esc(x.numero||'Cotización')}</b> · ${money(x.valor)} · ${fdd(x.at)}${x.nota?'<br>'+esc(x.nota):''}</span><select data-nq="${x.id}">${[['enviada','Enviada'],['aprobada','Aprobada'],['rechazada','Rechazada']].map(([k,n])=>`<option value="${k}" ${x.estado===k?'selected':''}>${n}</option>`).join('')}</select><button class="adm-x2" data-n="crm" data-k="cotizaciones" data-v="${x.id}" type="button" aria-label="Eliminar">×</button></div>`).join('')}</div>
  <div class="fm"><h3>Solicitudes y proyectos</h3>${d.solicitudes.map(s=>`<div class="adm-line"><span><b>${esc(s.codigo)}</b> · ${esc(CANAL[s.canal]||s.canal)} · ${fdd(s.creada)}</span><button class="b o sm" data-n="gosol" data-id="${s.id}" type="button">Ver</button></div>`).join('')||'<p class="adm-empty">Sin solicitudes del personalizador.</p>'}
   ${d.proyectos.map(p=>`<div class="adm-line"><span><b>${esc(p.codigo)}</b> · ${esc(p.nombre)} · ${esc(PROY[p.estado])}</span><button class="b o sm" data-n="goproy" data-id="${p.id}" type="button">Ver</button></div>`).join('')}
   <button class="b o sm" data-n="proforcli" data-id="${c.id}" type="button">+ Crear proyecto</button></div></div>
  <div class="fm adm-wide"><h3>Historial de conversaciones</h3>${conv.length?`<div class="adm-conv">${conv.map(m=>`<p><small>${fdt(m.at)} · ${esc(m.t)}</small><br>${esc(m.x)}</p>`).join('')}</div>`:'<p class="adm-empty">Sin conversaciones registradas.</p>'}
   <h4>Actividad</h4><ul class="adm-act">${(c.hist||[]).slice().reverse().slice(0,40).map(h=>`<li><time>${fdt(h.at)}</time> ${esc(h.texto)}</li>`).join('')||'<li>—</li>'}</ul></div>`;
}

/* =============== Vistas para app.js =============== */
const ADMNEG={tabs:['pzadmin','proyadmin','statsadmin','crmadmin'],
  view(t){if(t==='pzadmin')return pzView();if(t==='proyadmin')return proView();if(t==='statsadmin')return statsView();return crmView()},
  alertCount:()=>NS.cli?alertas().total:0};
window.ADMNEG=ADMNEG;

/* =============== Eventos =============== */
const reset=k=>{k.forEach(x=>NS[x]=null)};
document.addEventListener('click',async e=>{
  const tb=e.target.closest('[data-tab]');
  if(tb){const t=tb.dataset.tab;NS.msg=NS.err='';
    if(t==='pzadmin'){reset(['sol','cli']);NS.solSel='';NS.pzV='sol'}if(t==='proyadmin'){reset(['pro','cli']);NS.proSel=''}if(t==='statsadmin')reset(['st']);if(t==='crmadmin'){reset(['cli','bk']);NS.cliSel='';NS.det=null}return}
  const b=e.target.closest('[data-n]');if(!b)return;const a=b.dataset.n,id=b.dataset.id,v=b.dataset.v;
  const done=async(r,ok,k)=>{if(r.ok){if(k)reset(k);flash(ok)}else flash(r.e||'No se pudo completar la acción.',1)};
  const val=i=>((q('#'+i)||{}).value||'').trim?(q('#'+i).value||'').trim():'';
  if(a==='pzv'){NS.pzV=v;NS.solSel='';rerender()}
  else if(a==='solopen'){NS.solSel=id;rerender()}
  else if(a==='solback'){NS.solSel='';rerender()}
  else if(a==='solrefresh'){reset(['sol']);rerender()}
  else if(a==='solsave'){const r=await NA('s-upd',{id,estado:val('n-se'),nota:(q('#n-sn')||{}).value||''});await done(r,'Solicitud actualizada.',['sol'])}
  else if(a==='solassign'){const r=await NA('s-upd',{id,clienteId:val('n-sc')});await done(r,'Solicitud relacionada con el cliente.',['sol','cli'])}
  else if(a==='soldel'){if(confirm('¿Eliminar esta solicitud? No se puede deshacer.')){const r=await NA('s-del',{id});if(r.ok)NS.solSel='';await done(r,'Solicitud eliminada.',['sol','cli'])}}
  else if(a==='solproy'){const s=NS.sol.find(x=>x.id===id);NS.proForm={id:'',nombre:(({cocina:'Cocina',closet:'Closet',bano:'Mueble de baño',personalizado:'Mueble'})[s.tipo]||'Proyecto')+' · '+s.contacto.nombre,tipo:nombresTipo[s.tipo]||'',clienteId:s.clienteId,solicitudId:s.id,estado:0,inicio:hoy(),entrega:'',novedad:'',notaInterna:''};NS.proSel='form';reset(['pro']);tab='proyadmin';rerender()}
  else if(a==='gocli'){NS.cliSel=id;NS.det=null;NS.cliV='tablero';reset(['cli']);tab='crmadmin';rerender()}
  else if(a==='gosol'){NS.solSel=id;NS.pzV='sol';reset(['sol']);tab='pzadmin';rerender()}
  else if(a==='goproy'){NS.proSel=id;reset(['pro','cli']);tab='proyadmin';rerender()}
  /* proyectos */
  else if(a==='pronew'){NS.proForm={id:'',nombre:'',tipo:'',clienteId:'',solicitudId:'',estado:0,inicio:hoy(),entrega:'',novedad:'',notaInterna:''};NS.proSel='form';rerender()}
  else if(a==='proopen'){NS.proSel=id;rerender()}
  else if(a==='proback'){NS.proSel='';NS.msg=NS.err='';rerender()}
  else if(a==='proedit'){const p=NS.pro.find(x=>x.id===id);NS.proForm={id:p.id,nombre:p.nombre,tipo:p.tipo,clienteId:p.clienteId,solicitudId:p.solicitudId||'',estado:p.estado,inicio:p.inicio,entrega:p.entrega,novedad:'',notaInterna:p.notaInterna||''};NS.proSel='form';rerender()}
  else if(a==='proforcli'){NS.proForm={id:'',nombre:'',tipo:NS.det.cliente.tipo||'',clienteId:id,solicitudId:'',estado:0,inicio:hoy(),entrega:'',novedad:'',notaInterna:''};NS.proSel='form';reset(['pro']);tab='proyadmin';rerender()}
  else if(a==='prosave'){const r=await NA('p-save',NS.proForm);if(r.ok){NS.proSel=r.id;reset(['pro','cli','sol']);flash('Proyecto guardado. Código: '+r.codigo)}else flash(r.e||'No se pudo guardar.',1)}
  else if(a==='prodel'){if(confirm('¿Eliminar este proyecto? El cliente ya no podrá consultarlo.')){const r=await NA('p-del',{id});if(r.ok)NS.proSel='';await done(r,'Proyecto eliminado.',['pro','cli'])}}
  else if(a==='fotodel'){if(confirm('¿Quitar esta fotografía?')){const r=await NA('p-fotodel',{id,idx:v});await done(r,'Fotografía eliminada.',['pro'])}}
  else if(a==='copy'){try{await navigator.clipboard.writeText(v);flash('Código copiado.')}catch{flash('Código: '+v)}}
  /* estadísticas */
  else if(a==='strefresh'){reset(['st']);rerender()}
  /* CRM */
  else if(a==='cliv'){NS.cliV=v;rerender()}
  else if(a==='clinew'){NS.cliForm={id:'',nombre:'',telefono:'',correo:'',ciudad:'',tipo:'',origen:'otro',estado:'nuevo',valor:'',obs:''};NS.cliSel='form';rerender()}
  else if(a==='cliopen'){NS.cliSel=id;NS.det=null;NS.msg=NS.err='';rerender()}
  else if(a==='cliback'){NS.cliSel='';NS.det=null;reset(['cli']);NS.msg=NS.err='';rerender()}
  else if(a==='cliedit'){NS.cliForm={...NS.det.cliente};NS.cliSel='form';rerender()}
  else if(a==='clisave'){const f=NS.cliForm,r=await NA('c-save',f);if(r.ok){NS.cliSel=r.id;NS.det=null;reset(['cli']);flash('Cliente guardado.')}else{if(r.dup)NS.cliForm.dup=r.dup;flash(r.e||'No se pudo guardar.',1)}}
  else if(a==='clidel'){if(confirm('¿Eliminar a este cliente y todo su historial? No se puede deshacer.')){const r=await NA('c-del',{id:NS.cliSel});if(r.ok){NS.cliSel='';NS.det=null}await done(r,'Cliente eliminado.',['cli'])}}
  else if(a==='cadd'){
    const k=b.dataset.k,m={notas:{texto:(q('#n-nx')||{}).value},recordatorios:{fecha:(q('#n-rf')||{}).value,texto:(q('#n-rt')||{}).value},contactos:{tipo:(q('#n-ct')||{}).value,fecha:(q('#n-cf')||{}).value,texto:(q('#n-cx')||{}).value},cotizaciones:{numero:(q('#n-qn')||{}).value,valor:(q('#n-qv')||{}).value||0,nota:(q('#n-qo')||{}).value}};
    const r=await NA('c-add',{id:NS.cliSel,kind:k,item:m[k]});if(r.ok){NS.det=null;reset(['cli']);flash('Guardado.')}else flash(r.e||'No se pudo guardar.',1)}
  else if(a==='crm'){if(confirm('¿Eliminar este registro?')){const r=await NA('c-rm',{id:NS.cliSel,kind:b.dataset.k,itemId:v});if(r.ok){NS.det=null;reset(['cli']);flash('Eliminado.')}else flash(r.e||'Error',1)}}
  else if(a==='remdone'){const r=await NA('c-upd',{id,kind:'recordatorios',itemId:v,patch:{hecho:b.dataset.h!=='0'}});if(r.ok){NS.det=null;reset(['cli']);rerender()}else flash(r.e||'Error',1)}
  /* copias */
  else if(a==='bkmake'){const r=await NA('bk-make');await done(r,'Copia creada.',['bk'])}
  else if(a==='bkdown'){const r=await NA('bk-all');if(r.ok)descargar(r.copia,'copia-tecnoespacios-'+hoy()+'.json');else flash(r.e||'Error',1)}
  else if(a==='bkget'){const r=await NA('bk-get',{key:v});if(r.ok)descargar(r.copia,v+'.json');else flash(r.e||'Error',1)}
});
function descargar(o,n){const u=URL.createObjectURL(new Blob([JSON.stringify(o,null,1)],{type:'application/json'})),a=document.createElement('a');a.href=u;a.download=n;a.click();setTimeout(()=>URL.revokeObjectURL(u),1500)}

document.addEventListener('input',e=>{
  const t=e.target;if(!t.dataset||!t.dataset.nf)return;
  const [o,k]=t.dataset.nf.split('.');NS[o][k]=t.value;
  if(t.dataset.nf==='cliF.q'||t.dataset.nf==='cliF.tipo'){clearTimeout(input.t);input.t=setTimeout(()=>{const pos=t.selectionStart,id=t.dataset.nf;rerender();const n=document.querySelector(`[data-nf="${id}"]`);if(n){n.focus();try{n.setSelectionRange(pos,pos)}catch{}}},350)}
});
const input={};
document.addEventListener('change',async e=>{
  const t=e.target;
  if(t.dataset&&t.dataset.nf&&t.tagName==='SELECT'){const [o,k]=t.dataset.nf.split('.');NS[o][k]=t.value;return}
  if(t.id==='n-fs'){NS.solF.estado=t.value;rerender();return}if(t.id==='n-fc'){NS.solF.canal=t.value;rerender();return}
  if(t.id==='n-cfe'){NS.cliF.estado=t.value;rerender();return}if(t.id==='n-cfo'){NS.cliF.origen=t.value;rerender();return}if(t.id==='n-cfd'){NS.cliF.desde=t.value;rerender();return}
  if(t.id==='n-str'){NS.stR=t.value;rerender();return}if(t.id==='n-std'){NS.stD=t.value;rerender();return}if(t.id==='n-sth'){NS.stH=t.value;rerender();return}
  if(t.dataset&&t.dataset.nmove){const r=await NA('c-mover',{id:t.dataset.nmove,estado:t.value});if(r.ok){NS.det=null;reset(['cli']);flash('Cliente movido a «'+CLI[t.value]+'».')}else flash(r.e||'Error',1);return}
  if(t.dataset&&t.dataset.nq){const r=await NA('c-upd',{id:NS.cliSel,kind:'cotizaciones',itemId:t.dataset.nq,patch:{estado:t.value}});if(r.ok){NS.det=null;reset(['cli']);flash('Cotización actualizada.')}else flash(r.e||'Error',1);return}
  if(t.dataset&&t.dataset.nfile==='pfoto'&&t.files.length){
    const nota=(q('#n-fnota')||{}).value||'';let n=0;
    for(const f of t.files){const u=await up(f);if(u){const r=await NA('p-foto',{id:t.dataset.id,url:u,nota});if(r.ok)n++;else{flash(r.e||'No se pudo agregar la foto.',1);break}}}
    if(n){reset(['pro']);flash(n+(n===1?' fotografía agregada.':' fotografías agregadas.'))}return}
  if(t.dataset&&t.dataset.nfile==='bkrestore'&&t.files[0]){
    let d;try{d=JSON.parse(await t.files[0].text())}catch{return flash('El archivo no es una copia válida.',1)}
    if(!confirm('Se reemplazarán los clientes, solicitudes y proyectos actuales por los de la copia. Antes se guarda una copia de lo actual. ¿Continuar?'))return;
    const r=await NA('bk-restore',{copia:d});if(r.ok){reset(['cli','sol','pro','bk']);flash('Copia restaurada: '+r.clientes+' clientes, '+r.solicitudes+' solicitudes, '+r.proyectos+' proyectos.')}else flash(r.e||'No se pudo restaurar.',1)}
});
/* Tablero: arrastrar y soltar */
let drag='';
document.addEventListener('dragstart',e=>{const c=e.target.closest&&e.target.closest('[data-card]');if(!c)return;drag=c.dataset.card;e.dataTransfer.effectAllowed='move';try{e.dataTransfer.setData('text/plain',drag)}catch{}c.classList.add('drag')});
document.addEventListener('dragend',e=>{drag='';document.querySelectorAll('.kb-card.drag,.kb-col.over').forEach(x=>x.classList.remove('drag','over'))});
document.addEventListener('dragover',e=>{const c=e.target.closest&&e.target.closest('.kb-col');if(c&&drag){e.preventDefault();document.querySelectorAll('.kb-col.over').forEach(x=>x!==c&&x.classList.remove('over'));c.classList.add('over')}});
document.addEventListener('drop',async e=>{
  const c=e.target.closest&&e.target.closest('.kb-col');if(!c||!drag)return;e.preventDefault();
  const id=drag,estado=c.dataset.col;drag='';const cl=NS.cli.find(x=>x.id===id);if(!cl||cl.estado===estado)return rerender();
  const r=await NA('c-mover',{id,estado});if(r.ok){reset(['cli']);flash('Cliente movido a «'+CLI[estado]+'».')}else flash(r.e||'No se pudo mover.',1);
});
})();
