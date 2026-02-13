const { withAndroidManifest, withMainApplication } = require('@expo/config-plugins');

// 添加通知监听服务到 AndroidManifest.xml
const withNotificationService = (config) => {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    
    // 添加通知监听权限
    if (!manifest.manifest['uses-permission']) {
      manifest.manifest['uses-permission'] = [];
    }
    
    const permissions = manifest.manifest['uses-permission'];
    const hasPermission = permissions.some(
      p => p.$ && p.$['android:name'] === 'android.permission.BIND_NOTIFICATION_LISTENER_SERVICE'
    );
    
    if (!hasPermission) {
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
    
    const hasService = application.service.some(
      s => s.$ && s.$['android:name'] === 'com.easybill.NotificationListener'
    );
    
    if (!hasService) {
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

module.exports = function withNotificationListener(config) {
  config = withNotificationService(config);
  return config;
};
