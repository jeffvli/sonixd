import React, { useState } from 'react';
import settings from 'electron-settings';
import { useHotkeys } from 'react-hotkeys-hook';
import { useHistory } from 'react-router-dom';
import { ButtonToolbar, Content, FlexboxGrid, Icon, Nav, Whisper } from 'rsuite';
import { useTranslation } from 'react-i18next';
import Sidebar from './Sidebar';
import Titlebar from './Titlebar';
import { RootContainer, RootFooter, MainContainer } from './styled';
import { setContextMenu } from '../../redux/miscSlice';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { clearSelected } from '../../redux/multiSelectSlice';
import { StyledButton, StyledNavItem } from '../shared/styled';
import {
  GridViewConfigPanel,
  ListViewConfigPanel,
  PaginationConfigPanel,
  ThemeConfigPanel,
} from '../settings/ConfigPanels/LookAndFeelConfig';
import PlaybackConfig from '../settings/ConfigPanels/PlaybackConfig';
import PlayerConfig from '../settings/ConfigPanels/PlayerConfig';
import ServerConfig from '../settings/ConfigPanels/ServerConfig';
import CacheConfig from '../settings/ConfigPanels/CacheConfig';
import WindowConfig from '../settings/ConfigPanels/WindowConfig';
import AdvancedConfig from '../settings/ConfigPanels/AdvancedConfig';
import { setSidebar } from '../../redux/configSlice';
import SearchBar from '../search/SearchBar';
import Popup from '../shared/Popup';

const Layout = ({ footer, children, disableSidebar, font }: any) => {
  const { t } = useTranslation();
  const history = useHistory();
  const dispatch = useAppDispatch();
  const misc = useAppSelector((state) => state.misc);
  const config = useAppSelector((state) => state.config);
  const multiSelect = useAppSelector((state) => state.multiSelect);

  const [activeConfigNav, setActiveConfigNav] = useState('listView');

  useHotkeys(
    'backspace',
    (e: KeyboardEvent) => {
      e.preventDefault();
      history.goBack();
    },
    []
  );

  const handleToggle = () => {
    settings.setSync('sidebar.expand', !config.lookAndFeel.sidebar.expand);
    dispatch(setSidebar({ expand: !config.lookAndFeel.sidebar.expand }));
  };

  const handleSidebarSelect = (e: string) => {
    let route;
    const navItem = String(e);
    switch (navItem) {
      case 'discover':
        route = '/';
        break;
      case 'nowplaying':
        route = '/nowplaying';
        break;
      case 'playlists':
        route = '/playlist';
        break;
      case 'starred':
        route = '/starred';
        break;
      case 'albums':
        route = '/library/album';
        break;
      case 'music':
        route = '/library/music';
        break;
      case 'artists':
        route = '/library/artist';
        break;
      case 'genres':
        route = '/library/genre';
        break;
      case 'folders':
        route = '/library/folder';
        break;
      case 'config':
        route = '/config';
        break;
      default:
        route = '/';
        break;
    }

    history.push(route);
  };

  return (
    <>
      <Titlebar font={font} />
      <Sidebar
        expand={config.lookAndFeel.sidebar.expand}
        handleToggle={handleToggle}
        handleSidebarSelect={handleSidebarSelect}
        disableSidebar={disableSidebar}
        font={font}
        titleBar={misc.titleBar}
        onClick={() => {
          if (misc.contextMenu.show === true) {
            dispatch(
              setContextMenu({
                show: false,
              })
            );
          }
          if (multiSelect.selected.length > 0 && !multiSelect.isSelectDragging) {
            dispatch(clearSelected());
          }
        }}
      />
      <RootContainer
        id="container-root"
        font={font}
        onClick={() => {
          if (misc.contextMenu.show === true) {
            dispatch(
              setContextMenu({
                show: false,
              })
            );
          }
        }}
      >
        <MainContainer
          id="container-main"
          expanded={config.lookAndFeel.sidebar.expand}
          sidebarwidth={config.lookAndFeel.sidebar.width}
          $titleBar={misc.titleBar} // transient prop to determine margin
        >
          <FlexboxGrid
            justify="space-between"
            style={{
              zIndex: 2,
              padding: '0 10px 0 10px',
              margin: '10px 5px 5px 5px',
            }}
          >
            {!disableSidebar && (
              <>
                <FlexboxGrid.Item>
                  <ButtonToolbar aria-label="history">
                    <StyledButton
                      aria-label="back"
                      appearance="subtle"
                      size="sm"
                      onClick={() => history.goBack()}
                    >
                      <Icon icon="arrow-left-line" />
                    </StyledButton>
                    <StyledButton
                      aria-label="next"
                      appearance="subtle"
                      size="sm"
                      onClick={() => history.goForward()}
                    >
                      <Icon icon="arrow-right-line" />
                    </StyledButton>
                  </ButtonToolbar>
                </FlexboxGrid.Item>
                <FlexboxGrid.Item>
                  <ButtonToolbar>
                    <SearchBar />
                    <Whisper
                      speaker={
                        <Popup
                          style={{
                            width: '620px',
                            maxHeight: '80vh',
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            padding: '0px',
                          }}
                        >
                          <Nav
                            activeKey={activeConfigNav}
                            onSelect={(e) => setActiveConfigNav(e)}
                            appearance="tabs"
                          >
                            <StyledNavItem eventKey="listView">{t('List View')}</StyledNavItem>
                            <StyledNavItem eventKey="gridView">{t('Grid View')}</StyledNavItem>
                            <StyledNavItem eventKey="playback">{t('Playback')}</StyledNavItem>
                            <StyledNavItem eventKey="player">{t('Player')}</StyledNavItem>
                            <StyledNavItem eventKey="theme">{t('Theme')}</StyledNavItem>
                            <StyledNavItem eventKey="server">{t('Server')}</StyledNavItem>
                            <StyledNavItem eventKey="other">{t('Other')}</StyledNavItem>
                          </Nav>
                          {activeConfigNav === 'listView' && <ListViewConfigPanel />}
                          {activeConfigNav === 'gridView' && <GridViewConfigPanel />}
                          {activeConfigNav === 'playback' && <PlaybackConfig />}
                          {activeConfigNav === 'player' && <PlayerConfig />}
                          {activeConfigNav === 'theme' && <ThemeConfigPanel />}
                          {activeConfigNav === 'server' && <ServerConfig />}
                          {activeConfigNav === 'other' && (
                            <>
                              <PaginationConfigPanel />
                              <CacheConfig />
                              <WindowConfig />
                              <AdvancedConfig />
                            </>
                          )}
                        </Popup>
                      }
                      trigger="click"
                      placement="bottomEnd"
                      preventOverflow
                    >
                      <StyledButton aria-label="settings" appearance="subtle">
                        <Icon icon="cog" />
                      </StyledButton>
                    </Whisper>
                  </ButtonToolbar>
                </FlexboxGrid.Item>
              </>
            )}
          </FlexboxGrid>

          <Content id="container-content" role="main">
            {children}
          </Content>
        </MainContainer>
        <RootFooter id="container-footer">{footer}</RootFooter>
      </RootContainer>
    </>
  );
};

export default Layout;
