import React, { useState } from 'react';
import settings from 'electron-settings';
import { ConfigPanel } from '../styled';
import { StyledCheckbox } from '../../shared/styled';
import { useAppDispatch } from '../../../redux/hooks';
import { setPlaybackSetting } from '../../../redux/playQueueSlice';

const DebugConfig = () => {
  const dispatch = useAppDispatch();
  const [showDebugWindow, setShowDebugWindow] = useState(
    Boolean(settings.getSync('showDebugWindow'))
  );
  return (
    <ConfigPanel header="Advanced" bordered>
      <StyledCheckbox
        defaultChecked={showDebugWindow}
        onChange={() => {
          settings.setSync('showDebugWindow', !settings.getSync('showDebugWindow'));
          dispatch(
            setPlaybackSetting({
              setting: 'showDebugWindow',
              value: settings.getSync('showDebugWindow'),
            })
          );
          setShowDebugWindow(!showDebugWindow);
        }}
      >
        Show debug window
      </StyledCheckbox>
    </ConfigPanel>
  );
};

export default DebugConfig;
