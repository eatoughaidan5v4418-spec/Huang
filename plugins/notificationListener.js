const { withAndroidManifest, withGradleProperties } = require('@expo/config-plugins');

const NOTIFICATION_LISTENER_SERVICE = `
<service
    android:name=".NotificationListenerService"
    android:permission="android.permission.BIND_NOTIFICATION_LISTENER_SERVICE"
    android:exported="true">
    <intent-filter>
        <action android:name="android.service.notification.NotificationListenerService" />
    </intent-filter>
</service>
`;

module.exports = function withNotificationListener(config) {
  config = withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    
    const application = manifest.manifest.application;
    if (application && application[0]) {
      if (!application[0].service) {
        application[0].service = [];
      }
      
      const hasService = application[0].service.some(
        (s) => s.$ && s.$.android:name === '.NotificationListenerService'
      );
      
      if (!hasService) {
        application[0].service.push({
          $: {
            'android:name': '.NotificationListenerService',
            'android:permission': 'android.permission.BIND_NOTIFICATION_LISTENER_SERVICE',
            'android:exported': 'true',
          },
          'intent-filter': [
            {
              action: [
                {
                  $: {
                    'android:name': 'android.service.notification.NotificationListenerService',
                  },
                },
              ],
            },
          ],
        });
      }
    }
    
    return config;
  });

  return config;
};
