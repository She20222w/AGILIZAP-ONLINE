import { signup } from '@/app/actions';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await signup(body);
    
    if (result.checkoutUrl) {
      return Response.json({ checkoutUrl: result.checkoutUrl });
    } else if (result.success) {
      return Response.json({ success: result.success });
    } else {
      return Response.json({ error: result.error }, { status: 400 });
    }
  } catch (error) {
    console.error('Signup API error:', error);
    return Response.json({ error: 'Ocorreu um erro inesperado.' }, { status: 500 });
  }
}
