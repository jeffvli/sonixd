import React from 'react';
import { useHistory } from 'react-router-dom';
import { Sidenav, Nav, Icon } from 'rsuite';
import { useAppSelector } from '../../redux/hooks';
import { FixedSidebar, SidebarNavItem } from './styled';

const Sidebar = ({
  expand,
  handleToggle,
  handleSidebarSelect,
  disableSidebar,
  font,
  ...rest
}: any) => {
  const history = useHistory();

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
              tabIndex={0}
              eventKey="discover"
              icon={<Icon icon="dashboard" />}
              onSelect={handleSidebarSelect}
              disabled={disableSidebar}
              onKeyDown={(e: any) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  history.push('/');
                }
              }}
            >
              Dashboard
            </SidebarNavItem>
            <SidebarNavItem
              tabIndex={0}
              eventKey="nowplaying"
              icon={<Icon icon="music" />}
              onSelect={handleSidebarSelect}
              disabled={disableSidebar}
              onKeyDown={(e: any) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  history.push('/nowplaying');
                }
              }}
            >
              Now Playing
            </SidebarNavItem>
            <SidebarNavItem
              tabIndex={0}
              eventKey="playlists"
              icon={<Icon icon="list-ul" />}
              onSelect={handleSidebarSelect}
              disabled={disableSidebar}
              onKeyDown={(e: any) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  history.push('/playlist');
                }
              }}
            >
              Playlists
            </SidebarNavItem>
            <SidebarNavItem
              tabIndex={0}
              eventKey="starred"
              icon={<Icon icon="heart" />}
              onSelect={handleSidebarSelect}
              disabled={disableSidebar}
              onKeyDown={(e: any) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  history.push('/starred');
                }
              }}
            >
              Favorites
            </SidebarNavItem>
            <SidebarNavItem
              tabIndex={0}
              eventKey="albums"
              icon={<Icon icon="book2" />}
              onSelect={handleSidebarSelect}
              disabled={disableSidebar}
              onKeyDown={(e: any) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  history.push('/library/album');
                }
              }}
            >
              Albums
            </SidebarNavItem>
            <SidebarNavItem
              tabIndex={0}
              eventKey="artists"
              icon={<Icon icon="people-group" />}
              onSelect={handleSidebarSelect}
              disabled={disableSidebar}
              onKeyDown={(e: any) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  history.push('/library/artist');
                }
              }}
            >
              Artists
            </SidebarNavItem>
            <SidebarNavItem
              tabIndex={0}
              eventKey="genres"
              icon={<Icon icon="globe2" />}
              onSelect={handleSidebarSelect}
              disabled={disableSidebar}
              onKeyDown={(e: any) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  history.push('/library/genre');
                }
              }}
            >
              Genres
            </SidebarNavItem>
            {useAppSelector((state) => state.config).serverType !== 'funkwhale' && (
              <>
                <SidebarNavItem
                  tabIndex={0}
                  eventKey="folders"
                  icon={<Icon icon="folder-open" />}
                  onSelect={handleSidebarSelect}
                  disabled={disableSidebar}
                  onKeyDown={(e: any) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      history.push('/library/folder');
                    }
                  }}
                >
                  Folders
                </SidebarNavItem>
              </>
            )}
          </Nav>
          <Nav>
            <SidebarNavItem
              tabIndex={0}
              eventKey="config"
              icon={<Icon icon="gear-circle" />}
              onSelect={handleSidebarSelect}
              disabled={disableSidebar}
              onKeyDown={(e: any) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  history.push('/config');
                }
              }}
            >
              Config
            </SidebarNavItem>
            <SidebarNavItem
              tabIndex={0}
              icon={<Icon icon={expand ? 'arrow-left' : 'arrow-right'} />}
              onSelect={handleToggle}
              disabled={disableSidebar}
              onKeyDown={(e: any) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  handleToggle();
                }
              }}
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
