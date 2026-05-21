import { NextResponse } from "next/server";
import { scoreMeal } from "@/lib/ai/deepseek";
import { describeMealImage } from "@/lib/ai/vision";
import { createServiceSupabase, getUserFromRequest } from "@/lib/supabase/server";
import type { MealType } from "@/lib/types";

export const runtime = "nodejs";

const allowedMealTypes: MealType[] = ["breakfast", "lunch", "dinner"];
const maxImageSize = 6 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const { user, error } = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ error }, { status: 401 });
    }

    const formData = await request.formData();
    const mealType = formData.get("mealType");
    const date = formData.get("date");
    const description = String(formData.get("description") || "").trim();
    const image = formData.get("image");

    if (!allowedMealTypes.includes(mealType as MealType)) {
      return NextResponse.json({ error: "餐别不正确。" }, { status: 400 });
    }

    if (!date || typeof date !== "string") {
      return NextResponse.json({ error: "请选择记录日期。" }, { status: 400 });
    }

    if (!description && !(image instanceof File && image.size > 0)) {
      return NextResponse.json({ error: "请上传图片或填写餐食说明。" }, { status: 400 });
    }

    let imageUrl: string | null = null;
    let visionText = "";
    const supabase = createServiceSupabase();

    if (image instanceof File && image.size > 0) {
      if (!image.type.startsWith("image/")) {
        return NextResponse.json({ error: "只能上传图片文件。" }, { status: 400 });
      }

      if (image.size > maxImageSize) {
        return NextResponse.json({ error: "图片不能超过 6MB。" }, { status: 400 });
      }

      visionText = await describeMealImage(image);

      const extension = image.name.split(".").pop() || "jpg";
      const path = `${user.id}/${date}/${mealType}-${Date.now()}.${extension}`;
      const upload = await supabase.storage.from("meal-images").upload(path, image, {
        cacheControl: "3600",
        upsert: false
      });

      if (upload.error) {
        throw new Error(`图片上传失败：${upload.error.message}`);
      }

      const { data } = supabase.storage.from("meal-images").getPublicUrl(path);
      imageUrl = data.publicUrl;
    }

    const scoreResult = await scoreMeal({
      mealType: mealType as MealType,
      date,
      userDescription: description,
      visionText
    });

    const { data, error: insertError } = await supabase
      .from("meal_entries")
      .insert({
        user_id: user.id,
        meal_date: date,
        meal_type: mealType,
        image_url: imageUrl,
        user_description: description || null,
        vision_text: visionText || null,
        score_result: scoreResult
      })
      .select("*")
      .single();

    if (insertError) {
      throw new Error(`保存记录失败：${insertError.message}`);
    }

    return NextResponse.json({ entry: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "分析失败，请稍后重试。";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
