import { optionalEnv, requiredEnv } from "@/lib/env";

export async function describeMealImage(image: File) {
  const baseUrl = optionalEnv("VISION_API_BASE_URL");
  const apiKey = optionalEnv("VISION_API_KEY");

  if (!image.size) {
    return "";
  }

  if (!baseUrl || !apiKey) {
    return "未配置视觉模型 API，已跳过图片识别。";
  }

  const bytes = Buffer.from(await image.arrayBuffer());
  const dataUrl = `data:${image.type || "image/jpeg"};base64,${bytes.toString("base64")}`;

  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${requiredEnv("VISION_API_KEY")}`
    },
    body: JSON.stringify({
      model: optionalEnv("VISION_MODEL"),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "请用中文识别这张餐食图片中的主要食物、烹饪方式、明显份量和饮食风险，控制在 120 字以内。"
            },
            {
              type: "image_url",
              image_url: {
                url: dataUrl
              }
            }
          ]
        }
      ],
      temperature: 0.2
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`视觉模型请求失败：${response.status} ${detail}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;

  if (!text || typeof text !== "string") {
    throw new Error("视觉模型没有返回可用识别结果。");
  }

  return text;
}
