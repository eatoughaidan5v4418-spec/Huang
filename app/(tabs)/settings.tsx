import React, { useState } from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  ScrollView,
  Pressable,
  Input,
  Slider,
} from 'native-base';
import {
  Settings,
  Thermometer,
  Droplets,
  Clock,
  AlertTriangle,
  Save,
  RotateCcw,
  Info,
  Bluetooth,
} from 'lucide-react-native';
import { useCushionStore } from '../../store/useCushionStore';
import { DEFAULT_THRESHOLDS } from '../../constants/posture';
import { colors } from '../../constants/theme';

export default function SettingsPage() {
  const thresholds = useCushionStore((s) => s.thresholds);
  const updateThresholds = useCushionStore((s) => s.updateThresholds);
  const device = useCushionStore((s) => s.device);

  const [tempMin, setTempMin] = useState(thresholds.tempMin);
  const [tempMax, setTempMax] = useState(thresholds.tempMax);
  const [humidityMax, setHumidityMax] = useState(thresholds.humidityMax);
  const [humidityMin, setHumidityMin] = useState(thresholds.humidityMin);
  const [sittingMax, setSittingMax] = useState(thresholds.sittingDurationMax);
  const [alertDelay, setAlertDelay] = useState(thresholds.postureAlertDelay);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateThresholds({
      tempMin,
      tempMax,
      humidityMax,
      humidityMin,
      sittingDurationMax: sittingMax,
      postureAlertDelay: alertDelay,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setTempMin(DEFAULT_THRESHOLDS.tempMin);
    setTempMax(DEFAULT_THRESHOLDS.tempMax);
    setHumidityMax(DEFAULT_THRESHOLDS.humidityMax);
    setHumidityMin(DEFAULT_THRESHOLDS.humidityMin);
    setSittingMax(DEFAULT_THRESHOLDS.sittingDurationMax);
    setAlertDelay(DEFAULT_THRESHOLDS.postureAlertDelay);
  };

  return (
    <Box flex={1} bg={colors.background} pt={16} px={5}>
      <HStack alignItems="center" mb={6}>
        <Settings size={24} color={colors.textPrimary} />
        <Text fontSize="2xl" fontWeight="700" color={colors.textPrimary} ml={2}>
          参数设置
        </Text>
      </HStack>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 设备信息 */}
        <Box bg={colors.backgroundSecondary} rounded="3xl" p={5} mb={5}>
          <HStack alignItems="center" space={3} mb={3}>
            <Bluetooth size={18} color={colors.primary} />
            <Text fontSize="md" fontWeight="600" color={colors.textPrimary}>
              设备信息
            </Text>
          </HStack>
          <VStack space={2}>
            <HStack justifyContent="space-between">
              <Text fontSize="sm" color={colors.textSecondary}>连接状态</Text>
              <Text fontSize="sm" color={device.isConnected ? colors.healthy : colors.textTertiary}>
                {device.isConnected ? '已连接' : '未连接(演示模式)'}
              </Text>
            </HStack>
            <HStack justifyContent="space-between">
              <Text fontSize="sm" color={colors.textSecondary}>设备名称</Text>
              <Text fontSize="sm" color={colors.textPrimary}>
                {device.deviceName || 'HT32-SmartCushion'}
              </Text>
            </HStack>
          </VStack>
        </Box>

        {/* 温度阈值 */}
        <Box bg={colors.backgroundSecondary} rounded="3xl" p={5} mb={5}>
          <HStack alignItems="center" space={2} mb={4}>
            <Thermometer size={18} color={colors.heating} />
            <Text fontSize="md" fontWeight="600" color={colors.textPrimary}>
              温度阈值
            </Text>
          </HStack>
          <VStack space={4}>
            <VStack>
              <HStack justifyContent="space-between" mb={1}>
                <Text fontSize="sm" color={colors.textSecondary}>启动加热温度</Text>
                <Text fontSize="sm" fontWeight="600" color={colors.heating}>{tempMin}°C</Text>
              </HStack>
              <Slider
                value={tempMin} minValue={15} maxValue={30} step={1}
                onChange={(v) => setTempMin(v)}
              >
                <Slider.Track bg={colors.backgroundTertiary}>
                  <Slider.FilledTrack bg={colors.heating} />
                </Slider.Track>
                <Slider.Thumb bg={colors.heating} />
              </Slider>
            </VStack>
            <VStack>
              <HStack justifyContent="space-between" mb={1}>
                <Text fontSize="sm" color={colors.textSecondary}>关闭加热温度</Text>
                <Text fontSize="sm" fontWeight="600" color={colors.heating}>{tempMax}°C</Text>
              </HStack>
              <Slider
                value={tempMax} minValue={20} maxValue={35} step={1}
                onChange={(v) => setTempMax(v)}
              >
                <Slider.Track bg={colors.backgroundTertiary}>
                  <Slider.FilledTrack bg={colors.heating} />
                </Slider.Track>
                <Slider.Thumb bg={colors.heating} />
              </Slider>
            </VStack>
          </VStack>
        </Box>

        {/* 湿度阈值 */}
        <Box bg={colors.backgroundSecondary} rounded="3xl" p={5} mb={5}>
          <HStack alignItems="center" space={2} mb={4}>
            <Droplets size={18} color={colors.cooling} />
            <Text fontSize="md" fontWeight="600" color={colors.textPrimary}>
              湿度阈值
            </Text>
          </HStack>
          <VStack space={4}>
            <VStack>
              <HStack justifyContent="space-between" mb={1}>
                <Text fontSize="sm" color={colors.textSecondary}>启动风扇湿度</Text>
                <Text fontSize="sm" fontWeight="600" color={colors.cooling}>{humidityMax}%</Text>
              </HStack>
              <Slider
                value={humidityMax} minValue={50} maxValue={90} step={5}
                onChange={(v) => setHumidityMax(v)}
              >
                <Slider.Track bg={colors.backgroundTertiary}>
                  <Slider.FilledTrack bg={colors.cooling} />
                </Slider.Track>
                <Slider.Thumb bg={colors.cooling} />
              </Slider>
            </VStack>
            <VStack>
              <HStack justifyContent="space-between" mb={1}>
                <Text fontSize="sm" color={colors.textSecondary}>关闭风扇湿度</Text>
                <Text fontSize="sm" fontWeight="600" color={colors.cooling}>{humidityMin}%</Text>
              </HStack>
              <Slider
                value={humidityMin} minValue={30} maxValue={70} step={5}
                onChange={(v) => setHumidityMin(v)}
              >
                <Slider.Track bg={colors.backgroundTertiary}>
                  <Slider.FilledTrack bg={colors.cooling} />
                </Slider.Track>
                <Slider.Thumb bg={colors.cooling} />
              </Slider>
            </VStack>
          </VStack>
        </Box>

        {/* 久坐与坐姿提醒 */}
        <Box bg={colors.backgroundSecondary} rounded="3xl" p={5} mb={5}>
          <HStack alignItems="center" space={2} mb={4}>
            <Clock size={18} color={colors.primary} />
            <Text fontSize="md" fontWeight="600" color={colors.textPrimary}>
              就座提醒
            </Text>
          </HStack>
          <VStack space={4}>
            <VStack>
              <HStack justifyContent="space-between" mb={1}>
                <Text fontSize="sm" color={colors.textSecondary}>久坐提醒时长</Text>
                <Text fontSize="sm" fontWeight="600" color={colors.primary}>{sittingMax} 分钟</Text>
              </HStack>
              <Slider
                value={sittingMax} minValue={15} maxValue={90} step={5}
                onChange={(v) => setSittingMax(v)}
              >
                <Slider.Track bg={colors.backgroundTertiary}>
                  <Slider.FilledTrack bg={colors.primary} />
                </Slider.Track>
                <Slider.Thumb bg={colors.primary} />
              </Slider>
            </VStack>
            <VStack>
              <HStack justifyContent="space-between" mb={1}>
                <Text fontSize="sm" color={colors.textSecondary}>坐姿报警延迟</Text>
                <Text fontSize="sm" fontWeight="600" color={colors.warning}>{alertDelay} 秒</Text>
              </HStack>
              <Slider
                value={alertDelay} minValue={3} maxValue={15} step={1}
                onChange={(v) => setAlertDelay(v)}
              >
                <Slider.Track bg={colors.backgroundTertiary}>
                  <Slider.FilledTrack bg={colors.warning} />
                </Slider.Track>
                <Slider.Thumb bg={colors.warning} />
              </Slider>
            </VStack>
          </VStack>
        </Box>

        {/* 操作按钮 */}
        <HStack space={3} mb={5}>
          <Pressable flex={1} onPress={handleReset}>
            <Box
              bg={colors.backgroundSecondary} rounded="full" py={4}
              alignItems="center" flexDirection="row" justifyContent="center"
              borderWidth={1} borderColor={colors.divider}
            >
              <RotateCcw size={18} color={colors.textSecondary} />
              <Text color={colors.textSecondary} fontWeight="500" ml={2}>恢复默认</Text>
            </Box>
          </Pressable>
          <Pressable flex={1} onPress={handleSave}>
            <Box
              bg={saved ? colors.healthy : colors.primary} rounded="full" py={4}
              alignItems="center" flexDirection="row" justifyContent="center"
            >
              <Save size={18} color={colors.white} />
              <Text color={colors.white} fontWeight="500" ml={2}>
                {saved ? '已保存' : '保存设置'}
              </Text>
            </Box>
          </Pressable>
        </HStack>

        {/* 说明 */}
        <Box bg={colors.primaryLight} rounded="3xl" p={5} mb={5}>
          <HStack alignItems="flex-start" space={3}>
            <Box mt={0.5}><Info size={16} color={colors.primary} /></Box>
            <VStack flex={1}>
              <Text fontSize="sm" fontWeight="500" color={colors.textPrimary} mb={1}>
                参数说明
              </Text>
              <Text fontSize="xs" color={colors.textSecondary} lineHeight={18}>
                修改阈值后，设置会保存在手机本地。当蓝牙连接设备后，可通过"下发阈值"按钮将参数同步至 HT32 单片机。设备端也可通过独立按键在 LCD 屏幕上直接修改。
              </Text>
            </VStack>
          </HStack>
        </Box>

        <Box h={24} />
      </ScrollView>
    </Box>
  );
}
