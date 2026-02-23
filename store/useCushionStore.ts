import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  PostureType,
  SensorData,
  DeviceStatus,
  DeviceControl,
  ThresholdSettings,
  HistoryRecord,
  PostureAnalysis,
  TempHumidityPoint,
} from '../types';
import { DEFAULT_THRESHOLDS, PRESSURE_THRESHOLDS } from '../constants/posture';

interface CushionStore {
  // ===== 设备连接状态 =====
  device: DeviceStatus;
  setDevice: (device: Partial<DeviceStatus>) => void;
  setConnected: (connected: boolean, name?: string, id?: string) => void;

  // ===== 实时传感器数据 =====
  sensorData: SensorData;
  updateSensorData: (data: SensorData) => void;

  // ===== 坐姿分析 =====
  currentPosture: PostureAnalysis;
  analyzePosture: (data: SensorData) => PostureAnalysis;

  // ===== 就座状态 =====
  isSeated: boolean;
  sittingStartTime: number | null; // 本次就座开始时间戳
  sittingDuration: number;         // 累计就座秒数
  setSittingDuration: (seconds: number) => void;

  // ===== 设备控制 =====
  control: DeviceControl;
  setHeating: (on: boolean) => void;
  setFan: (on: boolean) => void;

  // ===== 用户阈值设置 =====
  thresholds: ThresholdSettings;
  updateThresholds: (thresholds: Partial<ThresholdSettings>) => void;

  // ===== 温湿度历史(近30个点) =====
  tempHumidityHistory: TempHumidityPoint[];
  addTempHumidityPoint: (point: TempHumidityPoint) => void;

  // ===== 历史记录 =====
  history: HistoryRecord[];
  addHistoryRecord: (record: HistoryRecord) => void;
  getTodayRecords: () => HistoryRecord[];
  getWeekRecords: () => HistoryRecord[];

  // ===== 不良坐姿报警计数(今日) =====
  todayAlertCount: number;
  incrementAlertCount: () => void;
  resetAlertCount: () => void;
}

