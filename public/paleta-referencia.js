(function(){
 const muestras=[
  {id:'ref-blanco',n:'Blanco cálido',x:'#f4f0e8'},
  {id:'ref-roble',n:'Roble claro',x:'#b78b61',img:['img/cat/colores-roble-mallado.jpg']},
  {id:'ref-arena',n:'Arena',x:'#c8b394'},
  {id:'ref-olivo',n:'Verde oliva',x:'#777d55'},
  {id:'ref-grafito',n:'Gris grafito',x:'#494c50'},
  {id:'ref-negro',n:'Negro',x:'#262827'}
 ].map(m=>({k:'colores',s:'Muestra de referencia',referencia:true,...m}));
 if(typeof module==='object'&&module.exports)module.exports=muestras;
 else window.TE_PALETA_REFERENCIA=muestras;
})();
