import React, { useEffect, useState } from 'react';
import getFolderSize from 'get-folder-size';
import path from 'path';
import settings from 'electron-settings';
import { Button, ControlLabel, InputNumber, Checkbox, Tag } from 'rsuite';
import { ConfigPanel } from './styled';
import { startScan, getScanStatus } from '../../api/api';
import GenericPage from '../layout/GenericPage';
import DisconnectButton from './DisconnectButton';
import GenericPageHeader from '../layout/GenericPageHeader';

const Config = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [imgCacheSize, setImgCacheSize] = useState(0);
  const [songCacheSize, setSongCacheSize] = useState(0);

  useEffect(() => {
    // Retrieve cache sizes on render
    const rootCacheFolder = path.join(
      path.dirname(settings.file()),
      'sonixdCache',
      `${settings.getSync('serverBase64')}`
    );

    const imageCacheFolder = path.join(rootCacheFolder, 'image');
    const songCacheFolder = path.join(rootCacheFolder, 'song');

    getFolderSize
      .loose(imageCacheFolder)
      .then((size: number) =>
        setImgCacheSize(Number((size / 1000 / 1000).toFixed(0)))
      )
      .catch((err: any) => console.log(err));

    getFolderSize
      .loose(songCacheFolder)
      .then((size: number) =>
        setSongCacheSize(Number((size / 1000 / 1000).toFixed(0)))
      )
      .catch((err: any) => console.log(err));
  });

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
      <ConfigPanel header="Cache" bordered>
        <div style={{ overflow: 'auto' }}>
          {path.join(
            path.dirname(settings.file()),
            'sonixdCache',
            `${settings.getSync('serverBase64')}`
          )}
        </div>
        <div style={{ width: '300px', paddingTop: '20px' }}>
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
