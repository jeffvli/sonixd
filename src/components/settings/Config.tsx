import React, { useEffect, useState } from 'react';
import path from 'path';
import settings from 'electron-settings';
import {
  Button,
  ControlLabel,
  InputNumber,
  Checkbox,
  Tag,
  TagPicker,
} from 'rsuite';
import { ConfigPanel } from './styled';
import { startScan, getScanStatus } from '../../api/api';
import GenericPage from '../layout/GenericPage';
import DisconnectButton from './DisconnectButton';
import GenericPageHeader from '../layout/GenericPageHeader';

const fsUtils = require('nodejs-fs-utils');

const columnList = [
  {
    label: '#',
    value: {
      id: '#',
      dataKey: 'index',
      alignment: 'center',
      resizable: true,
      width: 40,
      label: '#',
    },
  },
  {
    label: 'Album',
    value: {
      id: 'Album',
      dataKey: 'album',
      alignment: 'left',
      resizable: true,
      width: 350,
      label: 'Album',
    },
  },
  {
    label: 'Artist',
    value: {
      id: 'Artist',
      dataKey: 'artist',
      alignment: 'left',
      resizable: true,
      width: 300,
      label: 'Artist',
    },
  },
  {
    label: 'Bitrate',
    value: {
      id: 'Bitrate',
      dataKey: 'bitRate',
      alignment: 'left',
      resizable: true,
      width: 65,
      label: 'Bitrate',
    },
  },
  {
    label: 'Created',
    value: {
      id: 'Created',
      dataKey: 'created',
      alignment: 'left',
      resizable: true,
      width: 100,
      label: 'Created',
    },
  },
  {
    label: 'Duration',
    value: {
      id: 'Duration',
      dataKey: 'duration',
      alignment: 'center',
      resizable: true,
      width: 65,
      label: 'Duration',
    },
  },
  {
    label: 'Play Count',
    value: {
      id: 'Plays',
      dataKey: 'playCount',
      alignment: 'center',
      resizable: true,
      width: 50,
      label: 'Play Count',
    },
  },
  {
    label: 'Title',
    value: {
      id: 'Title',
      dataKey: 'title',
      alignment: 'left',
      resizable: true,
      width: 350,
      label: 'Title',
    },
  },
  {
    label: 'Title (Combined)',
    value: {
      id: 'Title',
      dataKey: 'combinedtitle',
      alignment: 'left',
      resizable: true,
      width: 350,
      label: 'Title (Combined)',
    },
  },
];

const columnPicker = [
  {
    label: '#',
  },
  {
    label: 'Album',
  },
  {
    label: 'Artist',
  },
  {
    label: 'Bitrate',
  },
  {
    label: 'Created',
  },
  {
    label: 'Duration',
  },
  {
    label: 'Play Count',
  },
  {
    label: 'Title',
  },
  {
    label: 'Title (Combined)',
  },
];

const Config = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [imgCacheSize, setImgCacheSize] = useState(0);
  const [songCacheSize, setSongCacheSize] = useState(0);

  const cols: any = settings.getSync('songListColumns');
  const currentColumns = cols?.map((column: any) => column.label) || [];

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
        <div style={{ width: '300px', paddingTop: '20px' }}>
          <ControlLabel>Crossfade duration (seconds)</ControlLabel>
          <InputNumber
            defaultValue={String(settings.getSync('fadeDuration')) || '0'}
            step={0.5}
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
          Select the columns you want displayed on all pages with a song list.
          The columns will be displayed in the order selected below.
        </div>
        <div style={{ width: '100%', marginTop: '20px' }}>
          <TagPicker
            data={columnPicker}
            defaultValue={currentColumns}
            style={{ width: '500px' }}
            onChange={(e) => {
              const columns: any[] = [];

              if (e) {
                e.map((selected: string) => {
                  const selectedColumn = columnList.find(
                    (column) => column.label === selected
                  );
                  if (selectedColumn) {
                    return columns.push(selectedColumn.value);
                  }

                  return null;
                });
              }

              settings.setSync('songListColumns', columns);
            }}
            labelKey="label"
            valueKey="label"
          />
          <div style={{ marginTop: '20px' }}>
            <ControlLabel>Row height</ControlLabel>
            <InputNumber
              defaultValue={
                String(settings.getSync('songListRowHeight')) || '0'
              }
              step={1}
              min={30}
              max={100}
              onChange={(e) => {
                settings.setSync('songListRowHeight', e);
              }}
              style={{ width: '150px' }}
            />
          </div>
          <div style={{ marginTop: '20px' }}>
            <ControlLabel>Font Size</ControlLabel>
            <InputNumber
              defaultValue={String(settings.getSync('songListFontSize')) || '0'}
              step={1}
              min={1}
              max={100}
              onChange={(e) => {
                settings.setSync('songListFontSize', e);
              }}
              style={{ width: '150px' }}
            />
          </div>
        </div>
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
