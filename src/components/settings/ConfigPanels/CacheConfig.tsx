import React, { useState, useEffect } from 'react';
import settings from 'electron-settings';
import { shell } from 'electron';
import fs from 'fs';
import path from 'path';
import { Message, Icon, ButtonToolbar, Whisper } from 'rsuite';
import { ConfigOptionDescription, ConfigPanel } from '../styled';
import {
  StyledInput,
  StyledCheckbox,
  StyledInputGroup,
  StyledLink,
  StyledPopover,
  StyledTag,
  StyledButton,
  StyledInputGroupButton,
} from '../../shared/styled';
import { getSongCachePath, getImageCachePath, getRootCachePath } from '../../../shared/utils';
import { notifyToast } from '../../shared/toast';
import { setMiscSetting } from '../../../redux/miscSlice';
import { useAppDispatch } from '../../../redux/hooks';

const fsUtils = require('nodejs-fs-utils');

const CacheConfig = () => {
  const dispatch = useAppDispatch();
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

  const handleClearImageCache = (type: 'playlist' | 'album' | 'artist' | 'folder') => {
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
          : type === 'folder'
          ? files.filter((file) => file.split('_')[0] === 'folder')
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
    <ConfigPanel header="Cache">
      {errorMessage !== '' && (
        <>
          <Message showIcon type="error" description={errorMessage} />
          <br />
        </>
      )}
      <ConfigOptionDescription>
        Songs are cached only when playback for the track fully completes and ends. Skipping to the
        next or previous track after only partially completing the track will not begin the caching
        process.
      </ConfigOptionDescription>
      <br />
      {isEditingCachePath && (
        <>
          <StyledInputGroup>
            <StyledInput value={newCachePath} onChange={(e: string) => setNewCachePath(e)} />
            <StyledInputGroupButton
              onClick={() => {
                const check = fs.existsSync(newCachePath);
                if (check) {
                  settings.setSync('cachePath', newCachePath);
                  fs.mkdirSync(getSongCachePath(), { recursive: true });
                  fs.mkdirSync(getImageCachePath(), { recursive: true });
                  dispatch(
                    setMiscSetting({ setting: 'imageCachePath', value: getImageCachePath() })
                  );
                  dispatch(setMiscSetting({ setting: 'songCachePath', value: getSongCachePath() }));
                  setErrorMessage('');
                  return setIsEditingCachePath(false);
                }

                return setErrorMessage(`Path: ${newCachePath} not found. Enter a valid path.`);
              }}
            >
              <Icon icon="check" />
            </StyledInputGroupButton>
            <StyledInputGroupButton
              onClick={() => {
                setIsEditingCachePath(false);
                setErrorMessage('');
              }}
            >
              <Icon icon="close" />
            </StyledInputGroupButton>
            <StyledInputGroupButton
              onClick={() => {
                const defaultPath = path.join(path.dirname(settings.file()));
                settings.setSync('cachePath', defaultPath);
                dispatch(setMiscSetting({ setting: 'imageCachePath', value: getImageCachePath() }));
                dispatch(setMiscSetting({ setting: 'songCachePath', value: getSongCachePath() }));
                setErrorMessage('');
                return setIsEditingCachePath(false);
              }}
            >
              Reset to default
            </StyledInputGroupButton>
          </StyledInputGroup>
          <p style={{ fontSize: 'smaller' }}>
            *You will need to manually move any existing cached files to their new location.
          </p>
        </>
      )}
      {!isEditingCachePath && (
        <>
          Location:{' '}
          <div style={{ overflow: 'auto' }}>
            <StyledLink onClick={() => shell.openPath(getRootCachePath())}>
              {getRootCachePath()} <Icon icon="external-link" />
            </StyledLink>
          </div>
        </>
      )}
      <div style={{ width: '300px', marginTop: '20px' }}>
        <StyledCheckbox
          defaultChecked={cacheSongs}
          onChange={(_v: any, e: boolean) => {
            settings.setSync('cacheSongs', e);
            setCacheSongs(e);
          }}
        >
          Songs{' '}
          <StyledTag>
            {songCacheSize} MB {imgCacheSize === 9999999 && '- Folder not found'}
          </StyledTag>
        </StyledCheckbox>
        <StyledCheckbox
          defaultChecked={cacheImages}
          onChange={(_v: any, e: boolean) => {
            settings.setSync('cacheImages', e);
            setCacheImages(e);
          }}
        >
          Images{' '}
          <StyledTag>
            {imgCacheSize} MB {imgCacheSize === 9999999 && '- Folder not found'}
          </StyledTag>
        </StyledCheckbox>
      </div>
      <br />
      <ButtonToolbar>
        <StyledButton onClick={() => setIsEditingCachePath(true)}>Edit cache location</StyledButton>
        <Whisper
          trigger="click"
          placement="autoVertical"
          speaker={
            <StyledPopover>
              Which cache would you like to clear?
              <ButtonToolbar>
                <StyledButton size="sm" onClick={handleClearSongCache}>
                  Songs
                </StyledButton>
                <StyledButton size="sm" onClick={() => handleClearImageCache('playlist')}>
                  Playlist images
                </StyledButton>
                <StyledButton size="sm" onClick={() => handleClearImageCache('album')}>
                  Album images
                </StyledButton>
                <StyledButton size="sm" onClick={() => handleClearImageCache('artist')}>
                  Artist images
                </StyledButton>
                <StyledButton size="sm" onClick={() => handleClearImageCache('folder')}>
                  Folder images
                </StyledButton>
              </ButtonToolbar>
            </StyledPopover>
          }
        >
          <StyledButton>Clear cache</StyledButton>
        </Whisper>
      </ButtonToolbar>
    </ConfigPanel>
  );
};

export default CacheConfig;
