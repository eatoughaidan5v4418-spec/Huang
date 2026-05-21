# 饮食评分网页

一个 Next.js + Supabase + DeepSeek 的饮食记录 MVP。用户可以登录、上传每日三餐图片和文字说明，服务端调用视觉模型识别图片，再用 DeepSeek 生成评分和饮食建议。

## 本地运行

```bash
npm install
npm run dev
```

复制 `.env.local.example` 为 `.env.local`，填写环境变量：

```bash
DEEPSEEK_API_KEY=
DEEPSEEK_MODEL=deepseek-v4-flash

VISION_API_KEY=
VISION_API_BASE_URL=
VISION_MODEL=

SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

`NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 与对应的 Supabase 值相同，用于浏览器登录。`SUPABASE_SERVICE_ROLE_KEY` 只用于服务端 API，不要暴露到前端。

## Supabase 初始化

1. 新建 Supabase 项目。
2. 在 SQL Editor 中执行 `supabase/schema.sql`。
3. 在 Authentication 中开启邮箱登录。
4. 确认 Storage 里存在公开 bucket：`meal-images`。

## 视觉模型接口

`VISION_API_BASE_URL` 需要是兼容 OpenAI Chat Completions 多模态格式的接口地址。请求体会发送：

```json
{
  "model": "VISION_MODEL",
  "messages": [
    {
      "role": "user",
      "content": [
        { "type": "text", "text": "..." },
        { "type": "image_url", "image_url": { "url": "data:image/jpeg;base64,..." } }
      ]
    }
  ]
}
```

如果暂时不配置视觉模型，上传图片仍会保存，系统会提示已跳过图片识别，并用用户填写的文字交给 DeepSeek 评分。

## Vercel 部署

1. 把项目推到 GitHub。
2. 在 Vercel 导入仓库。
3. 在 Vercel Project Settings -> Environment Variables 填写 `.env.local.example` 里的变量。
4. Build Command 使用 `npm run build`，Output 保持 Next.js 默认设置。

部署完成后，Vercel 会提供公网 HTTPS 地址。

更详细的公网部署说明见 `DEPLOYMENT.md`。

## 页面

- `/`：今日三餐记录、上传图片、AI 评分、饮食追问。
- `/history`：按日期查看历史饮食记录。
