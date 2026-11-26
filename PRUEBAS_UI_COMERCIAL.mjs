// Pruebas de interfaz en Chrome/Edge mediante CDP (escritorio y móvil).
// Requiere Netlify Dev en http://localhost:8888 y Chrome instalado.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';

const BASE = 'http://localhost:8888';
const AUTH = '102eadf5a95f7d262edefb1f2888cb8ded09635c5d71fa6c21d2def3902c299e';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PERFIL = path.join(os.tmpdir(), 'te-ui-' + Date.now());
const CAPTURAS = path.join(os.tmpdir(), 'te-capturas');
fs.mkdirSync(CAPTURAS, {recursive: true});

const resultados = [];
const erroresConsola = [];
const anotar = (nombre, ok, detalle = '') => {
  resultados.push({prueba: nombre, resultado: ok ? 'OK' : 'FALLO', detalle});
  console.log(`[${ok ? 'OK' : 'FALLO'}] ${nombre}${detalle ? ' — ' + detalle : ''}`);
};
const espera = ms => new Promise(r => setTimeout(r, ms));

const navegador = spawn(CHROME, [
  '--headless=new', '--remote-debugging-port=9222', '--remote-allow-origins=*', `--user-data-dir=${PERFIL}`,
  '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--disable-dev-shm-usage',
  'about:blank'
], {stdio: 'ignore'});

