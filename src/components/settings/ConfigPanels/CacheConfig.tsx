import React, { useState, useEffect } from 'react';
import settings from 'electron-settings';
import fs from 'fs';
import path from 'path';
import { InputGroup, Button, Tag, Message, Icon } from 'rsuite';
import { ConfigPanel } from '../styled';
import { StyledInput, StyledCheckbox } from '../../shared/styled';
import { getSongCachePath, getImageCachePath } from '../../../shared/utils';

const fsUtils = require('nodejs-fs-utils');

const CacheConfig = () => {
  const [imgCacheSize, setImgCacheSize] = useState(0);
  const [songCacheSize, setSongCacheSize] = useState(0);
  const [isEditingCachePath, setIsEditingCachePath] = useState(false);
  const [newCachePath, setNewCachePath] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [cacheSongs, setCacheSongs] = useState(
    Boolean(settings.getSync('cacheSongs'))
  );
  const [cacheImages, setCacheImages] = useState(
    Boolean(settings.getSync('cacheImages'))
  );

  useEffect(() => {
    // Retrieve cache sizes on render
    try {
      setImgCacheSize(
        Number(
          (fsUtils.fsizeSync(getImageCachePath()) / 1000 / 1000).toFixed(0)
        )
      );

      setSongCacheSize(
        Number((fsUtils.fsizeSync(getSongCachePath()) / 1000 / 1000).toFixed(0))
      );
    } catch (err) {
      setImgCacheSize(0);
      setSongCacheSize(0);
      fs.mkdirSync(getSongCachePath(), { recursive: true });
      fs.mkdirSync(getImageCachePath(), { recursive: true });
    }
  }, []);

  return (
    <ConfigPanel header="Cache" bordered>
      {errorMessage !== '' && (
        <>
          <Message showIcon type="error" description={errorMessage} />
          <br />
        </>
      )}
      <p>
        Songs are cached only when playback for the track fully completes and
        ends. Skipping to the next or previous track after only partially
        completing the track will not begin the caching process.
      </p>
      <br />
      {isEditingCachePath && (
        <>
          <InputGroup>
            <StyledInput
              value={newCachePath}
              onChange={(e: string) => setNewCachePath(e)}
            />
            <InputGroup.Button
              onClick={() => {
                const check = fs.existsSync(newCachePath);
                if (check) {
                  settings.setSync('cachePath', newCachePath);
                  fs.mkdirSync(getSongCachePath(), { recursive: true });
                  fs.mkdirSync(getImageCachePath(), { recursive: true });
                  setErrorMessage('');
                  return setIsEditingCachePath(false);
                }

                return setErrorMessage(
                  `Path: ${newCachePath} not found. Enter a valid path.`
                );
              }}
            >
              <Icon icon="check" />
            </InputGroup.Button>
            <InputGroup.Button
              onClick={() => {
                setIsEditingCachePath(false);
                setErrorMessage('');
              }}
            >
              <Icon icon="close" />
            </InputGroup.Button>
          </InputGroup>
          <p style={{ fontSize: 'smaller' }}>
            *You will need to manually move any existing cached files to their
            new location.
          </p>
        </>
      )}
      {!isEditingCachePath && (
        <div style={{ overflow: 'auto' }}>
          Location:{' '}
          <code>
            {path.join(
              String(settings.getSync('cachePath')),
              'sonixdCache',
              String(localStorage.getItem('serverBase64'))
            )}
          </code>
        </div>
      )}
      <div style={{ width: '300px', marginTop: '20px' }}>
        <StyledCheckbox
          defaultChecked={cacheSongs}
          onChange={() => {
            settings.setSync('cacheSongs', !settings.getSync('cacheSongs'));
            setCacheSongs(!cacheSongs);
          }}
        >
          Songs{' '}
          <Tag>
            {songCacheSize} MB{' '}
            {imgCacheSize === 9999999 && '- Folder not found'}
          </Tag>
        </StyledCheckbox>
        <StyledCheckbox
          defaultChecked={cacheImages}
          onChange={() => {
            settings.setSync('cacheImages', !settings.getSync('cacheImages'));
            setCacheImages(!cacheImages);
          }}
        >
          Images{' '}
          <Tag>
            {imgCacheSize} MB {imgCacheSize === 9999999 && '- Folder not found'}
          </Tag>
        </StyledCheckbox>
        <br />
        <Button onClick={() => setIsEditingCachePath(true)}>
          Edit cache location
        </Button>
      </div>
    </ConfigPanel>
  );
};

export default CacheConfig;
