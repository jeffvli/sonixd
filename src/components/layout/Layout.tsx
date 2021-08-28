import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Content } from 'rsuite';
import Sidebar from './Sidebar';
import Titlebar from './Titlebar';
import { RootContainer, RootFooter, MainContainer } from './styled';

const Layout = ({ footer, children, disableSidebar }: any) => {
  const [expandSidebar, setExpandSidebar] = useState(false);
  const history = useHistory();

  const handleToggle = () => {
    setExpandSidebar(!expandSidebar);
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
        route = '/playlists';
        break;
      case 'starred':
        route = '/starred';
        break;
      case 'library':
        route = '/library';
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
      <Titlebar />
      <Sidebar
        expand={expandSidebar}
        handleToggle={handleToggle}
        handleSidebarSelect={handleSidebarSelect}
        disableSidebar={disableSidebar}
      />
      <RootContainer id="container-root">
        <MainContainer id="container-main" expanded={expandSidebar}>
          <Content id="container-content">{children}</Content>
        </MainContainer>
        <RootFooter id="container-footer">{footer}</RootFooter>
      </RootContainer>
    </>
  );
};

export default Layout;
