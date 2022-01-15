import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { shell } from 'electron';
import { Whisper, Nav, ButtonToolbar } from 'rsuite';
import { useTranslation } from 'react-i18next';
import GenericPage from '../layout/GenericPage';
import DisconnectButton from './DisconnectButton';
import GenericPageHeader from '../layout/GenericPageHeader';
import setDefaultSettings from '../shared/setDefaultSettings';
import { StyledButton, StyledNavItem, StyledPopover } from '../shared/styled';
import PlaybackConfig from './ConfigPanels/PlaybackConfig';
import LookAndFeelConfig from './ConfigPanels/LookAndFeelConfig';
import PlayerConfig from './ConfigPanels/PlayerConfig';
import CacheConfig from './ConfigPanels/CacheConfig';
import AdvancedConfig from './ConfigPanels/AdvancedConfig';
import WindowConfig from './ConfigPanels/WindowConfig';
import packageJson from '../../package.json';
import ServerConfig from './ConfigPanels/ServerConfig';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setActive } from '../../redux/configSlice';
import { apiController } from '../../api/controller';
import ExternalConfig from './ConfigPanels/ExternalConfig';

const GITHUB_RELEASE_URL = 'https://api.github.com/repos/jeffvli/sonixd/releases?per_page=3';

const Config = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const config = useAppSelector((state) => state.config);
  const folder = useAppSelector((state) => state.folder);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [latestRelease, setLatestRelease] = useState(packageJson.version);
  const showWindowConfig = process.platform === 'darwin';

  useEffect(() => {
    const fetchReleases = async () => {
      const releases = await axios.get(GITHUB_RELEASE_URL);
      setLatestRelease(releases.data[0]?.name);
    };

    fetchReleases();
  }, []);

  useEffect(() => {
    // Check scan status on render
    apiController({ serverType: config.serverType, endpoint: 'getScanStatus' })
      .then((status) => {
        if (status.scanning) {
          return setIsScanning(true);
        }
        setIsScanning(false);
        return setScanProgress(0);
      })
      .catch((err) => console.log(err));
  }, [config.serverType]);

  useEffect(() => {
    // Reload scan status on interval during scan
    if (isScanning) {
      const interval = setInterval(() => {
        apiController({ serverType: config.serverType, endpoint: 'getScanStatus' })
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
  }, [config.serverType, isScanning]);

  return (
    <GenericPage
      padding="20px"
      hideDivider
      id="settings"
      header={
        <GenericPageHeader
          title={t('Config')}
          subtitle={
            <>
              <Nav
                activeKey={config.active.tab}
                onSelect={(e) => dispatch(setActive({ ...config.active, tab: e }))}
              >
                <StyledNavItem
                  eventKey="playback"
                  onKeyDown={(e: any) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      dispatch(setActive({ ...config.active, tab: 'playback' }));
                    }
                  }}
                >
                  {t('Playback')}
                </StyledNavItem>
                <StyledNavItem
                  eventKey="lookandfeel"
                  onKeyDown={(e: any) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      dispatch(setActive({ ...config.active, tab: 'lookandfeel' }));
                    }
                  }}
                >
                  {t('Look & Feel')}
                </StyledNavItem>
                <StyledNavItem
                  eventKey="other"
                  onKeyDown={(e: any) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      dispatch(setActive({ ...config.active, tab: 'other' }));
                    }
                  }}
                >
                  {t('Other')}
                </StyledNavItem>
              </Nav>
            </>
          }
          sidetitle={<DisconnectButton />}
          subsidetitle={
            <ButtonToolbar>
              <>
                <StyledButton
                  size="sm"
                  onClick={async () => {
                    apiController({
                      serverType: config.serverType,
                      endpoint: 'startScan',
                      args: { musicFolderId: folder.musicFolder },
                    });
                    setIsScanning(true);
                  }}
                  disabled={isScanning}
                >
                  {isScanning ? `${scanProgress}` : t('Scan')}
                </StyledButton>
              </>
              <Whisper
                trigger="click"
                placement="auto"
                speaker={
                  <StyledPopover title={t('Confirm')}>
                    <div>{t('Are you sure you want to reset your settings to default?')}</div>
                    <strong>{t('WARNING: This will reload the application')}</strong>
                    <div>
                      <StyledButton
                        id="reset-submit-button"
                        size="sm"
                        onClick={() => {
                          setDefaultSettings(true);
                          window.location.reload();
                        }}
                        appearance="primary"
                      >
                        {t('Yes')}
                      </StyledButton>
                    </div>
                  </StyledPopover>
                }
              >
                <StyledButton size="sm">{t('Reset defaults')}</StyledButton>
              </Whisper>
              <Whisper
                trigger="hover"
                placement="bottomEnd"
                enterable
                preventOverflow
                speaker={
                  <StyledPopover>
                    <>
                      {t('Current version:')} {packageJson.version}
                      <br />
                      {t('Latest version:')} {latestRelease}
                      <br />
                      Node: {process.versions.node}
                      <br />
                      Chrome: {process.versions.chrome}
                      <br />
                      Electron: {process.versions.electron}
                      <StyledButton
                        size="xs"
                        block
                        appearance="primary"
                        onClick={() => shell.openExternal('https://github.com/jeffvli/sonixd')}
                      >
                        {t('View on GitHub')}
                      </StyledButton>
                      <StyledButton
                        size="xs"
                        block
                        appearance="primary"
                        onClick={() =>
                          shell.openExternal(
                            'https://github.com/jeffvli/sonixd/blob/main/CHANGELOG.md'
                          )
                        }
                      >
                        {t('View CHANGELOG')}
                      </StyledButton>
                    </>
                  </StyledPopover>
                }
              >
                <StyledButton
                  size="sm"
                  color={packageJson.version === latestRelease ? undefined : 'green'}
                >
                  v{packageJson.version}
                </StyledButton>
              </Whisper>
            </ButtonToolbar>
          }
        />
      }
    >
      {(config.active.tab === 'playback' || '') && (
        <>
          <PlaybackConfig bordered />
          <PlayerConfig bordered />
        </>
      )}

      {config.active.tab === 'lookandfeel' && <LookAndFeelConfig bordered />}

      {config.active.tab === 'other' && (
        <>
          <ServerConfig bordered />
          <CacheConfig bordered />
          {!showWindowConfig && <WindowConfig bordered />}
          <ExternalConfig bordered />
          <AdvancedConfig bordered />
        </>
      )}
    </GenericPage>
  );
};

export default Config;
