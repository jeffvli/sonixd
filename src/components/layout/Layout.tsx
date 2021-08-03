import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Container, Sidebar as Sb, Content, Footer } from 'rsuite';
import classNames from 'classnames';

import Sidebar from './Sidebar';
import '../../styles/Layout.global.css';

const Layout = ({ footer, children }: any) => {
  const [expandSidebar, setExpandSidebar] = useState(true);
  const [activeSidebarNav, setActiveSidebarNav] = useState('discover');
  const history = useHistory();

  const handleToggle = () => {
    setExpandSidebar(!expandSidebar);
  };

  const handleSidebarSelect = (e: string) => {
    let route;
    const navItem = String(e);
    setActiveSidebarNav(navItem);
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
      case 'settings':
        route = '/settings';
        break;
      default:
        route = '/';
        break;
    }

    history.push(route);
  };

  const containerSidebarClasses = classNames({
    container__sidebar: true,
    container__sidebar_expanded: expandSidebar === true,
    container__sidebar_shrunk: expandSidebar === false,
  });

  const containerRootClasses = classNames({
    container__root: true,
    container__root_expanded: expandSidebar === true,
    container__root_shrunk: expandSidebar === false,
  });

  return (
    <>
      <Sidebar
        expand={expandSidebar}
        handleToggle={handleToggle}
        active={activeSidebarNav}
        handleSidebarSelect={handleSidebarSelect}
      />
      <Container id="container__root" className={containerRootClasses}>
        <Container id="main" className="container__main">
          <Content id="content" className="container__content">
            {children}
          </Content>
        </Container>
        <Footer id="footer" className="container__footer">
          Footer{footer}
        </Footer>
      </Container>
    </>
  );
};

export default Layout;
