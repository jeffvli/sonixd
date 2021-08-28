import React from 'react';
import { Sidenav, Nav, Icon } from 'rsuite';
import { FixedSidebar } from './styled';

const Sidebar = ({
  expand,
  handleToggle,
  handleSidebarSelect,
  disableSidebar,
}: any) => {
  return (
    <FixedSidebar id="sidebar" width={expand ? 193 : 56} collapsible>
      <Sidenav
        style={{
          height: '100%',
          borderRight: '1px solid #48545c',
        }}
        expanded={expand}
        appearance="default"
      >
        <Sidenav.Header />
        <Sidenav.Body>
          <Nav>
            <Nav.Item
              eventKey="discover"
              icon={<Icon icon="dashboard" />}
              onSelect={handleSidebarSelect}
              disabled={disableSidebar}
            >
              Dashboard
            </Nav.Item>
            <Nav.Item
              eventKey="nowplaying"
              icon={<Icon icon="music" />}
              onSelect={handleSidebarSelect}
              disabled={disableSidebar}
            >
              Now Playing
            </Nav.Item>
            <Nav.Item
              eventKey="starred"
              icon={<Icon icon="star" />}
              onSelect={handleSidebarSelect}
              disabled={disableSidebar}
            >
              Starred
            </Nav.Item>
            <Nav.Item
              eventKey="playlists"
              icon={<Icon icon="bookmark" />}
              onSelect={handleSidebarSelect}
              disabled={disableSidebar}
            >
              Playlists
            </Nav.Item>
            <Nav.Item
              eventKey="library"
              icon={<Icon icon="book2" />}
              onSelect={handleSidebarSelect}
              disabled={disableSidebar}
            >
              Library
            </Nav.Item>
            <Nav.Item
              eventKey="config"
              icon={<Icon icon="gear-circle" />}
              onSelect={handleSidebarSelect}
              disabled={disableSidebar}
            >
              Config
            </Nav.Item>
            <Nav.Item
              icon={<Icon icon={expand ? 'arrow-left' : 'arrow-right'} />}
              onSelect={handleToggle}
              disabled={disableSidebar}
            >
              {expand ? 'Collapse' : 'Expand'}
            </Nav.Item>
          </Nav>
        </Sidenav.Body>
      </Sidenav>
    </FixedSidebar>
  );
};

export default Sidebar;
