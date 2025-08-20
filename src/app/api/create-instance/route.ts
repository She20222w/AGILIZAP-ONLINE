import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { phoneNumber } = await req.json();

    // Sempre usar endpoint de produção
    const webhookUrl = process.env.CREATE_INSTANCE_WEBHOOK_URL_PROD;

    if (!webhookUrl) {
      console.error('Webhook URL de criação de instância não configurado.');
      return NextResponse.json(
        { success: false, error: 'Webhook URL não configurado.' },
        { status: 500 }
      );
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber }),
    });

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro na API de criação de instância:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno de servidor.' },
      { status: 500 }
    );
  }
}
