import React, { useEffect, useState } from 'react';
import { Button, Whisper, Popover, Nav, ButtonToolbar } from 'rsuite';
import { startScan, getScanStatus } from '../../api/api';
import GenericPage from '../layout/GenericPage';
import DisconnectButton from './DisconnectButton';
import GenericPageHeader from '../layout/GenericPageHeader';
import setDefaultSettings from '../shared/setDefaultSettings';
import { StyledButton, StyledNavItem } from '../shared/styled';
import PlaybackConfig from './ConfigPanels/PlaybackConfig';
import LookAndFeelConfig from './ConfigPanels/LookAndFeelConfig';
import PlayerConfig from './ConfigPanels/PlayerConfig';
import CacheConfig from './ConfigPanels/CacheConfig';
import DebugConfig from './ConfigPanels/DebugConfig';
import useRouterQuery from '../../hooks/useRouterQuery';

const Config = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const query = useRouterQuery();
  const [page, setPage] = useState(query.get('page') || 'playback');

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
              <Nav activeKey={page} onSelect={(e) => setPage(e)}>
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
                {isScanning ? `Scanning: ${scanProgress}` : 'Scan Library'}
              </StyledButton>
              <Whisper
                trigger="click"
                placement="auto"
                speaker={
                  <Popover title="Confirm">
                    <div>Are you sure you want to reset your settings to default?</div>
                    <div>
                      <Button
                        id="reset-submit-button"
                        size="sm"
                        onClick={() => {
                          setDefaultSettings(true);
                          window.location.reload();
                        }}
                        appearance="link"
                      >
                        Yes
                      </Button>
                      <strong>WARNING: This will reload the application</strong>
                    </div>
                  </Popover>
                }
              >
                <StyledButton size="sm">Reset defaults</StyledButton>
              </Whisper>
            </ButtonToolbar>
          }
        />
      }
    >
      {page === 'playback' && (
        <>
          <PlaybackConfig />
          <PlayerConfig />
        </>
      )}

      {page === 'lookandfeel' && <LookAndFeelConfig />}

      {page === 'other' && (
        <>
          <CacheConfig />
          <DebugConfig />
        </>
      )}
    </GenericPage>
  );
};

export default Config;
