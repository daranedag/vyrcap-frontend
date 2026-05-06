# VYRCAP - Frontend

Web informativa en React + Vite para cursos OTEC, preparada para contenido en InsForge, aula virtual Moodle, login y pagos iniciales con Mercado Pago.

## Stack

- React, TypeScript y Vite.
- InsForge para base de datos, auth y futuras pantallas administrativas.
- Moodle como aula virtual embebible o enlace externo.
- Mercado Pago Checkout Pro mediante funcion server-side.
- GitHub Pages para el despliegue inicial.

## Desarrollo local

```bash
npm install
npm run dev
```

Copia `.env.example` a `.env` y completa las variables `VITE_*` para conectar la web con InsForge, Moodle y el endpoint de pagos. Si no estan configuradas, el sitio usa contenido placeholder local.

## Base de datos en InsForge

Las migraciones canonicas estan en `insforge/migrations/` y una copia de referencia queda en `database/migrations/`.

```bash
npx @insforge/cli login
npx @insforge/cli link
npx @insforge/cli db push
```

Si prefieres aplicar SQL manualmente, ejecuta los archivos en este orden:

1. `001_initial_schema.sql`
2. `002_seed_placeholder_content.sql`
3. `003_rls_policies.sql`

## Pagos

El frontend nunca debe contener el token secreto de Mercado Pago. La creacion de preferencias esta en `functions/payments/mercadopago/create-preference.ts` y el webhook de aprobacion en `functions/payments/mercadopago/webhook.ts`.

El contrato inicial es:

```http
POST /payments/mercadopago/create-preference
Content-Type: application/json

{ "courseId": "uuid-del-curso", "userId": "id-opcional-del-usuario" }
```

## Moodle

Cada curso puede tener `moodle_course_url`. Si Moodle permite iframe desde el dominio publico, la seccion Aula Virtual lo embebe. Si Moodle bloquea iframe por `X-Frame-Options` o `Content-Security-Policy`, el boton abre el curso en una nueva pestana.

## Administracion futura

Retool puede conectarse a InsForge para administrar:

- `site_settings`
- `site_blocks`
- `courses`
- `contact_messages`
- `payment_orders`
- `integration_settings`

## Build

```bash
npm run build
```

El workflow `.github/workflows/deploy-pages.yml` compila y publica `dist/` en GitHub Pages.
