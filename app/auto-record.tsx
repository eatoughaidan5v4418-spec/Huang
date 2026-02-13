import React, { useState, useEffect, useCallback } from 'react';
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
import { ArrowLeft, Bell, Smartphone, CreditCard, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, AppState, Linking } from 'react-native';
import { colors } from '../constants/theme';
import { parseNotification, ParsedTransaction } from '../services/notificationParser';
import { useExpenseStore } from '../store/useExpenseStore';

// 动态导入 react-native-notification-listener
let RNNotificationListener: any = null;
if (Platform.OS === 'android') {
  try {
    RNNotificationListener = require('react-native-notification-listener');
  } catch (e) {
    console.warn('react-native-notification-listener not available');
  }
}

const AUTO_RECORD_KEY = 'auto_record_enabled';

export default function AutoRecordSettings() {
  const router = useRouter();
  const addExpense = useExpenseStore((state) => state.addExpense);
  const [autoRecord, setAutoRecord] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<ParsedTransaction[]>([]);
  const [headlessListener, setHeadlessListener] = useState<any>(null);

  const isSupported = Platform.OS === 'android' && RNNotificationListener !== null;

  // 检查权限状态
  const checkPermission = useCallback(async () => {
    if (!isSupported) return;
    try {
      const enabled = await RNNotificationListener.isPermissionGranted();
      setHasPermission(enabled);
    } catch (error) {
      console.error('Failed to check permission:', error);
      setHasPermission(false);
    }
  }, [isSupported]);

  useEffect(() => {
    loadSettings();
    
    // 监听应用状态变化，当用户从设置返回时重新检查权限
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkPermission();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [checkPermission]);

  // 设置通知监听
  useEffect(() => {
    if (!isSupported || !hasPermission || !autoRecord) {
      // 如果关闭自动记录，停止监听
      if (headlessListener) {
        headlessListener.remove();
        setHeadlessListener(null);
      }
      return;
    }

    console.log('Setting up notification listener...');
    
    // 启动通知监听
    RNNotificationListener.startListenerService();
    
    // 添加通知监听回调
    const subscription = RNNotificationListener.addListener((notification: any) => {
      console.log('Received notification:', notification);
      
      // 只处理微信和支付宝的通知
      if (notification.app !== 'com.tencent.mm' && notification.app !== 'com.eg.android.AlipayGphone') {
        return;
      }
      
      // 解析通知
      const data = {
        packageName: notification.app,
        title: notification.title || '',
        text: notification.text || '',
      };
      
      const transaction = parseNotification(data);
      
      if (transaction) {
        console.log('Parsed transaction:', transaction);
        
        // 自动添加记账
        addExpense({
          amount: transaction.amount,
          category: transaction.type === 'income' ? 'transfer' : 'shopping',
          date: new Date(),
          note: transaction.note || (transaction.type === 'income' ? '自动识别收入' : '自动识别支出'),
          type: transaction.type,
        });
        
        // 添加到最近交易列表
        setRecentTransactions(prev => [transaction, ...prev].slice(0, 5));
      }
    });

    setHeadlessListener(subscription);

    return () => {
      subscription.remove();
      RNNotificationListener.stopListenerService();
    };
  }, [isSupported, hasPermission, autoRecord, addExpense]);

  const loadSettings = async () => {
    try {
      const autoRecordValue = await AsyncStorage.getItem(AUTO_RECORD_KEY);
      await checkPermission();
      setAutoRecord(autoRecordValue === 'true');
      setIsReady(true);
    } catch (error) {
      console.error('Failed to load settings:', error);
      setIsReady(true);
    }
  };

  const toggleAutoRecord = async (enabled: boolean) => {
    if (!hasPermission && enabled) {
      return;
    }
    setAutoRecord(enabled);
    await AsyncStorage.setItem(AUTO_RECORD_KEY, enabled.toString());
  };

  // 打开通知监听设置页面
  const openNotificationSettings = () => {
    if (RNNotificationListener) {
      RNNotificationListener.requestPermission();
    } else {
      // 备用方案：打开系统设置
      Linking.openSettings();
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
            <Box p={3} rounded="xl" bg={hasPermission ? colors.incomeLight : colors.primaryLight} mr={3}>
              <Bell size={22} color={hasPermission ? colors.income : colors.primary} />
            </Box>
            <VStack flex={1}>
              <Text color={colors.textPrimary} fontSize="md" fontWeight="500">
                通知监听权限
              </Text>
              <Text color={colors.textSecondary} fontSize="sm">
                {hasPermission ? '权限已开启' : '需要系统级权限才能监听通知'}
              </Text>
            </VStack>
            {hasPermission && <CheckCircle size={24} color={colors.income} />}
          </HStack>

          {!hasPermission && (
            <>
              <Box bg={colors.background} rounded="2xl" p={4} mb={4}>
                <Text color={colors.textSecondary} fontSize="sm" lineHeight={20}>
                  由于 Android 系统限制，通知监听权限需要在系统设置中手动开启。点击下方按钮申请权限。
                </Text>
              </Box>

              <Pressable onPress={openNotificationSettings}>
                <Box
                  bg={colors.primary}
                  rounded="full"
                  py={4}
                  alignItems="center"
                  flexDirection="row"
                  justifyContent="center"
                >
                  <ExternalLink size={20} color={colors.white} />
                  <Text color={colors.white} fontWeight="500" ml={2}>
                    申请通知权限
                  </Text>
                </Box>
              </Pressable>
            </>
          )}
        </Box>

        {/* 自动记录开关 */}
        <Box bg={colors.backgroundSecondary} rounded="3xl" p={6} mb={6}>
          <HStack justifyContent="space-between" alignItems="center">
            <VStack flex={1} mr={4}>
              <Text color={colors.textPrimary} fontSize="md" fontWeight="500">
                自动记录交易
              </Text>
              <Text color={colors.textSecondary} fontSize="sm" mt={1}>
                检测到微信/支付宝交易时自动添加记录
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
          
          {!hasPermission && (
            <Box mt={4} p={3} bg={colors.expenseLight} rounded="xl">
              <Text color={colors.expense} fontSize="sm">
                请先开启通知监听权限
              </Text>
            </Box>
          )}
        </Box>

        {/* 最近自动识别的交易 */}
        {recentTransactions.length > 0 && (
          <Box bg={colors.backgroundSecondary} rounded="3xl" p={6} mb={6}>
            <Text color={colors.textPrimary} fontSize="md" fontWeight="500" mb={4}>
              最近识别的交易
            </Text>
            <VStack space={3}>
              {recentTransactions.map((transaction, index) => (
                <Box key={index} bg={colors.background} rounded="2xl" p={4}>
                  <HStack justifyContent="space-between" alignItems="center">
                    <VStack>
                      <Text color={colors.textPrimary} fontWeight="500">
                        {transaction.note}
                      </Text>
                      <Text color={colors.textTertiary} fontSize="xs" numberOfLines={1} maxW={200}>
                        {transaction.rawText.substring(0, 30)}...
                      </Text>
                    </VStack>
                    <Text
                      color={transaction.type === 'income' ? colors.income : colors.expense}
                      fontWeight="600"
                      fontSize="lg"
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      ¥{transaction.amount.toFixed(2)}
                    </Text>
                  </HStack>
                </Box>
              ))}
            </VStack>
          </Box>
        )}

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
                  支持收款、转账、红包等交易
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
                  支持收款、转账、支付等交易
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
              开启步骤
            </Text>
          </HStack>

          <VStack space={3}>
            <HStack space={3} alignItems="flex-start">
              <Box w={6} h={6} rounded="full" bg={colors.primary} alignItems="center" justifyContent="center">
                <Text color={colors.white} fontSize="xs" fontWeight="600">1</Text>
              </Box>
              <Text color={colors.textSecondary} fontSize="sm" flex={1}>
                点击"申请通知权限"按钮
              </Text>
            </HStack>
            <HStack space={3} alignItems="flex-start">
              <Box w={6} h={6} rounded="full" bg={colors.primary} alignItems="center" justifyContent="center">
                <Text color={colors.white} fontSize="xs" fontWeight="600">2</Text>
              </Box>
              <Text color={colors.textSecondary} fontSize="sm" flex={1}>
                在系统设置中允许 EasyBill 访问通知
              </Text>
            </HStack>
            <HStack space={3} alignItems="flex-start">
              <Box w={6} h={6} rounded="full" bg={colors.primary} alignItems="center" justifyContent="center">
                <Text color={colors.white} fontSize="xs" fontWeight="600">3</Text>
              </Box>
              <Text color={colors.textSecondary} fontSize="sm" flex={1}>
                返回应用，开启"自动记录交易"开关
              </Text>
            </HStack>
            <HStack space={3} alignItems="flex-start">
              <Box w={6} h={6} rounded="full" bg={colors.primary} alignItems="center" justifyContent="center">
                <Text color={colors.white} fontSize="xs" fontWeight="600">4</Text>
              </Box>
              <Text color={colors.textSecondary} fontSize="sm" flex={1}>
                使用微信/支付宝进行交易，自动识别记账
              </Text>
            </HStack>
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
