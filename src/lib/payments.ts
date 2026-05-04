import type { Course } from './content';

export type PaymentProvider = 'mercadopago';

export async function startCheckout(course: Course, provider: PaymentProvider = 'mercadopago') {
  const apiBase = import.meta.env.VITE_PAYMENT_API_BASE;

  if (!apiBase) {
    window.alert(
      'El portal de pagos aun no tiene endpoint configurado. Define VITE_PAYMENT_API_BASE para activar Mercado Pago.',
    );
    return;
  }

  const response = await fetch(`${apiBase}/payments/${provider}/create-preference`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ courseId: course.id }),
  });

  if (!response.ok) {
    throw new Error('No se pudo iniciar el pago.');
  }

  const data = (await response.json()) as { init_point?: string; sandbox_init_point?: string };
  const checkoutUrl = data.init_point ?? data.sandbox_init_point;

  if (!checkoutUrl) {
    throw new Error('Mercado Pago no devolvio una URL de checkout.');
  }

  window.location.assign(checkoutUrl);
}

export function formatClp(value: number) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(value);
}
