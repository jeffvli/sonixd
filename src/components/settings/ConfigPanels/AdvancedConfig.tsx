import React, { useState } from 'react';
import settings from 'electron-settings';
import { Icon } from 'rsuite';
import { shell } from 'electron';
import { ConfigPanel } from '../styled';
import { StyledButton, StyledToggle } from '../../shared/styled';
import { useAppDispatch } from '../../../redux/hooks';
import { setPlaybackSetting } from '../../../redux/playQueueSlice';
import ConfigOption from '../ConfigOption';

const AdvancedConfig = ({ bordered }: any) => {
  const dispatch = useAppDispatch();
  const [showDebugWindow, setShowDebugWindow] = useState(
    Boolean(settings.getSync('showDebugWindow'))
  );
  const [autoUpdate, setAutoUpdate] = useState(Boolean(settings.getSync('autoUpdate')));

  return (
    <ConfigPanel bordered={bordered} header="Advanced">
      <ConfigOption
        name="Automatic Updates"
        description="Enables or disables automatic updates. When a new version is detected, it will automatically be downloaded and installed."
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
        name="Show Debug Window"
        description="Displays the debug window."
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
        Open settings JSON <Icon icon="external-link" />
      </StyledButton>
    </ConfigPanel>
  );
};

export default AdvancedConfig;
