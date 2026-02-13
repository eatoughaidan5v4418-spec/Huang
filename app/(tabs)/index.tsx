import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  Heading,
  VStack,
  HStack,
  Pressable,
  useColorModeValue,
  ScrollView,
} from 'native-base';
import { useRouter } from 'expo-router';
import {
  Plus,
  TrendingUp,
  Calendar,
  ChevronRight,
  Bell,
} from 'lucide-react-native';
import { useExpenseStore } from '../../store/useExpenseStore';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../constants/categories';
import CategoryIcon from '../../components/ui/CategoryIcon';

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

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.500', 'gray.400');

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
      <Box flex={1} bg={bgColor} justifyContent="center" alignItems="center">
        <Text color={textColor}>加载中...</Text>
      </Box>
    );
  }

  return (
    <Box flex={1} bg={bgColor} pt={12} px={4}>
      <HStack justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="xl" color={textColor}>
          EasyBill
        </Heading>
        <HStack space={2}>
          <Pressable
            onPress={() => router.push('/auto-record')}
            p={2}
            rounded="full"
            bg={cardBg}
            shadow={2}
          >
            <Bell size={22} color="#1890FF" />
          </Pressable>
          <Pressable
            onPress={() => router.push('/statistics')}
            p={2}
            rounded="full"
            bg={cardBg}
            shadow={2}
          >
            <TrendingUp size={22} color="#1890FF" />
          </Pressable>
        </HStack>
      </HStack>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Box bg={cardBg} rounded="2xl" p={6} shadow={3} mb={6}>
          <HStack justifyContent="space-around" mb={4}>
            <VStack alignItems="center" flex={1}>
              <Text color={subTextColor} fontSize="xs" mb={1}>
                收入
              </Text>
              <Text color="#52C41A" fontSize="xl" fontWeight="bold">
                {formatCurrency(monthlyIncome)}
              </Text>
            </VStack>
            <VStack alignItems="center" flex={1}>
              <Text color={subTextColor} fontSize="xs" mb={1}>
                支出
              </Text>
              <Text color="#FF6B6B" fontSize="xl" fontWeight="bold">
                {formatCurrency(monthlyExpense)}
              </Text>
            </VStack>
            <VStack alignItems="center" flex={1}>
              <Text color={subTextColor} fontSize="xs" mb={1}>
                结余
              </Text>
              <Text
                fontSize="xl"
                fontWeight="bold"
                color={monthlyIncome - monthlyExpense >= 0 ? '#52C41A' : '#FF6B6B'}
              >
                {formatCurrency(monthlyIncome - monthlyExpense)}
              </Text>
            </VStack>
          </HStack>
          <HStack mt={2} space={1} alignItems="center" justifyContent="center">
            <Calendar size={14} color={subTextColor} />
            <Text color={subTextColor} fontSize="xs">
              本月记账 {expenses.filter((e) => {
                const d = new Date(e.date);
                return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
              }).length} 笔
            </Text>
          </HStack>
        </Box>

        <Pressable onPress={() => router.push('/auto-record')} mb={4}>
          <Box
            bg="#E6F7FF"
            rounded="xl"
            p={4}
            borderWidth={1}
            borderColor="#91D5FF"
          >
            <HStack alignItems="center" justifyContent="space-between">
              <HStack alignItems="center" space={3}>
                <Box p={2} rounded="lg" bg="#1890FF20">
                  <Bell size={20} color="#1890FF" />
                </Box>
                <VStack>
                  <Text color="#1890FF" fontWeight="semibold">
                    开启自动记账
                  </Text>
                  <Text color="#69C0FF" fontSize="xs">
                    自动抓取微信/支付宝交易
                  </Text>
                </VStack>
              </HStack>
              <ChevronRight size={20} color="#1890FF" />
            </HStack>
          </Box>
        </Pressable>

        <HStack justifyContent="space-between" alignItems="center" mb={4}>
          <Text color={textColor} fontSize="lg" fontWeight="semibold">
            最近记录
          </Text>
          {recentExpenses.length > 0 && (
            <Pressable onPress={() => router.push('/statistics')}>
              <HStack alignItems="center" space={1}>
                <Text color="#1890FF" fontSize="sm">
                  查看全部
                </Text>
                <ChevronRight size={14} color="#1890FF" />
              </HStack>
            </Pressable>
          )}
        </HStack>

        {recentExpenses.length === 0 ? (
          <Box bg={cardBg} rounded="xl" p={8} alignItems="center" shadow={2}>
            <Text color={subTextColor} textAlign="center">
              还没有记账记录
            </Text>
            <Text color={subTextColor} textAlign="center" fontSize="sm" mt={2}>
              点击下方按钮开始记账吧
            </Text>
          </Box>
        ) : (
          <VStack space={3} pb={20}>
            {recentExpenses.map((expense) => {
              const category = getCategoryInfo(expense.category, expense.type || 'expense');
              const isIncome = expense.type === 'income';
              return (
                <Box
                  key={expense.id}
                  bg={cardBg}
                  rounded="xl"
                  p={4}
                  shadow={1}
                >
                  <HStack justifyContent="space-between" alignItems="center">
                    <HStack space={3} alignItems="center">
                      <Box
                        p={2}
                        rounded="lg"
                        bg={`${category.color}20`}
                      >
                        <CategoryIcon
                          iconName={category.icon}
                          color={category.color}
                          size={24}
                        />
                      </Box>
                      <VStack>
                        <Text color={textColor} fontWeight="medium">
                          {category.name}
                        </Text>
                        <Text color={subTextColor} fontSize="xs">
                          {formatDate(expense.date)}
                          {expense.note && ` · ${expense.note}`}
                        </Text>
                      </VStack>
                    </HStack>
                    <Text
                      fontWeight="semibold"
                      fontSize="lg"
                      color={isIncome ? '#52C41A' : '#FF6B6B'}
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

      <Pressable
        onPress={() => router.push('/add-expense')}
        position="absolute"
        bottom={6}
        right={4}
        bg="#1890FF"
        p={4}
        rounded="full"
        shadow={4}
      >
        <Plus size={28} color="white" />
      </Pressable>
    </Box>
  );
}
