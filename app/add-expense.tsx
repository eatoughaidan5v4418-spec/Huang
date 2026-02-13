import React, { useState } from 'react';
import {
  Box,
  Text,
  Heading,
  VStack,
  HStack,
  Pressable,
  useColorModeValue,
  Input,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'native-base';
import { useRouter } from 'expo-router';
import { ArrowLeft, Check } from 'lucide-react-native';
import { useExpenseStore } from '../store/useExpenseStore';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants/categories';
import CategoryIcon from '../components/ui/CategoryIcon';

export default function AddExpense() {
  const router = useRouter();
  const addExpense = useExpenseStore((state) => state.addExpense);

  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(EXPENSE_CATEGORIES[0].id);
  const [type, setType] = useState<'expense' | 'income'>('expense');

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.500', 'gray.400');

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSave = () => {
    if (!amount || parseFloat(amount) <= 0) return;

    addExpense({
      amount: parseFloat(amount),
      category: selectedCategory,
      date: new Date(),
      note: note.trim(),
      type,
    });

    router.back();
  };

  const formatAmount = (value: string) => {
    // 只允许数字和小数点
    const cleaned = value.replace(/[^0-9.]/g, '');
    // 确保只有一个小数点
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    return cleaned;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <Box flex={1} bg={bgColor} pt={12} px={4}>
        <HStack alignItems="center" mb={6}>
          <Pressable onPress={() => router.back()} p={2} mr={2}>
            <ArrowLeft size={24} color={textColor} />
          </Pressable>
          <Heading size="lg" color={textColor}>
            记一笔
          </Heading>
        </HStack>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* 类型选择 */}
          <Box bg={cardBg} rounded="2xl" p={4} shadow={2} mb={4}>
            <HStack space={2}>
              <Pressable
                flex={1}
                onPress={() => setType('expense')}
                bg={type === 'expense' ? '#FF6B6B' : 'gray.100'}
                rounded="xl"
                py={3}
                alignItems="center"
              >
                <Text color={type === 'expense' ? 'white' : textColor} fontWeight="semibold">
                  支出
                </Text>
              </Pressable>
              <Pressable
                flex={1}
                onPress={() => setType('income')}
                bg={type === 'income' ? '#52C41A' : 'gray.100'}
                rounded="xl"
                py={3}
                alignItems="center"
              >
                <Text color={type === 'income' ? 'white' : textColor} fontWeight="semibold">
                  收入
                </Text>
              </Pressable>
            </HStack>
          </Box>

          {/* 金额输入 */}
          <Box bg={cardBg} rounded="2xl" p={6} shadow={2} mb={4}>
            <Text color={subTextColor} fontSize="sm" mb={2}>
              金额
            </Text>
            <HStack alignItems="center" space={2}>
              <Text color={textColor} fontSize="3xl" fontWeight="bold">
                ¥
              </Text>
              <Input
                flex={1}
                value={amount}
                onChangeText={(text) => setAmount(formatAmount(text))}
                placeholder="0.00"
                keyboardType="decimal-pad"
                fontSize="3xl"
                fontWeight="bold"
                color={textColor}
                borderWidth={0}
                _focus={{ borderWidth: 0 }}
                p={0}
              />
            </HStack>
          </Box>

          {/* 分类选择 */}
          <Box bg={cardBg} rounded="2xl" p={4} shadow={2} mb={4}>
            <Text color={textColor} fontSize="md" fontWeight="semibold" mb={4}>
              分类
            </Text>
            <HStack flexWrap="wrap" space={3}>
              {categories.map((category) => (
                <Pressable
                  key={category.id}
                  onPress={() => setSelectedCategory(category.id)}
                  m={1}
                >
                  <Box
                    bg={selectedCategory === category.id ? `${category.color}20` : 'gray.50'}
                    borderWidth={selectedCategory === category.id ? 2 : 0}
                    borderColor={category.color}
                    rounded="xl"
                    p={3}
                    alignItems="center"
                    minW={80}
                  >
                    <CategoryIcon
                      iconName={category.icon}
                      color={category.color}
                      size={28}
                    />
                    <Text
                      color={textColor}
                      fontSize="sm"
                      mt={1}
                      fontWeight={selectedCategory === category.id ? 'semibold' : 'normal'}
                    >
                      {category.name}
                    </Text>
                  </Box>
                </Pressable>
              ))}
            </HStack>
          </Box>

          {/* 备注输入 */}
          <Box bg={cardBg} rounded="2xl" p={4} shadow={2} mb={4}>
            <Text color={textColor} fontSize="md" fontWeight="semibold" mb={2}>
              备注
            </Text>
            <Input
              value={note}
              onChangeText={setNote}
              placeholder="添加备注（可选）"
              color={textColor}
              borderWidth={0}
              bg="gray.50"
              rounded="xl"
              py={3}
              px={4}
              _focus={{ borderWidth: 0, bg: 'gray.100' }}
            />
          </Box>

          {/* 保存按钮 */}
          <Pressable onPress={handleSave} mb={4}>
            <Box
              bg={amount ? '#1890FF' : '#ccc'}
              rounded="xl"
              py={4}
              alignItems="center"
              flexDirection="row"
              justifyContent="center"
            >
              <Check size={20} color="white" />
              <Text color="white" fontWeight="semibold" fontSize="lg" ml={2}>
                保存
              </Text>
            </Box>
          </Pressable>

          <Box h={8} />
        </ScrollView>
      </Box>
    </KeyboardAvoidingView>
  );
}
