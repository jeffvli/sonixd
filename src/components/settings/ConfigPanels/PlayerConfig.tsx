import React, { useState } from 'react';
import settings from 'electron-settings';
import { ControlLabel } from 'rsuite';
import { ConfigPanel } from '../styled';
import { StyledCheckbox, StyledInputNumber } from '../../shared/styled';
import { useAppDispatch } from '../../../redux/hooks';
import { setPlaybackSetting } from '../../../redux/playQueueSlice';

const PlayerConfig = () => {
  const dispatch = useAppDispatch();
  const [globalMediaHotkeys, setGlobalMediaHotkeys] = useState(
    Boolean(settings.getSync('globalMediaHotkeys'))
  );
  const [scrobble, setScrobble] = useState(Boolean(settings.getSync('scrobble')));
  return (
    <ConfigPanel header="Player" bordered>
      <p>
        Configure the number of seconds to skip forwards/backwards by when clicking the seek
        forward/backward buttons.
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
      <br />
      <StyledCheckbox
        defaultChecked={globalMediaHotkeys}
        onChange={() => {
          settings.setSync('globalMediaHotkeys', !settings.getSync('globalMediaHotkeys'));
          setGlobalMediaHotkeys(!globalMediaHotkeys);
        }}
      >
        Enable global media hotkeys (requires app restart)
      </StyledCheckbox>
      <StyledCheckbox
        defaultChecked={scrobble}
        onChange={() => {
          settings.setSync('scrobble', !scrobble);
          dispatch(setPlaybackSetting({ setting: 'scrobble', value: !scrobble }));
          setScrobble(!scrobble);
        }}
      >
        Enable scrobbling
      </StyledCheckbox>
    </ConfigPanel>
  );
};

export default PlayerConfig;
