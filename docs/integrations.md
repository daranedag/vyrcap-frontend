# Integraciones

## InsForge

Usa `VITE_INSFORGE_URL` y `VITE_INSFORGE_ANON_KEY` en el frontend para leer contenido publico, insertar contactos y autenticar usuarios. Las operaciones sensibles, como crear ordenes de pago o matricular usuarios, deben usar `INSFORGE_SERVICE_KEY` solo desde funciones server-side.

## Mercado Pago

El flujo inicial usa Checkout Pro:

1. El estudiante selecciona un curso.
2. El frontend llama a `/payments/mercadopago/create-preference`.
3. La funcion crea una fila en `payment_orders`.
4. La funcion crea una preferencia en Mercado Pago y devuelve `init_point`.
5. Mercado Pago notifica el resultado en `/payments/mercadopago/webhook`.
6. Si el pago queda `approved`, se actualiza `payment_orders` y se crea `enrollments`.

Para sumar Webpay, transferencia u otro proveedor, crea un nuevo handler con el mismo contrato y registra el proveedor en `payment_providers`.

## Moodle

La tabla `courses` almacena `moodle_course_url`, y `integration_settings` guarda la configuracion global. Para embebido real, el dominio de GitHub Pages o el dominio futuro debe estar permitido en la configuracion CSP/frame de Moodle.

## Retool

Retool deberia usar una conexion segura hacia InsForge con permisos administrativos. Recomendacion de pantallas:

- Cursos: CRUD de `courses`, filtros por estado y orden.
- Contenido: edicion de `site_settings` y `site_blocks`.
- Leads: bandeja de `contact_messages`.
- Pagos: lectura de `payment_orders` y reintentos manuales.
- Integraciones: lectura/edicion limitada de `integration_settings.public_config`.

## Integraciones sugeridas

- Email transaccional con Resend o SendGrid.
- Analitica con Plausible, PostHog o GA4.
- CRM liviano desde contactos si el volumen crece.
- Webpay Plus para Chile como segundo medio de pago.
- Jobs de sincronizacion Moodle si se requiere matricula automatica via API.
