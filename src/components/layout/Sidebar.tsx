import React from 'react';
import { Sidenav, Nav, Icon } from 'rsuite';
import { FixedSidebar } from './styled';

const Sidebar = ({ expand, handleToggle, handleSidebarSelect }: any) => {
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
            >
              Dashboard
            </Nav.Item>
            <Nav.Item
              eventKey="nowplaying"
              icon={<Icon icon="music" />}
              onSelect={handleSidebarSelect}
            >
              Now Playing
            </Nav.Item>
            <Nav.Item
              eventKey="starred"
              icon={<Icon icon="star" />}
              onSelect={handleSidebarSelect}
            >
              Starred
            </Nav.Item>
            <Nav.Item
              eventKey="playlists"
              icon={<Icon icon="bookmark" />}
              onSelect={handleSidebarSelect}
            >
              Playlists
            </Nav.Item>
            <Nav.Item
              eventKey="library"
              icon={<Icon icon="book2" />}
              onSelect={handleSidebarSelect}
            >
              Library
            </Nav.Item>
            <Nav.Item
              eventKey="settings"
              icon={<Icon icon="gear-circle" />}
              onSelect={handleSidebarSelect}
            >
              Config
            </Nav.Item>
            <Nav.Item
              icon={<Icon icon={expand ? 'arrow-left' : 'arrow-right'} />}
              onSelect={handleToggle}
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
