import { NextRequest } from "next/server";
import { chatWithProvider } from "@lib/chat";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const stream = await chatWithProvider(body as any);
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err: any) {
    return new Response(`Error: ${err?.message || "Unknown error"}`, { status: 500 });
  }
}

