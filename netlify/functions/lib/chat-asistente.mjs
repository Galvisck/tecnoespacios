const normalize = value => String(value ?? '').toLowerCase().normalize('NFD')
 .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

const includes = (text, phrase) => (' ' + text + ' ').includes(' ' + normalize(phrase) + ' ');

const answers = [
 {
  keywords: /\b(cotiz\w*|presupuesto|precio\w*|cuesta|valor|costo\w*)\b/,
  message: 'Cotizamos cada mueble según sus medidas, materiales e instalación. Puedes preparar tu diseño en el personalizador o contarnos qué mueble necesitas, en qué ciudad y qué medidas aproximadas tienes.',
  links: ['personalizador']
 },
 {
  keywords: /\b(estado|seguimiento|pedido|rastreo|codigo)\b/,
  message: 'Consulta el estado de tu proyecto con el código de seguimiento. Si necesitas ayuda para encontrar tu código, elige «Hablar con un asesor».',
  links: ['seguimiento']
 },
 {
  keywords: /\b(catalogo|disenos|acabados|materiales|colores|muestras|fotos|ideas|proyectos)\b/,
  message: 'En el personalizador puedes explorar acabados y combinar colores. También puedes ver ejemplos en la galería de proyectos.',
  links: ['personalizador', 'proyectos']
 },
 {
  keywords: /\b(tiempo|plazos?|demora|entrega|instalacion|instalan|cobertura)\b/,
  message: 'El equipo confirma el plazo y las opciones de entrega o instalación según tu proyecto y ciudad. Puedes compartir esos datos con un asesor.'
 },
 {
  keywords: /\b(cocinas?|closets?|vestieres?|banos?|muebles?|servicios?)\b/,
  message: 'Diseñamos y fabricamos cocinas, clósets, muebles de baño y otros muebles a medida. Puedes explorar diseños o preparar una solicitud de cotización.',
  links: ['personalizador', 'proyectos']
 },
 {
  keywords: /\b(horario|direccion|ubicacion|telefono|whatsapp|contacto)\b/,
  message: 'En la página de contacto encuentras los canales de atención de TECNO ESPACIOS.',
  links: ['contacto']
 }
];

function customReply(flow, history, text) {
 const start = flow?.start;
 if (!start || !Object.hasOwn(flow.nodes ?? {}, start)) return null;
 const previous = history.findLast(item => item.flowNode)?.flowNode;
 const current = previous && Object.hasOwn(flow.nodes, previous) ? previous : start;
 const node = flow.nodes[current];
 if (!node?.message || node.end) return null;
 const option = Array.isArray(node.options) && node.options.find((item, index) =>
  text === String(index + 1) || [item.label, ...(Array.isArray(item.keywords) ? item.keywords : [])]
   .some(word => normalize(word) && includes(text, word)));
 const next = node.any && previous ? node.next : option?.next;
 const target = next && Object.hasOwn(flow.nodes, next) ? flow.nodes[next] : null;
 const selected = target?.message ? target : node;
 const options = Array.isArray(selected.options) ? selected.options.slice(0, 12) : [];
 const choices = options.map((item, index) => (index + 1) + '. ' + item.label).join('\n');
 const content = previous && !target && node.fallback ? node.fallback : selected.message;
 return {message: choices ? content + '\n\n' + choices : content, flowNode: target?.message ? next : current};
}

export function respond(message, history, settings, requestAdvisor) {
 const text = normalize(message);
 const handoff = history.some(item => item.handoff || (item.from === 'admin' && !item.automatic));
 if (handoff) return null;
 if (requestAdvisor || /\b(asesor\w*|agente|humano|persona)\b/.test(text)) {
  return {message: 'Tu solicitud quedó en el chat del equipo. Cuéntanos qué necesitas y, si quieres que te contactemos por WhatsApp, deja tu número en el formulario.', handoff: true};
 }
 const rules = Array.isArray(settings?.chatRules) ? settings.chatRules : [];
 const rule = rules.find(item => normalize(item?.keyword) && typeof item.response === 'string'
  && item.response.trim() && includes(text, item.keyword));
 if (rule) return {message: rule.response};
 const answer = answers.find(item => item.keywords.test(text));
 if (answer) return {message: answer.message, links: answer.links};
 const custom = customReply(settings?.chatFlow, history, text);
 if (custom) return custom;
 if (/^(hola|buenas|buenos dias|buenas tardes|buenas noches)$/.test(text)) {
  return {message: '¡Hola! Puedo ayudarte con cotizaciones, diseños o seguimiento. Escribe tu pregunta o elige una opción.'};
 }
 return {message: '¿Tu consulta es sobre una cotización, un diseño o un proyecto en curso? También puedes elegir «Hablar con un asesor».'};
}
