import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  ScrollView,
  Pressable,
} from 'native-base';
import { useRouter } from 'expo-router';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useExpenseStore } from '../../store/useExpenseStore';
import { EXPENSE_CATEGORIES } from '../../constants/categories';
import CategoryIcon from '../../components/ui/CategoryIcon';
import { colors } from '../../constants/theme';

export default function Statistics() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  const getMonthlyStats = useExpenseStore((state) => state.getMonthlyStats);
  const getCategoryBreakdown = useExpenseStore((state) => state.getCategoryBreakdown);

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const [monthlyStats, setMonthlyStats] = useState({
    totalExpense: 0,
    totalIncome: 0,
    balance: 0,
    recordCount: 0,
  });
  const [breakdown, setBreakdown] = useState<any[]>([]);

  useEffect(() => {
    try {
      const stats = getMonthlyStats(selectedMonth.year, selectedMonth.month);
      const catBreakdown = getCategoryBreakdown(selectedMonth.year, selectedMonth.month);
      setMonthlyStats(stats);
      setBreakdown(catBreakdown);
      setIsReady(true);
    } catch (error) {
      console.error('Error loading stats:', error);
      setIsReady(true);
    }
  }, [getMonthlyStats, getCategoryBreakdown, selectedMonth]);

  const goToPrevMonth = () => {
    setSelectedMonth((prev) => {
      if (prev.month === 0) {
        return { year: prev.year - 1, month: 11 };
      }
      return { ...prev, month: prev.month - 1 };
    });
  };

  const goToNextMonth = () => {
    const now = new Date();
    if (selectedMonth.year === now.getFullYear() && selectedMonth.month === now.getMonth()) {
      return;
    }
    setSelectedMonth((prev) => {
      if (prev.month === 11) {
        return { year: prev.year + 1, month: 0 };
      }
      return { ...prev, month: prev.month + 1 };
    });
  };

  const formatCurrency = (amount: number) => {
    return `¥${amount.toFixed(2)}`;
  };

  const isCurrentMonth = () => {
    const now = new Date();
    return selectedMonth.year === now.getFullYear() && selectedMonth.month === now.getMonth();
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
      {/* 头部 */}
      <HStack alignItems="center" mb={8}>
        <Pressable onPress={() => router.back()} p={2} mr={2}>
          <ArrowLeft size={24} color={colors.textPrimary} />
        </Pressable>
        <Text fontSize="2xl" fontWeight="600" color={colors.textPrimary}>
          统计分析
        </Text>
      </HStack>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 月份选择器 */}
        <Box
          bg={colors.backgroundSecondary}
          rounded="3xl"
          p={5}
          mb={6}
          flexDirection="row"
          alignItems="center"
          justifyContent="center"
        >
          <Pressable onPress={goToPrevMonth} p={2}>
            <ChevronLeft size={24} color={colors.textPrimary} />
          </Pressable>
          <Box flex={1} alignItems="center">
            <Text color={colors.textPrimary} fontSize="lg" fontWeight="500">
              {selectedMonth.year}年{selectedMonth.month + 1}月
            </Text>
          </Box>
          <Pressable
            onPress={goToNextMonth}
            p={2}
            opacity={isCurrentMonth() ? 0.3 : 1}
            disabled={isCurrentMonth()}
          >
            <ChevronRight size={24} color={colors.textPrimary} />
          </Pressable>
        </Box>

        {/* 月度统计 */}
        <Box bg={colors.backgroundSecondary} rounded="3xl" p={8} mb={6}>
          <HStack justifyContent="space-between" alignItems="flex-start">
            <VStack alignItems="flex-start" flex={1}>
              <Text color={colors.textTertiary} fontSize="sm" mb={1}>
                总收入
              </Text>
              <Text color={colors.income} fontSize="2xl" fontWeight="600">
                {formatCurrency(monthlyStats.totalIncome)}
              </Text>
            </VStack>
            <VStack alignItems="center" flex={1}>
              <Text color={colors.textTertiary} fontSize="sm" mb={1}>
                总支出
              </Text>
              <Text color={colors.expense} fontSize="2xl" fontWeight="600">
                {formatCurrency(monthlyStats.totalExpense)}
              </Text>
            </VStack>
            <VStack alignItems="flex-end" flex={1}>
              <Text color={colors.textTertiary} fontSize="sm" mb={1}>
                结余
              </Text>
              <Text
                fontSize="2xl"
                fontWeight="600"
                color={monthlyStats.balance >= 0 ? colors.income : colors.expense}
              >
                {formatCurrency(monthlyStats.balance)}
              </Text>
            </VStack>
          </HStack>
          <HStack mt={6} justifyContent="center">
            <Text color={colors.textSecondary} fontSize="sm">
              共 {monthlyStats.recordCount} 笔记录
            </Text>
          </HStack>
        </Box>

        {/* 分类明细 */}
        <Box bg={colors.backgroundSecondary} rounded="3xl" p={6} mb={6}>
          <Text color={colors.textPrimary} fontSize="lg" fontWeight="500" mb={5}>
            分类明细
          </Text>
          {breakdown.filter((item) => item.amount > 0).length === 0 ? (
            <Box alignItems="center" py={8}>
              <Text color={colors.textSecondary}>该月暂无支出记录</Text>
            </Box>
          ) : (
            <VStack space={4}>
              {breakdown
                .filter((item) => item.amount > 0)
                .sort((a, b) => b.amount - a.amount)
                .map((item) => {
                  const category = EXPENSE_CATEGORIES.find((c) => c.id === item.category);
                  return (
                    <HStack
                      key={item.category}
                      justifyContent="space-between"
                      alignItems="center"
                      p={4}
                      rounded="2xl"
                      bg={colors.background}
                    >
                      <HStack space={4} alignItems="center">
                        <Box p={3} rounded="xl" bg={colors.expenseLight}>
                          <CategoryIcon
                            iconName={category?.icon || 'MoreHorizontal'}
                            color={colors.expense}
                          />
                        </Box>
                        <VStack>
                          <Text color={colors.textPrimary} fontWeight="500">
                            {category?.name || '其他'}
                          </Text>
                          <Text color={colors.textTertiary} fontSize="xs">
                            {item.percentage.toFixed(1)}%
                          </Text>
                        </VStack>
                      </HStack>
                      <Text color={colors.expense} fontWeight="600" fontSize="lg">
                        {formatCurrency(item.amount)}
                      </Text>
                    </HStack>
                  );
                })}
            </VStack>
          )}
        </Box>

        <Box h={8} />
      </ScrollView>
    </Box>
  );
}
