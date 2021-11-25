import React, { useState } from 'react';
import settings from 'electron-settings';
import { Icon } from 'rsuite';
import { shell } from 'electron';
import { ConfigPanel } from '../styled';
import { StyledButton, StyledCheckbox } from '../../shared/styled';
import { useAppDispatch } from '../../../redux/hooks';
import { setPlaybackSetting } from '../../../redux/playQueueSlice';

const AdvancedConfig = () => {
  const dispatch = useAppDispatch();
  const [showDebugWindow, setShowDebugWindow] = useState(
    Boolean(settings.getSync('showDebugWindow'))
  );
  const [autoUpdate, setAutoUpdate] = useState(Boolean(settings.getSync('autoUpdate')));

  return (
    <ConfigPanel header="Advanced" bordered>
      <StyledCheckbox
        defaultChecked={autoUpdate}
        checked={autoUpdate}
        onChange={(_v: any, e: boolean) => {
          settings.setSync('autoUpdate', e);
          setAutoUpdate(e);
        }}
      >
        Auto update
      </StyledCheckbox>
      <StyledCheckbox
        defaultChecked={showDebugWindow}
        onChange={(_v: any, e: boolean) => {
          settings.setSync('showDebugWindow', e);
          dispatch(
            setPlaybackSetting({
              setting: 'showDebugWindow',
              value: e,
            })
          );
          setShowDebugWindow(e);
        }}
      >
        Show debug window
      </StyledCheckbox>
      <br />
      <StyledButton onClick={() => shell.openPath(settings.file())}>
        Open settings JSON <Icon icon="external-link" />
      </StyledButton>
    </ConfigPanel>
  );
};

export default AdvancedConfig;
