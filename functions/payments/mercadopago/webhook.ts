import { getEnv, getInsforgeAdmin, jsonResponse } from '../shared.ts';

type MercadoPagoPayment = {
  id: number;
  status: 'approved' | 'pending' | 'rejected' | 'cancelled' | 'refunded';
  external_reference?: string;
  metadata?: {
    course_id?: string;
    user_id?: string;
    payment_order_id?: string;
  };
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return jsonResponse({}, { status: 204 });

  try {
    const env = getEnv();
    const db = getInsforgeAdmin(env);
    const url = new URL(request.url);
    const topic = url.searchParams.get('topic') ?? url.searchParams.get('type');
    const id = url.searchParams.get('id') ?? url.searchParams.get('data.id');

    if (topic !== 'payment' || !id) {
      return jsonResponse({ ok: true, ignored: true });
    }

    const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
      headers: {
        Authorization: `Bearer ${env.MERCADO_PAGO_ACCESS_TOKEN}`,
      },
    });

    const payment = (await paymentResponse.json()) as MercadoPagoPayment;

    if (!paymentResponse.ok) {
      return jsonResponse({ error: 'No se pudo leer el pago en Mercado Pago.' }, { status: 502 });
    }

    const orderId = payment.external_reference ?? payment.metadata?.payment_order_id;

    if (!orderId) {
      return jsonResponse({ error: 'Pago sin referencia de orden.' }, { status: 400 });
    }

    const { data: order } = await db.database
      .from('payment_orders')
      .select('*')
      .eq('id', orderId)
      .single();

    await db.database
      .from('payment_orders')
      .update({
        provider_payment_id: String(payment.id),
        status: payment.status,
        raw_response: payment,
      })
      .eq('id', orderId);

    if (payment.status === 'approved' && order) {
      await db.database.from('enrollments').upsert([
        {
          user_id: order.user_id,
          course_id: order.course_id,
          status: 'active',
          enrolled_at: new Date().toISOString(),
        },
      ]);
    }

    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : 'Error inesperado.' },
      { status: 500 },
    );
  }
});
