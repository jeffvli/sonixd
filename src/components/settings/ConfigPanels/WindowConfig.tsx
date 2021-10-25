import React, { useState } from 'react';
import settings from 'electron-settings';
import { ConfigPanel } from '../styled';
import { StyledCheckbox } from '../../shared/styled';

const WindowConfig = () => {
  const [minimizeToTray, setMinimizeToTray] = useState(Boolean(settings.getSync('minimizeToTray')));
  const [exitToTray, setExitToTray] = useState(Boolean(settings.getSync('exitToTray')));
  return (
    <ConfigPanel header="Window" bordered>
      <p>Note: These settings may not function correctly depending on your desktop environment.</p>
      <StyledCheckbox
        defaultChecked={minimizeToTray}
        checked={minimizeToTray}
        onChange={(_v: any, e: boolean) => {
          settings.setSync('minimizeToTray', e);
          setMinimizeToTray(e);
        }}
      >
        Minimize to tray
      </StyledCheckbox>

      <StyledCheckbox
        defaultChecked={exitToTray}
        checked={exitToTray}
        onChange={(_v: any, e: boolean) => {
          settings.setSync('exitToTray', e);
          setExitToTray(e);
        }}
      >
        Exit to tray
      </StyledCheckbox>
    </ConfigPanel>
  );
};

export default WindowConfig;
