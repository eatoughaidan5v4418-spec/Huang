import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Pressable,
  ScrollView,
} from 'native-base';
import {
  Bluetooth,
  BluetoothOff,
  Thermometer,
  Droplets,
  Clock,
  AlertTriangle,
  CheckCircle,
  User,
} from 'lucide-react-native';
import { useCushionStore } from '../../store/useCushionStore';
import { POSTURE_INFO } from '../../constants/posture';
import { colors } from '../../constants/theme';
import { generateMockSensorData } from '../../services/bluetoothService';

export default function Dashboard() {
  const device = useCushionStore((s) => s.device);
  const sensorData = useCushionStore((s) => s.sensorData);
  const currentPosture = useCushionStore((s) => s.currentPosture);
  const isSeated = useCushionStore((s) => s.isSeated);
  const sittingStartTime = useCushionStore((s) => s.sittingStartTime);
  const control = useCushionStore((s) => s.control);
  const thresholds = useCushionStore((s) => s.thresholds);
  const todayAlertCount = useCushionStore((s) => s.todayAlertCount);
  const updateSensorData = useCushionStore((s) => s.updateSensorData);
  const addTempHumidityPoint = useCushionStore((s) => s.addTempHumidityPoint);

  const [sittingTime, setSittingTime] = useState(0);
  const [demoMode, setDemoMode] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mockRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tempRecordRef = useRef<number>(0);

  // 久坐计时
  useEffect(() => {
    if (isSeated && sittingStartTime) {
      timerRef.current = setInterval(() => {
        setSittingTime(Math.floor((Date.now() - sittingStartTime) / 1000));
      }, 1000);
    } else {
      setSittingTime(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isSeated, sittingStartTime]);

  // 模拟数据(开发模式)
  useEffect(() => {
    if (demoMode) {
      mockRef.current = setInterval(() => {
        const data = generateMockSensorData();
        updateSensorData(data);
        tempRecordRef.current += 1;
        if (tempRecordRef.current % 20 === 0) {
          const now = new Date();
          addTempHumidityPoint({
            time: `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`,
            temperature: data.temperature,
            humidity: data.humidity,
          });
        }
      }, 500);
    }
    return () => {
      if (mockRef.current) clearInterval(mockRef.current);
    };
  }, [demoMode]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const postureInfo = POSTURE_INFO[currentPosture.posture];
  const postureColor =
    postureInfo.level === 'good' ? colors.healthy
    : postureInfo.level === 'warn' ? colors.warning
    : postureInfo.level === 'bad' ? colors.danger
    : colors.textTertiary;
  const postureBg =
    postureInfo.level === 'good' ? colors.healthyLight
    : postureInfo.level === 'warn' ? colors.warningLight
    : postureInfo.level === 'bad' ? colors.dangerLight
    : colors.backgroundTertiary;

  const sittingMinutes = Math.floor(sittingTime / 60);
  const isSittingTooLong = sittingMinutes >= thresholds.sittingDurationMax;

  return (
    <Box flex={1} bg={colors.background} pt={16} px={5}>
      {/* 头部 */}
      <HStack justifyContent="space-between" alignItems="center" mb={6}>
        <VStack>
          <Text fontSize="2xl" fontWeight="700" color={colors.textPrimary}>
            智能健康坐垫
          </Text>
          <HStack alignItems="center" space={1} mt={1}>
            {demoMode || device.isConnected ? (
              <Bluetooth size={14} color={colors.primary} />
            ) : (
              <BluetoothOff size={14} color={colors.textTertiary} />
            )}
            <Text fontSize="xs" color={demoMode || device.isConnected ? colors.primary : colors.textTertiary}>
              {demoMode ? '演示模式' : device.isConnected ? `已连接: ${device.deviceName}` : '未连接设备'}
            </Text>
          </HStack>
        </VStack>
        <Pressable
          onPress={() => setDemoMode(!demoMode)}
          bg={demoMode ? colors.primaryLight : colors.backgroundTertiary}
          px={4} py={2} rounded="full"
        >
          <Text fontSize="xs" color={demoMode ? colors.primary : colors.textSecondary}>
            {demoMode ? '演示中' : '连接设备'}
          </Text>
        </Pressable>
      </HStack>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 坐姿状态大卡片 */}
        <Box bg={postureBg} rounded="3xl" p={6} mb={5} borderWidth={1} borderColor={postureColor + '30'}>
          <HStack alignItems="center" space={4}>
            <Box
              w={16} h={16} rounded="full" bg={postureColor + '20'}
              alignItems="center" justifyContent="center"
            >
              {postureInfo.level === 'none' ? (
                <User size={32} color={postureColor} />
              ) : postureInfo.level === 'good' ? (
                <CheckCircle size={32} color={postureColor} />
              ) : (
                <AlertTriangle size={32} color={postureColor} />
              )}
            </Box>
            <VStack flex={1}>
              <Text fontSize="xl" fontWeight="700" color={postureColor}>
                {postureInfo.label}
              </Text>
              <Text fontSize="sm" color={colors.textSecondary} mt={1}>
                {postureInfo.description}
              </Text>
            </VStack>
          </HStack>
        </Box>

        {/* 压力分布可视化 */}
        <Box bg={colors.backgroundSecondary} rounded="3xl" p={5} mb={5}>
          <Text fontSize="md" fontWeight="600" color={colors.textPrimary} mb={4}>
            压力分布
          </Text>
          <HStack justifyContent="center" space={2}>
            <VStack space={2} alignItems="center">
              <HStack space={2}>
                <PressureCell label="左前" value={sensorData.pressureLeftFront} />
                <PressureCell label="右前" value={sensorData.pressureRightFront} />
              </HStack>
              <HStack space={2}>
                <PressureCell label="左后" value={sensorData.pressureLeftBack} />
                <PressureCell label="右后" value={sensorData.pressureRightBack} />
              </HStack>
            </VStack>
            <VStack ml={4} flex={1} space={3} justifyContent="center">
              <RatioBar label="左/右" left={currentPosture.leftRatio} right={currentPosture.rightRatio} />
              <RatioBar label="前/后" left={currentPosture.frontRatio} right={currentPosture.backRatio} />
            </VStack>
          </HStack>
        </Box>

        {/* 温度 + 湿度 + 就座时长 */}
        <HStack space={3} mb={5}>
          <Box flex={1} bg={colors.backgroundSecondary} rounded="2xl" p={4}>
            <HStack alignItems="center" space={2} mb={2}>
              <Thermometer size={16} color={colors.heating} />
              <Text fontSize="xs" color={colors.textTertiary}>温度</Text>
            </HStack>
            <Text fontSize="2xl" fontWeight="700" color={colors.textPrimary}>
              {sensorData.temperature.toFixed(1)}
            </Text>
            <Text fontSize="xs" color={colors.textTertiary}>°C</Text>
            {control.heatingOn && (
              <Box mt={1} bg={colors.heatingLight} rounded="full" px={2} py={0.5} alignSelf="flex-start">
                <Text fontSize="2xs" color={colors.heating}>加热中</Text>
              </Box>
            )}
          </Box>
          <Box flex={1} bg={colors.backgroundSecondary} rounded="2xl" p={4}>
            <HStack alignItems="center" space={2} mb={2}>
              <Droplets size={16} color={colors.cooling} />
              <Text fontSize="xs" color={colors.textTertiary}>湿度</Text>
            </HStack>
            <Text fontSize="2xl" fontWeight="700" color={colors.textPrimary}>
              {sensorData.humidity.toFixed(1)}
            </Text>
            <Text fontSize="xs" color={colors.textTertiary}>%RH</Text>
            {control.fanOn && (
              <Box mt={1} bg={colors.coolingLight} rounded="full" px={2} py={0.5} alignSelf="flex-start">
                <Text fontSize="2xs" color={colors.cooling}>散热中</Text>
              </Box>
            )}
          </Box>
          <Box
            flex={1}
            bg={isSittingTooLong ? colors.dangerLight : colors.backgroundSecondary}
            rounded="2xl" p={4}
          >
            <HStack alignItems="center" space={2} mb={2}>
              <Clock size={16} color={isSittingTooLong ? colors.danger : colors.primary} />
              <Text fontSize="xs" color={colors.textTertiary}>就座</Text>
            </HStack>
            <Text
              fontSize="2xl" fontWeight="700"
              color={isSittingTooLong ? colors.danger : colors.textPrimary}
            >
              {formatTime(sittingTime)}
            </Text>
            <Text fontSize="xs" color={colors.textTertiary}>
              {isSeated ? '就座中' : '已离座'}
            </Text>
          </Box>
        </HStack>

        {/* 今日统计 */}
        <Box bg={colors.backgroundSecondary} rounded="2xl" p={5} mb={5}>
          <Text fontSize="md" fontWeight="600" color={colors.textPrimary} mb={3}>
            今日概览
          </Text>
          <HStack justifyContent="space-around">
            <VStack alignItems="center">
              <Text fontSize="2xl" fontWeight="700" color={colors.primary}>
                {todayAlertCount}
              </Text>
              <Text fontSize="xs" color={colors.textTertiary}>坐姿提醒</Text>
            </VStack>
            <VStack alignItems="center">
              <Text fontSize="2xl" fontWeight="700" color={colors.textPrimary}>
                {sittingMinutes}
              </Text>
              <Text fontSize="xs" color={colors.textTertiary}>就座(分)</Text>
            </VStack>
            <VStack alignItems="center">
              <Text fontSize="2xl" fontWeight="700" color={colors.healthy}>
                {sensorData.temperature > 0 ? sensorData.temperature.toFixed(1) + '°' : '--'}
              </Text>
              <Text fontSize="xs" color={colors.textTertiary}>当前温度</Text>
            </VStack>
          </HStack>
        </Box>

        <Box h={24} />
      </ScrollView>
    </Box>
  );
}

function PressureCell({ label, value }: { label: string; value: number }) {
  const maxPressure = 500;
  const ratio = Math.min(value / maxPressure, 1);
  const bgColor = value <= 0 ? colors.backgroundTertiary
    : ratio > 0.6 ? '#EF444430' : ratio > 0.3 ? '#F59E0B30' : '#22C55E30';

  return (
    <Box
      w={16} h={16} rounded="xl" alignItems="center" justifyContent="center"
      bg={bgColor}
    >
      <Text fontSize="xs" color={colors.textSecondary}>{label}</Text>
      <Text fontSize="sm" fontWeight="700" color={colors.textPrimary}>
        {Math.round(value)}
      </Text>
    </Box>
  );
}

function RatioBar({ label, left, right }: { label: string; left: number; right: number }) {
  const leftPct = Math.round(left * 100);
  const rightPct = Math.round(right * 100);
  return (
    <VStack>
      <HStack justifyContent="space-between" mb={1}>
        <Text fontSize="2xs" color={colors.textTertiary}>{leftPct}%</Text>
        <Text fontSize="2xs" color={colors.textSecondary} fontWeight="500">{label}</Text>
        <Text fontSize="2xs" color={colors.textTertiary}>{rightPct}%</Text>
      </HStack>
      <HStack h={2} rounded="full" overflow="hidden" bg={colors.backgroundTertiary}>
        <Box flex={leftPct || 1} bg={leftPct > 65 ? colors.warning : colors.primary} roundedLeft="full" />
        <Box flex={rightPct || 1} bg={rightPct > 65 ? colors.warning : colors.primary + '60'} roundedRight="full" />
      </HStack>
    </VStack>
  );
}
