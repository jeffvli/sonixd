import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Container, Content, Footer } from 'rsuite';
import classNames from 'classnames';
import Sidebar from './Sidebar';
import '../../styles/Layout.global.css';
import Titlebar from './Titlebar';

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
      case 'starred':
        route = '/starred';
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

  const containerRootClasses = classNames({
    container__root: true,
    container__root_expanded: expandSidebar === true,
    container__root_shrunk: expandSidebar === false,
  });

  return (
    <>
      <Titlebar />
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
        {footer && (
          <Footer id="footer" className="container__footer">
            {footer}
          </Footer>
        )}
      </Container>
    </>
  );
};

export default Layout;
