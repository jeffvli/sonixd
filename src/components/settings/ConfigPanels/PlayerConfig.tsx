import React from 'react';
import settings from 'electron-settings';
import { ControlLabel } from 'rsuite';
import { ConfigPanel } from '../styled';
import { StyledInputNumber } from '../../shared/styled';

const PlayerConfig = () => {
  return (
    <ConfigPanel header="Player" bordered>
      <p>
        Configure the number of seconds to skip forwards/backwards by when
        clicking the seek forward/backward buttons.
      </p>
      <br />
      <ControlLabel>Seek forward (s)</ControlLabel>
      <StyledInputNumber
        defaultValue={String(settings.getSync('seekForwardInterval')) || '0'}
        step={0.5}
        min={0}
        max={100}
        width={150}
        onChange={(e: any) => {
          settings.setSync('seekForwardInterval', Number(e));
        }}
      />
      <br />
      <ControlLabel>Seek backward (s)</ControlLabel>
      <StyledInputNumber
        defaultValue={String(settings.getSync('seekBackwardInterval')) || '0'}
        step={0.5}
        min={0}
        max={100}
        width={150}
        onChange={(e: any) => {
          settings.setSync('seekBackwardInterval', Number(e));
        }}
      />
    </ConfigPanel>
  );
};

export default PlayerConfig;
