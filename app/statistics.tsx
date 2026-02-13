import React, { useState, useMemo } from 'react';
import {
  Box,
  Text,
  Heading,
  VStack,
  HStack,
  ScrollView,
  useColorModeValue,
  Pressable,
  Icon,
} from 'native-base';
import { useRouter } from 'expo-router';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useExpenseStore } from '../store/useExpenseStore';
import { EXPENSE_CATEGORIES } from '../constants/categories';
import CategoryIcon from '../components/ui/CategoryIcon';

const screenWidth = Dimensions.get('window').width;

export default function Statistics() {
  const router = useRouter();
  const { getMonthlyStats, getCategoryBreakdown, getDailyExpenses } = useExpenseStore();

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.500', 'gray.400');

  const monthlyStats = getMonthlyStats(selectedMonth.year, selectedMonth.month);
  const breakdown = getCategoryBreakdown(selectedMonth.year, selectedMonth.month);
  const dailyExpenses = getDailyExpenses(selectedMonth.year, selectedMonth.month);

  const chartData = useMemo(() => {
    const filteredData = breakdown.filter((item) => item.amount > 0);
    return filteredData.map((item) => {
      const category = EXPENSE_CATEGORIES.find((c) => c.id === item.category);
      return {
        name: category?.name || '其他',
        amount: item.amount,
        color: category?.color || '#DDA0DD',
        legendFontColor: subTextColor,
        legendFontSize: 12,
      };
    });
  }, [breakdown, subTextColor]);

  const barChartData = useMemo(() => {
    const labels = dailyExpenses.map((d) => d.day.toString());
    const data = dailyExpenses.map((d) => d.amount);
    const maxAmount = Math.max(...data, 1);
    
    return {
      labels,
      datasets: [
        {
          data,
          colors: data.map((value) => 
            (opacity = 1) => value > maxAmount * 0.8 ? `rgba(255, 107, 107, ${opacity})` : `rgba(24, 144, 255, ${opacity})`
          ),
        },
      ],
    };
  }, [dailyExpenses]);

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: 'transparent',
    backgroundGradientTo: 'transparent',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(24, 144, 255, ${opacity})`,
    labelColor: (opacity = 1) => subTextColor,
    style: {
      borderRadius: 16,
    },
    propsForBackgroundLines: {
      stroke: useColorModeValue('#f0f0f0', '#333'),
    },
    barPercentage: 0.5,
  };

  const topCategories = useMemo(() => {
    return breakdown
      .filter((item) => item.amount > 0)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [breakdown]);

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
            <Icon as={ChevronLeft} size="lg" color={textColor} />
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
            <Icon as={ChevronRight} size="lg" color={textColor} />
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

        {chartData.length > 0 ? (
          <Box bg={cardBg} rounded="2xl" p={4} shadow={2} mb={4} alignItems="center">
            <Text color={textColor} fontSize="md" fontWeight="semibold" mb={4}>
              支出构成
            </Text>
            <PieChart
              data={chartData}
              width={screenWidth - 64}
              height={200}
              chartConfig={chartConfig}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="15"
              center={[10, 0]}
              absolute
              hasLegend={false}
            />
            <VStack space={2} mt={4} alignItems="center">
              {chartData.map((item, index) => (
                <HStack key={index} space={2} alignItems="center" w="45%">
                  <Box w={3} h={3} rounded="full" bg={item.color} />
                  <Text color={subTextColor} fontSize="xs" flex={1}>
                    {item.name}
                  </Text>
                  <Text color={textColor} fontSize="xs" fontWeight="medium">
                    ¥{item.amount.toFixed(0)}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </Box>
        ) : (
          <Box bg={cardBg} rounded="2xl" p={8} alignItems="center" shadow={2} mb={4}>
            <Text color={subTextColor}>该月暂无支出记录</Text>
          </Box>
        )}

        {dailyExpenses.some((d) => d.amount > 0) && (
          <Box bg={cardBg} rounded="2xl" p={4} shadow={2} mb={4}>
            <Text color={textColor} fontSize="md" fontWeight="semibold" mb={4}>
              每日趋势
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <BarChart
                data={barChartData}
                width={Math.max(screenWidth - 48, dailyExpenses.length * 20)}
                height={180}
                chartConfig={chartConfig}
                style={{
                  borderRadius: 16,
                }}
                withCustomBarColorFromData
                flatColor
                fromZero
                showBarTops={false}
                yAxisLabel="¥"
                yAxisSuffix=""
              />
            </ScrollView>
          </Box>
        )}

        {topCategories.length > 0 && (
          <Box bg={cardBg} rounded="2xl" p={4} shadow={2} mb={4}>
            <HStack justifyContent="space-between" alignItems="center" mb={4}>
              <Text color={textColor} fontSize="md" fontWeight="semibold">
                支出排行榜
              </Text>
              <Text color={subTextColor} fontSize="xs">
                Top 5
              </Text>
            </HStack>
            <VStack space={3}>
              {topCategories.map((item, index) => {
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
                    <HStack space={3} alignItems="center" flex={1}>
                      <Box
                        w={6}
                        h={6}
                        rounded="full"
                        bg={index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#999'}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text color="white" fontSize="xs" fontWeight="bold">
                          {index + 1}
                        </Text>
                      </Box>
                      <Box p={2} rounded="lg" bg={`${category?.color}20`}>
                        <CategoryIcon
                          iconName={category?.icon || 'MoreHorizontal'}
                          color={category?.color || '#DDA0DD'}
                        />
                      </Box>
                      <VStack flex={1}>
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
          </Box>
        )}

        <Box bg={cardBg} rounded="2xl" p={4} shadow={2} mb={4}>
          <Text color={textColor} fontSize="md" fontWeight="semibold" mb={4}>
            分类明细
          </Text>
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
        </Box>

        <Box h={8} />
      </ScrollView>
    </Box>
  );
}
