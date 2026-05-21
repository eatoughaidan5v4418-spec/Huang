import { optionalEnv, requiredEnv } from "@/lib/env";
import type { MealScore, MealType } from "@/lib/types";
import { z } from "zod";

const scoreSchema = z.object({
  score: z.number().min(0).max(100),
  summary: z.string(),
  strengths: z.array(z.string()).default([]),
  concerns: z.array(z.string()).default([]),
  nutritionAdvice: z.array(z.string()).default([]),
  nextMealSuggestion: z.string()
});

type DeepSeekMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

async function callDeepSeek(messages: DeepSeekMessage[], json = false) {
  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${requiredEnv("DEEPSEEK_API_KEY")}`
    },
    body: JSON.stringify({
      model: optionalEnv("DEEPSEEK_MODEL") || "deepseek-v4-flash",
      messages,
      response_format: json ? { type: "json_object" } : { type: "text" },
      thinking: { type: "disabled" },
      temperature: 0.3,
      stream: false
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`DeepSeek 请求失败：${response.status} ${detail}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (!content || typeof content !== "string") {
    throw new Error("DeepSeek 没有返回可用内容。");
  }

  return content;
}

export async function scoreMeal(input: {
  mealType: MealType;
  date: string;
  userDescription: string;
  visionText: string;
}): Promise<MealScore> {
  const content = await callDeepSeek(
    [
      {
        role: "system",
        content:
          "你是严谨但友好的中文营养饮食评分助手。只输出 JSON，不要 Markdown。评分用于日常健康建议，不替代医生诊断。"
      },
      {
        role: "user",
        content: JSON.stringify({
          instruction:
            "请根据餐别、日期、用户描述和图片识别结果给这顿饭打 0-100 分，并给出简洁中文建议。必须返回字段：score, summary, strengths, concerns, nutritionAdvice, nextMealSuggestion。",
          mealType: input.mealType,
          date: input.date,
          userDescription: input.userDescription || "用户没有补充说明",
          visionText: input.visionText || "没有图片识别结果"
        })
      }
    ],
    true
  );

  const parsed = scoreSchema.safeParse(JSON.parse(content));

  if (!parsed.success) {
    throw new Error("DeepSeek 返回格式不符合评分结构。");
  }

  return parsed.data;
}

export async function chatWithDietContext(input: {
  question: string;
  context: unknown;
}) {
  return callDeepSeek([
    {
      role: "system",
      content:
        "你是中文饮食助手。基于用户已保存的饮食记录回答，给实用建议。不要编造不存在的记录，必要时说明信息不足。"
    },
    {
      role: "user",
      content: JSON.stringify({
        dietRecords: input.context,
        question: input.question
      })
    }
  ]);
}
