import { extendTheme } from 'native-base';

// 智能健康坐垫配色方案 - 健康科技风
export const colors = {
  // 背景色
  background: '#F0F4F8',           // 浅灰蓝背景
  backgroundSecondary: '#FFFFFF',  // 白色卡片
  backgroundTertiary: '#E8EDF2',   // 更深的辅助背景

  // 文本色
  textPrimary: '#1A2B3C',          // 深蓝灰主文本
  textSecondary: '#5A6B7C',        // 次要文本
  textTertiary: '#8A9BAC',         // 辅助文本

  // 健康状态色
  healthy: '#22C55E',              // 健康绿
  healthyLight: '#DCFCE7',         // 健康绿浅色
  warning: '#F59E0B',              // 警告橙
  warningLight: '#FEF3C7',         // 警告橙浅色
  danger: '#EF4444',               // 危险红
  dangerLight: '#FEE2E2',          // 危险红浅色

  // 功能色
  heating: '#F97316',              // 加热色(橙)
  heatingLight: '#FFF7ED',         // 加热色浅色
  cooling: '#06B6D4',              // 散热色(青)
  coolingLight: '#ECFEFF',         // 散热色浅色

  // 主强调色
  primary: '#3B82F6',              // 科技蓝
  primaryLight: '#EFF6FF',         // 科技蓝浅色
  primaryDark: '#1D4ED8',          // 科技蓝深色

  // 坐姿对应色
  postureNormal: '#22C55E',
  postureWarn: '#F59E0B',
  postureBad: '#EF4444',

  // 中性色
  white: '#FFFFFF',
  divider: '#E2E8F0',
  disabled: '#CBD5E1',
};

export const theme = extendTheme({
  colors: {
    primary: {
      50: colors.primaryLight,
      100: '#DBEAFE',
      200: '#BFDBFE',
      300: '#93C5FD',
      400: '#60A5FA',
      500: colors.primary,
      600: '#2563EB',
      700: colors.primaryDark,
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
        rounded: 'full',
        shadow: '0',
        _pressed: { opacity: 0.8 },
      },
      defaultProps: { colorScheme: 'primary' },
    },
    Box: {
      baseStyle: { rounded: '2xl' },
    },
    Input: {
      baseStyle: {
        rounded: 'xl',
        borderWidth: '0',
        bg: 'white',
        _focus: { bg: colors.backgroundTertiary, borderWidth: '0' },
      },
    },
    Pressable: {
      baseStyle: { _pressed: { opacity: 0.7 } },
    },
  },
});
