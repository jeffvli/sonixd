import React from 'react';
import { useHistory } from 'react-router-dom';
import { ButtonToolbar, Content, FlexboxGrid, Icon } from 'rsuite';
import Sidebar from './Sidebar';
import Titlebar from './Titlebar';
import { RootContainer, RootFooter, MainContainer } from './styled';
import { setContextMenu, setExpandSidebar } from '../../redux/miscSlice';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { clearSelected } from '../../redux/multiSelectSlice';
import { StyledIconButton } from '../shared/styled';

const Layout = ({ footer, children, disableSidebar, font }: any) => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const misc = useAppSelector((state) => state.misc);
  const multiSelect = useAppSelector((state) => state.multiSelect);

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
          </FlexboxGrid>

          <Content id="container-content">{children}</Content>
        </MainContainer>
        <RootFooter id="container-footer">{footer}</RootFooter>
      </RootContainer>
    </>
  );
};

export default Layout;
