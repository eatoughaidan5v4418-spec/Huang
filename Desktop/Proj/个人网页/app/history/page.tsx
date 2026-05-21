"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { ArrowLeft, CalendarDays, Loader2, Utensils } from "lucide-react";
import { createBrowserSupabase, hasBrowserSupabaseConfig } from "@/lib/supabase/client";
import type { MealEntry } from "@/lib/types";
import { mealLabels } from "@/lib/types";

export default function HistoryPage() {
  const supabase = useMemo(() => createBrowserSupabase(), []);
  const hasSupabaseConfig = hasBrowserSupabaseConfig();
  const [session, setSession] = useState<Session | null>(null);
  const [entries, setEntries] = useState<MealEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!hasSupabaseConfig) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => data.subscription.unsubscribe();
  }, [hasSupabaseConfig, supabase]);

  useEffect(() => {
    if (!session) {
      return;
    }

    async function loadHistory() {
      setError("");
      const token = session?.access_token;

      if (!token) {
        return;
      }

      try {
        const response = await fetch("/api/meals/history", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "读取历史失败。");
        }

        setEntries(data.entries);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "读取历史失败。");
      }
    }

    loadHistory();
  }, [session]);

  const groups = entries.reduce<Record<string, MealEntry[]>>((acc, entry) => {
    acc[entry.meal_date] ||= [];
    acc[entry.meal_date].push(entry);
    return acc;
  }, {});

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center px-6">
        <Loader2 className="h-8 w-8 animate-spin text-leaf" />
      </main>
    );
  }

  if (!hasSupabaseConfig) {
    return (
      <main className="grid min-h-screen place-items-center px-6">
        <section className="w-full max-w-xl rounded-lg bg-white p-8 shadow-soft">
          <h1 className="mb-3 text-2xl font-semibold">需要配置 Supabase</h1>
          <p className="leading-7 text-ink/70">配置环境变量后，历史记录页面会自动启用。</p>
          <Link className="mt-5 inline-flex items-center gap-2 rounded-md bg-leaf px-4 py-2 font-semibold text-white" href="/">
            <ArrowLeft className="h-4 w-4" />
            返回首页
          </Link>
        </section>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="grid min-h-screen place-items-center px-6">
        <section className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-soft">
          <h1 className="mb-3 text-2xl font-semibold">请先登录</h1>
          <p className="mb-5 text-ink/65">登录后才能查看你的饮食历史。</p>
          <Link className="inline-flex items-center gap-2 rounded-md bg-leaf px-4 py-2 font-semibold text-white" href="/">
            <ArrowLeft className="h-4 w-4" />
            返回登录
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-col gap-4 rounded-lg bg-white/88 p-5 shadow-soft md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-leaf text-white">
              <CalendarDays className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold md:text-3xl">饮食历史</h1>
              <p className="text-sm text-ink/60">最近 {entries.length} 条记录</p>
            </div>
          </div>
          <Link className="inline-flex items-center gap-2 rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" href="/">
            <ArrowLeft className="h-4 w-4" />
            返回今日
          </Link>
        </header>

        {error ? <div className="mb-5 rounded-md bg-tomato/10 px-4 py-3 text-sm text-tomato">{error}</div> : null}

        <section className="space-y-5">
          {Object.keys(groups).length ? (
            Object.entries(groups).map(([date, dayEntries]) => (
              <article className="rounded-lg bg-white/90 p-5 shadow-soft" key={date}>
                <h2 className="mb-4 text-xl font-semibold">{date}</h2>
                <div className="grid gap-4 md:grid-cols-3">
                  {dayEntries.map((entry) => (
                    <MealHistoryCard entry={entry} key={entry.id} />
                  ))}
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-lg bg-white p-10 text-center shadow-soft">
              <Utensils className="mx-auto mb-4 h-10 w-10 text-leaf" />
              <h2 className="text-xl font-semibold">还没有饮食记录</h2>
              <p className="mt-2 text-ink/60">回到首页上传第一顿饭，AI 会帮你生成评分和建议。</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function MealHistoryCard({ entry }: { entry: MealEntry }) {
  const result = entry.score_result;

  return (
    <div className="rounded-md border border-ink/10 bg-white p-4">
      {entry.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="mb-3 aspect-video w-full rounded-md object-cover" src={entry.image_url} alt={`${mealLabels[entry.meal_type]}图片`} />
      ) : null}
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="font-semibold">{mealLabels[entry.meal_type]}</h3>
        <span className="rounded-md bg-mint px-2 py-1 text-xs font-semibold text-leaf">{result?.score ?? "-"} 分</span>
      </div>
      <p className="text-sm leading-6 text-ink/70">{result?.summary || entry.user_description || entry.vision_text || "暂无摘要"}</p>
      {result?.nextMealSuggestion ? (
        <p className="mt-3 rounded-md bg-oat p-3 text-sm leading-6">
          <strong>下一餐：</strong>
          {result.nextMealSuggestion}
        </p>
      ) : null}
    </div>
  );
}
