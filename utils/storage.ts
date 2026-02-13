import AsyncStorage from '@react-native-async-storage/async-storage';
import { Expense } from '../types';

const EXPENSES_KEY = '@expenses';

export const saveExpenses = async (expenses: Expense[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(expenses);
    await AsyncStorage.setItem(EXPENSES_KEY, jsonValue);
  } catch (error) {
    console.error('Error saving expenses:', error);
    throw error;
  }
};

export const loadExpenses = async (): Promise<Expense[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(EXPENSES_KEY);
    if (jsonValue == null) {
      return [];
    }
    const expenses = JSON.parse(jsonValue);
    return expenses.map((expense: Expense) => ({
      ...expense,
      date: new Date(expense.date),
    }));
  } catch (error) {
    console.error('Error loading expenses:', error);
    return [];
  }
};

export const addExpenseToStorage = async (expense: Expense): Promise<void> => {
  const expenses = await loadExpenses();
  const updatedExpenses = [expense, ...expenses];
  await saveExpenses(updatedExpenses);
};

export const deleteExpenseFromStorage = async (id: string): Promise<void> => {
  const expenses = await loadExpenses();
  const updatedExpenses = expenses.filter((expense) => expense.id !== id);
  await saveExpenses(updatedExpenses);
};
