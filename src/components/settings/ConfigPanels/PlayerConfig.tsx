import React, { useEffect, useRef, useState } from 'react';
import { ipcRenderer, shell } from 'electron';
import settings from 'electron-settings';
import { Form } from 'rsuite';
import { ConfigOptionDescription, ConfigOptionName, ConfigPanel } from '../styled';
import {
  StyledButton,
  StyledInput,
  StyledInputGroup,
  StyledInputNumber,
  StyledInputPicker,
  StyledInputPickerContainer,
  StyledLink,
  StyledPanel,
  StyledToggle,
} from '../../shared/styled';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { setPlaybackSetting } from '../../../redux/playQueueSlice';
import ListViewTable from '../../viewtypes/ListViewTable';
import { appendPlaybackFilter, setAudioDeviceId } from '../../../redux/configSlice';
import { notifyToast } from '../../shared/toast';
import ConfigOption from '../ConfigOption';

const getAudioDevice = async () => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return (devices || []).filter((dev: MediaDeviceInfo) => dev.kind === 'audiooutput');
};

const playbackFilterColumns = [
  {
    id: '#',
    dataKey: 'index',
    alignment: 'center',
    resizable: false,
    width: 50,
    label: '#',
  },
  {
    id: 'Filter',
    dataKey: 'filter',
    alignment: 'left',
    resizable: false,
    flexGrow: 2,
    label: 'Filter',
  },
  {
    id: 'Enabled',
    dataKey: 'filterEnabled',
    alignment: 'left',
    resizable: false,
    width: 100,
    label: 'Enabled',
  },
  {
    id: 'Delete',
    dataKey: 'filterDelete',
    alignment: 'left',
    resizable: false,
    width: 100,
    label: 'Delete',
  },
];

const PlayerConfig = () => {
  const dispatch = useAppDispatch();
  const playQueue = useAppSelector((state) => state.playQueue);
  const multiSelect = useAppSelector((state) => state.multiSelect);
  const config = useAppSelector((state) => state.config);
  const [newFilter, setNewFilter] = useState({ string: '', valid: false });
  const [globalMediaHotkeys, setGlobalMediaHotkeys] = useState(
    Boolean(settings.getSync('globalMediaHotkeys'))
  );
  const [scrobble, setScrobble] = useState(Boolean(settings.getSync('scrobble')));
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>();
  const audioDevicePickerContainerRef = useRef(null);

  useEffect(() => {
    settings.setSync('playbackFilters', config.playback.filters);
  }, [config.playback.filters]);

  useEffect(() => {
    const getAudioDevices = () => {
      getAudioDevice()
        .then((dev) => setAudioDevices(dev))
        .catch(() => notifyToast('error', 'Error fetching audio devices'));
    };

    getAudioDevices();
  }, []);

  return (
    <ConfigPanel header="Player">
      <ConfigOption
        name="Audio Device"
        description="The audio device for Sonixd. Leaving this blank will use the system default."
        option={
          <StyledInputPickerContainer ref={audioDevicePickerContainerRef}>
            <StyledInputPicker
              container={() => audioDevicePickerContainerRef.current}
              data={audioDevices}
              defaultValue={config.playback.audioDeviceId}
              value={config.playback.audioDeviceId}
              labelKey="label"
              valueKey="deviceId"
              placement="bottomStart"
              onChange={(e: string) => {
                dispatch(setAudioDeviceId(e));
                settings.setSync('audioDeviceId', e);
              }}
            />
          </StyledInputPickerContainer>
        }
      />
      <ConfigOption
        name="Seek Forward"
        description="The number in seconds the player will skip forwards when clicking the seek forward button."
        option={
          <StyledInputNumber
            defaultValue={String(settings.getSync('seekForwardInterval')) || '0'}
            step={0.5}
            min={0}
            max={100}
            width={125}
            onChange={(e: any) => {
              settings.setSync('seekForwardInterval', Number(e));
            }}
          />
        }
      />
      <ConfigOption
        name="Seek Backward"
        description="The number in seconds the player will skip backwards when clicking the seek backward button."
        option={
          <StyledInputNumber
            defaultValue={String(settings.getSync('seekBackwardInterval')) || '0'}
            step={0.5}
            min={0}
            max={100}
            width={125}
            onChange={(e: any) => {
              settings.setSync('seekBackwardInterval', Number(e));
            }}
          />
        }
      />
      <ConfigOption
        name="Global Media Hotkeys"
        description={
          <>
            Enable or disable global media hotkeys (play/pause, next, previous, stop, etc). For
            macOS, you will need to add Sonixd as a{' '}
            <StyledLink
              onClick={() =>
                shell.openExternal(
                  'https://developer.apple.com/library/archive/documentation/Accessibility/Conceptual/AccessibilityMacOSX/OSXAXTestingApps.html'
                )
              }
            >
              trusted accessibility client.
            </StyledLink>
          </>
        }
        option={
          <StyledToggle
            defaultChecked={globalMediaHotkeys}
            checked={globalMediaHotkeys}
            onChange={(e: boolean) => {
              settings.setSync('globalMediaHotkeys', e);
              setGlobalMediaHotkeys(e);
              if (e) {
                ipcRenderer.send('enableGlobalHotkeys');
              } else {
                ipcRenderer.send('disableGlobalHotkeys');
              }
            }}
          />
        }
      />
      <ConfigOption
        name="Scrobble"
        description="Send player updates to your server. This is required by servers such as Jellyfin and Navidrome to track play counts and use external services such as Last.fm."
        option={
          <StyledToggle
            defaultChecked={scrobble}
            checked={scrobble}
            onChange={(e: boolean) => {
              settings.setSync('scrobble', e);
              dispatch(setPlaybackSetting({ setting: 'scrobble', value: e }));
              setScrobble(e);
            }}
          />
        }
      />
      <ConfigOptionName>Track Filters</ConfigOptionName>
      <ConfigOptionDescription>
        Filter out tracks based on regex string(s) by their title when adding to the queue. Adding
        by double-clicking a track will ignore all filters for that one track.
      </ConfigOptionDescription>
      <br />
      <StyledPanel bodyFill>
        <Form fluid>
          <StyledInputGroup>
            <StyledInput
              value={newFilter.string}
              onChange={(e: string) => {
                let isValid = true;
                try {
                  // eslint-disable-next-line no-new
                  new RegExp(e);
                } catch (err) {
                  isValid = false;
                }

                setNewFilter({ string: e, valid: isValid });
              }}
              placeholder="Enter regex string"
            />
            <StyledButton
              type="submit"
              disabled={newFilter.string === '' || newFilter.valid === false}
              onClick={() => {
                dispatch(appendPlaybackFilter({ filter: newFilter.string, enabled: true }));
                settings.setSync(
                  'playbackFilters',
                  config.playback.filters.concat({
                    filter: newFilter,
                    enabled: true,
                  })
                );
                setNewFilter({ string: '', valid: false });
              }}
            >
              Add
            </StyledButton>
          </StyledInputGroup>
        </Form>

        <ListViewTable
          data={config.playback.filters || []}
          autoHeight
          columns={playbackFilterColumns}
          rowHeight={35}
          fontSize={12}
          listType="column"
          cacheImages={{ enabled: false }}
          playQueue={playQueue}
          multiSelect={multiSelect}
          isModal={false}
          miniView={false}
          disableContextMenu
          disableRowClick
          handleRowClick={() => {}}
          handleRowDoubleClick={() => {}}
          config={[]}
        />
      </StyledPanel>
    </ConfigPanel>
  );
};

export default PlayerConfig;
