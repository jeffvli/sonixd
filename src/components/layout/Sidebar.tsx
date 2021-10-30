import React from 'react';
import { Sidenav, Nav, Icon } from 'rsuite';
import { FixedSidebar, SidebarNavItem } from './styled';

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
      width={expand ? 165 : 56}
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
            <SidebarNavItem
              eventKey="discover"
              icon={<Icon icon="dashboard" />}
              onSelect={handleSidebarSelect}
              disabled={disableSidebar}
            >
              Dashboard
            </SidebarNavItem>
            <SidebarNavItem
              eventKey="nowplaying"
              icon={<Icon icon="music" />}
              onSelect={handleSidebarSelect}
              disabled={disableSidebar}
            >
              Now Playing
            </SidebarNavItem>
            <SidebarNavItem
              eventKey="playlists"
              icon={<Icon icon="list-ul" />}
              onSelect={handleSidebarSelect}
              disabled={disableSidebar}
            >
              Playlists
            </SidebarNavItem>
            <SidebarNavItem
              eventKey="starred"
              icon={<Icon icon="heart" />}
              onSelect={handleSidebarSelect}
              disabled={disableSidebar}
            >
              Favorites
            </SidebarNavItem>
            <SidebarNavItem
              eventKey="albums"
              icon={<Icon icon="book2" />}
              onSelect={handleSidebarSelect}
              disabled={disableSidebar}
            >
              Albums
            </SidebarNavItem>
            <SidebarNavItem
              eventKey="artists"
              icon={<Icon icon="people-group" />}
              onSelect={handleSidebarSelect}
              disabled={disableSidebar}
            >
              Artists
            </SidebarNavItem>
            <SidebarNavItem
              eventKey="genres"
              icon={<Icon icon="globe2" />}
              onSelect={handleSidebarSelect}
              disabled={disableSidebar}
            >
              Genres
            </SidebarNavItem>
            <SidebarNavItem
              eventKey="folders"
              icon={<Icon icon="folder-open" />}
              onSelect={handleSidebarSelect}
              disabled={disableSidebar}
            >
              Folders
            </SidebarNavItem>
          </Nav>
          <Nav>
            <SidebarNavItem
              eventKey="config"
              icon={<Icon icon="gear-circle" />}
              onSelect={handleSidebarSelect}
              disabled={disableSidebar}
            >
              Config
            </SidebarNavItem>
            <SidebarNavItem
              icon={<Icon icon={expand ? 'arrow-left' : 'arrow-right'} />}
              onSelect={handleToggle}
              disabled={disableSidebar}
            >
              {expand ? 'Collapse' : 'Expand'}
            </SidebarNavItem>
          </Nav>
        </Sidenav.Body>
      </Sidenav>
    </FixedSidebar>
  );
};

export default Sidebar;
