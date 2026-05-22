"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { CalendarDays, History, MessageCircle, Send, UploadCloud, Utensils } from "lucide-react";
import type { MealEntry, MealScore, MealType } from "@/lib/types";
import { mealLabels } from "@/lib/types";

type Status = {
  type: "idle" | "ok" | "error";
  message: string;
};

const mealTypes: MealType[] = ["breakfast", "lunch", "dinner"];
const storageKey = "diet-score-guest-entries";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function makeScore(description: string, mealType: MealType): MealScore {
  const text = description.toLowerCase();
  let score = 78;

  if (/蔬菜|青菜|水果|蛋白|鸡蛋|鱼|牛肉|鸡胸|豆腐|杂粮/.test(text)) {
    score += 10;
  }

  if (/奶茶|炸|油炸|甜品|可乐|烧烤|夜宵|蛋糕|薯条/.test(text)) {
    score -= 14;
  }

  if (/少油|少糖|清淡|水煮|蒸|煮/.test(text)) {
    score += 6;
  }

  score = Math.max(45, Math.min(96, score));

  const mealName = mealLabels[mealType];

  return {
    score,
    summary: `${mealName}记录完成。当前评分基于你填写的文字和图片记录生成，适合先做日常饮食自查。`,
    strengths: ["已完成餐食记录", "能持续记录就可以形成饮食习惯反馈"],
    concerns: score < 70 ? ["这餐可能油糖偏高或营养结构不够均衡"] : ["继续注意主食、蛋白质和蔬菜的比例"],
    nutritionAdvice: ["建议每餐包含优质蛋白、蔬菜和适量主食", "饮料优先选择水、无糖茶或低糖饮品"],
    nextMealSuggestion:
      score < 70 ? "下一餐尽量清淡一些，增加蔬菜和蛋白质，减少油炸和含糖饮料。" : "下一餐保持均衡，可以继续补充蔬菜和优质蛋白。"
  };
}

async function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("图片读取失败。"));
    reader.readAsDataURL(file);
  });
}

export default function Home() {
  const [date, setDate] = useState(today());
  const [entries, setEntries] = useState<MealEntry[]>([]);
  const [status, setStatus] = useState<Status>({ type: "idle", message: "" });
  const [chatQuestion, setChatQuestion] = useState("");
  const [chatAnswer, setChatAnswer] = useState("");

  useEffect(() => {
    const raw = window.localStorage.getItem(storageKey);
    setEntries(raw ? JSON.parse(raw) : []);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(entries));
  }, [entries]);

  const dayEntries = useMemo(() => entries.filter((entry) => entry.meal_date === date), [entries, date]);
  const latestByMeal = mealTypes.reduce<Record<MealType, MealEntry | undefined>>(
    (acc, mealType) => {
      acc[mealType] = dayEntries.find((entry) => entry.meal_type === mealType);
      return acc;
    },
    { breakfast: undefined, lunch: undefined, dinner: undefined }
  );

  async function submitMeal(event: FormEvent<HTMLFormElement>, mealType: MealType) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const description = String(formData.get("description") || "").trim();
    const image = formData.get("image");

    if (!description && !(image instanceof File && image.size > 0)) {
      setStatus({ type: "error", message: "请上传图片或填写餐食说明。" });
      return;
    }

    const imageUrl = image instanceof File && image.size > 0 ? await fileToDataUrl(image) : null;
    let score = makeScore(description || "上传了餐食图片", mealType);
    let usedAi = false;

    try {
      const response = await fetch("/api/meals/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mealType,
          date,
          description,
          visionText: imageUrl ? "用户上传了餐食图片，但当前未接入视觉识别，请主要依据文字描述评分。" : ""
        })
      });
      const data = await response.json();

      if (response.ok && data.scoreResult) {
        score = data.scoreResult;
        usedAi = true;
      }
    } catch {
      usedAi = false;
    }

    const entry: MealEntry = {
      id: crypto.randomUUID(),
      user_id: "guest",
      meal_date: date,
      meal_type: mealType,
      image_url: imageUrl,
      user_description: description || null,
      vision_text: usedAi ? "DeepSeek AI 已参与评分。" : imageUrl ? "已保存餐食图片，当前使用本地评分兜底。" : null,
      score_result: score,
      created_at: new Date().toISOString()
    };

    setEntries((current) => [entry, ...current.filter((item) => !(item.meal_date === date && item.meal_type === mealType))]);
    form.reset();
    setStatus({ type: "ok", message: `${mealLabels[mealType]}已保存并${usedAi ? "由 DeepSeek AI 生成评分" : "生成本地评分"}。` });
  }

  function askDietAssistant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const average =
      dayEntries.length > 0
        ? Math.round(dayEntries.reduce((sum, entry) => sum + (entry.score_result?.score || 0), 0) / dayEntries.length)
        : 0;
    const fallback =
      dayEntries.length === 0
        ? "今天还没有餐食记录。先上传早餐、午餐或晚餐，我就能根据记录给你建议。"
        : `今天已记录 ${dayEntries.length} 餐，平均分约 ${average}。建议下一餐优先补充蔬菜和优质蛋白，少喝含糖饮料。你的问题是：${chatQuestion}`;

    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: chatQuestion, context: dayEntries })
    })
      .then(async (response) => {
        const data = await response.json();
        setChatAnswer(response.ok && data.answer ? data.answer : fallback);
      })
      .catch(() => setChatAnswer(fallback));
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
              <p className="text-sm text-ink/60">免配置体验版：记录保存在当前浏览器</p>
            </div>
          </div>
          <label className="flex w-fit items-center gap-2 rounded-md border border-ink/10 bg-white px-3 py-2 text-sm">
            <CalendarDays className="h-4 w-4 text-leaf" />
            <input className="bg-transparent outline-none" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </label>
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
            <MealCard key={mealType} entry={latestByMeal[mealType]} mealType={mealType} onSubmit={submitMeal} />
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
              <button className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-5 py-3 font-semibold text-white">
                <Send className="h-4 w-4" />
                发送
              </button>
            </form>
            {chatAnswer ? <p className="mt-4 whitespace-pre-wrap rounded-md bg-oat p-4 leading-7">{chatAnswer}</p> : null}
          </div>

          <div className="rounded-lg bg-white/90 p-5 shadow-soft">
            <div className="mb-4 flex items-center gap-2">
              <History className="h-5 w-5 text-leaf" />
              <h2 className="text-xl font-semibold">最近记录</h2>
            </div>
            <div className="max-h-[32rem] space-y-3 overflow-auto pr-1">
              {entries.length ? (
                entries.slice(0, 10).map((entry) => <HistoryRow entry={entry} key={entry.id} />)
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

function MealCard({
  mealType,
  entry,
  onSubmit
}: {
  mealType: MealType;
  entry?: MealEntry;
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

      <form className="space-y-3" onSubmit={(event) => onSubmit(event, mealType)}>
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
        <button className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-leaf px-4 py-3 font-semibold text-white">
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
    <div className="rounded-md border border-ink/10 bg-white p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="font-semibold">
          {entry.meal_date} · {mealLabels[entry.meal_type]}
        </span>
        <span className="rounded-md bg-mint px-2 py-1 text-xs font-semibold text-leaf">{entry.score_result?.score ?? "-"} 分</span>
      </div>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink/65">
        {entry.score_result?.summary || entry.user_description || entry.vision_text || "无摘要"}
      </p>
    </div>
  );
}
