import { createClient } from "@supabase/supabase-js";
import { requiredEnv } from "@/lib/env";

export function createServiceSupabase() {
  return createClient(requiredEnv("SUPABASE_URL"), requiredEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export async function getUserFromRequest(request: Request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "");

  if (!token) {
    return { user: null, error: "请先登录。" };
  }

  const supabase = createServiceSupabase();
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return { user: null, error: "登录状态已失效，请重新登录。" };
  }

  return { user: data.user, error: null };
}
