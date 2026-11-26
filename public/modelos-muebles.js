window.TE_MUEBLES = (() => {
 const tipos = [
  ['cocina', 'Cocina integral', '🍳'], ['closet', 'Clóset', '🚪'],
  ['bano', 'Mueble de baño', '🛁'], ['entretenimiento', 'Mueble de TV', '📺'],
  ['lavadero', 'Mueble de lavadero', '🧺'], ['personalizado', 'Muebles personalizados', '✏️']
 ];
 const partes = [['puertas', 'Puertas'], ['superiores', 'Puertas superiores'], ['estructura', 'Estructura'],
  ['cajones', 'Cajones'], ['laterales', 'Laterales'], ['divisiones', 'Divisiones']];
 const modelos = {
  cocina: [
   ['cocina-lineal', 'Cocina lineal', 'Muebles altos y bajos sobre una pared.'],
   ['cocina-l', 'Cocina en L', 'Dos frentes que aprovechan la esquina.'],
   ['cocina-isla', 'Cocina con isla', 'Muebles perimetrales y una isla central.']
  ],
  closet: [
   ['closet-corredizo', 'Clóset corredizo', 'Puertas deslizantes y un módulo abierto.'],
   ['closet-abatible', 'Clóset abatible', 'Puertas de apertura frontal y cajonera.'],
   ['closet-vestier', 'Vestier abierto', 'Zonas de colgar, entrepaños y cajones.']
  ],
  bano: [
   ['bano-flotante', 'Mueble flotante', 'Lavamanos sencillo con base suspendida.'],
   ['bano-doble', 'Lavamanos doble', 'Dos lavamanos y almacenamiento compartido.'],
   ['bano-torre', 'Mueble con torre', 'Lavamanos compacto con una torre lateral.']
  ],
  entretenimiento: [
   ['tv-panel', 'Panel para TV', 'Panel central y repisas a ambos lados.'],
   ['tv-modular', 'Centro modular', 'Almacenamiento superior y base para equipos.'],
   ['tv-flotante', 'Mueble flotante para TV', 'Base suspendida bajo un panel de pared.']
  ],
  lavadero: [
   ['lavadero-compacto', 'Lavadero compacto', 'Lavadero sobre gabinete con lavadora contigua.'],
   ['lavadero-lineal', 'Lavadero lineal', 'Mesón amplio, lavadero y almacenamiento alto.'],
   ['lavadero-torre', 'Lavandería con torre', 'Lavadora y secadora apiladas junto al lavadero.']
  ],
  personalizado: [
   ['personalizado-base', 'Diseño a medida', 'Gabinete con puertas, cajón y repisa.'],
   ['personalizado-almacenaje', 'Mueble de almacenamiento', 'Gabinete alto con nichos y cajones.'],
   ['personalizado-decorativo', 'Mueble decorativo', 'Repisas abiertas y una base cerrada.']
  ]
 };
 const nombres = Object.fromEntries(Object.values(modelos).flat().map(([id, nombre]) => [id, nombre]));
 const conMeson = tipo => ['cocina', 'bano', 'lavadero', 'personalizado'].includes(tipo);
 const predeterminados = {puertas:'#d9ba9a',superiores:'#e8d8c4',estructura:'#ab8464',
  cajones:'#c39b78',laterales:'#a77c5b',divisiones:'#be997a',meson:'#f6f1e8'};

 function dibujar(id, {acabados = {}, definiciones = '', tiradores = true, etiqueta = nombres[id]} = {}) {
  const contorno = 'stroke="#514235" stroke-opacity=".37" stroke-width="1.5" stroke-linejoin="round"';
  const fill = parte => acabados[parte] || acabados[parte === 'superiores' ? 'puertas' : parte] || predeterminados[parte];
  const rect = (x,y,w,h,color,rx=1) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${color}" ${contorno}/>`;
  const pieza = (x,y,w,h,parte) => rect(x,y,w,h,fill(parte));
  const pol = (points,parte) => `<polygon points="${points}" fill="${fill(parte)}" ${contorno}/>`;
  const manija = (x,y,l=22,vertical=false) => tiradores
   ? rect(x,y,vertical?4:l,vertical?l:4,'#736255',2) : '';
  const puerta = (x,y,w,h,parte='puertas') => pieza(x,y,w,h,parte)+manija(x+w-10,y+h/2-13,26,true);
  const cajon = (x,y,w,h) => pieza(x,y,w,h,'cajones')+manija(x+w/2-11,y+h/2-2);
  const caja = (x,y,w,h) => pieza(x,y,w,h,'estructura')+
   pieza(x,y,7,h,'laterales')+pieza(x+w-7,y,7,h,'laterales');
  const estante = (x,y,w) => pieza(x,y,w,7,'divisiones');
  const setPuertas = (x,y,w,h,n,parte='puertas') => {
   const ancho = (w-(n-1)*4)/n;
   return Array.from({length:n},(_,i)=>puerta(x+i*(ancho+4),y,ancho,h,parte)).join('');
  };
  const modulo = (x,y,w,h,n=2) => {
   const ancho = (w-18)/n;
   return caja(x,y,w,h)+Array.from({length:n},(_,i)=>{
    const izq=x+9+i*ancho;
    return cajon(izq,y+7,ancho-3,25)+puerta(izq,y+36,ancho-3,h-46);
   }).join('')+estante(x+7,y+32,w-14);
  };
  const alacena = (x,y,w,h,n=3) => caja(x,y,w,h)+setPuertas(x+9,y+8,w-18,h-16,n,'superiores');
  const repisa = (x,y,w,h,n=3) => caja(x,y,w,h)+
   Array.from({length:n},(_,i)=>estante(x+7,y+(i+1)*h/(n+1),w-14)).join('');
  const meson = (x,y,w) => pieza(x,y,w,13,'meson');
  const lavamanos = (x,y,w) => `<ellipse cx="${x}" cy="${y}" rx="${w}" ry="7" fill="#fcfbf8" ${contorno}/>`+
   `<path d="M${x} ${y-3}v-15q0-8 7-8h8v10" fill="none" stroke="#748081" stroke-width="4" stroke-linecap="round"/>`;
  const espejo = (x,y,w,h) => rect(x,y,w,h,'#dfe8e7',8)+
   `<path d="M${x+14} ${y+h-14}l${w*.35} -${h*.55}" stroke="#fff" stroke-width="5" opacity=".7"/>`;
  const tv = (x,y,w,h) => rect(x,y,w,h,'#272b2a',5)+rect(x+5,y+5,w-10,h-10,'#414b4b',2)+
   `<path d="M${x+10} ${y+h-10}l${w*.38} -${h*.7}" stroke="#91a4a1" stroke-width="5" opacity=".23"/>`;
  const lavadora = (x,y,w,h) => rect(x,y,w,h,'#eeeeea',5)+rect(x+8,y+8,w-16,16,'#c5cbc8',2)+
   `<circle cx="${x+w/2}" cy="${y+(h+22)/2}" r="${Math.min(w*.28,(h-27)*.39)}" fill="#889697" stroke="#535e60" stroke-width="4"/>`;
  let muebles = '';
  switch(id){
   case 'cocina-lineal':
    muebles=alacena(46,39,350,91)+repisa(400,39,113,91,2)+modulo(51,178,458,130,4)+
     meson(43,166,474)+lavamanos(333,167,31);break;
   case 'cocina-l':
    muebles=alacena(47,34,301,88)+repisa(352,34,103,88,2)+modulo(51,156,385,128,4)+
     meson(42,144,413)+lavamanos(287,144,29)+
     pol('385,156 451,156 513,221 513,316 447,296 385,258','laterales')+
     pol('381,143 455,143 522,213 451,213','meson')+pol('451,213 522,213 522,225 451,225','meson')+
     modulo(451,225,68,91,1);break;
   case 'cocina-isla':
    muebles=alacena(53,30,298,83)+repisa(356,30,151,83,2)+modulo(55,153,449,111,4)+
     meson(47,141,465)+lavamanos(382,141,29)+
     pol('134,232 391,232 445,207 211,207','meson')+
     pol('391,232 445,207 445,290 391,319','laterales')+
     modulo(136,244,261,75,3)+meson(128,232,278);break;
   case 'closet-corredizo':
    muebles=caja(80,24,400,283)+pieza(92,38,133,254,'puertas')+pieza(217,44,130,249,'puertas')+
     manija(207,143,36,true)+manija(329,143,36,true)+repisa(351,40,115,177,3)+
     cajon(356,223,108,29)+cajon(356,258,108,30)+estante(89,297,382);break;
   case 'closet-abatible':
    muebles=caja(67,24,426,285)+setPuertas(79,37,254,252,3)+repisa(341,36,139,170,3)+
     cajon(346,212,130,35)+cajon(346,251,130,37)+estante(77,297,405);break;
   case 'closet-vestier':
    muebles=caja(41,27,478,281)+repisa(52,37,116,221,4)+caja(173,37,235,221)+
     estante(181,75,219)+estante(181,163,219)+puerta(413,37,94,218)+
     '<path d="M198 97h186m-158 0v34m61-34v38m61-38v30" stroke="#6e7774" stroke-width="4"/>'+
     cajon(53,262,113,32)+cajon(175,262,232,32)+estante(51,298,458);break;
   case 'bano-flotante':
    muebles=espejo(153,41,254,106)+modulo(105,202,350,92,3)+meson(96,190,368)+
     lavamanos(280,188,37);break;
   case 'bano-doble':
    muebles=espejo(70,35,184,108)+espejo(306,35,184,108)+modulo(47,196,466,115,4)+
     meson(39,184,482)+lavamanos(160,182,35)+lavamanos(400,182,35);break;
   case 'bano-torre':
    muebles=espejo(82,56,230,99)+modulo(53,201,285,101,2)+meson(45,189,301)+
     lavamanos(196,186,36)+repisa(363,31,141,161,3)+puerta(375,198,117,106)+
     pieza(363,192,8,119,'laterales')+cajon(376,146,115,39);break;
   case 'tv-panel':
    muebles=pieza(123,35,314,215,'estructura')+tv(151,60,258,145)+
     repisa(34,67,88,167,3)+repisa(438,67,88,167,3)+modulo(55,245,450,72,4);break;
   case 'tv-modular':
    muebles=caja(83,24,395,67)+setPuertas(94,33,373,49,4)+tv(166,113,228,112)+
     repisa(52,114,92,111,2)+repisa(417,114,91,111,2)+modulo(49,241,462,78,3);break;
   case 'tv-flotante':
    muebles=pieza(150,35,260,213,'estructura')+pieza(154,35,19,213,'laterales')+
     Array.from({length:5},(_,i)=>pieza(372+i*7,38,4,204,'divisiones')).join('')+
     tv(174,60,202,114)+modulo(99,234,362,78,3);break;
   case 'lavadero-compacto':
    muebles=alacena(106,51,222,72,2)+repisa(334,51,118,72,2)+modulo(100,188,204,125,2)+
     lavadora(310,183,148,130)+meson(92,175,373)+lavamanos(199,173,44);break;
   case 'lavadero-lineal':
    muebles=alacena(44,37,373,75)+repisa(420,37,97,75,2)+modulo(45,183,156,131,1)+
     lavadora(207,181,145,133)+modulo(358,183,157,131,2)+meson(37,170,486)+
     lavamanos(122,169,37);break;
   case 'lavadero-torre':
    muebles=caja(57,27,182,291)+lavadora(70,44,156,124)+lavadora(70,175,156,124)+
     alacena(247,53,255,73,2)+modulo(247,186,255,128,2)+meson(240,173,269)+
     lavamanos(365,172,43);break;
   case 'personalizado-base':
    muebles=repisa(108,64,344,101,2)+modulo(108,169,344,136,3)+meson(100,157,360);break;
   case 'personalizado-almacenaje':
    muebles=caja(99,28,362,282)+setPuertas(112,43,205,170,2)+repisa(324,39,124,182,3)+
     cajon(112,225,336,30)+cajon(112,260,336,35)+meson(95,21,370);break;
   case 'personalizado-decorativo':
    muebles=repisa(86,43,180,174,3)+repisa(275,75,197,142,2)+
     modulo(89,225,380,82,3)+meson(80,213,398);break;
  }
  return `<svg viewBox="0 0 560 360" role="img" aria-label="${etiqueta || 'Vista previa del mueble'}"><defs>${definiciones}</defs><rect width="560" height="360" fill="#f1ede6"/><path d="M0 317h560v43H0z" fill="#e6ded2"/><path d="M0 317h560" stroke="#d2c7b7"/>${muebles}</svg>`;
 }
 return {tipos, partes, modelos, nombres, conMeson, dibujar};
})();
