import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const { NotificationModule } = NativeModules;

interface NotificationData {
  packageName: string;
  title: string;
  text: string;
}

interface NotificationModuleInterface {
  isNotificationServiceEnabled(): Promise<boolean>;
  openNotificationSettings(): void;
}

// 创建事件发射器
const notificationEmitter = NotificationModule 
  ? new NativeEventEmitter(NotificationModule)
  : null;

export const NotificationService = {
  // 检查通知监听权限是否开启
  isEnabled: async (): Promise<boolean> => {
    if (Platform.OS !== 'android' || !NotificationModule) {
      return false;
    }
    try {
      return await NotificationModule.isNotificationServiceEnabled();
    } catch (error) {
      console.error('Failed to check notification permission:', error);
      return false;
    }
  },

  // 打开通知监听设置页面
  openSettings: (): void => {
    if (Platform.OS !== 'android' || !NotificationModule) {
      return;
    }
    try {
      NotificationModule.openNotificationSettings();
    } catch (error) {
      console.error('Failed to open notification settings:', error);
    }
  },

  // 添加通知监听回调
  addNotificationListener: (callback: (data: NotificationData) => void) => {
    if (!notificationEmitter) {
      console.warn('Notification emitter not available');
      return { remove: () => {} };
    }
    return notificationEmitter.addListener('onNotificationReceived', callback);
  },

  // 移除通知监听
  removeNotificationListener: (subscription: any) => {
    if (subscription) {
      subscription.remove();
    }
  },
};

export type { NotificationData };
