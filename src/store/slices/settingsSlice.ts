import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SecuritySettings {
  twoFactorEnabled: boolean;
}

interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
}

interface SettingsState {
  logo: string | null;
  themeMode: 'light' | 'dark' | 'system';
  notifications: NotificationSettings;
  security: SecuritySettings;
}

const initialState: SettingsState = {
  logo: localStorage.getItem('logo'),
  themeMode: (localStorage.getItem('themeMode') as SettingsState['themeMode']) || 'system',
  notifications: {
    email: true,
    push: true,
    sms: false,
  },
  security: {
    twoFactorEnabled: false,
  },
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateLogo: (state, action: PayloadAction<string | null>) => {
      state.logo = action.payload;
      if (action.payload) {
        localStorage.setItem('logo', action.payload);
      } else {
        localStorage.removeItem('logo');
      }
    },
    initializeLogo: (state) => {
      state.logo = localStorage.getItem('logo');
    },
    updateThemeMode: (state, action: PayloadAction<SettingsState['themeMode']>) => {
      state.themeMode = action.payload;
      localStorage.setItem('themeMode', action.payload);
    },
    updateNotificationSettings: (state, action: PayloadAction<NotificationSettings>) => {
      state.notifications = action.payload;
    },
    updateSecuritySettings: (state, action: PayloadAction<SecuritySettings>) => {
      state.security = action.payload;
    },
  },
});

export const {
  updateLogo,
  initializeLogo,
  updateThemeMode,
  updateNotificationSettings,
  updateSecuritySettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;
