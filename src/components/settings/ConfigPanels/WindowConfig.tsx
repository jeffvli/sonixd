import React from 'react';
import settings from 'electron-settings';
import { useTranslation } from 'react-i18next';
import { ConfigOptionDescription, ConfigPanel } from '../styled';
import { StyledToggle } from '../../shared/styled';
import ConfigOption from '../ConfigOption';
import { setWindow } from '../../../redux/configSlice';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';

const WindowConfig = ({ bordered }: any) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const config = useAppSelector((state) => state.config);

  return (
    <ConfigPanel bordered={bordered} header={t('Window')}>
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
            defaultChecked={config.window.minimizeToTray}
            checked={config.window.minimizeToTray}
            onChange={(e: boolean) => {
              settings.setSync('minimizeToTray', e);
              dispatch(setWindow({ minimizeToTray: e }));
            }}
          />
        }
      />

      <ConfigOption
        name={t('Exit to Tray')}
        description={t('Exits to the system tray.')}
        option={
          <StyledToggle
            defaultChecked={config.window.exitToTray}
            checked={config.window.exitToTray}
            onChange={(e: boolean) => {
              settings.setSync('exitToTray', e);
              dispatch(setWindow({ exitToTray: e }));
            }}
          />
        }
      />
    </ConfigPanel>
  );
};

export default WindowConfig;
