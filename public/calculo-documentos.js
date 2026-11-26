(function(){
 const iva = [0, 5, 19];
 function entero(value, decimales, maximo) {
  const text = String(value ?? '').trim().replace(',', '.');
  if (!new RegExp('^\\d{1,13}(?:\\.\\d{1,' + decimales + '})?$').test(text)) return null;
  const [whole, fraction=''] = text.split('.');
  const result = Number(whole + fraction.padEnd(decimales, '0'));
  return result <= maximo ? result : null;
 }
 function precioCentavos(valor, maximo = 10000000000) {
  let precio = String(valor ?? '').trim().replace(/^(?:COP\s*)?\$?\s*/i,'');
  if (/^\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?$/.test(precio)) precio = precio.replace(/\./g,'');
  return entero(precio, 2, maximo);
 }
 function calcular(partidas) {
  if (!Array.isArray(partidas) || partidas.length < 1 || partidas.length > 25) return null;
  const lineas = [];
  for (const p of partidas) {
   if (!p || typeof p!=='object') return null;
   const cantidad = entero(p.cantidad, 3, 1000000);
   const precio = precioCentavos(p.precio);
   const tasa = Number(p.iva);
   if (!cantidad || precio === null || !iva.includes(tasa)) return null;
   const base = Number((BigInt(cantidad) * BigInt(precio) + 500n) / 1000n);
   const impuesto = Number((BigInt(base) * BigInt(tasa) + 50n) / 100n);
   lineas.push({cantidad, precio, tasa, base, impuesto, total:base + impuesto});
  }
  const subtotal = lineas.reduce((ac, l) => ac + l.base, 0);
  const impuesto = lineas.reduce((ac, l) => ac + l.impuesto, 0);
  return {lineas, subtotal, impuesto, total:subtotal + impuesto};
 }
 const fmt = new Intl.NumberFormat('es-CO', {minimumFractionDigits:2, maximumFractionDigits:2});
 const moneda = centavos => '$ ' + fmt.format(centavos/100);
 const mediosAbono = ['Transferencia','Efectivo','Tarjeta','Otro'];
 const tools = {calcular, moneda, precioCentavos, mediosAbono};
 if (typeof module === 'object' && module.exports) module.exports = tools;
 else window.TE_CALC_DOC = tools;
})();
