import React, { useEffect, useState } from 'react';
import path from 'path';
import settings from 'electron-settings';
import { Button, ControlLabel, InputNumber, Checkbox, Tag, Nav } from 'rsuite';
import { ConfigPanel } from './styled';
import { startScan, getScanStatus } from '../../api/api';
import GenericPage from '../layout/GenericPage';
import DisconnectButton from './DisconnectButton';
import GenericPageHeader from '../layout/GenericPageHeader';
import ListViewConfig from './ListViewConfig';
import {
  songColumnList,
  songColumnPicker,
  albumColumnList,
  albumColumnPicker,
} from './ListViewColumns';

const fsUtils = require('nodejs-fs-utils');

const Config = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [imgCacheSize, setImgCacheSize] = useState(0);
  const [songCacheSize, setSongCacheSize] = useState(0);
  const [currentLAFTab, setCurrentLAFTab] = useState('songList');

  const songCols: any = settings.getSync('songListColumns');
  const albumCols: any = settings.getSync('albumListColumns');
  const currentSongColumns = songCols?.map((column: any) => column.label) || [];
  const currentAlbumColumns =
    albumCols?.map((column: any) => column.label) || [];

  useEffect(() => {
    // Retrieve cache sizes on render
    const rootCacheFolder = path.join(
      path.dirname(settings.file()),
      'sonixdCache',
      `${settings.getSync('serverBase64')}`
    );

    const imgCacheFolder = path.join(rootCacheFolder, 'image');
    const songCacheFolder = path.join(rootCacheFolder, 'song');

    setImgCacheSize(
      Number((fsUtils.fsizeSync(imgCacheFolder) / 1000 / 1000).toFixed(0))
    );

    setSongCacheSize(
      Number((fsUtils.fsizeSync(songCacheFolder) / 1000 / 1000).toFixed(0))
    );
  }, []);

  useEffect(() => {
    // Check scan status on render
    getScanStatus()
      .then((status) => {
        if (status.scanning) {
          return setIsScanning(true);
        }
        setIsScanning(false);
        return setScanProgress(0);
      })
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    // Reload scan status on interval during scan
    if (isScanning) {
      const interval = setInterval(() => {
        getScanStatus()
          .then((status) => {
            if (status.scanning) {
              return setScanProgress(status.count);
            }
            setIsScanning(false);
            return setScanProgress(0);
          })
          .catch((err) => console.log(err));
      }, 1000);

      return () => clearInterval(interval);
    }
    return () => clearInterval();
  }, [isScanning]);

  return (
    <GenericPage
      id="settings"
      header={
        <GenericPageHeader
          title="Config"
          subtitle={
            <>
              <Button
                onClick={async () => {
                  startScan();
                  setIsScanning(true);
                }}
                disabled={isScanning}
              >
                {isScanning ? `Scanning: ${scanProgress}` : 'Scan Library'}
              </Button>
            </>
          }
          sidetitle={<DisconnectButton />}
        />
      }
    >
      <ConfigPanel header="Playback" bordered>
        <p>
          Fading works by polling the audio player on an interval (100ms) to
          determine when to start fading to the next track. Due to this, you may
          notice the fade to be inconsistent occasionally.
        </p>

        <p>
          If the crossfade duration is set to less than or equal to{' '}
          <code>1.5</code>, volume fading will not occur for either track, but
          rather start the fading-in track at full volume. This is to
          tentatively support
          <strong> gapless playback</strong> without fade. Experiment with this
          knowledge to find your comfort zone.
        </p>

        <div style={{ width: '300px', paddingTop: '20px' }}>
          <ControlLabel>Crossfade duration (seconds)</ControlLabel>
          <InputNumber
            defaultValue={String(settings.getSync('fadeDuration')) || '0'}
            step={0.1}
            min={0}
            max={100}
            onChange={(e) => {
              settings.setSync('fadeDuration', e);
            }}
            style={{ width: '150px' }}
          />
        </div>
      </ConfigPanel>
      <ConfigPanel header="Look & Feel" bordered>
        <div>
          Select the columns you want displayed pages with a song list. The
          columns will be displayed in the order selected below.
        </div>
        <Nav
          style={{ paddingTop: '10px' }}
          activeKey={currentLAFTab}
          onSelect={(e) => setCurrentLAFTab(e)}
        >
          <Nav.Item eventKey="songList">Song List</Nav.Item>
          <Nav.Item eventKey="albumList">Album List</Nav.Item>
          <Nav.Item eventKey="playlistList">Playlist List</Nav.Item>
        </Nav>
        {currentLAFTab === 'songList' && (
          <ListViewConfig
            title="Song List"
            defaultColumns={currentSongColumns}
            columnPicker={songColumnPicker}
            columnList={songColumnList}
            settingsConfig={{
              columnList: 'songListColumns',
              rowHeight: 'songListRowHeight',
              fontSize: 'songListFontSize',
            }}
          />
        )}

        {currentLAFTab === 'albumList' && (
          <ListViewConfig
            title="Album List"
            defaultColumns={currentAlbumColumns}
            columnPicker={albumColumnPicker}
            columnList={albumColumnList}
            settingsConfig={{
              columnList: 'albumListColumns',
              rowHeight: 'albumListRowHeight',
              fontSize: 'albumListFontSize',
            }}
          />
        )}
      </ConfigPanel>
      <ConfigPanel header="Cache" bordered>
        <div style={{ overflow: 'auto' }}>
          {path.join(
            path.dirname(settings.file()),
            'sonixdCache',
            `${settings.getSync('serverBase64')}`
          )}
        </div>
        <div style={{ width: '300px', marginTop: '20px' }}>
          <Checkbox
            defaultChecked={Boolean(settings.getSync('cacheSongs'))}
            onChange={() => {
              settings.setSync('cacheSongs', !settings.getSync('cacheSongs'));
            }}
          >
            Songs <Tag>{songCacheSize} MB</Tag>
          </Checkbox>
          <Checkbox
            defaultChecked={Boolean(settings.getSync('cacheImages'))}
            onChange={() => {
              settings.setSync('cacheImages', !settings.getSync('cacheImages'));
            }}
          >
            Images <Tag>{imgCacheSize} MB</Tag>
          </Checkbox>
        </div>
      </ConfigPanel>
    </GenericPage>
  );
};

export default Config;
