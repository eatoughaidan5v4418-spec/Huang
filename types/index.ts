// ========== 坐姿类型 ==========
export type PostureType =
  | 'none'           // 无人就座
  | 'normal'         // 端正坐姿
  | 'lean_left'      // 重心左倾
  | 'lean_right'     // 重心右倾
  | 'cross_leg_left' // 左腿跷二郎腿
  | 'cross_leg_right'// 右腿跷二郎腿
  | 'lean_forward';  // 过度前倾伏案

// ========== 设备状态 ==========
export interface DeviceStatus {
  isConnected: boolean;
  deviceName: string;
  deviceId: string;
  batteryLevel: number;     // 0-100
  signalStrength: number;   // RSSI
}

// ========== 传感器数据 ==========
export interface SensorData {
  // 压力传感器 (4路: 左前、右前、左后、右后)
  pressureLeftFront: number;
  pressureRightFront: number;
  pressureLeftBack: number;
  pressureRightBack: number;
  // 温湿度
  temperature: number;      // 摄氏度
  humidity: number;          // 相对湿度百分比
  // 时间戳
  timestamp: number;
}

// ========== 坐姿分析结果 ==========
export interface PostureAnalysis {
  posture: PostureType;
  leftRatio: number;        // 左侧压力占比 0-1
  rightRatio: number;       // 右侧压力占比 0-1
  frontRatio: number;       // 前侧压力占比 0-1
  backRatio: number;        // 后侧压力占比 0-1
  totalPressure: number;    // 总压力
  confidence: number;       // 判定置信度 0-1
}

// ========== 执行器控制指令 ==========
export interface DeviceControl {
  heatingOn: boolean;       // 加热开关
  fanOn: boolean;           // 风扇开关
}

// ========== 用户设置阈值 ==========
export interface ThresholdSettings {
  tempMin: number;          // 最低温度阈值(低于此值启动加热)
  tempMax: number;          // 最高温度阈值(达到后关闭加热)
  humidityMax: number;      // 最大湿度阈值(高于此值启动风扇)
  humidityMin: number;      // 湿度下限(低于后关闭风扇)
  sittingDurationMax: number; // 久坐时长上限(分钟)
  postureAlertDelay: number;  // 不良坐姿持续多少秒后报警
}

// ========== 历史记录项 ==========
export interface HistoryRecord {
  id: string;
  date: string;             // ISO日期字符串
  startTime: number;        // 开始时间戳
  endTime: number;          // 结束时间戳
  duration: number;         // 就座时长(秒)
  postureBreakdown: {       // 各坐姿时长占比
    normal: number;
    lean_left: number;
    lean_right: number;
    cross_leg_left: number;
    cross_leg_right: number;
    lean_forward: number;
  };
  avgTemperature: number;
  avgHumidity: number;
  alertCount: number;       // 不良坐姿提醒次数
}

// ========== 蓝牙协议帧 ==========
export interface BluetoothFrame {
  header: number;           // 帧头 0xAA
  command: number;          // 命令字
  dataLength: number;       // 数据长度
  data: number[];           // 数据区
  checksum: number;         // 校验和
}

// ========== 温湿度历史点 ==========
export interface TempHumidityPoint {
  time: string;
  temperature: number;
  humidity: number;
}
