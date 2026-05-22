import { NextResponse } from "next/server";
import { hasDeepSeekConfig, scoreMeal } from "@/lib/ai/deepseek";
import type { MealType } from "@/lib/types";

export const runtime = "nodejs";

const allowedMealTypes: MealType[] = ["breakfast", "lunch", "dinner"];

export async function POST(request: Request) {
  try {
    if (!hasDeepSeekConfig()) {
      return NextResponse.json({ error: "DeepSeek API Key is not configured." }, { status: 503 });
    }

    const body = await request.json();
    const mealType = body.mealType;
    const date = String(body.date || "");
    const description = String(body.description || "").trim();
    const visionText = String(body.visionText || "").trim();

    if (!allowedMealTypes.includes(mealType as MealType)) {
      return NextResponse.json({ error: "餐别不正确。" }, { status: 400 });
    }

    if (!date) {
      return NextResponse.json({ error: "请选择记录日期。" }, { status: 400 });
    }

    if (!description && !visionText) {
      return NextResponse.json({ error: "请填写餐食说明。" }, { status: 400 });
    }

    const scoreResult = await scoreMeal({
      mealType: mealType as MealType,
      date,
      userDescription: description,
      visionText
    });

    return NextResponse.json({ scoreResult });
  } catch (error) {
    const message = error instanceof Error ? error.message : "分析失败，请稍后重试。";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
