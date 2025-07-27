import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const allowedOrigin = 'https://boostseller.ai'; // or specify frontend domain

// Handle CORS preflight request
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// Handle POST request (checkout session creation)
export async function POST(req: NextRequest) {
  try {
    const { plan } = await req.json();

    const priceMap: Record<string, { name: string; amount: number }> = {
      pro_monthly: { name: 'Pro Plan - Monthly', amount: 14900 },
      pro_annual: { name: 'Pro Plan - Annual', amount: 99000 },
    };

    const selected = priceMap[plan];

    if (!selected) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: selected.amount,
            product_data: { name: selected.name },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.SUCCESS_URL}`,
      cancel_url: `${process.env.CANCEL_URL}`,
    });

    return NextResponse.json(
      { sessionId: session.id },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': allowedOrigin,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  } catch (err) {
    console.error('Stripe error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
