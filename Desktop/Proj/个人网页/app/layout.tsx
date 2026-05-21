import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "饮食评分",
  description: "记录每日三餐，用 AI 生成饮食评分和建议。"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
