import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  Heading,
  VStack,
  HStack,
  ScrollView,
  useColorModeValue,
  Pressable,
} from 'native-base';
import { useRouter } from 'expo-router';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useExpenseStore } from '../../store/useExpenseStore';
import { EXPENSE_CATEGORIES } from '../../constants/categories';
import CategoryIcon from '../../components/ui/CategoryIcon';

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

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.500', 'gray.400');

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
      <Box flex={1} bg={bgColor} justifyContent="center" alignItems="center">
        <Text color={textColor}>加载中...</Text>
      </Box>
    );
  }

  return (
    <Box flex={1} bg={bgColor} pt={12} px={4}>
      <HStack alignItems="center" mb={6}>
        <Pressable onPress={() => router.back()} p={2} mr={2}>
          <ArrowLeft size={24} color={textColor} />
        </Pressable>
        <Heading size="lg" color={textColor}>
          统计分析
        </Heading>
      </HStack>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Box
          bg={cardBg}
          rounded="2xl"
          p={4}
          shadow={2}
          mb={4}
          flexDirection="row"
          alignItems="center"
          justifyContent="center"
        >
          <Pressable onPress={goToPrevMonth} p={2}>
            <ChevronLeft size={24} color={textColor} />
          </Pressable>
          <Box flex={1} alignItems="center">
            <Text color={textColor} fontSize="lg" fontWeight="semibold">
              {selectedMonth.year}年{selectedMonth.month + 1}月
            </Text>
          </Box>
          <Pressable
            onPress={goToNextMonth}
            p={2}
            opacity={isCurrentMonth() ? 0.3 : 1}
            disabled={isCurrentMonth()}
          >
            <ChevronRight size={24} color={textColor} />
          </Pressable>
        </Box>

        <Box bg={cardBg} rounded="2xl" p={6} shadow={2} mb={4}>
          <HStack justifyContent="space-around" mb={4}>
            <VStack alignItems="center" flex={1}>
              <Text color={subTextColor} fontSize="xs" mb={1}>
                总收入
              </Text>
              <Text color="#52C41A" fontSize="xl" fontWeight="bold">
                {formatCurrency(monthlyStats.totalIncome)}
              </Text>
            </VStack>
            <VStack alignItems="center" flex={1}>
              <Text color={subTextColor} fontSize="xs" mb={1}>
                总支出
              </Text>
              <Text color="#FF6B6B" fontSize="xl" fontWeight="bold">
                {formatCurrency(monthlyStats.totalExpense)}
              </Text>
            </VStack>
            <VStack alignItems="center" flex={1}>
              <Text color={subTextColor} fontSize="xs" mb={1}>
                结余
              </Text>
              <Text
                fontSize="xl"
                fontWeight="bold"
                color={monthlyStats.balance >= 0 ? '#52C41A' : '#FF6B6B'}
              >
                {formatCurrency(monthlyStats.balance)}
              </Text>
            </VStack>
          </HStack>
          <Text color={subTextColor} fontSize="xs" textAlign="center">
            共 {monthlyStats.recordCount} 笔记录
          </Text>
        </Box>

        <Box bg={cardBg} rounded="2xl" p={4} shadow={2} mb={4}>
          <Text color={textColor} fontSize="md" fontWeight="semibold" mb={4}>
            分类明细
          </Text>
          {breakdown.filter((item) => item.amount > 0).length === 0 ? (
            <Box alignItems="center" py={8}>
              <Text color={subTextColor}>该月暂无支出记录</Text>
            </Box>
          ) : (
            <VStack space={3}>
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
                      p={3}
                      rounded="lg"
                      bg={useColorModeValue('gray.50', 'gray.700')}
                    >
                      <HStack space={3} alignItems="center">
                        <Box p={2} rounded="lg" bg={`${category?.color}20`}>
                          <CategoryIcon
                            iconName={category?.icon || 'MoreHorizontal'}
                            color={category?.color || '#DDA0DD'}
                          />
                        </Box>
                        <VStack>
                          <Text color={textColor} fontWeight="medium">
                            {category?.name || '其他'}
                          </Text>
                          <Text color={subTextColor} fontSize="xs">
                            {item.percentage.toFixed(1)}%
                          </Text>
                        </VStack>
                      </HStack>
                      <Text color="#FF6B6B" fontWeight="semibold">
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
