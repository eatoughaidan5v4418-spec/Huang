import React, { useState } from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  ScrollView,
  Pressable,
} from 'native-base';
import {
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  Thermometer,
  Droplets,
  TrendingUp,
} from 'lucide-react-native';
import { Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useCushionStore } from '../../store/useCushionStore';
import { POSTURE_INFO } from '../../constants/posture';
import { colors } from '../../constants/theme';

const screenWidth = Dimensions.get('window').width - 40;

export default function Statistics() {
  const history = useCushionStore((s) => s.history);
  const tempHumidityHistory = useCushionStore((s) => s.tempHumidityHistory);
  const todayAlertCount = useCushionStore((s) => s.todayAlertCount);

  const [activeTab, setActiveTab] = useState<'posture' | 'environment'>('posture');

  // 构建温湿度图表数据
  const chartData = tempHumidityHistory.length > 0 ? {
    labels: tempHumidityHistory.slice(-8).map((p) => p.time),
    datasets: [
      {
        data: tempHumidityHistory.slice(-8).map((p) => p.temperature),
        color: () => colors.heating,
        strokeWidth: 2,
      },
      {
        data: tempHumidityHistory.slice(-8).map((p) => p.humidity),
        color: () => colors.cooling,
        strokeWidth: 2,
      },
    ],
    legend: ['温度(°C)', '湿度(%)'],
  } : null;

  // 最近7条历史记录
  const recentHistory = history.slice(0, 7);

  // 统计总就座时长
  const totalSittingMinutes = recentHistory.reduce((sum, r) => sum + Math.floor(r.duration / 60), 0);
  const totalAlerts = recentHistory.reduce((sum, r) => sum + r.alertCount, 0);

  return (
    <Box flex={1} bg={colors.background} pt={16} px={5}>
      <Text fontSize="2xl" fontWeight="700" color={colors.textPrimary} mb={6}>
        数据统计
      </Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Tab 切换 */}
        <Box bg={colors.backgroundSecondary} rounded="2xl" p={1} mb={5}>
          <HStack>
            <Pressable
              flex={1}
              onPress={() => setActiveTab('posture')}
              bg={activeTab === 'posture' ? colors.primary : 'transparent'}
              rounded="xl" py={3} alignItems="center"
            >
              <Text
                fontSize="sm" fontWeight="500"
                color={activeTab === 'posture' ? colors.white : colors.textSecondary}
              >
                坐姿分析
              </Text>
            </Pressable>
            <Pressable
              flex={1}
              onPress={() => setActiveTab('environment')}
              bg={activeTab === 'environment' ? colors.primary : 'transparent'}
              rounded="xl" py={3} alignItems="center"
            >
              <Text
                fontSize="sm" fontWeight="500"
                color={activeTab === 'environment' ? colors.white : colors.textSecondary}
              >
                环境趋势
              </Text>
            </Pressable>
          </HStack>
        </Box>

        {activeTab === 'posture' ? (
          <>
            {/* 坐姿统计概览 */}
            <HStack space={3} mb={5}>
              <Box flex={1} bg={colors.backgroundSecondary} rounded="2xl" p={4} alignItems="center">
                <Activity size={20} color={colors.primary} />
                <Text fontSize="xl" fontWeight="700" color={colors.textPrimary} mt={2}>
                  {totalSittingMinutes}
                </Text>
                <Text fontSize="xs" color={colors.textTertiary}>总就座(分)</Text>
              </Box>
              <Box flex={1} bg={colors.backgroundSecondary} rounded="2xl" p={4} alignItems="center">
                <AlertTriangle size={20} color={colors.warning} />
                <Text fontSize="xl" fontWeight="700" color={colors.warning} mt={2}>
                  {totalAlerts + todayAlertCount}
                </Text>
                <Text fontSize="xs" color={colors.textTertiary}>坐姿提醒</Text>
              </Box>
              <Box flex={1} bg={colors.backgroundSecondary} rounded="2xl" p={4} alignItems="center">
                <CheckCircle size={20} color={colors.healthy} />
                <Text fontSize="xl" fontWeight="700" color={colors.healthy} mt={2}>
                  {recentHistory.length}
                </Text>
                <Text fontSize="xs" color={colors.textTertiary}>记录次数</Text>
              </Box>
            </HStack>

            {/* 历史记录列表 */}
            <Box bg={colors.backgroundSecondary} rounded="3xl" p={5} mb={5}>
              <Text fontSize="md" fontWeight="600" color={colors.textPrimary} mb={4}>
                近期就座记录
              </Text>
              {recentHistory.length === 0 ? (
                <Box alignItems="center" py={8}>
                  <Text color={colors.textSecondary} fontSize="sm">
                    暂无就座记录
                  </Text>
                  <Text color={colors.textTertiary} fontSize="xs" mt={1}>
                    坐上坐垫后会自动记录
                  </Text>
                </Box>
              ) : (
                <VStack space={3}>
                  {recentHistory.map((record) => {
                    const durationMin = Math.floor(record.duration / 60);
                    const normalPct = Math.round(record.postureBreakdown.normal * 100);
                    return (
                      <Box key={record.id} bg={colors.background} rounded="2xl" p={4}>
                        <HStack justifyContent="space-between" alignItems="center" mb={2}>
                          <Text fontSize="sm" fontWeight="500" color={colors.textPrimary}>
                            {record.date}
                          </Text>
                          <HStack alignItems="center" space={1}>
                            <Clock size={12} color={colors.textTertiary} />
                            <Text fontSize="xs" color={colors.textTertiary}>{durationMin}分钟</Text>
                          </HStack>
                        </HStack>
                        <HStack justifyContent="space-between" alignItems="center">
                          <HStack space={2}>
                            <Box bg={colors.healthyLight} rounded="full" px={2} py={0.5}>
                              <Text fontSize="2xs" color={colors.healthy}>端正 {normalPct}%</Text>
                            </Box>
                            {record.alertCount > 0 && (
                              <Box bg={colors.warningLight} rounded="full" px={2} py={0.5}>
                                <Text fontSize="2xs" color={colors.warning}>提醒 {record.alertCount}次</Text>
                              </Box>
                            )}
                          </HStack>
                          <Text fontSize="xs" color={colors.textTertiary}>
                            {record.avgTemperature.toFixed(1)}° / {record.avgHumidity.toFixed(0)}%
                          </Text>
                        </HStack>
                      </Box>
                    );
                  })}
                </VStack>
              )}
            </Box>
          </>
        ) : (
          <>
            {/* 温湿度趋势图 */}
            <Box bg={colors.backgroundSecondary} rounded="3xl" p={5} mb={5}>
              <HStack alignItems="center" space={2} mb={4}>
                <TrendingUp size={18} color={colors.primary} />
                <Text fontSize="md" fontWeight="600" color={colors.textPrimary}>
                  温湿度趋势
                </Text>
              </HStack>
              {chartData ? (
                <LineChart
                  data={chartData}
                  width={screenWidth - 20}
                  height={200}
                  chartConfig={{
                    backgroundColor: colors.backgroundSecondary,
                    backgroundGradientFrom: colors.backgroundSecondary,
                    backgroundGradientTo: colors.backgroundSecondary,
                    decimalPlaces: 1,
                    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                    labelColor: () => colors.textTertiary,
                    propsForDots: { r: '3' },
                    propsForBackgroundLines: { stroke: colors.backgroundTertiary },
                  }}
                  bezier
                  style={{ borderRadius: 16 }}
                />
              ) : (
                <Box alignItems="center" py={8}>
                  <Text color={colors.textSecondary} fontSize="sm">
                    数据收集中...
                  </Text>
                  <Text color={colors.textTertiary} fontSize="xs" mt={1}>
                    连接设备后将自动记录温湿度变化
                  </Text>
                </Box>
              )}
            </Box>

            {/* 温湿度阈值说明 */}
            <Box bg={colors.backgroundSecondary} rounded="3xl" p={5} mb={5}>
              <Text fontSize="md" fontWeight="600" color={colors.textPrimary} mb={3}>
                环境阈值
              </Text>
              <HStack space={3}>
                <Box flex={1} bg={colors.heatingLight} rounded="2xl" p={4}>
                  <HStack alignItems="center" space={2} mb={2}>
                    <Thermometer size={16} color={colors.heating} />
                    <Text fontSize="sm" fontWeight="500" color={colors.heating}>温度</Text>
                  </HStack>
                  <Text fontSize="xs" color={colors.textSecondary}>
                    低于 {useCushionStore.getState().thresholds.tempMin}°C 加热
                  </Text>
                  <Text fontSize="xs" color={colors.textSecondary}>
                    达到 {useCushionStore.getState().thresholds.tempMax}°C 停止
                  </Text>
                </Box>
                <Box flex={1} bg={colors.coolingLight} rounded="2xl" p={4}>
                  <HStack alignItems="center" space={2} mb={2}>
                    <Droplets size={16} color={colors.cooling} />
                    <Text fontSize="sm" fontWeight="500" color={colors.cooling}>湿度</Text>
                  </HStack>
                  <Text fontSize="xs" color={colors.textSecondary}>
                    高于 {useCushionStore.getState().thresholds.humidityMax}% 散热
                  </Text>
                  <Text fontSize="xs" color={colors.textSecondary}>
                    降至 {useCushionStore.getState().thresholds.humidityMin}% 停止
                  </Text>
                </Box>
              </HStack>
            </Box>
          </>
        )}

        <Box h={24} />
      </ScrollView>
    </Box>
  );
}
