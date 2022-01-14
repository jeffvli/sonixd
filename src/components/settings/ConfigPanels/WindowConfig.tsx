import React, { useState } from 'react';
import settings from 'electron-settings';
import { ConfigOptionDescription, ConfigPanel } from '../styled';
import { StyledToggle } from '../../shared/styled';
import ConfigOption from '../ConfigOption';

const WindowConfig = ({ bordered }: any) => {
  const [minimizeToTray, setMinimizeToTray] = useState(Boolean(settings.getSync('minimizeToTray')));
  const [exitToTray, setExitToTray] = useState(Boolean(settings.getSync('exitToTray')));
  return (
    <ConfigPanel bordered={bordered} header="Window">
      <ConfigOptionDescription>
        Note: These settings may not function correctly depending on your desktop environment.
      </ConfigOptionDescription>

      <ConfigOption
        name="Minimize to Tray"
        description="Minimizes to the system tray."
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
        name="Exit to Tray"
        description="Exits to the system tray."
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
