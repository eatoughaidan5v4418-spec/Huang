/**
 * 蓝牙串口通信服务
 *
 * 负责与 HT32F52352 坐垫设备的蓝牙串口透传模块通信。
 * 协议格式: [帧头 0xAA] [命令字] [数据长度] [数据...] [校验和] [帧尾 0x55]
 *
 * 注意：实际蓝牙连接需要使用 react-native-ble-plx 或 react-native-bluetooth-serial 等原生模块。
 * 此处提供协议解析与模拟数据层，便于UI先行开发和联调。
 */

import { SensorData, DeviceControl } from '../types';
import { BT_PROTOCOL } from '../constants/posture';

// ========== 协议帧构造 ==========

/** 计算校验和(数据区各字节累加取低8位) */
function calcChecksum(data: number[]): number {
  let sum = 0;
  for (const byte of data) {
    sum = (sum + byte) & 0xFF;
  }
  return sum;
}

/** 构造下行控制帧 */
export function buildControlFrame(command: number, data: number[] = []): number[] {
  const frame = [
    BT_PROTOCOL.FRAME_HEADER,
    command,
    data.length,
    ...data,
    calcChecksum([command, data.length, ...data]),
    BT_PROTOCOL.FRAME_TAIL,
  ];
  return frame;
}

/** 解析上行传感器数据帧 -> SensorData */
export function parseSensorFrame(raw: number[]): SensorData | null {
  if (raw.length < 6) return null;
  if (raw[0] !== BT_PROTOCOL.FRAME_HEADER) return null;
  if (raw[1] !== BT_PROTOCOL.CMD_SENSOR_DATA) return null;

  const dataLen = raw[2];
  if (raw.length < 3 + dataLen + 2) return null;

  const data = raw.slice(3, 3 + dataLen);
  const checksum = raw[3 + dataLen];
  const tail = raw[4 + dataLen];

  if (tail !== BT_PROTOCOL.FRAME_TAIL) return null;
  if (calcChecksum([raw[1], raw[2], ...data]) !== checksum) return null;

  // 数据格式: 4个压力值(各2字节高低位) + 温度(1字节) + 湿度(1字节)
  if (dataLen >= 10) {
    return {
      pressureLeftFront: (data[0] << 8) | data[1],
      pressureRightFront: (data[2] << 8) | data[3],
      pressureLeftBack: (data[4] << 8) | data[5],
      pressureRightBack: (data[6] << 8) | data[7],
      temperature: data[8],
      humidity: data[9],
      timestamp: Date.now(),
    };
  }
  return null;
}

/** 构造加热控制帧 */
export function buildHeatingCommand(on: boolean): number[] {
  return buildControlFrame(
    on ? BT_PROTOCOL.CMD_HEATING_ON : BT_PROTOCOL.CMD_HEATING_OFF
  );
}

/** 构造风扇控制帧 */
export function buildFanCommand(on: boolean): number[] {
  return buildControlFrame(
    on ? BT_PROTOCOL.CMD_FAN_ON : BT_PROTOCOL.CMD_FAN_OFF
  );
}

/** 构造阈值下发帧 */
export function buildThresholdFrame(
  tempMin: number,
  tempMax: number,
  humidityMax: number,
  humidityMin: number,
  sittingMax: number
): number[] {
  return buildControlFrame(BT_PROTOCOL.CMD_SET_THRESHOLDS, [
    tempMin, tempMax, humidityMax, humidityMin, sittingMax & 0xFF,
  ]);
}

// ========== 模拟数据生成(开发阶段使用) ==========

let mockSeated = true;
let mockPosturePhase = 0;

/** 生成模拟传感器数据，用于无实际设备时的UI开发和测试 */
export function generateMockSensorData(): SensorData {
  mockPosturePhase = (mockPosturePhase + 1) % 200;

  let lf = 0, rf = 0, lb = 0, rb = 0;

  if (!mockSeated && mockPosturePhase > 180) {
    mockSeated = true;
  }
  if (mockSeated && mockPosturePhase === 150) {
    mockSeated = false;
  }

  if (mockSeated) {
    if (mockPosturePhase < 50) {
      // 端正坐姿
      lf = 180 + Math.random() * 40;
      rf = 180 + Math.random() * 40;
      lb = 200 + Math.random() * 40;
      rb = 200 + Math.random() * 40;
    } else if (mockPosturePhase < 80) {
      // 左倾
      lf = 300 + Math.random() * 50;
      rf = 80 + Math.random() * 30;
      lb = 320 + Math.random() * 50;
      rb = 60 + Math.random() * 30;
    } else if (mockPosturePhase < 110) {
      // 跷右腿
      lf = 100 + Math.random() * 30;
      rf = 400 + Math.random() * 60;
      lb = 80 + Math.random() * 20;
      rb = 350 + Math.random() * 60;
    } else if (mockPosturePhase < 140) {
      // 前倾
      lf = 320 + Math.random() * 40;
      rf = 310 + Math.random() * 40;
      lb = 80 + Math.random() * 30;
      rb = 70 + Math.random() * 30;
    } else {
      // 端正
      lf = 190 + Math.random() * 30;
      rf = 185 + Math.random() * 30;
      lb = 210 + Math.random() * 30;
      rb = 205 + Math.random() * 30;
    }
  }

  return {
    pressureLeftFront: Math.round(lf),
    pressureRightFront: Math.round(rf),
    pressureLeftBack: Math.round(lb),
    pressureRightBack: Math.round(rb),
    temperature: 24 + Math.random() * 4,
    humidity: 50 + Math.random() * 20,
    timestamp: Date.now(),
  };
}
