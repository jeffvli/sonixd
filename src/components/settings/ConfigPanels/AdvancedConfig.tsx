import React, { useState } from 'react';
import { Icon } from 'rsuite';
import { useTranslation } from 'react-i18next';
import { ConfigPanel } from '../styled';
import { StyledButton, StyledToggle } from '../../shared/styled';
import { useAppDispatch } from '../../../redux/hooks';
import { setPlaybackSetting } from '../../../redux/playQueueSlice';
import ConfigOption from '../ConfigOption';
import { settings } from '../../shared/setDefaultSettings';

const AdvancedConfig = ({ bordered }: any) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [showDebugWindow, setShowDebugWindow] = useState(Boolean(settings.get('showDebugWindow')));
  const [autoUpdate, setAutoUpdate] = useState(Boolean(settings.get('autoUpdate')));

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
              settings.set('autoUpdate', e);
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
              settings.set('showDebugWindow', e);
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
      <StyledButton appearance="primary" onClick={() => settings.openInEditor()}>
        {t('Open settings JSON')} <Icon icon="external-link" />
      </StyledButton>
    </ConfigPanel>
  );
};

export default AdvancedConfig;
