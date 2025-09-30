export const dynamic = 'force-dynamic';

export async function GET() {
  return new Response(JSON.stringify({ 
    message: "Simple test API is working",
    timestamp: new Date().toISOString(),
    status: "ok"
  }), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function POST() {
  return new Response(JSON.stringify({ 
    message: "Simple test POST is working",
    timestamp: new Date().toISOString(),
    status: "ok"
  }), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
