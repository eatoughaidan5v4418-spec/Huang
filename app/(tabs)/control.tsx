import React from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Pressable,
  ScrollView,
  Switch,
} from 'native-base';
import {
  Flame,
  Fan,
  Thermometer,
  Droplets,
  Power,
  Bluetooth,
  BluetoothOff,
  Zap,
  Wind,
} from 'lucide-react-native';
import { useCushionStore } from '../../store/useCushionStore';
import { colors } from '../../constants/theme';

export default function Control() {
  const device = useCushionStore((s) => s.device);
  const sensorData = useCushionStore((s) => s.sensorData);
  const control = useCushionStore((s) => s.control);
  const thresholds = useCushionStore((s) => s.thresholds);
  const setHeating = useCushionStore((s) => s.setHeating);
  const setFan = useCushionStore((s) => s.setFan);

  const tempStatus = sensorData.temperature < thresholds.tempMin
    ? 'low' : sensorData.temperature > thresholds.tempMax ? 'high' : 'normal';
  const humidStatus = sensorData.humidity > thresholds.humidityMax
    ? 'high' : sensorData.humidity < thresholds.humidityMin ? 'low' : 'normal';

  return (
    <Box flex={1} bg={colors.background} pt={16} px={5}>
      {/* 头部 */}
      <HStack alignItems="center" mb={6}>
        <Text fontSize="2xl" fontWeight="700" color={colors.textPrimary} flex={1}>
          设备控制
        </Text>
        <HStack alignItems="center" space={1}>
          {device.isConnected ? (
            <Bluetooth size={16} color={colors.primary} />
          ) : (
            <BluetoothOff size={16} color={colors.textTertiary} />
          )}
          <Text fontSize="xs" color={device.isConnected ? colors.primary : colors.textTertiary}>
            {device.isConnected ? '已连接' : '演示模式'}
          </Text>
        </HStack>
      </HStack>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 当前环境状态 */}
        <Box bg={colors.backgroundSecondary} rounded="3xl" p={6} mb={5}>
          <Text fontSize="md" fontWeight="600" color={colors.textPrimary} mb={4}>
            当前环境
          </Text>
          <HStack space={4}>
            <Box flex={1} bg={tempStatus === 'low' ? colors.heatingLight : tempStatus === 'high' ? colors.dangerLight : colors.healthyLight}
              rounded="2xl" p={4} alignItems="center"
            >
              <Thermometer size={28} color={tempStatus === 'low' ? colors.heating : tempStatus === 'high' ? colors.danger : colors.healthy} />
              <Text fontSize="2xl" fontWeight="700" color={colors.textPrimary} mt={2}>
                {sensorData.temperature.toFixed(1)}°C
              </Text>
              <Text fontSize="xs" color={colors.textSecondary} mt={1}>
                {tempStatus === 'low' ? '偏冷' : tempStatus === 'high' ? '偏热' : '适宜'}
              </Text>
            </Box>
            <Box flex={1} bg={humidStatus === 'high' ? colors.coolingLight : humidStatus === 'low' ? colors.warningLight : colors.healthyLight}
              rounded="2xl" p={4} alignItems="center"
            >
              <Droplets size={28} color={humidStatus === 'high' ? colors.cooling : humidStatus === 'low' ? colors.warning : colors.healthy} />
              <Text fontSize="2xl" fontWeight="700" color={colors.textPrimary} mt={2}>
                {sensorData.humidity.toFixed(1)}%
              </Text>
              <Text fontSize="xs" color={colors.textSecondary} mt={1}>
                {humidStatus === 'high' ? '偏湿' : humidStatus === 'low' ? '偏干' : '适宜'}
              </Text>
            </Box>
          </HStack>
        </Box>

        {/* 加热控制 */}
        <Box bg={colors.backgroundSecondary} rounded="3xl" p={6} mb={5}>
          <HStack justifyContent="space-between" alignItems="center" mb={4}>
            <HStack alignItems="center" space={3}>
              <Box p={3} rounded="xl" bg={control.heatingOn ? colors.heatingLight : colors.backgroundTertiary}>
                <Flame size={24} color={control.heatingOn ? colors.heating : colors.textTertiary} />
              </Box>
              <VStack>
                <Text fontSize="lg" fontWeight="600" color={colors.textPrimary}>
                  加热控制
                </Text>
                <Text fontSize="xs" color={colors.textSecondary}>
                  温度低于 {thresholds.tempMin}°C 时建议开启
                </Text>
              </VStack>
            </HStack>
            <Switch
              isChecked={control.heatingOn}
              onToggle={() => setHeating(!control.heatingOn)}
              onTrackColor={colors.heating}
              size="lg"
            />
          </HStack>
          {control.heatingOn && (
            <Box bg={colors.heatingLight} rounded="2xl" p={4}>
              <HStack alignItems="center" space={2}>
                <Zap size={16} color={colors.heating} />
                <Text fontSize="sm" color={colors.heating} fontWeight="500">
                  加热丝工作中
                </Text>
              </HStack>
              <Text fontSize="xs" color={colors.textSecondary} mt={1}>
                当温度达到 {thresholds.tempMax}°C 时自动关闭
              </Text>
            </Box>
          )}
        </Box>

        {/* 散热风扇控制 */}
        <Box bg={colors.backgroundSecondary} rounded="3xl" p={6} mb={5}>
          <HStack justifyContent="space-between" alignItems="center" mb={4}>
            <HStack alignItems="center" space={3}>
              <Box p={3} rounded="xl" bg={control.fanOn ? colors.coolingLight : colors.backgroundTertiary}>
                <Fan size={24} color={control.fanOn ? colors.cooling : colors.textTertiary} />
              </Box>
              <VStack>
                <Text fontSize="lg" fontWeight="600" color={colors.textPrimary}>
                  散热风扇
                </Text>
                <Text fontSize="xs" color={colors.textSecondary}>
                  湿度高于 {thresholds.humidityMax}% 时建议开启
                </Text>
              </VStack>
            </HStack>
            <Switch
              isChecked={control.fanOn}
              onToggle={() => setFan(!control.fanOn)}
              onTrackColor={colors.cooling}
              size="lg"
            />
          </HStack>
          {control.fanOn && (
            <Box bg={colors.coolingLight} rounded="2xl" p={4}>
              <HStack alignItems="center" space={2}>
                <Wind size={16} color={colors.cooling} />
                <Text fontSize="sm" color={colors.cooling} fontWeight="500">
                  风扇运转中 - 强制风干散热
                </Text>
              </HStack>
              <Text fontSize="xs" color={colors.textSecondary} mt={1}>
                当湿度降至 {thresholds.humidityMin}% 以下时自动关闭
              </Text>
            </Box>
          )}
        </Box>

        {/* 自动控制说明 */}
        <Box bg={colors.primaryLight} rounded="3xl" p={5} mb={5}>
          <HStack alignItems="flex-start" space={3}>
            <Box mt={0.5}>
              <Power size={16} color={colors.primary} />
            </Box>
            <VStack flex={1}>
              <Text fontSize="sm" fontWeight="500" color={colors.textPrimary} mb={1}>
                闭环自动控制
              </Text>
              <Text fontSize="xs" color={colors.textSecondary} lineHeight={18}>
                设备端 HT32 单片机会根据温湿度阈值自动控制加热和散热。手机端的控制开关可以手动覆盖自动逻辑，实现远程干预。语音模块也可直接控制，支持语音指令"打开加热"、"关闭风扇"等。
              </Text>
            </VStack>
          </HStack>
        </Box>

        <Box h={24} />
      </ScrollView>
    </Box>
  );
}
