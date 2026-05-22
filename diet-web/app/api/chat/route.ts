import { NextResponse } from "next/server";
import { chatWithDietContext, hasDeepSeekConfig } from "@/lib/ai/deepseek";

export async function POST(request: Request) {
  try {
    if (!hasDeepSeekConfig()) {
      return NextResponse.json({ error: "DeepSeek API Key is not configured." }, { status: 503 });
    }

    const body = await request.json();
    const question = String(body.question || "").trim();

    if (!question) {
      return NextResponse.json({ error: "请输入问题。" }, { status: 400 });
    }

    const answer = await chatWithDietContext({
      question,
      context: body.context || []
    });

    return NextResponse.json({ answer });
  } catch (error) {
    const message = error instanceof Error ? error.message : "对话失败，请稍后重试。";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
