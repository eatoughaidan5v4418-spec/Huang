import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThresholdSettings, HistoryRecord } from '../types';

const THRESHOLDS_KEY = '@cushion_thresholds';
const HISTORY_KEY = '@cushion_history';

export const saveThresholds = async (thresholds: ThresholdSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(THRESHOLDS_KEY, JSON.stringify(thresholds));
  } catch (error) {
    console.error('保存阈值设置失败:', error);
  }
};

export const loadThresholds = async (): Promise<ThresholdSettings | null> => {
  try {
    const json = await AsyncStorage.getItem(THRESHOLDS_KEY);
    return json ? JSON.parse(json) : null;
  } catch (error) {
    console.error('加载阈值设置失败:', error);
    return null;
  }
};

export const saveHistory = async (history: HistoryRecord[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('保存历史记录失败:', error);
  }
};

export const loadHistory = async (): Promise<HistoryRecord[]> => {
  try {
    const json = await AsyncStorage.getItem(HISTORY_KEY);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.error('加载历史记录失败:', error);
    return [];
  }
};
