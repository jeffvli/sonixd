import React from 'React';
import classNames from 'classnames';
import { Sidebar as Sb, Sidenav, Dropdown, Nav, Icon } from 'rsuite';
import '../../styles/Sidebar.global.css';

const Sidebar = ({
  expand,
  handleToggle,
  active,
  handleSidebarSelect,
}: any) => {
  const sidebarClasses = classNames({
    sidebar__main: true,
    sidebar__main_expanded: expand === true,
  });

  const containerSidebarClasses = classNames({
    container__sidebar: true,
    container__sidebar_expanded: expand === true,
    container__sidebar_shrunk: expand === false,
  });

  const sidebarExpanderClasses = classNames({
    sidebar__expander_true: expand === true,
    sidebar__expander_false: expand === false,
  });

  return (
    <Sb
      id="sidebar"
      className="container__sidebar"
      width={expand ? 193 : 56}
      collapsible
    >
      <Sidenav
        className={sidebarClasses}
        expanded={expand}
        appearance="default"
      >
        <Sidenav.Header />
        <Sidenav.Body>
          <Nav>
            <Nav.Item
              active={active === 'discover'}
              eventKey="discover"
              icon={<Icon icon="dashboard" />}
              onSelect={handleSidebarSelect}
            >
              Discover
            </Nav.Item>
            <Nav.Item
              active={active === 'nowplaying'}
              eventKey="nowplaying"
              icon={<Icon icon="music" />}
              onSelect={handleSidebarSelect}
            >
              Now Playing
            </Nav.Item>
            <Nav.Item
              active={active === 'playlists'}
              eventKey="playlists"
              icon={<Icon icon="bookmark" />}
              onSelect={handleSidebarSelect}
            >
              Playlists
            </Nav.Item>
            <Nav.Item
              active={active === 'starred'}
              eventKey="starred"
              icon={<Icon icon="star" />}
              onSelect={handleSidebarSelect}
            >
              Starred
            </Nav.Item>
            <Dropdown
              placement="rightStart"
              eventKey="library"
              title="Library"
              noCaret
              icon={<Icon icon="book2" />}
            >
              <Dropdown.Item
                active={active === 'library-1'}
                eventKey="library-1"
                onSelect={handleSidebarSelect}
              >
                Album
              </Dropdown.Item>
              <Dropdown.Item
                active={active === 'library-2'}
                eventKey="library-2"
                onSelect={handleSidebarSelect}
              >
                Artists
              </Dropdown.Item>
              <Dropdown.Item
                active={active === 'library-3'}
                eventKey="library-3"
                onSelect={handleSidebarSelect}
              >
                Genres
              </Dropdown.Item>
              <Dropdown.Item
                active={active === 'library-5'}
                eventKey="library-5"
                onSelect={handleSidebarSelect}
              >
                Podcasts
              </Dropdown.Item>
              <Dropdown.Item
                active={active === 'library-6'}
                eventKey="library-6"
                onSelect={handleSidebarSelect}
              >
                Radio
              </Dropdown.Item>
            </Dropdown>
            <Nav.Item
              active={active === 'settings'}
              eventKey="settings"
              icon={<Icon icon="gear-circle" />}
              onSelect={handleSidebarSelect}
            >
              Config
            </Nav.Item>
            <Nav.Item
              icon={
                <Icon
                  icon={
                    expand ? 'exclamation-triangle' : 'exclamation-triangle'
                  }
                />
              }
              onSelect={handleToggle}
            >
              Toggle Expand
            </Nav.Item>
          </Nav>
        </Sidenav.Body>
      </Sidenav>
    </Sb>
  );
};

export default Sidebar;
