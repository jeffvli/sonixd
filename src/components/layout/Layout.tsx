import React from 'react';
import { useHistory } from 'react-router-dom';
import { Content } from 'rsuite';
import Sidebar from './Sidebar';
import Titlebar from './Titlebar';
import { RootContainer, RootFooter, MainContainer } from './styled';
import { setContextMenu, setExpandSidebar } from '../../redux/miscSlice';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { clearSelected } from '../../redux/multiSelectSlice';

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
        route = '/folder';
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
          if (
            multiSelect.selected.length > 0 &&
            !multiSelect.isSelectDragging
          ) {
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
          <Content id="container-content">{children}</Content>
        </MainContainer>
        <RootFooter id="container-footer">{footer}</RootFooter>
      </RootContainer>
    </>
  );
};

export default Layout;
