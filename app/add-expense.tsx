import React, { useState } from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Pressable,
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
import { colors } from '../constants/theme';

export default function AddExpense() {
  const router = useRouter();
  const addExpense = useExpenseStore((state) => state.addExpense);

  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(EXPENSE_CATEGORIES[0].id);
  const [type, setType] = useState<'expense' | 'income'>('expense');

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
    const cleaned = value.replace(/[^0-9.]/g, '');
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
      <Box flex={1} bg={colors.background} pt={16} px={6}>
        {/* 头部 */}
        <HStack alignItems="center" mb={8}>
          <Pressable onPress={() => router.back()} p={2} mr={2}>
            <ArrowLeft size={24} color={colors.textPrimary} />
          </Pressable>
          <Text fontSize="2xl" fontWeight="600" color={colors.textPrimary}>
            记一笔
          </Text>
        </HStack>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* 类型选择 */}
          <Box bg={colors.backgroundSecondary} rounded="3xl" p={2} mb={6}>
            <HStack space={2}>
              <Pressable
                flex={1}
                onPress={() => setType('expense')}
                bg={type === 'expense' ? colors.expense : 'transparent'}
                rounded="2xl"
                py={3}
                alignItems="center"
              >
                <Text color={type === 'expense' ? colors.white : colors.textSecondary} fontWeight="500">
                  支出
                </Text>
              </Pressable>
              <Pressable
                flex={1}
                onPress={() => setType('income')}
                bg={type === 'income' ? colors.income : 'transparent'}
                rounded="2xl"
                py={3}
                alignItems="center"
              >
                <Text color={type === 'income' ? colors.white : colors.textSecondary} fontWeight="500">
                  收入
                </Text>
              </Pressable>
            </HStack>
          </Box>

          {/* 金额输入 */}
          <Box bg={colors.backgroundSecondary} rounded="3xl" p={8} mb={6}>
            <Text color={colors.textTertiary} fontSize="sm" mb={2}>
              金额
            </Text>
            <HStack alignItems="center" space={2}>
              <Text color={colors.textPrimary} fontSize="4xl" fontWeight="600">
                ¥
              </Text>
              <Input
                flex={1}
                value={amount}
                onChangeText={(text) => setAmount(formatAmount(text))}
                placeholder="0.00"
                keyboardType="decimal-pad"
                fontSize="4xl"
                fontWeight="600"
                color={colors.textPrimary}
                borderWidth={0}
                bg="transparent"
                _focus={{ borderWidth: 0, bg: 'transparent' }}
                p={0}
              />
            </HStack>
          </Box>

          {/* 分类选择 */}
          <Box bg={colors.backgroundSecondary} rounded="3xl" p={6} mb={6}>
            <Text color={colors.textPrimary} fontSize="md" fontWeight="500" mb={5}>
              分类
            </Text>
            <HStack flexWrap="wrap">
              {categories.map((category) => (
                <Pressable
                  key={category.id}
                  onPress={() => setSelectedCategory(category.id)}
                  m={1}
                  mb={3}
                >
                  <Box
                    bg={selectedCategory === category.id ? colors.background : colors.backgroundTertiary}
                    borderWidth={selectedCategory === category.id ? 2 : 0}
                    borderColor={category.color}
                    rounded="2xl"
                    p={4}
                    alignItems="center"
                    minW={85}
                  >
                    <CategoryIcon
                      iconName={category.icon}
                      color={category.color}
                      size={26}
                    />
                    <Text
                      color={colors.textPrimary}
                      fontSize="sm"
                      mt={2}
                      fontWeight={selectedCategory === category.id ? '500' : 'normal'}
                    >
                      {category.name}
                    </Text>
                  </Box>
                </Pressable>
              ))}
            </HStack>
          </Box>

          {/* 备注输入 */}
          <Box bg={colors.backgroundSecondary} rounded="3xl" p={6} mb={6}>
            <Text color={colors.textPrimary} fontSize="md" fontWeight="500" mb={3}>
              备注
            </Text>
            <Input
              value={note}
              onChangeText={setNote}
              placeholder="添加备注（可选）"
              color={colors.textPrimary}
              borderWidth={0}
              bg={colors.background}
              rounded="2xl"
              py={4}
              px={5}
              _focus={{ borderWidth: 0, bg: colors.backgroundTertiary }}
            />
          </Box>

          {/* 保存按钮 - 胶囊形 */}
          <Pressable onPress={handleSave} mb={6}>
            <Box
              bg={amount ? colors.primary : colors.backgroundTertiary}
              rounded="full"
              py={4}
              alignItems="center"
              flexDirection="row"
              justifyContent="center"
            >
              <Check size={20} color={amount ? colors.white : colors.textTertiary} />
              <Text color={amount ? colors.white : colors.textTertiary} fontWeight="500" fontSize="lg" ml={2}>
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
