# Modelo de datos

## Contenido publico

`site_settings` guarda configuracion global del sitio como marca, hero, contacto y URL Moodle. `site_blocks` permite mover textos de secciones a base de datos para que Retool pueda administrarlos sin deploy.

## Cursos

`courses` contiene la ficha completa del curso: descripcion, objetivo, contenidos, publico objetivo, modalidad, precio, duracion, estado, orden y URL Moodle.

## Usuarios y matriculas

`profiles` extiende la identidad creada por InsForge Auth. `enrollments` vincula usuarios con cursos y queda lista para guardar IDs de Moodle cuando se automatice la matricula.

## Pagos

`payment_providers` registra medios disponibles. `payment_orders` guarda la orden local, el ID del proveedor, el estado, la URL de checkout y payloads crudos para auditoria.

## Operacion

`contact_messages` funciona como bandeja de leads. `integration_settings` documenta configuraciones publicas y estados de Moodle, Retool, email u otros servicios.
