import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform, Linking, AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { parseNotification, ParsedTransaction, isPaymentNotification } from '../services/notificationParser';
import { useExpenseStore } from '../store/useExpenseStore';

const NOTIFICATION_PERMISSION_KEY = 'notification_permission_enabled';
const AUTO_RECORD_KEY = 'auto_record_enabled';

interface NotificationListenerState {
  isEnabled: boolean;
  autoRecord: boolean;
  hasPermission: boolean;
  isSupported: boolean;
  pendingTransactions: ParsedTransaction[];
  requestPermission: () => Promise<void>;
  openSettings: () => void;
  toggleAutoRecord: (enabled: boolean) => void;
  confirmTransaction: (transaction: ParsedTransaction) => void;
  dismissTransaction: (transaction: ParsedTransaction) => void;
}

export function useNotificationListener(): NotificationListenerState {
  const [isEnabled, setIsEnabled] = useState(false);
  const [autoRecord, setAutoRecord] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [pendingTransactions, setPendingTransactions] = useState<ParsedTransaction[]>([]);
  const appState = useRef(AppState.currentState);
  const addExpense = useExpenseStore((state) => state.addExpense);

  const isSupported = Platform.OS === 'android';

  const checkPermission = useCallback(async () => {
    if (!isSupported) return false;

    try {
      const enabled = await AsyncStorage.getItem(NOTIFICATION_PERMISSION_KEY);
      const hasPermissionValue = enabled === 'true';
      setHasPermission(hasPermissionValue);
      return hasPermissionValue;
    } catch {
      return false;
    }
  }, [isSupported]);

  const loadSettings = useCallback(async () => {
    try {
      const autoRecordValue = await AsyncStorage.getItem(AUTO_RECORD_KEY);
      setAutoRecord(autoRecordValue === 'true');
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }, []);

  useEffect(() => {
    checkPermission();
    loadSettings();

    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        checkPermission();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [checkPermission, loadSettings]);

  const requestPermission = useCallback(async () => {
    if (!isSupported) return;

    try {
      await Linking.openSettings();
      await AsyncStorage.setItem(NOTIFICATION_PERMISSION_KEY, 'true');
      setIsEnabled(true);
    } catch (error) {
      console.error('Failed to request permission:', error);
    }
  }, [isSupported]);

  const openSettings = useCallback(() => {
    Linking.openSettings();
  }, []);

  const toggleAutoRecord = useCallback(async (enabled: boolean) => {
    setAutoRecord(enabled);
    await AsyncStorage.setItem(AUTO_RECORD_KEY, enabled.toString());
  }, []);

  const handleNewNotification = useCallback((notification: {
    packageName: string;
    title: string;
    text: string;
    subText?: string;
    bigText?: string;
    timestamp: number;
  }) => {
    if (!isPaymentNotification(notification.packageName)) return;

    const transaction = parseNotification(notification);
    if (!transaction) return;

    if (autoRecord) {
      addExpense({
        amount: transaction.amount,
        category: transaction.category,
        note: transaction.note,
        type: transaction.type,
      });
    } else {
      setPendingTransactions((prev) => [...prev, transaction]);
    }
  }, [autoRecord, addExpense]);

  const confirmTransaction = useCallback((transaction: ParsedTransaction) => {
    addExpense({
      amount: transaction.amount,
      category: transaction.category,
      note: transaction.note,
      type: transaction.type,
    });
    setPendingTransactions((prev) => prev.filter((t) => t !== transaction));
  }, [addExpense]);

  const dismissTransaction = useCallback((transaction: ParsedTransaction) => {
    setPendingTransactions((prev) => prev.filter((t) => t !== transaction));
  }, []);

  useEffect(() => {
    if (isSupported && hasPermission) {
      (global as any).__onNotificationReceived = handleNewNotification;
    }

    return () => {
      if ((global as any).__onNotificationReceived) {
        delete (global as any).__onNotificationReceived;
      }
    };
  }, [isSupported, hasPermission, handleNewNotification]);

  return {
    isEnabled,
    autoRecord,
    hasPermission,
    isSupported,
    pendingTransactions,
    requestPermission,
    openSettings,
    toggleAutoRecord,
    confirmTransaction,
    dismissTransaction,
  };
}
