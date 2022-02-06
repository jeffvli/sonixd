import React, { useCallback, useEffect, useMemo, useState } from 'react';
import settings from 'electron-settings';
import useMeasure from 'react-use/lib/useMeasure';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { Sidenav, Nav, Icon } from 'rsuite';
import _ from 'lodash';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { Server } from '../../types';
import {
  FixedSidebar,
  PlaylistDivider,
  SidebarCoverArtContainer,
  SidebarDragContainer,
  SidebarNavItem,
} from './styled';
import { setSidebar } from '../../redux/miscSlice';
import { StyledButton } from '../shared/styled';
import { InfoModal } from '../modal/PageModal';
import placeholderImg from '../../img/placeholder.png';
import SidebarPlaylists from './SidebarPlaylists';

const Sidebar = ({
  expand,
  handleToggle,
  handleSidebarSelect,
  disableSidebar,
  font,
  titleBar,
  ...rest
}: any) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const history = useHistory();
  const playQueue = useAppSelector((state) => state.playQueue);
  const config = useAppSelector((state) => state.config);
  const misc = useAppSelector((state) => state.misc);
  const [width, setWidth] = useState(Number(misc.sidebar.width.replace('px', '')));
  const [isResizing, setIsResizing] = useState(false);
  const [showCoverArtModal, setShowCoverArtModal] = useState(false);
  const [throttledWidth, setThrottledWidth] = useState(
    Number(misc.sidebar.width.replace('px', ''))
  );
  const [mainNavRef, { height: mainNavHeight }] = useMeasure<HTMLDivElement>();
  const [sidebarBodyRef, { height: sidebarBodyHeight }] = useMeasure<HTMLDivElement>();

  const getSidebarWidth = useCallback((num: number) => {
    if (num < 160) {
      return 160;
    }

    if (num > 400) {
      return 400;
    }

    return num;
  }, []);

  const handleResizeMove = useMemo(() => {
    const throttled = _.throttle((e: MouseEvent) => setThrottledWidth(e.clientX), 25);
    return (e: MouseEvent) => throttled(e);
  }, []);

  const handleResizeEnd = useCallback(
    (e: MouseEvent) => {
      if (isResizing) {
        dispatch(setSidebar({ width: `${getSidebarWidth(e?.clientX)}px` }));
        setIsResizing(false);
        document.body.style.cursor = 'default';
      }
    },
    [dispatch, getSidebarWidth, isResizing]
  );

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [handleResizeEnd, isResizing, handleResizeMove]);

  useEffect(() => {
    setWidth(getSidebarWidth(throttledWidth));
  }, [dispatch, getSidebarWidth, throttledWidth]);

  return (
    <>
      <FixedSidebar
        id="sidebar"
        width={expand ? `${width}px` : 56}
        font={font}
        $titleBar={titleBar} // transient prop to determine position
        onClick={rest.onClick}
      >
        <Sidenav style={{ height: '100%' }} expanded={expand} appearance="default">
          {expand && misc.sidebar.coverArt && (
            <SidebarCoverArtContainer height={`${width}px`}>
              <LazyLoadImage
                onClick={() => setShowCoverArtModal(true)}
                src={
                  playQueue.current?.image.replace(
                    /&size=\d+|width=\d+&height=\d+&quality=\d+/,
                    ''
                  ) || placeholderImg
                }
              />
              <StyledButton
                size="xs"
                onClick={() => {
                  dispatch(setSidebar({ coverArt: false }));
                  settings.setSync('sidebar.coverArt', false);
                }}
              >
                <Icon icon="down" />
              </StyledButton>
            </SidebarCoverArtContainer>
          )}

          <Sidenav.Body
            style={{
              height: expand ? `calc(100% - ${misc.sidebar.coverArt ? width : 0}px)` : '100%',
              overflowY: 'auto',
            }}
          >
            <div ref={sidebarBodyRef} style={{ height: '100%' }}>
              {expand && (
                <SidebarDragContainer
                  $resizing={isResizing}
                  onMouseDown={() => {
                    setIsResizing(true);
                    document.body.style.cursor = 'w-resize';
                  }}
                />
              )}

              <Nav>
                <div ref={mainNavRef}>
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
                    {t('Dashboard')}
                  </SidebarNavItem>
                  <SidebarNavItem
                    tabIndex={0}
                    eventKey="nowplaying"
                    icon={<Icon icon="headphones" />}
                    onSelect={handleSidebarSelect}
                    disabled={disableSidebar}
                    onKeyDown={(e: any) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        history.push('/nowplaying');
                      }
                    }}
                  >
                    {t('Now Playing')}
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
                    {t('Favorites')}
                  </SidebarNavItem>
                  {config.serverType === Server.Jellyfin && (
                    <SidebarNavItem
                      tabIndex={0}
                      eventKey="music"
                      icon={<Icon icon="music" />}
                      onSelect={handleSidebarSelect}
                      disabled={disableSidebar}
                      onKeyDown={(e: any) => {
                        if (e.key === ' ' || e.key === 'Enter') {
                          history.push('/library/music');
                        }
                      }}
                    >
                      Songs
                    </SidebarNavItem>
                  )}
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
                    {t('Albums')}
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
                    {t('Artists')}
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
                    {t('Genres')}
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
                        {t('Folders')}
                      </SidebarNavItem>
                    </>
                  )}
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
                    {t('Config')}
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
                    {expand ? t('Collapse') : t('Expand')}
                  </SidebarNavItem>
                  {!expand && (
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
                      {t('Playlists')}
                    </SidebarNavItem>
                  )}
                </div>
              </Nav>
              {expand && !disableSidebar && (
                <div
                  style={{
                    height: `${
                      sidebarBodyHeight - mainNavHeight < 170
                        ? 170
                        : sidebarBodyHeight - mainNavHeight
                    }px`,
                    overflow: 'hidden',
                    overflowY: 'auto',
                  }}
                >
                  <>
                    <PlaylistDivider onClick={() => history.push('/playlist')}>
                      {t('Playlists')}
                    </PlaylistDivider>
                    <SidebarPlaylists width={width} />
                  </>
                </div>
              )}
            </div>
          </Sidenav.Body>
        </Sidenav>
      </FixedSidebar>
      <InfoModal show={showCoverArtModal} handleHide={() => setShowCoverArtModal(false)}>
        <LazyLoadImage
          src={
            playQueue.current?.image.replace(/&size=\d+|width=\d+&height=\d+&quality=\d+/, '') ||
            placeholderImg
          }
          style={{
            width: 'auto',
            height: 'auto',
            minHeight: '50vh',
            maxHeight: '70vh',
            maxWidth: '95vw',
          }}
        />
      </InfoModal>
    </>
  );
};

export default Sidebar;
