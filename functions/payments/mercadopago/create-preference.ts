import { getEnv, getInsforgeAdmin, jsonResponse, readJson } from '../shared.ts';

type CreatePreferenceRequest = {
  courseId: string;
  userId?: string;
};

type CourseRecord = {
  id: string;
  title: string;
  short_description: string;
  price_clp: number;
  status: string;
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return jsonResponse({}, { status: 204 });
  if (request.method !== 'POST') return jsonResponse({ error: 'Metodo no permitido.' }, { status: 405 });

  try {
    const env = getEnv();
    const db = getInsforgeAdmin(env);
    const payload = await readJson<CreatePreferenceRequest>(request);

    if (!payload.courseId) {
      return jsonResponse({ error: 'courseId es requerido.' }, { status: 400 });
    }

    const { data: course, error: courseError } = await db.database
      .from('courses')
      .select('id,title,short_description,price_clp,status')
      .eq('id', payload.courseId)
      .single();

    if (courseError || !course || course.status !== 'published') {
      return jsonResponse({ error: 'Curso no disponible.' }, { status: 404 });
    }

    const typedCourse = course as CourseRecord;

    const { data: order, error: orderError } = await db.database
      .from('payment_orders')
      .insert([
        {
          provider_id: 'mercadopago',
          user_id: payload.userId,
          course_id: typedCourse.id,
          amount_clp: typedCourse.price_clp,
          status: 'created',
          raw_request: payload,
        },
      ])
      .select('*')
      .single();

    if (orderError || !order) {
      throw new Error(orderError?.message ?? 'No se pudo crear la orden.');
    }

    const preferenceBody = {
      items: [
        {
          id: typedCourse.id,
          title: typedCourse.title,
          description: typedCourse.short_description,
          quantity: 1,
          currency_id: 'CLP',
          unit_price: typedCourse.price_clp,
        },
      ],
      external_reference: order.id,
      notification_url: env.MERCADO_PAGO_WEBHOOK_URL,
      back_urls: {
        success: `${env.PUBLIC_SITE_URL}/?payment=success`,
        failure: `${env.PUBLIC_SITE_URL}/?payment=failure`,
        pending: `${env.PUBLIC_SITE_URL}/?payment=pending`,
      },
      auto_return: 'approved',
      metadata: {
        course_id: typedCourse.id,
        user_id: payload.userId,
        payment_order_id: order.id,
      },
    };

    const mercadoPagoResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.MERCADO_PAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferenceBody),
    });

    const preference = await mercadoPagoResponse.json();

    if (!mercadoPagoResponse.ok) {
      await db.database
        .from('payment_orders')
        .update({ status: 'rejected', raw_response: preference })
        .eq('id', order.id);
      return jsonResponse({ error: 'Mercado Pago rechazo la preferencia.', detail: preference }, { status: 502 });
    }

    await db.database
      .from('payment_orders')
      .update({
        provider_order_id: preference.id,
        checkout_url: preference.init_point ?? preference.sandbox_init_point,
        status: 'pending',
        raw_response: preference,
      })
      .eq('id', order.id);

    return jsonResponse({
      order_id: order.id,
      preference_id: preference.id,
      init_point: preference.init_point,
      sandbox_init_point: preference.sandbox_init_point,
    });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : 'Error inesperado.' },
      { status: 500 },
    );
  }
});
