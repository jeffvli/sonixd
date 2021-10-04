import React, { useState, useEffect } from 'react';
import settings from 'electron-settings';
import fs from 'fs';
import path from 'path';
import { InputGroup, Button, Tag, Message, Icon, ButtonToolbar, Whisper, Popover } from 'rsuite';
import { ConfigPanel } from '../styled';
import { StyledInput, StyledCheckbox } from '../../shared/styled';
import { getSongCachePath, getImageCachePath } from '../../../shared/utils';
import { notifyToast } from '../../shared/toast';

const fsUtils = require('nodejs-fs-utils');

const CacheConfig = () => {
  const [imgCacheSize, setImgCacheSize] = useState(0);
  const [songCacheSize, setSongCacheSize] = useState(0);
  const [isEditingCachePath, setIsEditingCachePath] = useState(false);
  const [newCachePath, setNewCachePath] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [cacheSongs, setCacheSongs] = useState(Boolean(settings.getSync('cacheSongs')));
  const [cacheImages, setCacheImages] = useState(Boolean(settings.getSync('cacheImages')));

  useEffect(() => {
    // Retrieve cache sizes on render
    try {
      setImgCacheSize(Number((fsUtils.fsizeSync(getImageCachePath()) / 1000 / 1000).toFixed(0)));

      setSongCacheSize(Number((fsUtils.fsizeSync(getSongCachePath()) / 1000 / 1000).toFixed(0)));
    } catch (err) {
      setImgCacheSize(0);
      setSongCacheSize(0);
      fs.mkdirSync(getSongCachePath(), { recursive: true });
      fs.mkdirSync(getImageCachePath(), { recursive: true });
    }
  }, []);

  const handleClearSongCache = () => {
    const songCachePath = getSongCachePath();
    fs.readdir(songCachePath, (err, files) => {
      if (err) {
        return notifyToast('error', `Unable to scan directory: ${err}`);
      }

      return files.forEach((file) => {
        const songPath = path.join(songCachePath, file);

        // Simple validation
        if (path.extname(songPath) === '.mp3') {
          fs.unlink(songPath, (error) => {
            if (err) {
              return notifyToast('error', `Unable to clear cache item: ${error}`);
            }
            return null;
          });
        }
      });
    });
    notifyToast('success', `Cleared song cache`);
  };

  const handleClearImageCache = (type: 'playlist' | 'album' | 'artist') => {
    const imageCachePath = getImageCachePath();
    fs.readdir(imageCachePath, (err, files) => {
      if (err) {
        return notifyToast('error', `Unable to scan directory: ${err}`);
      }

      const selectedFiles =
        type === 'playlist'
          ? files.filter((file) => file.split('_')[0] === 'playlist')
          : type === 'album'
          ? files.filter((file) => file.split('_')[0] === 'album')
          : files.filter((file) => file.split('_')[0] === 'artist');

      return selectedFiles.forEach((file) => {
        const imagePath = path.join(imageCachePath, file);

        // Simple validation
        if (path.extname(imagePath) === '.jpg') {
          fs.unlink(imagePath, (error) => {
            if (err) {
              return notifyToast('error', `Unable to clear cache item: ${error}`);
            }
            return null;
          });
        }
      });
    });
    notifyToast('success', `Cleared ${type} image cache`);
  };

  return (
    <ConfigPanel header="Cache" bordered>
      {errorMessage !== '' && (
        <>
          <Message showIcon type="error" description={errorMessage} />
          <br />
        </>
      )}
      <p>
        Songs are cached only when playback for the track fully completes and ends. Skipping to the
        next or previous track after only partially completing the track will not begin the caching
        process.
      </p>
      <br />
      {isEditingCachePath && (
        <>
          <InputGroup>
            <StyledInput value={newCachePath} onChange={(e: string) => setNewCachePath(e)} />
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

                return setErrorMessage(`Path: ${newCachePath} not found. Enter a valid path.`);
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
            *You will need to manually move any existing cached files to their new location.
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
            {songCacheSize} MB {imgCacheSize === 9999999 && '- Folder not found'}
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
      </div>
      <br />
      <ButtonToolbar>
        <Button onClick={() => setIsEditingCachePath(true)}>Edit cache location</Button>
        <Whisper
          trigger="click"
          placement="autoVertical"
          speaker={
            <Popover>
              Which cache would you like to clear?
              <ButtonToolbar>
                <Button size="sm" onClick={handleClearSongCache}>
                  Songs
                </Button>
                <Button size="sm" onClick={() => handleClearImageCache('playlist')}>
                  Playlist images
                </Button>
                <Button size="sm" onClick={() => handleClearImageCache('album')}>
                  Album images
                </Button>
                <Button size="sm" onClick={() => handleClearImageCache('artist')}>
                  Artist images
                </Button>
              </ButtonToolbar>
            </Popover>
          }
        >
          <Button>Clear cache</Button>
        </Whisper>
      </ButtonToolbar>
    </ConfigPanel>
  );
};

export default CacheConfig;
