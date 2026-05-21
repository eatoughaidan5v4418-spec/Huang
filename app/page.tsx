"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  CalendarDays,
  ChevronRight,
  History,
  Loader2,
  LogOut,
  MessageCircle,
  Send,
  UploadCloud,
  Utensils
} from "lucide-react";
import { createBrowserSupabase, hasBrowserSupabaseConfig } from "@/lib/supabase/client";
import type { MealEntry, MealType } from "@/lib/types";
import { mealLabels } from "@/lib/types";

type Status = {
  type: "idle" | "ok" | "error";
  message: string;
};

const mealTypes: MealType[] = ["breakfast", "lunch", "dinner"];

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function Home() {
  const supabase = useMemo(() => createBrowserSupabase(), []);
  const hasSupabaseConfig = hasBrowserSupabaseConfig();
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [date, setDate] = useState(today());
  const [entries, setEntries] = useState<MealEntry[]>([]);
  const [history, setHistory] = useState<MealEntry[]>([]);
  const [status, setStatus] = useState<Status>({ type: "idle", message: "" });
  const [authLoading, setAuthLoading] = useState(true);
  const [loadingMeal, setLoadingMeal] = useState<MealType | null>(null);
  const [chatQuestion, setChatQuestion] = useState("");
  const [chatAnswer, setChatAnswer] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    if (!hasSupabaseConfig) {
      setAuthLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => data.subscription.unsubscribe();
  }, [hasSupabaseConfig, supabase]);

  useEffect(() => {
    if (session) {
      loadMeals(date);
      loadHistory();
    }
  }, [session, date]);

  async function authHeaders() {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
      throw new Error("请先登录。");
    }

    return { Authorization: `Bearer ${token}` };
  }

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ type: "idle", message: "" });

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      const signup = await supabase.auth.signUp({ email, password });

      if (signup.error) {
        setStatus({ type: "error", message: signup.error.message });
        return;
      }

      setSession(signup.data.session);
      setStatus({ type: "ok", message: "账号已创建。如果 Supabase 开启邮箱验证，请先完成验证。" });
      return;
    }

    setSession(data.session);
  }

  async function loadMeals(targetDate: string) {
    try {
      const response = await fetch(`/api/meals?date=${targetDate}`, {
        headers: await authHeaders()
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "读取失败。");
      }

      setEntries(data.entries);
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : "读取失败。" });
    }
  }

  async function loadHistory() {
    try {
      const response = await fetch("/api/meals/history", {
        headers: await authHeaders()
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "读取历史失败。");
      }

      setHistory(data.entries);
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : "读取历史失败。" });
    }
  }

  async function submitMeal(event: FormEvent<HTMLFormElement>, mealType: MealType) {
    event.preventDefault();
    setLoadingMeal(mealType);
    setStatus({ type: "idle", message: "" });

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("mealType", mealType);
    formData.set("date", date);

    try {
      const response = await fetch("/api/meals/analyze", {
        method: "POST",
        headers: await authHeaders(),
        body: formData
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "分析失败。");
      }

      form.reset();
      setStatus({ type: "ok", message: `${mealLabels[mealType]}已生成评分。` });
      await loadMeals(date);
      await loadHistory();
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : "分析失败。" });
    } finally {
      setLoadingMeal(null);
    }
  }

  async function askDietAssistant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setChatLoading(true);
    setChatAnswer("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await authHeaders())
        },
        body: JSON.stringify({ question: chatQuestion })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "对话失败。");
      }

      setChatAnswer(data.answer);
    } catch (error) {
      setChatAnswer(error instanceof Error ? error.message : "对话失败。");
    } finally {
      setChatLoading(false);
    }
  }

  const latestByMeal = mealTypes.reduce<Record<MealType, MealEntry | undefined>>(
    (acc, mealType) => {
      acc[mealType] = entries.find((entry) => entry.meal_type === mealType);
      return acc;
    },
    { breakfast: undefined, lunch: undefined, dinner: undefined }
  );

  if (authLoading) {
    return (
      <main className="grid min-h-screen place-items-center px-6">
        <Loader2 className="h-8 w-8 animate-spin text-leaf" />
      </main>
    );
  }

  if (!hasSupabaseConfig) {
    return <SetupRequired />;
  }

  if (!session) {
    return (
      <main className="grid min-h-screen place-items-center px-6 py-10">
        <section className="w-full max-w-md rounded-lg bg-white p-8 shadow-soft">
          <div className="mb-8 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-leaf text-white">
              <Utensils className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">饮食评分</h1>
              <p className="text-sm text-ink/60">登录后记录三餐并保存 AI 建议</p>
            </div>
          </div>
          <form className="space-y-4" onSubmit={signIn}>
            <input
              className="w-full rounded-md border border-ink/15 px-4 py-3 outline-none focus:border-leaf"
              type="email"
              placeholder="邮箱"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <input
              className="w-full rounded-md border border-ink/15 px-4 py-3 outline-none focus:border-leaf"
              type="password"
              placeholder="密码"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={6}
              required
            />
            <button className="w-full rounded-md bg-leaf px-4 py-3 font-semibold text-white" type="submit">
              登录 / 注册
            </button>
          </form>
          {status.message ? <p className="mt-4 text-sm text-tomato">{status.message}</p> : null}
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 rounded-lg bg-white/88 p-5 shadow-soft md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-leaf text-white">
              <Utensils className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold md:text-3xl">每日饮食评分</h1>
              <p className="text-sm text-ink/60">{session.user.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 rounded-md border border-ink/10 bg-white px-3 py-2 text-sm">
              <CalendarDays className="h-4 w-4 text-leaf" />
              <input className="bg-transparent outline-none" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            </label>
            <Link className="inline-flex items-center gap-2 rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" href="/history">
              <History className="h-4 w-4" />
              历史
            </Link>
            <button
              className="inline-flex items-center gap-2 rounded-md border border-ink/10 bg-white px-3 py-2 text-sm"
              onClick={() => supabase.auth.signOut()}
              type="button"
            >
              <LogOut className="h-4 w-4" />
              退出
            </button>
          </div>
        </header>

        {status.message ? (
          <div
            className={`mb-5 rounded-md px-4 py-3 text-sm ${
              status.type === "error" ? "bg-tomato/10 text-tomato" : "bg-leaf/10 text-leaf"
            }`}
          >
            {status.message}
          </div>
        ) : null}

        <section className="grid gap-5 lg:grid-cols-3">
          {mealTypes.map((mealType) => (
            <MealCard
              key={mealType}
              entry={latestByMeal[mealType]}
              loading={loadingMeal === mealType}
              mealType={mealType}
              onSubmit={submitMeal}
            />
          ))}
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_420px]">
          <div className="rounded-lg bg-white/90 p-5 shadow-soft">
            <div className="mb-4 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-leaf" />
              <h2 className="text-xl font-semibold">饮食追问</h2>
            </div>
            <form className="flex flex-col gap-3 md:flex-row" onSubmit={askDietAssistant}>
              <input
                className="min-w-0 flex-1 rounded-md border border-ink/15 px-4 py-3 outline-none focus:border-leaf"
                placeholder="例如：我晚餐应该少吃什么？"
                value={chatQuestion}
                onChange={(event) => setChatQuestion(event.target.value)}
                required
              />
              <button className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-5 py-3 font-semibold text-white" disabled={chatLoading}>
                {chatLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                发送
              </button>
            </form>
            {chatAnswer ? <p className="mt-4 whitespace-pre-wrap rounded-md bg-oat p-4 leading-7">{chatAnswer}</p> : null}
          </div>

          <div className="rounded-lg bg-white/90 p-5 shadow-soft">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-leaf" />
                <h2 className="text-xl font-semibold">最近记录</h2>
              </div>
              <Link className="inline-flex items-center gap-1 text-sm font-semibold text-leaf" href="/history">
                全部
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="max-h-[32rem] space-y-3 overflow-auto pr-1">
              {history.length ? (
                history.slice(0, 8).map((entry) => <HistoryRow entry={entry} key={entry.id} />)
              ) : (
                <p className="rounded-md bg-oat p-4 text-sm text-ink/60">还没有饮食记录。</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function SetupRequired() {
  return (
    <main className="grid min-h-screen place-items-center px-6 py-10">
      <section className="w-full max-w-xl rounded-lg bg-white p-8 shadow-soft">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-leaf text-white">
            <Utensils className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold">需要配置 Supabase</h1>
        </div>
        <p className="leading-7 text-ink/70">
          请在本地或 Vercel 环境变量中填写 <code>NEXT_PUBLIC_SUPABASE_URL</code> 和{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>，同时按 <code>supabase/schema.sql</code> 初始化数据库。
        </p>
      </section>
    </main>
  );
}

function MealCard({
  mealType,
  entry,
  loading,
  onSubmit
}: {
  mealType: MealType;
  entry?: MealEntry;
  loading: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>, mealType: MealType) => void;
}) {
  const [preview, setPreview] = useState("");

  return (
    <article className="rounded-lg bg-white/92 p-5 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">{mealLabels[mealType]}</h2>
        {entry?.score_result ? (
          <span className="rounded-md bg-citrus/20 px-3 py-1 text-sm font-semibold text-ink">{entry.score_result.score} 分</span>
        ) : null}
      </div>

      <form
        className="space-y-3"
        onSubmit={(event) => {
          onSubmit(event, mealType);
          setPreview("");
        }}
      >
        <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-md border border-dashed border-leaf/40 bg-mint/45 px-4 py-5 text-center text-sm text-ink/70">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="aspect-video w-full rounded-md object-cover" src={preview} alt="待上传餐食预览" />
          ) : (
            <>
              <UploadCloud className="h-6 w-6 text-leaf" />
              上传餐食图片
            </>
          )}
          <input
            className="hidden"
            name="image"
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0];
              setPreview(file ? URL.createObjectURL(file) : "");
            }}
          />
        </label>
        <textarea
          className="min-h-24 w-full resize-none rounded-md border border-ink/15 px-4 py-3 outline-none focus:border-leaf"
          name="description"
          placeholder="补充说明：例如半碗米饭、少油、加了奶茶..."
        />
        <button className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-leaf px-4 py-3 font-semibold text-white" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          生成评分
        </button>
      </form>

      {entry ? <EntryResult entry={entry} /> : null}
    </article>
  );
}

