import React, { useState, useEffect } from 'react';
import settings from 'electron-settings';
import { shell } from 'electron';
import fs from 'fs';
import path from 'path';
import { Message, Icon, ButtonToolbar, Whisper } from 'rsuite';
import { useTranslation } from 'react-i18next';
import { ConfigOptionDescription, ConfigPanel } from '../styled';
import {
  StyledInput,
  StyledCheckbox,
  StyledInputGroup,
  StyledLink,
  StyledTag,
  StyledButton,
  StyledInputGroupButton,
} from '../../shared/styled';
import { getSongCachePath, getImageCachePath, getRootCachePath } from '../../../shared/utils';
import { notifyToast } from '../../shared/toast';
import { setMiscSetting } from '../../../redux/miscSlice';
import { useAppDispatch } from '../../../redux/hooks';
import Popup from '../../shared/Popup';

const fsUtils = require('nodejs-fs-utils');

const CacheConfig = ({ bordered }: any) => {
  const { t } = useTranslation();
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
        return notifyToast('error', t('Unable to scan directory: {{err}}', { err }));
      }

      return files.forEach((file) => {
        const songPath = path.join(songCachePath, file);

        // Simple validation
        if (path.extname(songPath) === '.mp3') {
          fs.unlink(songPath, (error) => {
            if (err) {
              return notifyToast('error', t('Unable to clear cache item: {{error}}', { error }));
            }
            return null;
          });
        }
      });
    });
    notifyToast('success', t('Cleared song cache'));
  };

  const handleClearImageCache = (type: 'playlist' | 'album' | 'artist' | 'folder') => {
    const imageCachePath = getImageCachePath();
    fs.readdir(imageCachePath, (err, files) => {
      if (err) {
        return notifyToast('error', t('Unable to scan directory: {{err}}', { err }));
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
              return notifyToast('error', t('Unable to clear cache item: {{error}}', { error }));
            }
            return null;
          });
        }
      });
    });
    notifyToast('success', t('Cleared {{type}} image cache', { type }));
  };

  return (
    <ConfigPanel bordered={bordered} header={t('Cache')}>
      {errorMessage !== '' && (
        <>
          <Message showIcon type="error" description={errorMessage} />
          <br />
        </>
      )}
      <ConfigOptionDescription>
        {t(
          'Songs are cached only when playback for the track fully completes and ends. Skipping to the next or previous track after only partially completing the track will not begin the caching process.'
        )}
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

                return setErrorMessage(
                  t('Path: {{newCachePath}} not found. Enter a valid path.', {
                    newCachePath,
                  })
                );
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
              {t('Reset to default')}
            </StyledInputGroupButton>
          </StyledInputGroup>
          <p style={{ fontSize: 'smaller' }}>
            {t('*You will need to manually move any existing cached files to their new location.')}
          </p>
        </>
      )}
      {!isEditingCachePath && (
        <>
          {t('Location:')}{' '}
          <div style={{ overflow: 'none' }}>
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
          {t('Songs')}{' '}
          <StyledTag>
            {songCacheSize} MB {imgCacheSize === 9999999 && t('- Folder not found')}
          </StyledTag>
        </StyledCheckbox>
        <StyledCheckbox
          defaultChecked={cacheImages}
          onChange={(_v: any, e: boolean) => {
            settings.setSync('cacheImages', e);
            setCacheImages(e);
          }}
        >
          {t('Images')}{' '}
          <StyledTag>
            {imgCacheSize} MB {imgCacheSize === 9999999 && t('- Folder not found')}
          </StyledTag>
        </StyledCheckbox>
      </div>
      <br />
      <ButtonToolbar>
        <StyledButton onClick={() => setIsEditingCachePath(true)}>
          {t('Edit cache location')}
        </StyledButton>
        <Whisper
          trigger="click"
          placement="autoVertical"
          speaker={
            <Popup>
              {t('Which cache would you like to clear?')}
              <ButtonToolbar>
                <StyledButton size="sm" onClick={handleClearSongCache}>
                  {t('Songs')}
                </StyledButton>
                <StyledButton size="sm" onClick={() => handleClearImageCache('playlist')}>
                  {t('Playlist images')}
                </StyledButton>
                <StyledButton size="sm" onClick={() => handleClearImageCache('album')}>
                  {t('Album images')}
                </StyledButton>
                <StyledButton size="sm" onClick={() => handleClearImageCache('artist')}>
                  {t('Artist images')}
                </StyledButton>
                <StyledButton size="sm" onClick={() => handleClearImageCache('folder')}>
                  {t('Folder images')}
                </StyledButton>
              </ButtonToolbar>
            </Popup>
          }
        >
          <StyledButton>{t('Clear cache')}</StyledButton>
        </Whisper>
      </ButtonToolbar>
    </ConfigPanel>
  );
};

export default CacheConfig;
