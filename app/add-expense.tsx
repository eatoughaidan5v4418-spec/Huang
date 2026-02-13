import React, { useState } from 'react';
import {
  Box,
  Text,
  Heading,
  VStack,
  HStack,
  Input,
  Button,
  Pressable,
  TextArea,
  useColorModeValue,
  KeyboardAvoidingView,
  ScrollView,
} from 'native-base';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { useExpenseStore } from '../store/useExpenseStore';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, CATEGORY_DEFAULT_NOTES } from '../constants/categories';
import { Category } from '../types';
import CategoryIcon from '../components/ui/CategoryIcon';

export default function AddExpense() {
  const router = useRouter();
  const { addExpense } = useExpenseStore();

  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [selectedCategory, setSelectedCategory] = useState<Category>(EXPENSE_CATEGORIES[0]);
  const [note, setNote] = useState('');

  const bgColor = useColorModeValue('white', 'gray.900');
  const cardBg = useColorModeValue('gray.50', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.500', 'gray.400');
  const inputBg = useColorModeValue('white', 'gray.700');

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleTypeChange = (newType: 'expense' | 'income') => {
    setType(newType);
    setSelectedCategory(newType === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
    setNote('');
  };

  const handleSubmit = () => {
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      return;
    }

    const finalNote = note.trim() || CATEGORY_DEFAULT_NOTES[selectedCategory.id] || '';

    addExpense({
      amount: amountValue,
      category: selectedCategory.id,
      note: finalNote,
      type: type,
    });

    router.back();
  };

  const handleAmountChange = (value: string) => {
    const filtered = value.replace(/[^0-9.]/g, '');
    const parts = filtered.split('.');
    if (parts.length > 2) {
      return;
    }
    if (parts[1] && parts[1].length > 2) {
      return;
    }
    setAmount(filtered);
  };

  const formatDisplayAmount = () => {
    if (!amount) return '0.00';
    const value = parseFloat(amount) || 0;
    return value.toFixed(2);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      flex={1}
    >
      <Box flex={1} bg={bgColor} pt={4}>
        <HStack justifyContent="space-between" alignItems="center" px={4} mb={6}>
          <Pressable onPress={() => router.back()} p={2}>
            <X size={24} color={textColor} />
          </Pressable>
          <Heading size="lg" color={textColor}>
            记一笔
          </Heading>
          <Box w={10} />
        </HStack>

        <VStack flex={1} px={4} space={4}>
          <HStack space={3} justifyContent="center">
            <Pressable
              onPress={() => handleTypeChange('expense')}
              flex={1}
            >
              <Box
                py={3}
                rounded="xl"
                bg={type === 'expense' ? '#FF6B6B' : cardBg}
                alignItems="center"
              >
                <Text
                  color={type === 'expense' ? 'white' : subTextColor}
                  fontWeight="semibold"
                  fontSize="md"
                >
                  支出
                </Text>
              </Box>
            </Pressable>
            <Pressable
              onPress={() => handleTypeChange('income')}
              flex={1}
            >
              <Box
                py={3}
                rounded="xl"
                bg={type === 'income' ? '#52C41A' : cardBg}
                alignItems="center"
              >
                <Text
                  color={type === 'income' ? 'white' : subTextColor}
                  fontWeight="semibold"
                  fontSize="md"
                >
                  收入
                </Text>
              </Box>
            </Pressable>
          </HStack>

          <Box alignItems="center" py={4}>
            <Text color={subTextColor} fontSize="sm" mb={2}>
              {type === 'expense' ? '支出' : '收入'}金额
            </Text>
            <HStack alignItems="baseline" space={1}>
              <Text 
                color={type === 'expense' ? '#FF6B6B' : '#52C41A'} 
                fontSize="5xl" 
                fontWeight="bold"
              >
                ¥
              </Text>
              <Text color={textColor} fontSize="5xl" fontWeight="bold">
                {formatDisplayAmount()}
              </Text>
            </HStack>
          </Box>

          <Input
            value={amount}
            onChangeText={handleAmountChange}
            placeholder="输入金额"
            keyboardType="decimal-pad"
            fontSize="2xl"
            textAlign="center"
            bg={inputBg}
            borderWidth={0}
            h={16}
          />

          <ScrollView showsVerticalScrollIndicator={false}>
            <Box>
              <Text color={subTextColor} fontSize="sm" mb={3}>
                选择分类
              </Text>
              <HStack flexWrap="wrap" space={3} justifyContent="flex-start">
                {categories.map((category) => (
                  <Pressable
                    key={category.id}
                    onPress={() => setSelectedCategory(category)}
                    w="22%"
                    alignItems="center"
                    mb={3}
                  >
                    <Box
                      p={3}
                      rounded="xl"
                      bg={
                        selectedCategory.id === category.id
                          ? `${category.color}30`
                          : cardBg
                      }
                      borderWidth={2}
                      borderColor={
                        selectedCategory.id === category.id
                          ? category.color
                          : 'transparent'
                      }
                      mb={2}
                    >
                      <CategoryIcon iconName={category.icon} color={category.color} />
                    </Box>
                    <Text
                      color={
                        selectedCategory.id === category.id
                          ? textColor
                          : subTextColor
                      }
                      fontSize="xs"
                      textAlign="center"
                    >
                      {category.name}
                    </Text>
                  </Pressable>
                ))}
              </HStack>
            </Box>

            <Box mt={4}>
              <Text color={subTextColor} fontSize="sm" mb={3}>
                添加备注
              </Text>
              <TextArea
                value={note}
                onChangeText={setNote}
                placeholder={`默认: ${CATEGORY_DEFAULT_NOTES[selectedCategory.id] || ''}`}
                bg={inputBg}
                borderWidth={0}
                fontSize="md"
                h={20}
                autoCompleteType="off"
                _focus={{
                  bg: inputBg,
                }}
              />
            </Box>
          </ScrollView>

          <Button
            onPress={handleSubmit}
            bg={type === 'expense' ? '#FF6B6B' : '#52C41A'}
            _text={{
              color: 'white',
              fontWeight: 'semibold',
              fontSize: 'lg',
            }}
            h={14}
            mb={8}
            isDisabled={!amount || parseFloat(amount) <= 0}
          >
            保存记录
          </Button>
        </VStack>
      </Box>
    </KeyboardAvoidingView>
  );
}