function EntryResult({ entry }: { entry: MealEntry }) {
  const result = entry.score_result;

  if (!result) {
    return null;
  }

  return (
    <div className="mt-5 space-y-3 border-t border-ink/10 pt-4">
      {entry.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="aspect-video w-full rounded-md object-cover" src={entry.image_url} alt={`${mealLabels[entry.meal_type]}图片`} />
      ) : null}
      <p className="text-sm leading-6 text-ink/75">{result.summary}</p>
      <InfoList title="优点" items={result.strengths} />
      <InfoList title="注意" items={result.concerns} />
      <InfoList title="建议" items={result.nutritionAdvice} />
      <p className="rounded-md bg-oat p-3 text-sm leading-6">
        <strong>下一餐：</strong>
        {result.nextMealSuggestion}
      </p>
    </div>
  );
}

function InfoList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) {
    return null;
  }

  return (
    <div>
      <p className="mb-1 text-sm font-semibold">{title}</p>
      <ul className="space-y-1 text-sm leading-6 text-ink/72">
        {items.map((item) => (
          <li key={item}>· {item}</li>
        ))}
      </ul>
    </div>
  );
}

function HistoryRow({ entry }: { entry: MealEntry }) {
  return (
    <Link className="block rounded-md border border-ink/10 bg-white p-3 text-left transition hover:border-leaf/40" href="/history">
      <div className="flex items-center justify-between gap-3">
        <span className="font-semibold">
          {entry.meal_date} · {mealLabels[entry.meal_type]}
        </span>
        <span className="rounded-md bg-mint px-2 py-1 text-xs font-semibold text-leaf">{entry.score_result?.score ?? "-"} 分</span>
      </div>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink/65">
        {entry.score_result?.summary || entry.user_description || entry.vision_text || "无摘要"}
      </p>
    </Link>
  );
}
