import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Pressable,
  ScrollView,
  Switch,
} from 'native-base';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, Smartphone, CreditCard, AlertCircle, CheckCircle } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { colors } from '../constants/theme';

const AUTO_RECORD_KEY = 'auto_record_enabled';
const NOTIFICATION_PERMISSION_KEY = 'notification_permission_enabled';

export default function AutoRecordSettings() {
  const router = useRouter();
  const [autoRecord, setAutoRecord] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const isSupported = Platform.OS === 'android';

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const autoRecordValue = await AsyncStorage.getItem(AUTO_RECORD_KEY);
      const permissionValue = await AsyncStorage.getItem(NOTIFICATION_PERMISSION_KEY);
      setAutoRecord(autoRecordValue === 'true');
      setHasPermission(permissionValue === 'true');
      setIsReady(true);
    } catch (error) {
      console.error('Failed to load settings:', error);
      setIsReady(true);
    }
  };

  const toggleAutoRecord = async (enabled: boolean) => {
    setAutoRecord(enabled);
    await AsyncStorage.setItem(AUTO_RECORD_KEY, enabled.toString());
  };

  const requestPermission = async () => {
    try {
      await AsyncStorage.setItem(NOTIFICATION_PERMISSION_KEY, 'true');
      setHasPermission(true);
    } catch (error) {
      console.error('Failed to save permission:', error);
    }
  };

  if (!isReady) {
    return (
      <Box flex={1} bg={colors.background} justifyContent="center" alignItems="center">
        <Text color={colors.textSecondary}>加载中...</Text>
      </Box>
    );
  }

  if (!isSupported) {
    return (
      <Box flex={1} bg={colors.background} pt={16} px={6}>
        <HStack alignItems="center" mb={8}>
          <Pressable onPress={() => router.back()} p={2} mr={2}>
            <ArrowLeft size={24} color={colors.textPrimary} />
          </Pressable>
          <Text fontSize="2xl" fontWeight="600" color={colors.textPrimary}>
            自动记账
          </Text>
        </HStack>

        <Box bg={colors.backgroundSecondary} rounded="3xl" p={8} alignItems="center">
          <Box p={4} rounded="full" bg={colors.expenseLight} mb={4}>
            <AlertCircle size={32} color={colors.expense} />
          </Box>
          <Text color={colors.textPrimary} fontSize="lg" fontWeight="500" mb={2}>
            此功能仅支持 Android
          </Text>
          <Text color={colors.textSecondary} textAlign="center">
            自动记账功能需要监听系统通知，目前仅支持 Android 设备。
          </Text>
        </Box>
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
          自动记账
        </Text>
      </HStack>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 权限设置 */}
        <Box bg={colors.backgroundSecondary} rounded="3xl" p={6} mb={6}>
          <HStack alignItems="center" mb={4}>
            <Box p={3} rounded="xl" bg={colors.primaryLight} mr={3}>
              <Bell size={22} color={colors.primary} />
            </Box>
            <VStack flex={1}>
              <Text color={colors.textPrimary} fontSize="md" fontWeight="500">
                通知监听权限
              </Text>
              <Text color={colors.textSecondary} fontSize="sm">
                需要开启权限才能自动抓取交易信息
              </Text>
            </VStack>
          </HStack>

          <Pressable onPress={requestPermission}>
            <Box
              bg={hasPermission ? colors.income : colors.primary}
              rounded="full"
              py={4}
              alignItems="center"
              flexDirection="row"
              justifyContent="center"
            >
              {hasPermission ? (
                <>
                  <CheckCircle size={20} color={colors.white} />
                  <Text color={colors.white} fontWeight="500" ml={2}>
                    权限已开启
                  </Text>
                </>
              ) : (
                <>
                  <Bell size={20} color={colors.white} />
                  <Text color={colors.white} fontWeight="500" ml={2}>
                    开启通知监听权限
                  </Text>
                </>
              )}
            </Box>
          </Pressable>
        </Box>

        {/* 自动记录开关 */}
        <Box bg={colors.backgroundSecondary} rounded="3xl" p={6} mb={6}>
          <HStack justifyContent="space-between" alignItems="center">
            <VStack>
              <Text color={colors.textPrimary} fontSize="md" fontWeight="500">
                自动记录交易
              </Text>
              <Text color={colors.textSecondary} fontSize="sm" mt={1}>
                检测到交易时自动添加记录
              </Text>
            </VStack>
            <Switch
              value={autoRecord}
              onToggle={toggleAutoRecord}
              isDisabled={!hasPermission}
              colorScheme="primary"
              size="lg"
            />
          </HStack>
        </Box>

        {/* 支持的应用 */}
        <Box bg={colors.backgroundSecondary} rounded="3xl" p={6} mb={6}>
          <Text color={colors.textPrimary} fontSize="md" fontWeight="500" mb={5}>
            支持的应用
          </Text>

          <VStack space={4}>
            <HStack alignItems="center" p={4} bg={colors.background} rounded="2xl">
              <Box p={3} rounded="xl" bg="#07C16020">
                <Smartphone size={22} color="#07C160" />
              </Box>
              <VStack ml={4} flex={1}>
                <Text color={colors.textPrimary} fontWeight="500">
                  微信支付
                </Text>
                <Text color={colors.textSecondary} fontSize="sm">
                  支持微信支付、微信转账
                </Text>
              </VStack>
              <CheckCircle size={20} color={colors.income} />
            </HStack>

            <HStack alignItems="center" p={4} bg={colors.background} rounded="2xl">
              <Box p={3} rounded="xl" bg="#1677FF20">
                <CreditCard size={22} color="#1677FF" />
              </Box>
              <VStack ml={4} flex={1}>
                <Text color={colors.textPrimary} fontWeight="500">
                  支付宝
                </Text>
                <Text color={colors.textSecondary} fontSize="sm">
                  支持支付宝支付、转账
                </Text>
              </VStack>
              <CheckCircle size={20} color={colors.income} />
            </HStack>
          </VStack>
        </Box>

        {/* 使用说明 */}
        <Box bg={colors.backgroundSecondary} rounded="3xl" p={6} mb={6}>
          <HStack alignItems="center" mb={4}>
            <Box p={2} rounded="lg" bg={colors.primaryLight} mr={2}>
              <AlertCircle size={18} color={colors.primary} />
            </Box>
            <Text color={colors.textPrimary} fontSize="md" fontWeight="500">
              使用说明
            </Text>
          </HStack>

          <VStack space={3}>
            <Text color={colors.textSecondary} fontSize="sm">
              1. 点击上方按钮开启通知监听权限
            </Text>
            <Text color={colors.textSecondary} fontSize="sm">
              2. 在系统设置中找到 EasyBill 并开启
            </Text>
            <Text color={colors.textSecondary} fontSize="sm">
              3. 返回应用，开启"自动记录交易"开关
            </Text>
            <Text color={colors.textSecondary} fontSize="sm">
              4. 之后微信/支付宝的交易会自动记录
            </Text>
          </VStack>
        </Box>

        {/* 隐私说明 */}
        <Box bg={colors.primaryLight} rounded="3xl" p={5} mb={6}>
          <HStack alignItems="flex-start" space={3}>
            <Box mt={0.5}>
              <AlertCircle size={16} color={colors.primary} />
            </Box>
            <VStack flex={1}>
              <Text color={colors.textPrimary} fontSize="sm" fontWeight="500" mb={1}>
                隐私说明
              </Text>
              <Text color={colors.textSecondary} fontSize="xs">
                所有交易数据仅保存在您的设备本地，不会上传到任何服务器。我们只解析微信和支付宝的支付通知，不会读取其他应用的通知内容。
              </Text>
            </VStack>
          </HStack>
        </Box>

        <Box h={8} />
      </ScrollView>
    </Box>
  );
}
