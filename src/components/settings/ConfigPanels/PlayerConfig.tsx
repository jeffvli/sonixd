import React, { useEffect, useRef, useState } from 'react';
import { ipcRenderer, shell } from 'electron';
import settings from 'electron-settings';
import { Form, Whisper } from 'rsuite';
import { WhisperInstance } from 'rsuite/lib/Whisper';
import i18next from 'i18next';
import { Trans, useTranslation } from 'react-i18next';
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
  StyledPopover,
  StyledToggle,
} from '../../shared/styled';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { setPlaybackSetting } from '../../../redux/playQueueSlice';
import ListViewTable from '../../viewtypes/ListViewTable';
import { appendPlaybackFilter, setAudioDeviceId } from '../../../redux/configSlice';
import { notifyToast } from '../../shared/toast';
import ConfigOption from '../ConfigOption';
import { Server } from '../../../types';
import { isWindows, isWindows10 } from '../../../shared/utils';

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
    // eslint-disable-next-line react-hooks/rules-of-hooks
    label: i18next.t('Filter'),
  },
  {
    id: 'Enabled',
    dataKey: 'filterEnabled',
    alignment: 'left',
    resizable: false,
    width: 100,
    // eslint-disable-next-line react-hooks/rules-of-hooks
    label: i18next.t('Enabled'),
  },
  {
    id: 'Delete',
    dataKey: 'filterDelete',
    alignment: 'left',
    resizable: false,
    width: 100,
    // eslint-disable-next-line react-hooks/rules-of-hooks
    label: i18next.t('Delete'),
  },
];

const PlayerConfig = ({ bordered }: any) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const playQueue = useAppSelector((state) => state.playQueue);
  const multiSelect = useAppSelector((state) => state.multiSelect);
  const config = useAppSelector((state) => state.config);
  const [newFilter, setNewFilter] = useState({ string: '', valid: false });
  const [transcode, setTranscode] = useState(Boolean(settings.getSync('transcode')));
  const [globalMediaHotkeys, setGlobalMediaHotkeys] = useState(
    Boolean(settings.getSync('globalMediaHotkeys'))
  );
  const [systemMediaTransportControls, setSystemMediaTransportControls] = useState(
    Boolean(settings.getSync('systemMediaTransportControls'))
  );
  const [scrobble, setScrobble] = useState(Boolean(settings.getSync('scrobble')));
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>();
  const audioDevicePickerContainerRef = useRef(null);
  const transcodingRestartWhisper = useRef<WhisperInstance>();

  useEffect(() => {
    settings.setSync('playbackFilters', config.playback.filters);
  }, [config.playback.filters]);

  useEffect(() => {
    const getAudioDevices = () => {
      getAudioDevice()
        .then((dev) => setAudioDevices(dev))
        .catch(() => notifyToast('error', t('Error fetching audio devices')));
    };

    getAudioDevices();
  }, [t]);

  return (
    <ConfigPanel bordered={bordered} header={t('Player')}>
      <ConfigOption
        name={t('Audio Device')}
        description={t(
          'The audio device for Sonixd. Leaving this blank will use the system default.'
        )}
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
              placeholder={t('Select')}
              onChange={(e: string) => {
                dispatch(setAudioDeviceId(e));
                settings.setSync('audioDeviceId', e);
              }}
            />
          </StyledInputPickerContainer>
        }
      />
      <ConfigOption
        name={t('Seek Forward')}
        description={t(
          'The number in seconds the player will skip forwards when clicking the seek forward button.'
        )}
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
        name={t('Seek Backward')}
        description={t(
          'The number in seconds the player will skip backwards when clicking the seek backward button.'
        )}
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

      {config.serverType === Server.Jellyfin && (
        <ConfigOption
          name={t('Allow Transcoding')}
          description={t(
            'If your audio files are not playing properly or are not in a supported web streaming format, you will need to enable this (requires app restart).'
          )}
          option={
            <>
              <Whisper
                ref={transcodingRestartWhisper}
                trigger="none"
                placement="auto"
                speaker={
                  <StyledPopover title={t('Restart?')}>
                    <div>{t('Do you want to restart the application now?')}</div>
                    <strong>{t('This is highly recommended!')}</strong>
                    <div>
                      <StyledButton
                        id="titlebar-restart-button"
                        size="sm"
                        onClick={() => {
                          ipcRenderer.send('reload');
                        }}
                        appearance="primary"
                      >
                        {t('Yes')}
                      </StyledButton>
                    </div>
                  </StyledPopover>
                }
              >
                <StyledToggle
                  defaultChecked={transcode}
                  checked={transcode}
                  onChange={(e: boolean) => {
                    settings.setSync('transcode', e);
                    setTranscode(e);
                    transcodingRestartWhisper.current?.open();
                  }}
                />
              </Whisper>
            </>
          }
        />
      )}

      <ConfigOption
        name={t('Global Media Hotkeys')}
        description={
          <Trans>
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
          </Trans>
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

                settings.setSync('systemMediaTransportControls', !e);
                setSystemMediaTransportControls(!e);
                ipcRenderer.send('disableSystemMediaTransportControls');
              } else {
                ipcRenderer.send('disableGlobalHotkeys');
              }
            }}
          />
        }
      />

      {isWindows() && isWindows10() && (
        <ConfigOption
          name={t('Windows System Media Transport Controls')}
          description={
            <>
              {t(
                'Enable or disable the Windows System Media Transport Controls (play/pause, next, previous, stop). This will show the Windows Media Popup (Windows 10 only) when pressing a media key. This feauture will override the Global Media Hotkeys option.'
              )}
            </>
          }
          option={
            <StyledToggle
              defaultChecked={systemMediaTransportControls}
              checked={systemMediaTransportControls}
              onChange={(e: boolean) => {
                settings.setSync('systemMediaTransportControls', e);
                setSystemMediaTransportControls(e);
                if (e) {
                  ipcRenderer.send('enableSystemMediaTransportControls');

                  settings.setSync('globalMediaHotkeys', !e);
                  setGlobalMediaHotkeys(!e);
                  ipcRenderer.send('disableGlobalHotkeys');
                } else {
                  ipcRenderer.send('disableSystemMediaTransportControls');
                }
              }}
            />
          }
        />
      )}

      <ConfigOption
        name={t('Scrobble')}
        description={t(
          'Send player updates to your server. This is required by servers such as Jellyfin and Navidrome to track play counts and use external services such as Last.fm.'
        )}
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
      <ConfigOptionName>{t('Track Filters')}</ConfigOptionName>
      <ConfigOptionDescription>
        {t(
          'Filter out tracks based on regex string(s) by their title when adding to the queue. Adding by double-clicking a track will ignore all filters for that one track.'
        )}
      </ConfigOptionDescription>
      <br />
      <StyledPanel bodyFill>
        <Form fluid>
          <StyledInputGroup>
            <StyledInput
              style={{ width: 'auto' }}
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
              placeholder={t('Enter regex string')}
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
              {t('Add')}
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
