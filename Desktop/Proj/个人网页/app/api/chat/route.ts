import { NextResponse } from "next/server";
import { chatWithDietContext } from "@/lib/ai/deepseek";
import { createServiceSupabase, getUserFromRequest } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { user, error } = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ error }, { status: 401 });
    }

    const body = await request.json();
    const question = String(body.question || "").trim();

    if (!question) {
      return NextResponse.json({ error: "请输入问题。" }, { status: 400 });
    }

    const supabase = createServiceSupabase();
    const { data, error: queryError } = await supabase
      .from("meal_entries")
      .select("meal_date, meal_type, user_description, vision_text, score_result")
      .eq("user_id", user.id)
      .order("meal_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(21);

    if (queryError) {
      throw new Error(queryError.message);
    }

    const answer = await chatWithDietContext({
      question,
      context: data
    });

    return NextResponse.json({ answer });
  } catch (error) {
    const message = error instanceof Error ? error.message : "对话失败，请稍后重试。";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
