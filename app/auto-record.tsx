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
  Switch,
} from 'native-base';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, Smartphone, CreditCard, AlertCircle, CheckCircle } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

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

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.500', 'gray.400');

  if (!isReady) {
    return (
      <Box flex={1} bg={bgColor} justifyContent="center" alignItems="center">
        <Text color={textColor}>加载中...</Text>
      </Box>
    );
  }

  if (!isSupported) {
    return (
      <Box flex={1} bg={bgColor} pt={12} px={4}>
        <HStack alignItems="center" mb={6}>
          <Pressable onPress={() => router.back()} p={2} mr={2}>
            <ArrowLeft size={24} color={textColor} />
          </Pressable>
          <Heading size="lg" color={textColor}>
            自动记账
          </Heading>
        </HStack>

        <Box bg={cardBg} rounded="2xl" p={6} shadow={2} alignItems="center">
          <AlertCircle size={48} color="#FF6B6B" />
          <Text color={textColor} fontSize="lg" fontWeight="semibold" mt={4}>
            此功能仅支持 Android
          </Text>
          <Text color={subTextColor} textAlign="center" mt={2}>
            自动记账功能需要监听系统通知，目前仅支持 Android 设备。
          </Text>
        </Box>
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
          自动记账
        </Heading>
      </HStack>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Box bg={cardBg} rounded="2xl" p={6} shadow={2} mb={4}>
          <HStack alignItems="center" mb={4}>
            <Bell size={24} color="#1890FF" />
            <Text color={textColor} fontSize="lg" fontWeight="semibold" ml={3}>
              通知监听权限
            </Text>
          </HStack>

          <Text color={subTextColor} fontSize="sm" mb={4}>
            需要开启通知监听权限才能自动抓取微信和支付宝的交易信息。
          </Text>

          <Pressable onPress={requestPermission}>
            <Box
              bg={hasPermission ? '#52C41A' : '#1890FF'}
              rounded="xl"
              py={4}
              alignItems="center"
            >
              <HStack alignItems="center" space={2}>
                {hasPermission ? (
                  <>
                    <CheckCircle size={20} color="white" />
                    <Text color="white" fontWeight="semibold">
                      权限已开启
                    </Text>
                  </>
                ) : (
                  <>
                    <Bell size={20} color="white" />
                    <Text color="white" fontWeight="semibold">
                      开启通知监听权限
                    </Text>
                  </>
                )}
              </HStack>
            </Box>
          </Pressable>
        </Box>

        <Box bg={cardBg} rounded="2xl" p={6} shadow={2} mb={4}>
          <HStack justifyContent="space-between" alignItems="center">
            <VStack>
              <Text color={textColor} fontSize="md" fontWeight="semibold">
                自动记录交易
              </Text>
              <Text color={subTextColor} fontSize="xs">
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

        <Box bg={cardBg} rounded="2xl" p={6} shadow={2} mb={4}>
          <Text color={textColor} fontSize="md" fontWeight="semibold" mb={4}>
            支持的应用
          </Text>

          <VStack space={3}>
            <HStack alignItems="center" p={3} bg="gray.50" rounded="xl">
              <Box p={2} rounded="lg" bg="#07C16020">
                <Smartphone size={24} color="#07C160" />
              </Box>
              <VStack ml={3} flex={1}>
                <Text color={textColor} fontWeight="medium">
                  微信支付
                </Text>
                <Text color={subTextColor} fontSize="xs">
                  支持微信支付、微信转账、微信红包
                </Text>
              </VStack>
              <CheckCircle size={20} color="#52C41A" />
            </HStack>

            <HStack alignItems="center" p={3} bg="gray.50" rounded="xl">
              <Box p={2} rounded="lg" bg="#1677FF20">
                <CreditCard size={24} color="#1677FF" />
              </Box>
              <VStack ml={3} flex={1}>
                <Text color={textColor} fontWeight="medium">
                  支付宝
                </Text>
                <Text color={subTextColor} fontSize="xs">
                  支持支付宝支付、支付宝转账、支付宝红包
                </Text>
              </VStack>
              <CheckCircle size={20} color="#52C41A" />
            </HStack>
          </VStack>
        </Box>

        <Box bg={cardBg} rounded="2xl" p={6} shadow={2} mb={4}>
          <HStack alignItems="center" mb={3}>
            <AlertCircle size={18} color="#FAAD14" />
            <Text color={textColor} fontSize="md" fontWeight="semibold" ml={2}>
              使用说明
            </Text>
          </HStack>

          <VStack space={2}>
            <Text color={subTextColor} fontSize="sm">
              1. 点击上方按钮开启通知监听权限
            </Text>
            <Text color={subTextColor} fontSize="sm">
              2. 在系统设置中找到 EasyBill 并开启
            </Text>
            <Text color={subTextColor} fontSize="sm">
              3. 返回应用，开启"自动记录交易"开关
            </Text>
            <Text color={subTextColor} fontSize="sm">
              4. 之后微信/支付宝的交易会自动记录
            </Text>
          </VStack>
        </Box>

        <Box bg="#FFF7E6" rounded="2xl" p={4} mb={4}>
          <HStack alignItems="flex-start" space={2}>
            <Box mt={0.5}>
              <AlertCircle size={16} color="#FAAD14" />
            </Box>
            <VStack flex={1}>
              <Text color="#D48806" fontSize="xs" fontWeight="semibold">
                隐私说明
              </Text>
              <Text color="#D48806" fontSize="xs" mt={1}>
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
