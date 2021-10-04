import React from 'react';
import { Sidenav, Nav, Icon } from 'rsuite';
import { FixedSidebar } from './styled';

const Sidebar = ({
  expand,
  handleToggle,
  handleSidebarSelect,
  disableSidebar,
  font,
  ...rest
}: any) => {
  return (
    <FixedSidebar
      id="sidebar"
      width={expand ? 193 : 56}
      collapsible
      font={font}
      onClick={rest.onClick}
    >
      <Sidenav
        style={{
          height: '100%',
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
              eventKey="playlists"
              icon={<Icon icon="list-ul" />}
              onSelect={handleSidebarSelect}
              disabled={disableSidebar}
            >
              Playlists
            </Nav.Item>
            <Nav.Item
              eventKey="starred"
              icon={<Icon icon="heart" />}
              onSelect={handleSidebarSelect}
              disabled={disableSidebar}
            >
              Favorites
            </Nav.Item>
            <Nav.Item
              eventKey="albums"
              icon={<Icon icon="book2" />}
              onSelect={handleSidebarSelect}
              disabled={disableSidebar}
            >
              Albums
            </Nav.Item>
            <Nav.Item
              eventKey="artists"
              icon={<Icon icon="people-group" />}
              onSelect={handleSidebarSelect}
              disabled={disableSidebar}
            >
              Artists
            </Nav.Item>
            <Nav.Item
              eventKey="genres"
              icon={<Icon icon="globe2" />}
              onSelect={handleSidebarSelect}
              disabled={disableSidebar}
            >
              Genres
            </Nav.Item>
            <Nav.Item
              eventKey="folders"
              icon={<Icon icon="folder-open" />}
              onSelect={handleSidebarSelect}
              disabled
            >
              Folders
            </Nav.Item>
          </Nav>
          <Nav>
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
