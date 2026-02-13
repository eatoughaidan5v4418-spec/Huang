import { extendTheme } from 'native-base';

// Soft Minimalist 配色方案
export const colors = {
  // 背景色
  background: '#FAFAFA',           // 暖白色背景
  backgroundSecondary: '#F5F5F5',  // 卡片背景
  backgroundTertiary: '#EEEEEE',   // 更浅的背景

  // 文本色
  textPrimary: '#424242',          // 深灰色主文本
  textSecondary: '#757575',        // 次要文本
  textTertiary: '#9E9E9E',         // 辅助文本

  // 收入/支出颜色（温柔版）
  income: '#4DB6AC',               // 薄荷绿
  incomeLight: '#E0F2F1',          // 薄荷绿浅色背景
  expense: '#FF8A80',              // 珊瑚红
  expenseLight: '#FFEBEE',         // 珊瑚红浅色背景

  // 强调色
  primary: '#7986CB',              // 柔和的蓝紫色
  primaryLight: '#E8EAF6',         // 柔和的蓝紫色背景

  // 中性色
  white: '#FFFFFF',
  divider: 'transparent',          // 去线条化：分割线透明
};

export const theme = extendTheme({
  colors: {
    background: {
      50: colors.background,
      100: colors.backgroundSecondary,
      200: colors.backgroundTertiary,
    },
    text: {
      50: colors.textTertiary,
      100: colors.textSecondary,
      200: colors.textPrimary,
    },
    income: {
      500: colors.income,
      50: colors.incomeLight,
    },
    expense: {
      500: colors.expense,
      50: colors.expenseLight,
    },
    primary: {
      50: colors.primaryLight,
      100: '#C5CAE9',
      200: '#9FA8DA',
      300: '#7986CB',
      400: '#5C6BC0',
      500: colors.primary,
      600: '#3F51B5',
      700: '#3949AB',
    },
  },
  fonts: {
    heading: undefined,
    body: undefined,
    mono: undefined,
  },
  components: {
    Button: {
      baseStyle: {
        rounded: 'full',  // 胶囊形按钮
        shadow: '0',
        _pressed: {
          opacity: 0.8,
        },
      },
      defaultProps: {
        colorScheme: 'primary',
      },
    },
    Box: {
      baseStyle: {
        rounded: '3xl',  // 大圆角 24px
      },
    },
    Card: {
      baseStyle: {
        rounded: '3xl',
        shadow: '0',      // 去阴影
        bg: 'background.100',
      },
    },
    Input: {
      baseStyle: {
        rounded: '2xl',
        borderWidth: '0',
        bg: 'background.100',
        _focus: {
          bg: 'background.200',
          borderWidth: '0',
        },
      },
    },
    Pressable: {
      baseStyle: {
        _pressed: {
          opacity: 0.7,
        },
      },
    },
  },
});

// 导出样式常量供直接使用
export const softStyles = {
  // 页面容器
  container: {
    flex: 1,
    bg: colors.background,
    pt: 12,
    px: 5,
  },

  // 卡片样式
  card: {
    bg: colors.backgroundSecondary,
    rounded: '3xl',
    p: 6,
    shadow: '0',
    borderWidth: 0,
  },

  // 列表项样式
  listItem: {
    bg: colors.backgroundSecondary,
    rounded: '2xl',
    p: 4,
    shadow: '0',
    borderWidth: 0,
    mb: 3,
  },

  // 胶囊按钮
  pillButton: {
    bg: colors.primary,
    rounded: 'full',
    px: 6,
    py: 3,
    shadow: '0',
  },

  // 浮动按钮
  fab: {
    bg: colors.primary,
    rounded: 'full',
    p: 4,
    shadow: '0',
  },

  // 文本样式
  title: {
    color: colors.textPrimary,
    fontSize: '2xl',
    fontWeight: '600',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 'sm',
  },
  amount: {
    color: colors.textPrimary,
    fontSize: 'xl',
    fontWeight: '600',
  },

  // 间距
  spacing: {
    xs: 1,
    sm: 2,
    md: 4,
    lg: 6,
    xl: 8,
  },
};
