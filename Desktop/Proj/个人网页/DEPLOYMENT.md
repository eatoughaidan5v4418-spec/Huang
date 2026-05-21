# 公网部署步骤

这个项目需要部署到支持 Next.js API Route 的平台，推荐 Vercel。GitHub Pages 不适合当前版本，因为本项目需要服务端 API 来保护 DeepSeek、视觉模型和 Supabase Service Role 密钥。

## 需要准备

1. Vercel 账号。
2. Supabase 项目。
3. DeepSeek API Key。
4. 一个兼容 OpenAI Chat Completions 图片输入格式的视觉模型 API。

## Supabase

在 Supabase SQL Editor 执行：

```sql
-- 直接复制执行 supabase/schema.sql
```

然后在 Supabase 项目设置中找到：

- Project URL
- anon public key
- service_role key

## Vercel 环境变量

在 Vercel 项目设置的 Environment Variables 中添加：

```bash
DEEPSEEK_API_KEY=你的 DeepSeek Key
DEEPSEEK_MODEL=deepseek-v4-flash

VISION_API_KEY=你的视觉模型 Key
VISION_API_BASE_URL=你的视觉模型 chat completions 地址
VISION_MODEL=你的视觉模型名称

SUPABASE_URL=你的 Supabase Project URL
SUPABASE_ANON_KEY=你的 Supabase anon key
SUPABASE_SERVICE_ROLE_KEY=你的 Supabase service_role key

NEXT_PUBLIC_SUPABASE_URL=你的 Supabase Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的 Supabase anon key
```

## 部署命令

登录 Vercel 后，在项目目录运行：

```bash
npm run deploy
```

第一次运行会询问项目名和部署范围，按提示选择即可。部署成功后，终端会输出一个 `https://...vercel.app` 的公网地址。

## 重要提醒

- 不要把 `API.txt`、`.env.local` 或任何密钥提交到 GitHub。
- 没有填写 Supabase 环境变量时，公网网页会打开，但只会显示“需要配置 Supabase”。
- 没有填写视觉模型环境变量时，图片识别会跳过，仍可根据文字描述调用 DeepSeek 评分。
