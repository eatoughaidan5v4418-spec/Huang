import { Category } from '../types';

export const EXPENSE_CATEGORIES: Category[] = [
  { id: 'food', name: '餐饮', icon: 'Utensils', color: '#FF6B6B' },
  { id: 'transport', name: '交通', icon: 'Bus', color: '#4ECDC4' },
  { id: 'shopping', name: '购物', icon: 'ShoppingBag', color: '#45B7D1' },
  { id: 'entertainment', name: '娱乐', icon: 'Film', color: '#96CEB4' },
  { id: 'housing', name: '居住', icon: 'Home', color: '#FFA940' },
  { id: 'medical', name: '医疗', icon: 'Heart', color: '#FF7875' },
  { id: 'education', name: '教育', icon: 'BookOpen', color: '#9254DE' },
  { id: 'other', name: '其他', icon: 'MoreHorizontal', color: '#DDA0DD' },
];

export const INCOME_CATEGORIES: Category[] = [
  { id: 'salary', name: '工资', icon: 'Banknote', color: '#52C41A' },
  { id: 'bonus', name: '奖金', icon: 'Gift', color: '#73D13D' },
  { id: 'investment', name: '投资', icon: 'TrendingUp', color: '#95DE64' },
  { id: 'parttime', name: '兼职', icon: 'Briefcase', color: '#B7EB8F' },
  { id: 'other_income', name: '其他', icon: 'MoreHorizontal', color: '#D9F7BE' },
];

export const CATEGORIES = EXPENSE_CATEGORIES;

export const CATEGORY_ICONS: Record<string, string> = {
  Utensils: 'Utensils',
  Bus: 'Bus',
  ShoppingBag: 'ShoppingBag',
  Film: 'Film',
  Home: 'Home',
  Heart: 'Heart',
  BookOpen: 'BookOpen',
  MoreHorizontal: 'MoreHorizontal',
  Banknote: 'Banknote',
  Gift: 'Gift',
  TrendingUp: 'TrendingUp',
  Briefcase: 'Briefcase',
};

export const CATEGORY_DEFAULT_NOTES: Record<string, string> = {
  food: '餐饮支出',
  transport: '交通支出',
  shopping: '购物支出',
  entertainment: '娱乐支出',
  housing: '居住支出',
  medical: '医疗支出',
  education: '教育支出',
  other: '其他支出',
  salary: '工资收入',
  bonus: '奖金收入',
  investment: '投资收入',
  parttime: '兼职收入',
  other_income: '其他收入',
};
