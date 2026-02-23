import { PostureType, ThresholdSettings } from '../types';

// 坐姿信息映射
export const POSTURE_INFO: Record<PostureType, {
  label: string;
  description: string;
  level: 'good' | 'warn' | 'bad' | 'none';
}> = {
  none: {
    label: '未就座',
    description: '坐垫上无人就座',
    level: 'none',
  },
  normal: {
    label: '坐姿端正',
    description: '当前坐姿良好，请继续保持',
    level: 'good',
  },
  lean_left: {
    label: '重心左倾',
    description: '身体重心偏向左侧，请注意调整',
    level: 'warn',
  },
  lean_right: {
    label: '重心右倾',
    description: '身体重心偏向右侧，请注意调整',
    level: 'warn',
  },
  cross_leg_left: {
    label: '左腿跷二郎腿',
    description: '检测到跷二郎腿，长期会影响脊柱健康',
    level: 'bad',
  },
  cross_leg_right: {
    label: '右腿跷二郎腿',
    description: '检测到跷二郎腿，长期会影响脊柱健康',
    level: 'bad',
  },
  lean_forward: {
    label: '过度前倾',
    description: '伏案过度前倾，请注意挺直腰背',
    level: 'bad',
  },
};

// 默认阈值设置
export const DEFAULT_THRESHOLDS: ThresholdSettings = {
  tempMin: 22,              // 低于22°C启动加热
  tempMax: 28,              // 达到28°C关闭加热
  humidityMax: 70,          // 高于70%启动风扇
  humidityMin: 55,          // 低于55%关闭风扇
  sittingDurationMax: 45,   // 久坐45分钟提醒
  postureAlertDelay: 5,     // 不良坐姿持续5秒后报警
};

// 蓝牙协议常量
export const BT_PROTOCOL = {
  FRAME_HEADER: 0xAA,
  FRAME_TAIL: 0x55,
  // 上行命令(设备 -> 手机)
  CMD_SENSOR_DATA: 0x01,    // 传感器数据上报
  CMD_DEVICE_STATUS: 0x02,  // 设备状态上报
  CMD_POSTURE_ALERT: 0x03,  // 坐姿异常报警
  // 下行命令(手机 -> 设备)
  CMD_HEATING_ON: 0x10,     // 开启加热
  CMD_HEATING_OFF: 0x11,    // 关闭加热
  CMD_FAN_ON: 0x12,         // 开启风扇
  CMD_FAN_OFF: 0x13,        // 关闭风扇
  CMD_SET_THRESHOLDS: 0x14, // 下发阈值参数
  CMD_QUERY_STATUS: 0x15,   // 查询设备状态
};

// 压力传感器阈值
export const PRESSURE_THRESHOLDS = {
  MIN_SIT_PRESSURE: 50,       // 最低有人就座压力总和
  CROSS_LEG_RATIO: 0.75,      // 单侧压力占比超过75%判定跷腿
  LEAN_RATIO: 0.65,           // 单侧压力占比超过65%判定侧倾
  FORWARD_RATIO: 0.70,        // 前部压力占比超过70%判定前倾
};
