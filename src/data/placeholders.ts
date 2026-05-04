import type { Course, SiteContent } from '../lib/content';

export const placeholderContent: SiteContent = {
  brandName: 'OTEC Aula Pro',
  logoText: 'OAP',
  eyebrow: 'Capacitacion tecnica con aula virtual',
  heroTitle: 'Cursos profesionales con gestion online de principio a fin.',
  heroBody:
    'Una plataforma informativa preparada para Moodle, pagos digitales y administracion futura desde Retool.',
  primaryCta: 'Ver cursos',
  secondaryCta: 'Entrar al aula',
  aboutTitle: 'Formacion practica para profesionales en terreno',
  aboutBody:
    'Creamos experiencias de aprendizaje aplicadas para equipos tecnicos, empresas y profesionales independientes. El sitio queda preparado para administrar textos, cursos, pagos, contactos e integraciones desde base de datos.',
  contactEmail: 'contacto@otec-placeholder.cl',
  contactPhone: '+56 9 0000 0000',
  contactAddress: 'Santiago, Chile',
  moodleUrl: import.meta.env.VITE_MOODLE_URL ?? 'https://moodle.example.com',
};

export const placeholderCourses: Course[] = [
  {
    id: 'ito',
    slug: 'inspeccion-tecnica-de-obras',
    title: 'Inspeccion Tecnica de Obras (ITO)',
    shortDescription:
      'Supervision, control y gestion documental para proyectos de construccion.',
    description:
      'El curso de Inspeccion Tecnica de Obras esta disenado para formar profesionales capaces de supervisar, controlar y asegurar la correcta ejecucion de proyectos de construccion, resguardando el cumplimiento de planos, especificaciones tecnicas, normativa vigente y estandares de calidad.',
    objective:
      'Entregar herramientas practicas y conocimientos tecnicos para desempenarse como ITO, fortaleciendo la toma de decisiones en terreno y la correcta gestion de contratos de obra.',
    contents: [
      'Rol y responsabilidades del ITO',
      'Interpretacion de planos y especificaciones tecnicas',
      'Control de calidad en obra',
      'Gestion documental y estados de pago',
      'Normativa vigente y marco legal en Chile',
      'Control de avances fisicos y financieros',
      'Manejo de no conformidades',
    ],
    audience:
      'Ingenieros, constructores civiles, tecnicos en construccion y profesionales del area que deseen desempenarse o fortalecer competencias como ITO.',
    modality: 'Clases teorico-practicas con enfoque en casos reales.',
    priceClp: 180000,
    durationHours: 32,
    moodleCourseUrl: `${placeholderContent.moodleUrl}/course/view.php?id=1`,
  },
  {
    id: 'calidad',
    slug: 'control-de-calidad-en-obra',
    title: 'Control de Calidad en Obra',
    shortDescription:
      'Planificacion, trazabilidad y seguimiento de calidad para faenas constructivas.',
    description:
      'Curso orientado a fortalecer criterios de inspeccion, registro y control de partidas criticas dentro de proyectos de edificacion e infraestructura.',
    objective:
      'Aplicar herramientas de control, evidencias y cierre de observaciones para mejorar la entrega de proyectos.',
    contents: [
      'Planes de inspeccion y ensayo',
      'Protocolos de recepcion',
      'No conformidades y acciones correctivas',
      'Trazabilidad documental',
    ],
    audience: 'Profesionales y tecnicos vinculados a obra, calidad o supervision.',
    modality: 'Online con sesiones practicas y material descargable.',
    priceClp: 120000,
    durationHours: 20,
    moodleCourseUrl: `${placeholderContent.moodleUrl}/course/view.php?id=2`,
  },
];
