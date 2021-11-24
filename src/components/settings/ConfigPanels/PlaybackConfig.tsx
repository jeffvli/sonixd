import React, { useRef, useState } from 'react';
import settings from 'electron-settings';
import { ButtonToolbar, ControlLabel, RadioGroup } from 'rsuite';
import { ConfigPanel } from '../styled';
import {
  StyledButton,
  StyledInputNumber,
  StyledInputPicker,
  StyledInputPickerContainer,
  StyledRadio,
} from '../../shared/styled';
import { useAppDispatch } from '../../../redux/hooks';
import { setPlaybackSetting } from '../../../redux/playQueueSlice';

const PlaybackConfig = () => {
  const dispatch = useAppDispatch();
  const [crossfadeDuration, setCrossfadeDuration] = useState(
    Number(settings.getSync('fadeDuration'))
  );
  const [pollingInterval, setPollingInterval] = useState(
    Number(settings.getSync('pollingInterval'))
  );
  const [volumeFade, setVolumeFade] = useState(Boolean(settings.getSync('volumeFade')));
  const crossfadePickerContainerRef = useRef(null);

  const handleSetCrossfadeDuration = (e: number) => {
    setCrossfadeDuration(e);
    settings.setSync('fadeDuration', Number(e));
    dispatch(
      setPlaybackSetting({
        setting: 'fadeDuration',
        value: Number(e),
      })
    );
  };

  const handleSetPollingInterval = (e: number) => {
    setPollingInterval(e);
    settings.setSync('pollingInterval', Number(e));
    dispatch(
      setPlaybackSetting({
        setting: 'pollingInterval',
        value: Number(e),
      })
    );
  };

  const handleSetVolumeFade = (e: boolean) => {
    setVolumeFade(e);
    settings.setSync('volumeFade', e);
    dispatch(setPlaybackSetting({ setting: 'volumeFade', value: e }));
  };

  return (
    <ConfigPanel header="Playback" bordered>
      <p>
        Fading works by polling the audio player on an interval to determine when to start fading to
        the next track. Due to this, you may notice the fade timing may not be 100% perfect.
        Lowering the player polling interval may increase the accuracy of the fade, but also
        increases the application&apos;s CPU usage.
      </p>

      <p>
        Setting the crossfade duration to <code>0</code> will enable{' '}
        <strong>gapless playback</strong> mode. All other playback settings except the polling
        interval will be ignored. It is recommended that you use a polling interval between{' '}
        <code>10</code> and <code>20</code> for increased transition accuracy. Note that the gapless
        playback is not true gapless and may work better or worse on specific albums.
      </p>

      <p>
        If volume fade is disabled, then the fading-in track will start at the specified crossfade
        duration at full volume.
      </p>

      <p style={{ fontSize: 'smaller' }}>
        *Enable the debug window if you want to view the differences between each fade type
      </p>

      <div style={{ paddingTop: '20px' }}>
        <ControlLabel>Crossfade duration (s)</ControlLabel>
        <StyledInputNumber
          defaultValue={crossfadeDuration}
          value={crossfadeDuration}
          step={0.05}
          min={0}
          max={100}
          width={150}
          onChange={(e: number) => handleSetCrossfadeDuration(e)}
        />

        <br />
        <ControlLabel>Polling interval (ms)</ControlLabel>
        <StyledInputNumber
          defaultValue={pollingInterval}
          value={pollingInterval}
          step={1}
          min={1}
          max={1000}
          width={150}
          onChange={(e: number) => handleSetPollingInterval(e)}
        />
        <br />
        <StyledInputPickerContainer ref={crossfadePickerContainerRef}>
          <ControlLabel>Crossfade type</ControlLabel>
          <br />
          <StyledInputPicker
            container={() => crossfadePickerContainerRef.current}
            data={[
              {
                label: 'Equal Power',
                value: 'equalPower',
              },
              {
                label: 'Linear',
                value: 'linear',
              },
              {
                label: 'Dipped',
                value: 'dipped',
              },
              {
                label: 'Constant Power',
                value: 'constantPower',
              },
              {
                label: 'Constant Power (slow fade)',
                value: 'constantPowerSlowFade',
              },
              {
                label: 'Constant Power (slow cut)',
                value: 'constantPowerSlowCut',
              },
              {
                label: 'Constant Power (fast cut)',
                value: 'constantPowerFastCut',
              },
            ]}
            cleanable={false}
            defaultValue={String(settings.getSync('fadeType'))}
            onChange={(e: string) => {
              settings.setSync('fadeType', e);
              dispatch(setPlaybackSetting({ setting: 'fadeType', value: e }));
            }}
          />
        </StyledInputPickerContainer>

        <br />
        <ControlLabel>Volume fade</ControlLabel>
        <RadioGroup
          name="volumeFadeRadioList"
          appearance="default"
          defaultValue={volumeFade}
          value={volumeFade}
          onChange={(e: boolean) => handleSetVolumeFade(e)}
        >
          <StyledRadio value>Enabled</StyledRadio>
          <StyledRadio value={false}>Disabled</StyledRadio>
        </RadioGroup>
        <br />
        <h6>Presets</h6>
        <ButtonToolbar>
          <StyledButton
            onClick={() => {
              setCrossfadeDuration(0);
              setPollingInterval(15);
              handleSetCrossfadeDuration(0);
              handleSetPollingInterval(15);
            }}
          >
            Gapless
          </StyledButton>
          <StyledButton
            onClick={() => {
              setCrossfadeDuration(7);
              setPollingInterval(50);
              setVolumeFade(true);
              handleSetCrossfadeDuration(7);
              handleSetPollingInterval(50);
              handleSetVolumeFade(true);
            }}
          >
            Fade
          </StyledButton>
          <StyledButton
            onClick={() => {
              setCrossfadeDuration(0);
              setPollingInterval(200);
              setVolumeFade(false);
              handleSetCrossfadeDuration(0);
              handleSetPollingInterval(200);
              handleSetVolumeFade(false);
            }}
          >
            Normal
          </StyledButton>
        </ButtonToolbar>
      </div>
    </ConfigPanel>
  );
};

export default PlaybackConfig;
