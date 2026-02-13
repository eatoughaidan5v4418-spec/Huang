const { withAndroidManifest, withMainApplication, withProjectBuildGradle } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// 添加通知监听服务到 AndroidManifest.xml
const withNotificationService = (config) => {
  return withAndroidManifest(config, async (config) => {
    const manifest = config.modResults;
    
    // 添加通知监听权限
    if (!manifest.manifest['uses-permission']) {
      manifest.manifest['uses-permission'] = [];
    }
    
    const permissions = manifest.manifest['uses-permission'];
    const bindNotificationListenerService = permissions.find(
      p => p.$['android:name'] === 'android.permission.BIND_NOTIFICATION_LISTENER_SERVICE'
    );
    
    if (!bindNotificationListenerService) {
      permissions.push({
        $: {
          'android:name': 'android.permission.BIND_NOTIFICATION_LISTENER_SERVICE'
        }
      });
    }
    
    // 添加通知监听服务
    if (!manifest.manifest.application) {
      manifest.manifest.application = [{}];
    }
    
    const application = manifest.manifest.application[0];
    if (!application.service) {
      application.service = [];
    }
    
    const hasNotificationService = application.service.find(
      s => s.$['android:name'] === 'com.easybill.NotificationListener'
    );
    
    if (!hasNotificationService) {
      application.service.push({
        $: {
          'android:name': 'com.easybill.NotificationListener',
          'android:permission': 'android.permission.BIND_NOTIFICATION_LISTENER_SERVICE',
          'android:exported': 'true'
        },
        'intent-filter': [{
          action: [{
            $: {
              'android:name': 'android.service.notification.NotificationListenerService'
            }
          }]
        }]
      });
    }
    
    return config;
  });
};

// 创建通知监听服务文件
const withNotificationServiceFile = (config) => {
  return withMainApplication(config, async (config) => {
    const packageName = 'com.easybill';
    const serviceDir = path.join(config.modRequest.platformProjectRoot, 'app', 'src', 'main', 'java', ...packageName.split('.'));
    const serviceFile = path.join(serviceDir, 'NotificationListener.java');
    
    // 确保目录存在
    if (!fs.existsSync(serviceDir)) {
      fs.mkdirSync(serviceDir, { recursive: true });
    }
    
    // 创建通知监听服务
    const serviceCode = `package com.easybill;

import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class NotificationListener extends NotificationListenerService {
    private static final String TAG = "EasyBillNotification";
    private static ReactContext reactContext;

    public static void setReactContext(ReactContext context) {
        reactContext = context;
    }

    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        super.onNotificationPosted(sbn);
        
        String packageName = sbn.getPackageName();
        String title = sbn.getNotification().extras.getString("android.title");
        String text = sbn.getNotification().extras.getCharSequence("android.text").toString();
        
        Log.d(TAG, "Notification from: " + packageName);
        Log.d(TAG, "Title: " + title);
        Log.d(TAG, "Text: " + text);
        
        // 只处理微信和支付宝的通知
        if (packageName.equals("com.tencent.mm") || packageName.equals("com.eg.android.AlipayGphone")) {
            sendNotificationToJS(packageName, title, text);
        }
    }

    @Override
    public void onNotificationRemoved(StatusBarNotification sbn) {
        super.onNotificationRemoved(sbn);
    }

    private void sendNotificationToJS(String packageName, String title, String text) {
        if (reactContext != null) {
            Bundle bundle = new Bundle();
            bundle.putString("packageName", packageName);
            bundle.putString("title", title);
            bundle.putString("text", text);
            
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("onNotificationReceived", Arguments.fromBundle(bundle));
        }
    }
}
`;
    
    fs.writeFileSync(serviceFile, serviceCode);
    
    return config;
  });
};

// 创建桥接模块
const withNotificationBridge = (config) => {
  return withMainApplication(config, async (config) => {
    const packageName = 'com.easybill';
    const moduleDir = path.join(config.modRequest.platformProjectRoot, 'app', 'src', 'main', 'java', ...packageName.split('.'));
    const moduleFile = path.join(moduleDir, 'NotificationModule.java');
    
    if (!fs.existsSync(moduleDir)) {
      fs.mkdirSync(moduleDir, { recursive: true });
    }
    
    const moduleCode = `package com.easybill;

import android.content.Intent;
import android.provider.Settings;
import androidx.annotation.NonNull;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;

public class NotificationModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;

    public NotificationModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        NotificationListener.setReactContext(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "NotificationModule";
    }

    @ReactMethod
    public void isNotificationServiceEnabled(Promise promise) {
        String enabledListeners = Settings.Secure.getString(
            reactContext.getContentResolver(),
            "enabled_notification_listeners"
        );
        String packageName = reactContext.getPackageName();
        boolean isEnabled = enabledListeners != null && enabledListeners.contains(packageName);
        promise.resolve(isEnabled);
    }

    @ReactMethod
    public void openNotificationSettings() {
        Intent intent = new Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        reactContext.startActivity(intent);
    }

    @ReactMethod
    public void addListener(String eventName) {
        // Required for RN built in Event Emitter Calls
    }

    @ReactMethod
    public void removeListeners(Integer count) {
        // Required for RN built in Event Emitter Calls
    }
}
`;
    
    fs.writeFileSync(moduleFile, moduleCode);
    
    return config;
  });
};

// 创建 Package 文件
const withNotificationPackage = (config) => {
  return withMainApplication(config, async (config) => {
    const packageName = 'com.easybill';
    const packageDir = path.join(config.modRequest.platformProjectRoot, 'app', 'src', 'main', 'java', ...packageName.split('.'));
    const packageFile = path.join(packageDir, 'NotificationPackage.java');
    
    if (!fs.existsSync(packageDir)) {
      fs.mkdirSync(packageDir, { recursive: true });
    }
    
    const packageCode = `package com.easybill;

import androidx.annotation.NonNull;
import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class NotificationPackage implements ReactPackage {
    @NonNull
    @Override
    public List<NativeModule> createNativeModules(@NonNull ReactApplicationContext reactContext) {
        List<NativeModule> modules = new ArrayList<>();
        modules.add(new NotificationModule(reactContext));
        return modules;
    }

    @NonNull
    @Override
    public List<ViewManager> createViewManagers(@NonNull ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }
}
`;
    
    fs.writeFileSync(packageFile, packageCode);
    
    return config;
  });
};

// 修改 MainApplication 注册 Package
const withMainApplicationUpdate = (config) => {
  return withMainApplication(config, async (config) => {
    const mainApplicationPath = path.join(
      config.modRequest.platformProjectRoot,
      'app',
      'src',
      'main',
      'java',
      'com',
      'easybill',
      'MainApplication.kt'
    );
    
    if (fs.existsSync(mainApplicationPath)) {
      let content = fs.readFileSync(mainApplicationPath, 'utf8');
      
      // 添加 import
      if (!content.includes('import com.easybill.NotificationPackage')) {
        content = content.replace(
          'import android.app.Application',
          'import android.app.Application\nimport com.easybill.NotificationPackage'
        );
      }
      
      // 添加 Package 到 getPackages
      if (!content.includes('NotificationPackage()')) {
        content = content.replace(
          'PackageList(this)',
          'PackageList(this).apply { add(NotificationPackage()) }'
        );
      }
      
      fs.writeFileSync(mainApplicationPath, content);
    }
    
    return config;
  });
};

module.exports = function withNotificationListener(config) {
  config = withNotificationService(config);
  config = withNotificationServiceFile(config);
  config = withNotificationBridge(config);
  config = withNotificationPackage(config);
  config = withMainApplicationUpdate(config);
  return config;
};
