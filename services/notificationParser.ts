export interface ParsedTransaction {
  amount: number;
  type: 'expense' | 'income';
  category: string;
  note: string;
  source: 'wechat' | 'alipay';
  merchant?: string;
  timestamp: Date;
}

export interface NotificationData {
  packageName: string;
  title: string;
  text: string;
  subText?: string;
  bigText?: string;
  timestamp: number;
}

const WECHAT_PACKAGE = 'com.tencent.mm';
const ALIPAY_PACKAGE = 'com.eg.android.AlipayGphone';

const WECHAT_PATTERNS = {
  expense: [
    /微信支付.*?(\d+\.?\d*)\s*元/,
    /支付成功.*?(\d+\.?\d*)\s*元/,
    /你向.*?支付(\d+\.?\d*)\s*元/,
    /付款.*?(\d+\.?\d*)\s*元/,
    /消费.*?(\d+\.?\d*)\s*元/,
  ],
  income: [
    /收到.*?(\d+\.?\d*)\s*元/,
    /入账.*?(\d+\.?\d*)\s*元/,
    /收款.*?(\d+\.?\d*)\s*元/,
    /红包.*?(\d+\.?\d*)\s*元/,
    /转账.*?(\d+\.?\d*)\s*元/,
  ],
};

const ALIPAY_PATTERNS = {
  expense: [
    /支付成功.*?(\d+\.?\d*)\s*元/,
    /付款成功.*?(\d+\.?\d*)\s*元/,
    /消费.*?(\d+\.?\d*)\s*元/,
    /成功支付(\d+\.?\d*)\s*元/,
    /付款(\d+\.?\d*)\s*元/,
  ],
  income: [
    /收到.*?(\d+\.?\d*)\s*元/,
    /入账.*?(\d+\.?\d*)\s*元/,
    /收款.*?(\d+\.?\d*)\s*元/,
    /转账.*?(\d+\.?\d*)\s*元/,
    /红包.*?(\d+\.?\d*)\s*元/,
  ],
};

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  food: ['餐饮', '外卖', '美食', '餐厅', '快餐', '奶茶', '咖啡', '小吃', '麦当劳', '肯德基', '星巴克', '瑞幸', '美团外卖', '饿了么'],
  transport: ['出行', '打车', '滴滴', '出租', '地铁', '公交', '加油', '停车', '高铁', '火车', '机票', '航班'],
  shopping: ['购物', '超市', '便利店', '淘宝', '京东', '拼多多', '商场', '网购', '快递'],
  entertainment: ['娱乐', '电影', '游戏', '音乐', '视频', '直播', '会员'],
  housing: ['房租', '水电', '物业', '宽带', '维修'],
  medical: ['医院', '药店', '药品', '医疗', '挂号'],
  education: ['教育', '培训', '课程', '学习', '书店'],
};

function extractMerchant(text: string): string | undefined {
  const merchantPatterns = [
    /向(.+?)支付/,
    /在(.+?)消费/,
    /在(.+?)付款/,
    /商户[：:]\s*(.+)/,
    /收款方[：:]\s*(.+)/,
  ];

  for (const pattern of merchantPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return undefined;
}

function guessCategory(text: string, merchant?: string): string {
  const searchText = `${text} ${merchant || ''}`.toLowerCase();
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (searchText.includes(keyword.toLowerCase())) {
        return category;
      }
    }
  }

  return 'other';
}

export function parseWechatNotification(notification: NotificationData): ParsedTransaction | null {
  const fullText = `${notification.title} ${notification.text} ${notification.bigText || ''}`;
  
  for (const pattern of WECHAT_PATTERNS.expense) {
    const match = fullText.match(pattern);
    if (match) {
      const amount = parseFloat(match[1]);
      if (!isNaN(amount) && amount > 0) {
        const merchant = extractMerchant(fullText);
        return {
          amount,
          type: 'expense',
          category: guessCategory(fullText, merchant),
          note: merchant ? `微信支付 - ${merchant}` : '微信支付',
          source: 'wechat',
          merchant,
          timestamp: new Date(notification.timestamp),
        };
      }
    }
  }

  for (const pattern of WECHAT_PATTERNS.income) {
    const match = fullText.match(pattern);
    if (match) {
      const amount = parseFloat(match[1]);
      if (!isNaN(amount) && amount > 0) {
        const merchant = extractMerchant(fullText);
        return {
          amount,
          type: 'income',
          category: 'other_income',
          note: merchant ? `微信收款 - ${merchant}` : '微信收款',
          source: 'wechat',
          merchant,
          timestamp: new Date(notification.timestamp),
        };
      }
    }
  }

  return null;
}

export function parseAlipayNotification(notification: NotificationData): ParsedTransaction | null {
  const fullText = `${notification.title} ${notification.text} ${notification.bigText || ''}`;
  
  for (const pattern of ALIPAY_PATTERNS.expense) {
    const match = fullText.match(pattern);
    if (match) {
      const amount = parseFloat(match[1]);
      if (!isNaN(amount) && amount > 0) {
        const merchant = extractMerchant(fullText);
        return {
          amount,
          type: 'expense',
          category: guessCategory(fullText, merchant),
          note: merchant ? `支付宝 - ${merchant}` : '支付宝支付',
          source: 'alipay',
          merchant,
          timestamp: new Date(notification.timestamp),
        };
      }
    }
  }

  for (const pattern of ALIPAY_PATTERNS.income) {
    const match = fullText.match(pattern);
    if (match) {
      const amount = parseFloat(match[1]);
      if (!isNaN(amount) && amount > 0) {
        const merchant = extractMerchant(fullText);
        return {
          amount,
          type: 'income',
          category: 'other_income',
          note: merchant ? `支付宝收款 - ${merchant}` : '支付宝收款',
          source: 'alipay',
          merchant,
          timestamp: new Date(notification.timestamp),
        };
      }
    }
  }

  return null;
}

export function parseNotification(notification: NotificationData): ParsedTransaction | null {
  if (notification.packageName === WECHAT_PACKAGE) {
    return parseWechatNotification(notification);
  }
  
  if (notification.packageName === ALIPAY_PACKAGE) {
    return parseAlipayNotification(notification);
  }

  return null;
}

export function isPaymentNotification(packageName: string): boolean {
  return packageName === WECHAT_PACKAGE || packageName === ALIPAY_PACKAGE;
}
