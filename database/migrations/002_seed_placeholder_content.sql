insert into public.site_settings (key, value)
values (
  'public_site',
  '{
    "brandName": "OTEC Aula Pro",
    "logoText": "OAP",
    "eyebrow": "Capacitacion tecnica con aula virtual",
    "heroTitle": "Cursos profesionales con gestion online de principio a fin.",
    "heroBody": "Una plataforma informativa preparada para Moodle, pagos digitales y administracion futura desde Retool.",
    "primaryCta": "Ver cursos",
    "secondaryCta": "Entrar al aula",
    "aboutTitle": "Formacion practica para profesionales en terreno",
    "aboutBody": "Creamos experiencias de aprendizaje aplicadas para equipos tecnicos, empresas y profesionales independientes. El sitio queda preparado para administrar textos, cursos, pagos, contactos e integraciones desde base de datos.",
    "contactEmail": "contacto@otec-placeholder.cl",
    "contactPhone": "+56 9 0000 0000",
    "contactAddress": "Santiago, Chile",
    "moodleUrl": "https://moodle.example.com"
  }'::jsonb
)
on conflict (key) do update set value = excluded.value;

insert into public.site_blocks (slug, section, title, eyebrow, body, content, status, display_order)
values
  (
    'home-hero',
    'home',
    'Cursos profesionales con gestion online de principio a fin.',
    'Capacitacion tecnica con aula virtual',
    'Una plataforma informativa preparada para Moodle, pagos digitales y administracion futura desde Retool.',
    '{"primaryCta": "Ver cursos", "secondaryCta": "Entrar al aula"}'::jsonb,
    'published',
    10
  ),
  (
    'about-main',
    'about',
    'Formacion practica para profesionales en terreno',
    'Sobre nosotros',
    'Creamos experiencias de aprendizaje aplicadas para equipos tecnicos, empresas y profesionales independientes.',
    '{}'::jsonb,
    'published',
    20
  ),
  (
    'virtual-classroom',
    'moodle',
    'Moodle integrado al flujo de compra y matricula',
    'Acceso a Aula Virtual',
    'El sitio queda preparado para abrir el aula en una vista embebida cuando la configuracion de Moodle lo permita, o dirigir al estudiante a una ventana segura.',
    '{"embedEnabled": true, "fallbackTarget": "_blank"}'::jsonb,
    'published',
    30
  )
on conflict (slug) do update
set title = excluded.title,
    eyebrow = excluded.eyebrow,
    body = excluded.body,
    content = excluded.content,
    status = excluded.status,
    display_order = excluded.display_order;

insert into public.courses (
  slug,
  title,
  short_description,
  description,
  objective,
  contents,
  audience,
  modality,
  price_clp,
  duration_hours,
  moodle_course_url,
  status,
  display_order
)
values
  (
    'inspeccion-tecnica-de-obras',
    'Inspeccion Tecnica de Obras (ITO)',
    'Supervision, control y gestion documental para proyectos de construccion.',
    'El curso de Inspeccion Tecnica de Obras esta disenado para formar profesionales capaces de supervisar, controlar y asegurar la correcta ejecucion de proyectos de construccion, resguardando el cumplimiento de planos, especificaciones tecnicas, normativa vigente y estandares de calidad.',
    'Entregar herramientas practicas y conocimientos tecnicos para desempenarse como ITO, fortaleciendo la toma de decisiones en terreno y la correcta gestion de contratos de obra.',
    array[
      'Rol y responsabilidades del ITO',
      'Interpretacion de planos y especificaciones tecnicas',
      'Control de calidad en obra',
      'Gestion documental y estados de pago',
      'Normativa vigente y marco legal en Chile',
      'Control de avances fisicos y financieros',
      'Manejo de no conformidades'
    ],
    'Ingenieros, constructores civiles, tecnicos en construccion y profesionales del area que deseen desempenarse o fortalecer competencias como ITO.',
    'Clases teorico-practicas con enfoque en casos reales.',
    180000,
    32,
    'https://moodle.example.com/course/view.php?id=1',
    'published',
    10
  ),
  (
    'control-de-calidad-en-obra',
    'Control de Calidad en Obra',
    'Planificacion, trazabilidad y seguimiento de calidad para faenas constructivas.',
    'Curso orientado a fortalecer criterios de inspeccion, registro y control de partidas criticas dentro de proyectos de edificacion e infraestructura.',
    'Aplicar herramientas de control, evidencias y cierre de observaciones para mejorar la entrega de proyectos.',
    array[
      'Planes de inspeccion y ensayo',
      'Protocolos de recepcion',
      'No conformidades y acciones correctivas',
      'Trazabilidad documental'
    ],
    'Profesionales y tecnicos vinculados a obra, calidad o supervision.',
    'Online con sesiones practicas y material descargable.',
    120000,
    20,
    'https://moodle.example.com/course/view.php?id=2',
    'published',
    20
  )
on conflict (slug) do update
set title = excluded.title,
    short_description = excluded.short_description,
    description = excluded.description,
    objective = excluded.objective,
    contents = excluded.contents,
    audience = excluded.audience,
    modality = excluded.modality,
    price_clp = excluded.price_clp,
    duration_hours = excluded.duration_hours,
    moodle_course_url = excluded.moodle_course_url,
    status = excluded.status,
    display_order = excluded.display_order;

insert into public.payment_providers (id, name, status, public_config)
values
  ('mercadopago', 'Mercado Pago', 'sandbox', '{"currency": "CLP"}'::jsonb),
  ('webpay', 'Webpay Plus', 'inactive', '{"currency": "CLP"}'::jsonb),
  ('bank_transfer', 'Transferencia bancaria', 'inactive', '{"currency": "CLP"}'::jsonb)
on conflict (id) do update
set name = excluded.name,
    status = excluded.status,
    public_config = excluded.public_config;

insert into public.integration_settings (id, name, provider, status, public_config, notes)
values
  (
    'moodle',
    'Aula Virtual Moodle',
    'moodle',
    'sandbox',
    '{"baseUrl": "https://moodle.example.com", "embedEnabled": true}'::jsonb,
    'Configurar X-Frame-Options/CSP en Moodle para permitir embed desde el dominio publico si se usara iframe.'
  ),
  (
    'retool',
    'Administracion Retool',
    'retool',
    'inactive',
    '{"target": "site_settings,courses,site_blocks,contact_messages,payment_orders"}'::jsonb,
    'Retool se conectara a InsForge para CRUD editorial y operativo.'
  ),
  (
    'email',
    'Notificaciones email',
    'resend_or_sendgrid',
    'inactive',
    '{"templates": ["contact_received", "payment_approved", "enrollment_created"]}'::jsonb,
    'Integracion sugerida para mensajes transaccionales.'
  )
on conflict (id) do update
set name = excluded.name,
    provider = excluded.provider,
    status = excluded.status,
    public_config = excluded.public_config,
    notes = excluded.notes;
