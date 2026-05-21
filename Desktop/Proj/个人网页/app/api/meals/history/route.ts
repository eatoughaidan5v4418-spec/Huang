import { NextResponse } from "next/server";
import { createServiceSupabase, getUserFromRequest } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { user, error } = await getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const supabase = createServiceSupabase();
  const { data, error: queryError } = await supabase
    .from("meal_entries")
    .select("*")
    .eq("user_id", user.id)
    .order("meal_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(60);

  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 500 });
  }

  return NextResponse.json({ entries: data });
}
