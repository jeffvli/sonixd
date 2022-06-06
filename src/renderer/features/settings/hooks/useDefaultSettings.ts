import isElectron from 'is-electron';

export interface WebSettings {
  player: 'web' | 'local';
}

const DEFAULT_SETTINGS: WebSettings = {
  player: isElectron() ? 'local' : 'web',
};

export const useDefaultSettings = () => {
  const currentSettings = localStorage.getItem('settings');

  if (currentSettings) {
    return JSON.parse(currentSettings);
  }

  return localStorage.setItem('settings', JSON.stringify(DEFAULT_SETTINGS));
};
