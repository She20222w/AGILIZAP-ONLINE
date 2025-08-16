import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    const isProd = process.env.NODE_ENV === 'production';
    const webhookUrl = isProd
      ? process.env.NEXT_PUBLIC_ACTIVE_WEBHOOK_URL_PROD
      : process.env.NEXT_PUBLIC_ACTIVE_WEBHOOK_URL_DEV;

    if (!webhookUrl) {
      console.error('Webhook URL de verificação não configurado.');
      return NextResponse.json(
        { success: false, error: 'Webhook URL não configurado.' },
        { status: 500 }
      );
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro na API de verificação:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno de servidor.' },
      { status: 500 }
    );
  }
}
