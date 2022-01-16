import React, { useState } from 'react';
import settings from 'electron-settings';
import { Icon } from 'rsuite';
import { shell } from 'electron';
import { useTranslation } from 'react-i18next';
import { ConfigPanel } from '../styled';
import { StyledButton, StyledToggle } from '../../shared/styled';
import { useAppDispatch } from '../../../redux/hooks';
import { setPlaybackSetting } from '../../../redux/playQueueSlice';
import ConfigOption from '../ConfigOption';

const AdvancedConfig = ({ bordered }: any) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [showDebugWindow, setShowDebugWindow] = useState(
    Boolean(settings.getSync('showDebugWindow'))
  );
  const [autoUpdate, setAutoUpdate] = useState(Boolean(settings.getSync('autoUpdate')));

  return (
    <ConfigPanel bordered={bordered} header={t('Advanced')}>
      <ConfigOption
        name={t('Automatic Updates')}
        description={t(
          'Enables or disables automatic updates. When a new version is detected, it will automatically be downloaded and installed.'
        )}
        option={
          <StyledToggle
            defaultChecked={autoUpdate}
            checked={autoUpdate}
            onChange={(e: boolean) => {
              settings.setSync('autoUpdate', e);
              setAutoUpdate(e);
            }}
          />
        }
      />

      <ConfigOption
        name={t('Show Debug Window')}
        description={t('Displays the debug window.')}
        option={
          <StyledToggle
            defaultChecked={showDebugWindow}
            checked={showDebugWindow}
            onChange={(e: boolean) => {
              settings.setSync('showDebugWindow', e);
              dispatch(
                setPlaybackSetting({
                  setting: 'showDebugWindow',
                  value: e,
                })
              );
              setShowDebugWindow(e);
            }}
          />
        }
      />

      <br />
      <StyledButton appearance="primary" onClick={() => shell.openPath(settings.file())}>
        {t('Open settings JSON')} <Icon icon="external-link" />
      </StyledButton>
    </ConfigPanel>
  );
};

export default AdvancedConfig;
