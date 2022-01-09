import React, { useState } from 'react';
import settings from 'electron-settings';
import { useTranslation } from 'react-i18next';
import { ConfigOptionDescription, ConfigPanel } from '../styled';
import { StyledToggle } from '../../shared/styled';
import ConfigOption from '../ConfigOption';

const WindowConfig = () => {
  const { t } = useTranslation();
  const [minimizeToTray, setMinimizeToTray] = useState(Boolean(settings.getSync('minimizeToTray')));
  const [exitToTray, setExitToTray] = useState(Boolean(settings.getSync('exitToTray')));
  return (
    <ConfigPanel header={t('Window')}>
      <ConfigOptionDescription>
        {t(
          'Note: These settings may not function correctly depending on your desktop environment.'
        )}
      </ConfigOptionDescription>

      <ConfigOption
        name={t('Minimize to Tray')}
        description={t('Minimizes to the system tray.')}
        option={
          <StyledToggle
            defaultChecked={minimizeToTray}
            checked={minimizeToTray}
            onChange={(e: boolean) => {
              settings.setSync('minimizeToTray', e);
              setMinimizeToTray(e);
            }}
          />
        }
      />

      <ConfigOption
        name={t('Exit to Tray')}
        description={t('Exits to the system tray.')}
        option={
          <StyledToggle
            defaultChecked={exitToTray}
            checked={exitToTray}
            onChange={(e: boolean) => {
              settings.setSync('exitToTray', e);
              setExitToTray(e);
            }}
          />
        }
      />
    </ConfigPanel>
  );
};

export default WindowConfig;