let ws;
try {
  let lista = null;
  for (let i = 0; i < 40; i++) {
    try {
      lista = await (await fetch('http://127.0.0.1:9222/json/list')).json();
      if (lista.some(t => t.type === 'page')) break;
    } catch {}
    await espera(250);
  }
  const pagina = lista?.find(t => t.type === 'page');
  if (!pagina) throw new Error('No se pudo iniciar Chrome con depuración remota.');

  ws = new WebSocket(pagina.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let seq = 0;
  const pendientes = new Map();
  ws.onmessage = ev => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pendientes.has(msg.id)) {
      const {resolve, reject, timer} = pendientes.get(msg.id);
      clearTimeout(timer);
      pendientes.delete(msg.id);
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
    } else if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
      erroresConsola.push(msg.params.args.map(a => a.value || a.description || '').join(' '));
    } else if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') {
      erroresConsola.push(msg.params.entry.text);
    }
  };
  const enviar = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++seq;
    const timer = setTimeout(() => { pendientes.delete(id); reject(new Error('Tiempo agotado: ' + method)); }, 20000);
    pendientes.set(id, {resolve, reject, timer});
    ws.send(JSON.stringify({id, method, params}));
  });
  const evalJS = async expresion => {
    const r = await enviar('Runtime.evaluate', {expression: expresion, returnByValue: true, awaitPromise: true});
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
  };
  const esperarPor = async (expresion, etiqueta, timeout = 15000) => {
    const inicio = Date.now();
    while (Date.now() - inicio < timeout) {
      try { if (await evalJS(expresion)) return true; } catch {}
      await espera(200);
    }
    let diagnostico = '';
    try { diagnostico = String(await evalJS("document.querySelector('#app')?.innerText || ''")).slice(0, 600); } catch {}
    throw new Error('Tiempo de espera agotado: ' + etiqueta +
      (diagnostico ? '\nContenido: ' + diagnostico.replace(/\s+/g, ' ') : '') +
      (erroresConsola.length ? '\nConsola: ' + erroresConsola.slice(0, 5).join(' | ') : ''));
  };
  const navegar = async ruta => {
    await enviar('Page.navigate', {url: BASE + ruta});
    await espera(900);
  };
  const capturar = async nombre => {
    const r = await enviar('Page.captureScreenshot', {format: 'png', captureBeyondViewport: false});
    const archivo = path.join(CAPTURAS, nombre);
    fs.writeFileSync(archivo, Buffer.from(r.data, 'base64'));
    return archivo;
  };
  const poner = (selector, valor) => `(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)return false;e.value=${JSON.stringify(valor)};e.dispatchEvent(new Event('input',{bubbles:true}));return true})()`;

  await enviar('Page.enable');
  await enviar('Runtime.enable');
  await enviar('Log.enable');

  // ---------- Escritorio ----------
  await enviar('Emulation.setDeviceMetricsOverride', {width: 1440, height: 900, deviceScaleFactor: 1, mobile: false});
  await navegar('/personalizador');
  await esperarPor("document.querySelector('[data-com-step=\"2\"]') !== null", 'personalizador');
  await evalJS("document.querySelector('[data-com-step=\"2\"]').click()");
  await esperarPor("document.querySelectorAll('.com-color-card').length >= 50", 'catálogo de colores');
  const totalColores = await evalJS("document.querySelectorAll('.com-color-card').length");
  anotar('Escritorio: catálogo completo visible', totalColores === 56, `${totalColores} colores`);
  const datosColor = await evalJS(`(()=>{const c=document.querySelector('.com-color-card');return {img:!!c.querySelector('img'),nombre:c.querySelector('b')?.textContent,ref:c.querySelector('small')?.textContent,hex:c.querySelector('code')?.textContent}})()`);
  anotar('Escritorio: foto, nombre, referencia y código visibles', datosColor.img && !!datosColor.nombre && !!datosColor.ref && /^#[0-9a-f]{6}$/i.test(datosColor.hex || ''), JSON.stringify(datosColor));

  await evalJS("document.querySelector('[data-com-color=\"colores|Terranta\"]').click()");
  await esperarPor("document.querySelector('.com-color-card.on') !== null", 'selección de color');
  await evalJS("document.querySelector('[data-com-color=\"colores|Oasis\"]').click()");
  await evalJS("document.querySelector('[data-com-part=\"cajones\"]').click()");
  await evalJS("document.querySelector('[data-com-color=\"colores|Riviera\"]').click()");
  const asignados = await evalJS("document.querySelector('.com-preview ul')?.innerText || ''");
  anotar('Escritorio: selección múltiple y asignación por partes', ['Terranta', 'Oasis', 'Riviera'].every(n => asignados.includes(n)), asignados.replace(/\s+/g, ' ').slice(0, 140));

  await evalJS("document.querySelector('[data-com-step=\"3\"]').click()");
  await esperarPor("document.querySelector('#comMsg') !== null", 'resumen de cotización');
  const resumen = await evalJS("document.querySelector('#app').innerText");
  anotar('Escritorio: precio sujeto a cotización', resumen.includes('Sujeto a cotización') && !/\$\s?\d/.test(resumen));

  await evalJS("document.querySelector('[data-com-crear]').click()");
  anotar('Opción de proyecto activada en el formulario', await evalJS("document.querySelector('[data-com-crear]').checked"));
  await evalJS(poner('[data-com-contact="nombre"]', 'Cliente Prueba UI'));
  await evalJS(poner('[data-com-contact="tel"]', '3101234567'));
  await evalJS(poner('[data-com-contact="email"]', 'prueba-ui@ejemplo.com'));
  await evalJS("document.querySelector('[data-com-send=\"cotizacion\"]').click()");
  await esperarPor("(document.querySelector('#comMsg')?.textContent || '').includes('Solicitud registrada')", 'envío de solicitud', 20000);
  const mensaje = await evalJS("document.querySelector('#comMsg').textContent");
  const codigo = (mensaje.match(/TE-\d{8}-[0-9A-F]{4}/) || [])[0] || '';
  anotar('Escritorio: solicitud enviada con código de seguimiento', !!codigo, codigo || mensaje);
  const capturaEscritorio = await capturar('te-personalizador-escritorio.png');

  await navegar('/seguimiento');
  await esperarPor("document.querySelector('#segForm') !== null", 'formulario de seguimiento');
  await evalJS(poner('#segCode', codigo));
  await evalJS(poner('#segVer', 'prueba-ui@ejemplo.com'));
  await evalJS("document.querySelector('#segForm button').click()");
  await esperarPor("document.querySelector('.seg-status') !== null", 'resultado de seguimiento', 20000);
  const estado = await evalJS("document.querySelector('.seg-status').textContent");
  const hitos = await evalJS("document.querySelectorAll('.seg-timeline li').length");
  anotar('Escritorio: consulta pública de seguimiento', !!estado && hitos === 9, `${estado} · ${hitos} hitos`);
  await capturar('te-seguimiento-escritorio.png');

  // ---------- Panel administrativo ----------
  await evalJS(`sessionStorage.setItem('te',${JSON.stringify(AUTH)})`);
  await navegar('/');
  await enviar('Page.reload', {ignoreCache: true});
  await espera(1200);
  await evalJS("location.hash='#/admin'");
  await esperarPor("document.querySelector('[data-comtab=\"compersonalizador\"]') !== null", 'entrada al panel comercial');
  await evalJS("document.querySelector('[data-comtab=\"compersonalizador\"]').click()");
  await esperarPor("document.querySelector('[data-comtab=\"comstats\"]') !== null", 'panel comercial');
  await evalJS("document.querySelector('[data-comtab=\"comstats\"]').click()");
  await esperarPor("document.querySelector('.com-stats-grid') !== null", 'estadísticas', 20000);
  const tarjetas = await evalJS("document.querySelectorAll('.com-stat').length");
  anotar('Panel: estadísticas reales renderizadas', tarjetas >= 7, `${tarjetas} tarjetas`);

  await evalJS("document.querySelector('[data-comtab=\"comcrm\"]').click()");
  await esperarPor("document.querySelector('.com-kanban') !== null", 'CRM', 20000);
  const columnas = await evalJS("document.querySelectorAll('.com-kanban-col').length");
  anotar('Panel: CRM con tablero por etapas', columnas === 7, `${columnas} etapas`);

  await evalJS("document.querySelector('[data-comtab=\"compersonalizador\"]').click()");
  await esperarPor("document.querySelectorAll('[data-com-config]').length >= 6", 'configuración del personalizador', 20000);
  const ocultos = await evalJS("document.querySelectorAll('[data-com-hidden]').length");
  anotar('Panel: configuración y catálogo sincronizados', ocultos === 56, `${ocultos} colores gestionables`);

  await evalJS("document.querySelector('[data-com-exit]').click()");
  await esperarPor("document.querySelector('[data-com-exit]') === null", 'salida del panel comercial');
  anotar('Panel: retorno al panel general', true);

  // ---------- Móvil ----------
  await enviar('Emulation.setDeviceMetricsOverride', {width: 390, height: 844, deviceScaleFactor: 2, mobile: true});
  await navegar('/personalizador');
  await esperarPor("document.querySelector('[data-com-step=\"2\"]') !== null", 'personalizador en móvil');
  await evalJS("document.querySelector('[data-com-step=\"2\"]').click()");
  await esperarPor("document.querySelectorAll('.com-color-card').length >= 50", 'catálogo en móvil');
  const movil = await evalJS(`(()=>({
    ancho: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
    columnas: getComputedStyle(document.querySelector('.com-layout')).gridTemplateColumns.split(' ').length,
    tarjetas: document.querySelectorAll('.com-color-card').length,
    boton: document.querySelector('.com-part-list button').getBoundingClientRect().height
  }))()`);
  anotar('Móvil: sin desbordamiento horizontal', movil.ancho <= movil.viewport + 2, `scrollWidth=${movil.ancho} viewport=${movil.viewport}`);
  anotar('Móvil: diseño de una columna y controles táctiles', movil.columnas === 1 && movil.boton >= 36 && movil.tarjetas === 56, JSON.stringify(movil));
  const capturaMovil = await capturar('te-personalizador-movil.png');

  await navegar('/seguimiento');
  await esperarPor("document.querySelector('#segForm') !== null", 'seguimiento en móvil');
  const movilSeg = await evalJS(`(()=>({ancho:document.documentElement.scrollWidth,viewport:window.innerWidth,columnas:getComputedStyle(document.querySelector('.com-inline')).gridTemplateColumns.split(' ').length}))()`);
  anotar('Móvil: seguimiento sin desbordamiento', movilSeg.ancho <= movilSeg.viewport + 2 && movilSeg.columnas === 1, JSON.stringify(movilSeg));
  await capturar('te-seguimiento-movil.png');

  anotar('Consola sin errores de JavaScript', erroresConsola.length === 0, erroresConsola.slice(0, 3).join(' | '));
  console.log('\nCapturas:', capturaEscritorio, capturaMovil, path.join(CAPTURAS, 'te-seguimiento-escritorio.png'), path.join(CAPTURAS, 'te-seguimiento-movil.png'));
  const fallos = resultados.filter(r => r.resultado === 'FALLO').length;
  console.log(`\nRESUMEN UI: ${resultados.length} pruebas, ${fallos} fallos`);
  fs.writeFileSync(path.join(CAPTURAS, 'resultados.json'), JSON.stringify({resultados, erroresConsola}, null, 2));
  if (fallos) process.exitCode = 1;
} catch (e) {
  console.error('ERROR EN PRUEBAS UI:', e.message);
  process.exitCode = 1;
} finally {
  try { ws?.close(); } catch {}
  navegador.kill('SIGKILL');
  setTimeout(() => { try { fs.rmSync(PERFIL, {recursive: true, force: true}); } catch {} }, 500);
}
