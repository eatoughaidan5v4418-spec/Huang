export type ExpenseCategoryType = 'food' | 'transport' | 'shopping' | 'entertainment' | 'housing' | 'medical' | 'education' | 'other';
export type IncomeCategoryType = 'salary' | 'bonus' | 'investment' | 'parttime' | 'other_income';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  note: string;
  date: Date;
  type: 'expense' | 'income';
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

export interface DailyExpense {
  day: number;
  amount: number;
}

export interface MonthlyStats {
  totalExpense: number;
  totalIncome: number;
  balance: number;
  recordCount: number;
}
