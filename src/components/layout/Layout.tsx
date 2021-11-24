import React, { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useHistory } from 'react-router-dom';
import { ButtonToolbar, Content, FlexboxGrid, Icon, Nav, Whisper } from 'rsuite';
import Sidebar from './Sidebar';
import Titlebar from './Titlebar';
import { RootContainer, RootFooter, MainContainer } from './styled';
import { setContextMenu, setExpandSidebar, setSearchQuery } from '../../redux/miscSlice';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { clearSelected } from '../../redux/multiSelectSlice';
import {
  StyledIconButton,
  StyledInput,
  StyledInputGroup,
  StyledInputGroupButton,
  StyledNavItem,
  StyledPopover,
} from '../shared/styled';

import {
  GridViewConfigPanel,
  ListViewConfigPanel,
} from '../settings/ConfigPanels/LookAndFeelConfig';

const Layout = ({ footer, children, disableSidebar, font }: any) => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const misc = useAppSelector((state) => state.misc);
  const multiSelect = useAppSelector((state) => state.multiSelect);
  const [openSearch, setOpenSearch] = useState(false);
  const [activeConfigNav, setActiveConfigNav] = useState('listView');

  useHotkeys(
    'backspace',
    (e: KeyboardEvent) => {
      e.preventDefault();
      history.goBack();
    },
    []
  );

  useHotkeys('ctrl+f', () => {
    setOpenSearch(true);
    document.getElementById('local-search-input')?.focus();
  });

  const handleToggle = () => {
    dispatch(setExpandSidebar(!misc.expandSidebar));
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

  const handleSearch = (e: string) => {
    dispatch(setSearchQuery(e));
  };

  return (
    <>
      <Titlebar font={font} />
      <Sidebar
        expand={misc.expandSidebar}
        handleToggle={handleToggle}
        handleSidebarSelect={handleSidebarSelect}
        disableSidebar={disableSidebar}
        font={font}
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
        <MainContainer id="container-main" expanded={misc.expandSidebar}>
          <FlexboxGrid
            justify="space-between"
            style={{
              zIndex: 2,
              padding: '0 10px 0 10px',
              margin: '10px 5px 5px 5px',
            }}
          >
            <FlexboxGrid.Item>
              <ButtonToolbar>
                <StyledIconButton
                  appearance="subtle"
                  size="sm"
                  icon={<Icon icon="arrow-circle-left" />}
                  onClick={() => history.goBack()}
                />
                <StyledIconButton
                  appearance="subtle"
                  size="sm"
                  icon={<Icon icon="arrow-circle-right" />}
                  onClick={() => history.goForward()}
                />
              </ButtonToolbar>
            </FlexboxGrid.Item>
            <FlexboxGrid.Item>
              <ButtonToolbar>
                <span style={{ display: 'inline-block' }}>
                  {misc.searchQuery !== '' || openSearch ? (
                    <StyledInputGroup inside>
                      <StyledInput
                        opacity={0.6}
                        size="sm"
                        id="local-search-input"
                        value={misc.searchQuery}
                        onChange={handleSearch}
                        onPressEnter={() => {
                          if (misc.searchQuery.trim()) {
                            history.push(`/search?query=${misc.searchQuery}`);
                          }
                          dispatch(setSearchQuery(''));
                          setOpenSearch(false);
                        }}
                        onKeyDown={(e: KeyboardEvent) => {
                          if (e.key === 'Escape') {
                            dispatch(setSearchQuery(''));
                            setOpenSearch(false);
                          }
                        }}
                        style={{ width: '180px' }}
                      />
                      <StyledInputGroupButton
                        height={30}
                        appearance="subtle"
                        tabIndex={0}
                        onClick={() => {
                          dispatch(setSearchQuery(''));
                          setOpenSearch(false);
                        }}
                        onKeyDown={(e: any) => {
                          if (e.key === ' ' || e.key === 'Enter') {
                            dispatch(setSearchQuery(''));
                            setOpenSearch(false);
                          }
                        }}
                      >
                        <Icon icon="close" />
                      </StyledInputGroupButton>
                    </StyledInputGroup>
                  ) : (
                    <StyledIconButton
                      onClick={() => {
                        setOpenSearch(true);
                        setTimeout(() => {
                          document.getElementById('local-search-input')?.focus();
                        }, 50);
                      }}
                      appearance="subtle"
                      icon={<Icon icon="search" />}
                    />
                  )}
                </span>
                <Whisper
                  speaker={
                    <StyledPopover>
                      <Nav
                        activeKey={activeConfigNav}
                        onSelect={(e) => setActiveConfigNav(e)}
                        appearance="subtle"
                      >
                        <StyledNavItem eventKey="listView">List-View</StyledNavItem>
                        <StyledNavItem eventKey="gridView">Grid-View</StyledNavItem>
                      </Nav>
                      {activeConfigNav === 'listView' && <ListViewConfigPanel />}
                      {activeConfigNav === 'gridView' && <GridViewConfigPanel />}
                    </StyledPopover>
                  }
                  trigger="click"
                  placement="autoVerticalEnd"
                  preventOverflow
                >
                  <StyledIconButton appearance="subtle" icon={<Icon icon="cog" />} />
                </Whisper>
              </ButtonToolbar>
            </FlexboxGrid.Item>
          </FlexboxGrid>

          <Content id="container-content">{children}</Content>
        </MainContainer>
        <RootFooter id="container-footer">{footer}</RootFooter>
      </RootContainer>
    </>
  );
};

export default Layout;
