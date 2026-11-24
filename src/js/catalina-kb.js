/* =========================================================================
   Base de conocimiento de Catalina (demo sin backend)
   Coincidencia por palabras clave sobre texto normalizado. Reemplazable por
   un endpoint LLM con RAG sobre el mismo contenido.
   ========================================================================= */
export const normalize = (s) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ\s/]/g, ' ');

const L = (href, txt) => `<a href="${href}">${txt}</a>`;

const KB = [
  {
    k: ['hola', 'buenas', 'buenos dias', 'buenas tardes', 'que tal', 'hey'],
    a: '<p>¡Hola! Qué gusto saludarte. Soy Catalina, la concierge de Medismart. ¿Quieres saber qué incluye la plataforma, cómo se implementa o conocer a mi familia de agentes?</p>',
    chips: ['¿Qué incluye Medismart Empresas?', '¿Cuánto tarda la implementación?', 'Conocer a los agentes IA'],
  },
  {
    k: ['incluye', 'ofrecen', 'servicio', 'servicios', 'que es medismart', 'que hacen', 'pilares', 'plataforma', 'solucion', 'soluciones'],
    a: `<p>Medismart Empresas es un ecosistema de salud digital 360° con cuatro pilares:</p>
        <ul><li><b>Telemedicina y prevención:</b> medicina general 24/7, salud mental, crónicos y exámenes.</li>
        <li><b>Soluciones especializadas:</b> teleperitaje y monitoreo de licencias médicas.</li>
        <li><b>Bienestar animal:</b> programas de Mundo Mascotas.</li>
        <li><b>Farmacias y complementarios:</b> descuentos, recetas y despacho.</li></ul>
        <p>Todo en una sola app para tus colaboradores y un dashboard para RR.HH. ${L('/servicios.html', 'Ver soluciones')}</p>`,
    chips: ['¿Cuál pilar le sirve más a mi empresa?', '¿Cuánto tarda la implementación?', 'Quiero agendar una demo'],
  },
  {
    k: ['cual pilar', 'mi empresa', 'recomiendas', 'conviene', 'me sirve'],
    a: `<p>Depende de tu equipo. Te dejo una guía rápida:</p>
        <ul><li>¿Mucho ausentismo o licencias? Empieza por <b>Telemedicina</b> y <b>Soluciones especializadas</b>.</li>
        <li>¿Equipos con alta carga emocional? Suma <b>salud mental</b> con Alma.</li>
        <li>¿Buscas un beneficio muy valorado? <b>Mascotas</b> y <b>Farmacias</b> encantan.</li></ul>
        <p>En una demo armamos la combinación exacta para tu dotación. ${L('/contacto.html#demo', 'Agendar demo')}</p>`,
    chips: ['¿Cuánto cuesta?', 'Calcular ahorro por ausentismo', 'Quiero agendar una demo'],
  },
  {
    k: ['implementacion', 'implementar', 'tarda', 'semanas', 'cuanto tiempo', 'plazo', 'onboarding', 'empezar', 'partir'],
    a: `<p>La implementación toma <b>entre 2 y 4 semanas</b>:</p>
        <ul><li><b>Semana 1:</b> kickoff y configuración de tu empresa.</li>
        <li><b>Semana 2:</b> carga de nómina de titulares y beneficiarios (mi hermana Dalia ayuda aquí).</li>
        <li><b>Semanas 3–4:</b> comunicación interna y lanzamiento.</li></ul>
        <p>Desde el primer día tu equipo puede atenderse 24/7.</p>`,
    chips: ['¿Se integra con nuestros sistemas?', '¿Tiene cobertura Fonasa e Isapres?', 'Quiero agendar una demo'],
  },
  {
    k: ['integra', 'integracion', 'api', 'sistema', 'sistemas', 'rrhh', 'rr hh', 'recursos humanos', 'dashboard', 'reporte', 'reporteria'],
    a: '<p>Sí. Nos integramos vía <b>API con tus sistemas de RR.HH.</b> para mantener la nómina al día, y tu equipo de personas accede a un <b>dashboard</b> con métricas de uso y bienestar, siempre agregadas y anónimas.</p>',
    chips: ['¿Cómo protegen los datos?', '¿Cuánto tarda la implementación?'],
  },
  {
    k: ['datos', 'seguridad', 'privacidad', 'ciberseguridad', 'ley', 'protegen', 'confidencial', 'cifrado', 'uptime'],
    a: `<p>La seguridad es parte del diseño:</p>
        <ul><li>Cumplimos la <b>Ley 21.719</b> de protección de datos personales y la <b>Ley 21.541</b> de telemedicina.</li>
        <li>Profesionales inscritos en el <b>RNPI</b> de la Superintendencia de Salud.</li>
        <li>Disponibilidad de plataforma de <b>99,9%</b>.</li>
        <li>La empresa nunca ve información clínica individual.</li></ul>
        <p>${L('/sobre-nosotros.html#ciberseguridad', 'Ver ciberseguridad')}</p>`,
    chips: ['¿Se integra con nuestros sistemas?', 'Quiero agendar una demo'],
  },
  {
    k: ['agente', 'agentes', ' ia', 'inteligencia artificial', 'familia', 'teo', 'sara', 'alma', 'noelia', 'dalia', 'lia', 'clara', 'aida', 'asistente'],
    a: `<p>¡Te presento a mi familia! Cada uno tiene un oficio:</p>
        <ul><li><b>Teo</b> · teleperitaje</li><li><b>Sara</b> · agenda de centros médicos</li>
        <li><b>Alma</b> · salud mental</li><li><b>Noelia</b> · pacientes crónicos</li>
        <li><b>Dalia</b> · cargas y enrolamiento</li><li><b>Lia</b> · citas por WhatsApp</li>
        <li><b>Clara</b> · lectura de exámenes</li></ul>
        <p>Y yo, Catalina, junto todo en un solo lugar. ${L('/agentes-ia.html', 'Conócenos')}</p>`,
    chips: ['¿Qué es SmartCheck?', '¿Cómo protegen los datos?'],
  },
  {
    k: ['smartcheck', 'smart check', 'chequeo', 'preventivo', 'riesgo'],
    a: '<p><b>SmartCheck</b> es un chequeo preventivo digital: en pocos minutos, desde el celular, evalúa factores de riesgo y entrega un plan de acción personal. Tu equipo de salud recibe alertas tempranas agregadas para actuar a tiempo.</p>',
    chips: ['Conocer a los agentes IA', 'Quiero agendar una demo'],
  },
  {
    k: ['precio', 'costo', 'cuesta', 'valor', 'cotizar', 'cotizacion', 'plan', 'planes', 'tarifa'],
    a: `<p>El valor depende del tamaño de tu equipo y de los pilares que elijas, por eso armamos cada propuesta a medida. En una demo de 30 minutos te mostramos la plataforma y preparamos tu cotización. ${L('/contacto.html#demo', 'Agendar demo')}</p>`,
    chips: ['Calcular ahorro por ausentismo', 'Quiero agendar una demo'],
  },
  {
    k: ['demo', 'agendar', 'reunion', 'agenda', 'llamada', 'presentacion', 'conocer la plataforma'],
    a: `<p>¡Me encanta la idea! La demo dura <b>30 minutos</b>, es 100% online y verás la plataforma funcionando, el dashboard de RR.HH. y métricas de tu industria.</p><p>${L('/contacto.html#demo', 'Agendar mi demo ahora')} · te llega la confirmación al calendario al instante.</p>`,
    chips: ['¿Cuánto cuesta?', '¿Qué incluye Medismart Empresas?'],
  },
  {
    k: ['fonasa', 'isapre', 'isapres', 'cobertura', 'prevision'],
    a: '<p>Sí, Medismart funciona con colaboradores de <b>Fonasa e Isapres</b>. El beneficio es complementario a su previsión de salud.</p>',
    chips: ['¿Qué incluye Medismart Empresas?', 'Quiero agendar una demo'],
  },
  {
    k: ['salud mental', 'psicolog', 'estres', 'ansiedad', 'emocional', 'burnout', 'ceal'],
    a: '<p>La salud mental es uno de nuestros focos: atención con psicólogos por videollamada, programas preventivos y el acompañamiento de <b>Alma</b>, nuestra agente que escucha sin apuro. También apoyamos a tu empresa con el protocolo <b>CEAL-SM</b>.</p>',
    chips: ['Conocer a los agentes IA', 'Quiero agendar una demo'],
  },
  {
    k: ['mascota', 'mascotas', 'perro', 'gato', 'veterinari', 'animal', 'mundo mascotas'],
    a: '<p>Con <b>Mundo Mascotas</b> tu equipo accede a orientación veterinaria remota, recordatorios de controles y vacunas, y beneficios en una red de convenios. Porque las mascotas también son familia.</p>',
    chips: ['¿Qué incluye Medismart Empresas?'],
  },
  {
    k: ['farmacia', 'medicamento', 'remedio', 'receta', 'despacho'],
    a: '<p>En el pilar de <b>Farmacias y servicios complementarios</b> tu equipo tiene descuentos en farmacias en convenio, recetas electrónicas y despacho a domicilio.</p>',
    chips: ['¿Qué incluye Medismart Empresas?'],
  },
  {
    k: ['ausentismo', 'licencia', 'licencias', 'ahorro', 'roi', 'calcular', 'calculadora', 'productividad'],
    a: `<p>Atender a tiempo reduce días perdidos. Prueba nuestra ${L('/sobre-nosotros.html#impacto', 'calculadora de ausentismo')} para estimar el ahorro de tu empresa. Y con teleperitaje, Teo ayuda a revisar licencias médicas con trazabilidad.</p>`,
    chips: ['¿Cuánto cuesta?', 'Quiero agendar una demo'],
  },
  {
    k: ['telemedicina', 'medico', 'doctor', '24/7', 'consulta', 'videollamada', 'videoconsulta', 'especialidad', 'cronico', 'examen'],
    a: '<p>Con <b>Telemedicina y prevención</b> tus colaboradores tienen medicina general 24/7 por videollamada, acceso a más de 25 especialidades, programas para pacientes crónicos y exámenes preventivos.</p>',
    chips: ['¿Tiene cobertura Fonasa e Isapres?', 'Quiero agendar una demo'],
  },
  {
    k: ['contacto', 'telefono', 'whatsapp', 'correo', 'email', 'mail', 'hablar', 'ejecutivo', 'horario'],
    a: `<p>Puedes escribirnos o llamarnos:</p><ul><li>Correo: ${L('mailto:contacto.empresas@medismart.live', 'contacto.empresas@medismart.live')}</li><li>WhatsApp y línea corporativa: +56 9 4804 2543</li><li>Lunes a viernes, de 8:00 a 20:00 h</li></ul>`,
    chips: ['Quiero agendar una demo'],
  },
  {
    k: ['pais', 'paises', 'donde', 'latinoamerica', 'presencia', 'usuarios', 'cuantos'],
    a: '<p>Hoy acompañamos a <b>más de 7 millones de personas</b> en <b>8 países</b> de Latinoamérica, con atención 24/7 y más de 25 especialidades.</p>',
    chips: ['¿Qué incluye Medismart Empresas?'],
  },
  {
    k: ['wikidoc', 'articulo', 'articulos', 'blog', 'contenido', 'leer'],
    a: `<p>En ${L('/wikidoc.html', 'WikiDoc')} publicamos artículos sobre salud, bienestar laboral e innovación, escritos y revisados por nuestro equipo médico.</p>`,
  },
  {
    k: ['emergencia', 'urgencia', 'grave', 'infarto', 'accidente', 'samu', 'riesgo vital'],
    a: '<p><b>Si es una emergencia o hay riesgo vital, llama al 131 (SAMU)</b> o acude al servicio de urgencia más cercano. Medismart es una plataforma ambulatoria y no reemplaza la atención de urgencia.</p>',
  },
  {
    k: ['gracias', 'genial', 'perfecto', 'buenisimo', 'excelente', 'ok'],
    a: '<p>¡Con gusto! Estoy aquí mientras recorres el sitio. Si quieres, te ayudo a agendar la demo.</p>',
    chips: ['Quiero agendar una demo'],
  },
];

const FALLBACK = {
  html: `<p>Buena pregunta. Aún estoy aprendiendo sobre eso, pero nuestro equipo te puede responder en detalle. ¿Te parece si lo vemos en una ${L('/contacto.html#demo', 'demo de 30 minutos')}?</p><p>También puedo contarte sobre servicios, implementación, seguridad o agentes IA.</p>`,
  chips: ['¿Qué incluye Medismart Empresas?', '¿Cuánto tarda la implementación?', '¿Cómo protegen los datos?'],
};

export function answer(text) {
  const t = ` ${text} `;
  let best = null, score = 0;
  for (const item of KB) {
    const s = item.k.reduce((acc, k) => acc + (t.includes(k) ? k.length : 0), 0);
    if (s > score) { score = s; best = item; }
  }
  return best ? { html: best.a, chips: best.chips } : FALLBACK;
}
