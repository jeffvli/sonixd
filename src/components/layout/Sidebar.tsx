import React from 'react';
import { Sidenav, Nav, Icon, Dropdown } from 'rsuite';
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
              icon={<Icon icon="heart" />}
              onSelect={handleSidebarSelect}
              disabled={disableSidebar}
            >
              Favorites
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
              eventKey="folders"
              icon={<Icon icon="folder-open" />}
              onSelect={handleSidebarSelect}
              disabled={disableSidebar}
            >
              Folders
            </Nav.Item>
            <Dropdown
              placement="rightStart"
              eventKey="library"
              title="Library"
              icon={<Icon icon="book2" />}
            >
              <Dropdown.Item eventKey="albums" onSelect={handleSidebarSelect}>
                Albums
              </Dropdown.Item>
              <Dropdown.Item eventKey="artists" onSelect={handleSidebarSelect}>
                Artists
              </Dropdown.Item>
              <Dropdown.Item eventKey="genres" onSelect={handleSidebarSelect}>
                Genres
              </Dropdown.Item>
            </Dropdown>
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