export const useCushionStore = create<CushionStore>()(
  persist(
    (set, get) => ({
      // ===== 设备连接 =====
      device: {
        isConnected: false,
        deviceName: '',
        deviceId: '',
        batteryLevel: 0,
        signalStrength: 0,
      },
      setDevice: (partial) =>
        set((state) => ({ device: { ...state.device, ...partial } })),
      setConnected: (connected, name, id) =>
        set((state) => ({
          device: {
            ...state.device,
            isConnected: connected,
            deviceName: name ?? state.device.deviceName,
            deviceId: id ?? state.device.deviceId,
          },
        })),

      // ===== 传感器数据 =====
      sensorData: {
        pressureLeftFront: 0,
        pressureRightFront: 0,
        pressureLeftBack: 0,
        pressureRightBack: 0,
        temperature: 0,
        humidity: 0,
        timestamp: 0,
      },
      updateSensorData: (data) => {
        const posture = get().analyzePosture(data);
        const totalPressure =
          data.pressureLeftFront +
          data.pressureRightFront +
          data.pressureLeftBack +
          data.pressureRightBack;
        const isSeated = totalPressure > PRESSURE_THRESHOLDS.MIN_SIT_PRESSURE;

        set((state) => {
          let sittingStartTime = state.sittingStartTime;
          if (isSeated && !state.isSeated) {
            sittingStartTime = Date.now();
          } else if (!isSeated) {
            sittingStartTime = null;
          }

          return {
            sensorData: data,
            currentPosture: posture,
            isSeated,
            sittingStartTime,
          };
        });
      },

      // ===== 坐姿分析(重心偏移算法) =====
      currentPosture: {
        posture: 'none' as PostureType,
        leftRatio: 0,
        rightRatio: 0,
        frontRatio: 0,
        backRatio: 0,
        totalPressure: 0,
        confidence: 0,
      },
      analyzePosture: (data: SensorData): PostureAnalysis => {
        const { pressureLeftFront, pressureRightFront, pressureLeftBack, pressureRightBack } = data;
        const total = pressureLeftFront + pressureRightFront + pressureLeftBack + pressureRightBack;

        if (total < PRESSURE_THRESHOLDS.MIN_SIT_PRESSURE) {
          return {
            posture: 'none',
            leftRatio: 0, rightRatio: 0, frontRatio: 0, backRatio: 0,
            totalPressure: total, confidence: 1,
          };
        }

        const leftTotal = pressureLeftFront + pressureLeftBack;
        const rightTotal = pressureRightFront + pressureRightBack;
        const frontTotal = pressureLeftFront + pressureRightFront;
        const backTotal = pressureLeftBack + pressureRightBack;

        const leftRatio = leftTotal / total;
        const rightRatio = rightTotal / total;
        const frontRatio = frontTotal / total;
        const backRatio = backTotal / total;

        let posture: PostureType = 'normal';
        let confidence = 0.8;

        // 跷二郎腿判定: 单侧压力集中且某一点特别突出
        if (leftRatio > PRESSURE_THRESHOLDS.CROSS_LEG_RATIO) {
          posture = 'cross_leg_left';
          confidence = Math.min(leftRatio / 0.75, 1);
        } else if (rightRatio > PRESSURE_THRESHOLDS.CROSS_LEG_RATIO) {
          posture = 'cross_leg_right';
          confidence = Math.min(rightRatio / 0.75, 1);
        }
        // 过度前倾判定
        else if (frontRatio > PRESSURE_THRESHOLDS.FORWARD_RATIO) {
          posture = 'lean_forward';
          confidence = Math.min(frontRatio / 0.70, 1);
        }
        // 侧倾判定
        else if (leftRatio > PRESSURE_THRESHOLDS.LEAN_RATIO) {
          posture = 'lean_left';
          confidence = Math.min(leftRatio / 0.65, 1);
        } else if (rightRatio > PRESSURE_THRESHOLDS.LEAN_RATIO) {
          posture = 'lean_right';
          confidence = Math.min(rightRatio / 0.65, 1);
        }

        return { posture, leftRatio, rightRatio, frontRatio, backRatio, totalPressure: total, confidence };
      },

      // ===== 就座状态 =====
      isSeated: false,
      sittingStartTime: null,
      sittingDuration: 0,
      setSittingDuration: (seconds) => set({ sittingDuration: seconds }),

      // ===== 设备控制 =====
      control: { heatingOn: false, fanOn: false },
      setHeating: (on) =>
        set((state) => ({ control: { ...state.control, heatingOn: on } })),
      setFan: (on) =>
        set((state) => ({ control: { ...state.control, fanOn: on } })),

      // ===== 阈值设置 =====
      thresholds: DEFAULT_THRESHOLDS,
      updateThresholds: (partial) =>
        set((state) => ({ thresholds: { ...state.thresholds, ...partial } })),

      // ===== 温湿度历史 =====
      tempHumidityHistory: [],
      addTempHumidityPoint: (point) =>
        set((state) => ({
          tempHumidityHistory: [...state.tempHumidityHistory, point].slice(-30),
        })),

      // ===== 历史记录 =====
      history: [],
      addHistoryRecord: (record) =>
        set((state) => ({
          history: [record, ...state.history].slice(0, 100),
        })),
      getTodayRecords: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().history.filter((r) => r.date === today);
      },
      getWeekRecords: () => {
        const now = Date.now();
        const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
        return get().history.filter((r) => new Date(r.date).getTime() >= weekAgo);
      },

      // ===== 报警计数 =====
      todayAlertCount: 0,
      incrementAlertCount: () =>
        set((state) => ({ todayAlertCount: state.todayAlertCount + 1 })),
      resetAlertCount: () => set({ todayAlertCount: 0 }),
    }),
    {
      name: 'cushion-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        thresholds: state.thresholds,
        history: state.history,
      }),
    }
  )
);
