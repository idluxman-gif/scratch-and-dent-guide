import { NextResponse } from 'next/server';
import { setPremium } from '@/lib/premium';

/**
 * Payoneer IPN (Instant Payment Notification) handler.
 *
 * Payoneer POSTs a notification to this URL after each payment event.
 * The transactionId encodes the shopId in the format: sad-{shopId}-{timestamp}
 *
 * Relevant status codes:
 *   charged   — payment succeeded → activate premium
 *   failed    — payment failed → no action
 *   canceled  — payment canceled → no action
 *   chargeback — chargeback → revoke premium if needed
 */

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('[payoneer-ipn] received:', JSON.stringify(body));

    const { transactionId, statusCode, resultCode } = body;

    // Only act on successful charges
    if (resultCode !== 'SUCCESS' || statusCode !== 'charged') {
      console.log(`[payoneer-ipn] ignored: status=${statusCode} result=${resultCode}`);
      return NextResponse.json({ received: true });
    }

    // Parse shopId from transactionId: sad-{shopId}-{timestamp}
    if (!transactionId?.startsWith('sad-')) {
      console.warn('[payoneer-ipn] unexpected transactionId format:', transactionId);
      return NextResponse.json({ received: true });
    }

    const parts = transactionId.split('-');
    // Format: sad-{shopId}-{timestamp} where shopId may contain dashes (integers won't)
    // For SAD, shopId is an integer, so parts[1] is the shopId
    const shopId = parts[1];
    const email = body.customer?.email || body.identification?.email || '';

    if (!shopId) {
      console.error('[payoneer-ipn] could not parse shopId from:', transactionId);
      return NextResponse.json({ received: true });
    }

    await setPremium(shopId, { paymentId: transactionId, email });
    console.log(`[payoneer-ipn] premium activated: shopId=${shopId}`);

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[payoneer-ipn] handler error:', err);
    // Return 200 to prevent Payoneer from retrying indefinitely
    return NextResponse.json({ received: true });
  }
}
