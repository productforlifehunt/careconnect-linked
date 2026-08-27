import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.9c982b158f40454994318cd985411e34',
  appName: 'Care-Connected',
  webDir: 'dist',
  server: {
    url: 'https://9c982b15-8f40-4549-9431-8cd985411e34.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  ios: {
    // Permission prompts are only shown from an explicit user action in Settings.
    limitsNavigationsToAppBoundDomains: false,
  },
  plugins: {
    PushNotifications: {
      // Banner + sound + badge, matching iOS conventions for care alerts.
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#7C5CFF',
    },
    Geolocation: {
      // Foreground-only accuracy; background tracking is opt-in per care group.
      requestPermissions: true,
    },
  },
};

export default config;
