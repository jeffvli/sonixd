import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { shell } from 'electron';
import { Whisper, Nav, ButtonToolbar } from 'rsuite';
import { startScan, getScanStatus } from '../../api/api';
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

const GITHUB_RELEASE_URL = 'https://api.github.com/repos/jeffvli/sonixd/releases?per_page=3';

const Config = () => {
  const dispatch = useAppDispatch();
  const config = useAppSelector((state) => state.config);
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
              <Nav
                activeKey={config.active.tab}
                onSelect={(e) => dispatch(setActive({ ...config.active, tab: e }))}
              >
                <StyledNavItem eventKey="playback">Playback</StyledNavItem>
                <StyledNavItem eventKey="lookandfeel">Look & Feel</StyledNavItem>
                <StyledNavItem eventKey="other">Other</StyledNavItem>
              </Nav>
            </>
          }
          sidetitle={<DisconnectButton />}
          subsidetitle={
            <ButtonToolbar>
              <StyledButton
                size="sm"
                onClick={async () => {
                  startScan();
                  setIsScanning(true);
                }}
                disabled={isScanning}
              >
                {isScanning ? `${scanProgress}` : 'Scan'}
              </StyledButton>
              <Whisper
                trigger="click"
                placement="auto"
                speaker={
                  <StyledPopover title="Confirm">
                    <div>Are you sure you want to reset your settings to default?</div>
                    <strong>WARNING: This will reload the application</strong>
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
                        Yes
                      </StyledButton>
                    </div>
                  </StyledPopover>
                }
              >
                <StyledButton size="sm">Reset defaults</StyledButton>
              </Whisper>
              <Whisper
                trigger="hover"
                placement="auto"
                enterable
                preventOverflow
                speaker={
                  <StyledPopover>
                    <>
                      Current version: {packageJson.version}
                      <br />
                      Latest version: {latestRelease}
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
                        View on GitHub
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
                        View CHANGELOG
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
          <PlaybackConfig />
          <PlayerConfig />
        </>
      )}

      {config.active.tab === 'lookandfeel' && <LookAndFeelConfig />}

      {config.active.tab === 'other' && (
        <>
          <ServerConfig />
          <CacheConfig />
          {!showWindowConfig && <WindowConfig />}
          <AdvancedConfig />
        </>
      )}
    </GenericPage>
  );
};

export default Config;
