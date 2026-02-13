import { NotificationData } from '../modules/NotificationModule';

export interface ParsedTransaction {
  amount: number;
  type: 'income' | 'expense';
  merchant?: string;
  note?: string;
  rawText: string;
}

/**
 * 解析微信支付通知
 * 示例通知内容：
 * - "微信支付收款0.10元"
 * - "你有一笔新支出，金额¥12.50，商户：麦当劳"
 */
export function parseWeChatNotification(data: NotificationData): ParsedTransaction | null {
  const { title, text } = data;
  const fullText = `${title} ${text}`;
  
  console.log('Parsing WeChat notification:', fullText);
  
  // 收入模式：收款、转账入账等
  const incomePatterns = [
    /收款([\d.]+)元/,
    /转账入账([\d.]+)元/,
    /红包([\d.]+)元/,
    /\+([\d.]+)/,
    /收入.*?([\d.]+)/,
  ];
  
  // 支出模式
  const expensePatterns = [
    /支出.*?¥?([\d.]+)/,
    /消费.*?¥?([\d.]+)/,
    /付款.*?¥?([\d.]+)/,
    /-([\d.]+)/,
    /([\d.]+)元/,
  ];
  
  // 尝试匹配收入
  for (const pattern of incomePatterns) {
    const match = fullText.match(pattern);
    if (match) {
      const amount = parseFloat(match[1]);
      if (!isNaN(amount) && amount > 0) {
        return {
          amount,
          type: 'income',
          note: extractMerchant(fullText) || '微信收款',
          rawText: fullText,
        };
      }
    }
  }
  
  // 尝试匹配支出
  for (const pattern of expensePatterns) {
    const match = fullText.match(pattern);
    if (match) {
      const amount = parseFloat(match[1]);
      if (!isNaN(amount) && amount > 0) {
        return {
          amount,
          type: 'expense',
          merchant: extractMerchant(fullText),
          note: extractMerchant(fullText) || '微信支付',
          rawText: fullText,
        };
      }
    }
  }
  
  return null;
}

/**
 * 解析支付宝通知
 * 示例通知内容：
 * - "支付宝成功收款0.10元"
 * - "你有一笔新支出，金额¥12.50，商家：星巴克"
 */
export function parseAlipayNotification(data: NotificationData): ParsedTransaction | null {
  const { title, text } = data;
  const fullText = `${title} ${text}`;
  
  console.log('Parsing Alipay notification:', fullText);
  
  // 收入模式
  const incomePatterns = [
    /收款([\d.]+)/,
    /到账([\d.]+)/,
    /\+([\d.]+)/,
    /收入.*?([\d.]+)/,
  ];
  
  // 支出模式
  const expensePatterns = [
    /支出.*?¥?([\d.]+)/,
    /消费.*?¥?([\d.]+)/,
    /付款.*?¥?([\d.]+)/,
    /-([\d.]+)/,
    /([\d.]+)元/,
  ];
  
  // 尝试匹配收入
  for (const pattern of incomePatterns) {
    const match = fullText.match(pattern);
    if (match) {
      const amount = parseFloat(match[1]);
      if (!isNaN(amount) && amount > 0) {
        return {
          amount,
          type: 'income',
          note: extractMerchant(fullText) || '支付宝收款',
          rawText: fullText,
        };
      }
    }
  }
  
  // 尝试匹配支出
  for (const pattern of expensePatterns) {
    const match = fullText.match(pattern);
    if (match) {
      const amount = parseFloat(match[1]);
      if (!isNaN(amount) && amount > 0) {
        return {
          amount,
          type: 'expense',
          merchant: extractMerchant(fullText),
          note: extractMerchant(fullText) || '支付宝支付',
          rawText: fullText,
        };
      }
    }
  }
  
  return null;
}

/**
 * 从通知文本中提取商户名称
 */
function extractMerchant(text: string): string | undefined {
  const merchantPatterns = [
    /商户[：:]\s*([^，,。]+)/,
    /商家[：:]\s*([^，,。]+)/,
    /向(.+?)付款/,
    /付款给(.+?)[，,。]/,
    /在(.+?)消费/,
  ];
  
  for (const pattern of merchantPatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  
  return undefined;
}

/**
 * 根据包名自动选择解析器
 */
export function parseNotification(data: NotificationData): ParsedTransaction | null {
  const { packageName } = data;
  
  if (packageName === 'com.tencent.mm') {
    return parseWeChatNotification(data);
  } else if (packageName === 'com.eg.android.AlipayGphone') {
    return parseAlipayNotification(data);
  }
  
  return null;
}
