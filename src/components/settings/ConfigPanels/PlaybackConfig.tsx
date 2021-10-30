import React, { useRef } from 'react';
import settings from 'electron-settings';
import { ControlLabel, RadioGroup } from 'rsuite';
import { ConfigPanel } from '../styled';
import {
  StyledInputNumber,
  StyledInputPicker,
  StyledInputPickerContainer,
  StyledRadio,
} from '../../shared/styled';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { setPlaybackSetting, setPlayerVolume } from '../../../redux/playQueueSlice';

const PlaybackConfig = () => {
  const dispatch = useAppDispatch();
  const playQueue = useAppSelector((state) => state.playQueue);
  const crossfadePickerContainerRef = useRef(null);

  return (
    <ConfigPanel header="Playback" bordered>
      <p>
        Fading works by polling the audio player on an interval to determine when to start fading to
        the next track. Due to this, you may notice the fade timing may not be 100% perfect.
        Lowering the player polling interval may increase the accuracy of the fade, but also
        increases the application&apos;s CPU usage.
      </p>

      <p>
        If volume fade is disabled, then the fading-in track will start at the specified crossfade
        duration at full volume.
      </p>

      <p>
        Setting the crossfade duration to <code>0</code> will enable{' '}
        <strong>gapless playback</strong> mode. All other playback settings except the polling
        interval will be ignored. It is recommended that you use a polling interval between{' '}
        <code>10</code> and <code>20</code> for increased transition accuracy. Note that the gapless
        playback is not true gapless and may work better or worse on specific albums.
      </p>
      <p style={{ fontSize: 'smaller' }}>
        *Enable the debug window if you want to view the differences between each fade type
      </p>

      <div style={{ width: '300px', paddingTop: '20px' }}>
        <ControlLabel>Crossfade duration (s)</ControlLabel>
        <StyledInputNumber
          defaultValue={String(settings.getSync('fadeDuration')) || '0'}
          step={0.05}
          min={0}
          max={100}
          width={150}
          onChange={(e: any) => {
            settings.setSync('fadeDuration', Number(e));
            dispatch(
              setPlaybackSetting({
                setting: 'fadeDuration',
                value: Number(e),
              })
            );

            if (Number(e) === 0) {
              dispatch(setPlayerVolume({ player: 1, volume: playQueue.volume }));
              dispatch(setPlayerVolume({ player: 2, volume: playQueue.volume }));
            }
          }}
        />

        <br />
        <ControlLabel>Polling interval (ms)</ControlLabel>
        <StyledInputNumber
          defaultValue={String(settings.getSync('pollingInterval'))}
          step={1}
          min={1}
          max={1000}
          width={150}
          onChange={(e: any) => {
            settings.setSync('pollingInterval', Number(e));
            dispatch(
              setPlaybackSetting({
                setting: 'pollingInterval',
                value: Number(e),
              })
            );
          }}
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
          defaultValue={Boolean(settings.getSync('volumeFade'))}
          onChange={(e) => {
            settings.setSync('volumeFade', e);
            dispatch(setPlaybackSetting({ setting: 'volumeFade', value: e }));
          }}
        >
          <StyledRadio value>Enabled</StyledRadio>
          <StyledRadio value={false}>Disabled</StyledRadio>
        </RadioGroup>
      </div>
    </ConfigPanel>
  );
};

export default PlaybackConfig;
