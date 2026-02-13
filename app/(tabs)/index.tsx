import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Pressable,
  ScrollView,
} from 'native-base';
import { useRouter } from 'expo-router';
import {
  Plus,
  TrendingUp,
  Bell,
} from 'lucide-react-native';
import { useExpenseStore } from '../../store/useExpenseStore';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../constants/categories';
import CategoryIcon from '../../components/ui/CategoryIcon';
import { colors } from '../../constants/theme';

export default function Index() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  const expenses = useExpenseStore((state) => state.expenses);
  const getMonthlyExpense = useExpenseStore((state) => state.getMonthlyExpense);
  const getMonthlyIncome = useExpenseStore((state) => state.getMonthlyIncome);
  const getRecentExpenses = useExpenseStore((state) => state.getRecentExpenses);

  const [currentDate] = useState(new Date());
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const [monthlyExpense, setMonthlyExpense] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [recentExpenses, setRecentExpenses] = useState<any[]>([]);

  useEffect(() => {
    try {
      const expense = getMonthlyExpense(currentYear, currentMonth);
      const income = getMonthlyIncome(currentYear, currentMonth);
      const recent = getRecentExpenses(5);
      setMonthlyExpense(expense);
      setMonthlyIncome(income);
      setRecentExpenses(recent);
      setIsReady(true);
    } catch (error) {
      console.error('Error loading data:', error);
      setIsReady(true);
    }
  }, [expenses, getMonthlyExpense, getMonthlyIncome, getRecentExpenses, currentYear, currentMonth]);

  const getCategoryInfo = (categoryId: string, type: string) => {
    const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    return categories.find((c) => c.id === categoryId) || categories[categories.length - 1];
  };

  const formatCurrency = (amount: number) => {
    return `¥${amount.toFixed(2)}`;
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const expenseDate = new Date(date);

    if (expenseDate.toDateString() === now.toDateString()) {
      return '今天';
    }

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (expenseDate.toDateString() === yesterday.toDateString()) {
      return '昨天';
    }

    return `${expenseDate.getMonth() + 1}月${expenseDate.getDate()}日`;
  };

  if (!isReady) {
    return (
      <Box flex={1} bg={colors.background} justifyContent="center" alignItems="center">
        <Text color={colors.textSecondary}>加载中...</Text>
      </Box>
    );
  }

  return (
    <Box flex={1} bg={colors.background} pt={16} px={6}>
      {/* 头部标题 */}
      <HStack justifyContent="space-between" alignItems="center" mb={8}>
        <Text fontSize="3xl" fontWeight="600" color={colors.textPrimary}>
          EasyBill
        </Text>
        <HStack space={3}>
          <Pressable
            onPress={() => router.push('/auto-record')}
            p={3}
            rounded="full"
            bg={colors.backgroundSecondary}
          >
            <Bell size={22} color={colors.primary} />
          </Pressable>
          <Pressable
            onPress={() => router.push('/statistics')}
            p={3}
            rounded="full"
            bg={colors.backgroundSecondary}
          >
            <TrendingUp size={22} color={colors.primary} />
          </Pressable>
        </HStack>
      </HStack>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 月度总览卡片 */}
        <Box
          bg={colors.backgroundSecondary}
          rounded="3xl"
          p={8}
          mb={8}
        >
          <HStack justifyContent="space-between" alignItems="flex-start">
            <VStack alignItems="flex-start" flex={1}>
              <Text color={colors.textTertiary} fontSize="sm" mb={1}>
                本月收入
              </Text>
              <Text color={colors.income} fontSize="2xl" fontWeight="600">
                {formatCurrency(monthlyIncome)}
              </Text>
            </VStack>
            <VStack alignItems="center" flex={1}>
              <Text color={colors.textTertiary} fontSize="sm" mb={1}>
                本月支出
              </Text>
              <Text color={colors.expense} fontSize="2xl" fontWeight="600">
                {formatCurrency(monthlyExpense)}
              </Text>
            </VStack>
            <VStack alignItems="flex-end" flex={1}>
              <Text color={colors.textTertiary} fontSize="sm" mb={1}>
                结余
              </Text>
              <Text
                fontSize="2xl"
                fontWeight="600"
                color={monthlyIncome - monthlyExpense >= 0 ? colors.income : colors.expense}
              >
                {formatCurrency(monthlyIncome - monthlyExpense)}
              </Text>
            </VStack>
          </HStack>

          {/* 记账笔数 */}
          <HStack mt={6} justifyContent="center">
            <Text color={colors.textSecondary} fontSize="sm">
              本月共记账 {expenses.filter((e) => {
                const d = new Date(e.date);
                return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
              }).length} 笔
            </Text>
          </HStack>
        </Box>

        {/* 自动记账提示 */}
        <Pressable onPress={() => router.push('/auto-record')} mb={8}>
          <Box
            bg={colors.primaryLight}
            rounded="3xl"
            p={5}
          >
            <HStack alignItems="center" space={4}>
              <Box
                p={3}
                rounded="full"
                bg={colors.white}
              >
                <Bell size={20} color={colors.primary} />
              </Box>
              <VStack flex={1}>
                <Text color={colors.textPrimary} fontWeight="500" fontSize="md">
                  开启自动记账
                </Text>
                <Text color={colors.textSecondary} fontSize="sm" mt={0.5}>
                  自动抓取微信/支付宝交易
                </Text>
              </VStack>
            </HStack>
          </Box>
        </Pressable>

        {/* 最近记录标题 */}
        <HStack justifyContent="space-between" alignItems="center" mb={5}>
          <Text color={colors.textPrimary} fontSize="lg" fontWeight="500">
            最近记录
          </Text>
          {recentExpenses.length > 0 && (
            <Pressable onPress={() => router.push('/statistics')}>
              <Text color={colors.primary} fontSize="sm">
                查看全部
              </Text>
            </Pressable>
          )}
        </HStack>

        {/* 记录列表 */}
        {recentExpenses.length === 0 ? (
          <Box
            bg={colors.backgroundSecondary}
            rounded="3xl"
            p={10}
            alignItems="center"
            mb={8}
          >
            <Text color={colors.textSecondary} textAlign="center">
              还没有记账记录
            </Text>
            <Text color={colors.textTertiary} textAlign="center" fontSize="sm" mt={2}>
              点击下方按钮开始记账吧
            </Text>
          </Box>
        ) : (
          <VStack space={4} mb={24}>
            {recentExpenses.map((expense) => {
              const category = getCategoryInfo(expense.category, expense.type || 'expense');
              const isIncome = expense.type === 'income';
              return (
                <Box
                  key={expense.id}
                  bg={colors.backgroundSecondary}
                  rounded="2xl"
                  p={5}
                >
                  <HStack justifyContent="space-between" alignItems="center">
                    <HStack space={4} alignItems="center">
                      <Box
                        p={3}
                        rounded="xl"
                        bg={isIncome ? colors.incomeLight : colors.expenseLight}
                      >
                        <CategoryIcon
                          iconName={category.icon}
                          color={isIncome ? colors.income : colors.expense}
                          size={22}
                        />
                      </Box>
                      <VStack>
                        <Text color={colors.textPrimary} fontWeight="500" fontSize="md">
                          {category.name}
                        </Text>
                        <Text color={colors.textTertiary} fontSize="xs" mt={0.5}>
                          {formatDate(expense.date)}
                          {expense.note && ` · ${expense.note}`}
                        </Text>
                      </VStack>
                    </HStack>
                    <Text
                      fontWeight="600"
                      fontSize="lg"
                      color={isIncome ? colors.income : colors.expense}
                    >
                      {isIncome ? '+' : '-'}{formatCurrency(expense.amount)}
                    </Text>
                  </HStack>
                </Box>
              );
            })}
          </VStack>
        )}
      </ScrollView>

      {/* 浮动添加按钮 */}
      <Pressable
        onPress={() => router.push('/add-expense')}
        position="absolute"
        bottom={8}
        right={6}
        bg={colors.primary}
        p={4}
        rounded="full"
      >
        <Plus size={28} color={colors.white} />
      </Pressable>
    </Box>
  );
}
