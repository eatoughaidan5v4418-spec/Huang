import { NextResponse } from "next/server";
import { createServiceSupabase, getUserFromRequest } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { user, error } = await getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json({ error: "缺少 date 参数。" }, { status: 400 });
  }

  const supabase = createServiceSupabase();
  const { data, error: queryError } = await supabase
    .from("meal_entries")
    .select("*")
    .eq("user_id", user.id)
    .eq("meal_date", date)
    .order("created_at", { ascending: false });

  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 500 });
  }

  return NextResponse.json({ entries: data });
}
