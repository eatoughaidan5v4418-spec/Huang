import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Expense, CategoryBreakdown, DailyExpense, MonthlyStats } from '../types';
import { EXPENSE_CATEGORIES } from '../constants/categories';

interface ExpenseStore {
  expenses: Expense[];
  isLoading: boolean;
  addExpense: (expense: Omit<Expense, 'id' | 'date'>) => void;
  deleteExpense: (id: string) => void;
  getMonthlyTotal: (year: number, month: number) => number;
  getMonthlyExpense: (year: number, month: number) => number;
  getMonthlyIncome: (year: number, month: number) => number;
  getMonthlyStats: (year: number, month: number) => MonthlyStats;
  getRecentExpenses: (limit: number) => Expense[];
  getCategoryBreakdown: (year: number, month: number) => CategoryBreakdown[];
  getDailyExpenses: (year: number, month: number) => DailyExpense[];
}

export const useExpenseStore = create<ExpenseStore>()(
  persist(
    (set, get) => ({
      expenses: [],
      isLoading: false,

      addExpense: (expenseData) => {
        const newExpense: Expense = {
          id: Date.now().toString(),
          ...expenseData,
          date: new Date(),
        };
        set((state) => ({
          expenses: [newExpense, ...state.expenses],
        }));
      },

      deleteExpense: (id) => {
        set((state) => ({
          expenses: state.expenses.filter((expense) => expense.id !== id),
        }));
      },

      getMonthlyTotal: (year, month) => {
        const { expenses } = get();
        return expenses
          .filter((expense) => {
            const expenseDate = new Date(expense.date);
            return (
              expenseDate.getFullYear() === year &&
              expenseDate.getMonth() === month
            );
          })
          .reduce((total, expense) => total + expense.amount, 0);
      },

      getMonthlyExpense: (year, month) => {
        const { expenses } = get();
        return expenses
          .filter((expense) => {
            const expenseDate = new Date(expense.date);
            return (
              expenseDate.getFullYear() === year &&
              expenseDate.getMonth() === month &&
              expense.type !== 'income'
            );
          })
          .reduce((total, expense) => total + expense.amount, 0);
      },

      getMonthlyIncome: (year, month) => {
        const { expenses } = get();
        return expenses
          .filter((expense) => {
            const expenseDate = new Date(expense.date);
            return (
              expenseDate.getFullYear() === year &&
              expenseDate.getMonth() === month &&
              expense.type === 'income'
            );
          })
          .reduce((total, expense) => total + expense.amount, 0);
      },

      getMonthlyStats: (year, month) => {
        const { expenses } = get();
        const monthExpenses = expenses.filter((expense) => {
          const expenseDate = new Date(expense.date);
          return (
            expenseDate.getFullYear() === year &&
            expenseDate.getMonth() === month
          );
        });

        const totalExpense = monthExpenses
          .filter((e) => e.type !== 'income')
          .reduce((sum, e) => sum + e.amount, 0);

        const totalIncome = monthExpenses
          .filter((e) => e.type === 'income')
          .reduce((sum, e) => sum + e.amount, 0);

        return {
          totalExpense,
          totalIncome,
          balance: totalIncome - totalExpense,
          recordCount: monthExpenses.length,
        };
      },

      getRecentExpenses: (limit) => {
        const { expenses } = get();
        return expenses.slice(0, limit);
      },

      getCategoryBreakdown: (year, month) => {
        const { expenses } = get();
        const monthlyExpenses = expenses.filter((expense) => {
          const expenseDate = new Date(expense.date);
          return (
            expenseDate.getFullYear() === year &&
            expenseDate.getMonth() === month &&
            expense.type !== 'income'
          );
        });

        const total = monthlyExpenses.reduce(
          (sum, expense) => sum + expense.amount,
          0
        );

        if (total === 0) {
          return EXPENSE_CATEGORIES.map((category) => ({
            category: category.id,
            amount: 0,
            percentage: 0,
          }));
        }

        const breakdown = EXPENSE_CATEGORIES.map((category) => {
          const categoryTotal = monthlyExpenses
            .filter((expense) => expense.category === category.id)
            .reduce((sum, expense) => sum + expense.amount, 0);

          return {
            category: category.id,
            amount: categoryTotal,
            percentage: (categoryTotal / total) * 100,
          };
        });

        return breakdown;
      },

      getDailyExpenses: (year, month) => {
        const { expenses } = get();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const dailyExpenses: DailyExpense[] = [];

        for (let day = 1; day <= daysInMonth; day++) {
          const dayExpenses = expenses.filter((expense) => {
            const expenseDate = new Date(expense.date);
            return (
              expenseDate.getFullYear() === year &&
              expenseDate.getMonth() === month &&
              expenseDate.getDate() === day &&
              expense.type !== 'income'
            );
          });

          const totalAmount = dayExpenses.reduce(
            (sum, expense) => sum + expense.amount,
            0
          );

          dailyExpenses.push({ day, amount: totalAmount });
        }

        return dailyExpenses;
      },
    }),
    {
      name: 'expense-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
