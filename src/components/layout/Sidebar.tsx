import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { StyledButton } from '../shared/styled';
import { InfoModal } from '../modal/Modal';
import placeholderImg from '../../img/placeholder.png';
import SidebarPlaylists from './SidebarPlaylists';
import { setSidebar } from '../../redux/configSlice';
import { settings } from '../shared/setDefaultSettings';

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
  const [width, setWidth] = useState(Number(config.lookAndFeel.sidebar.width.replace('px', '')));
  const [isResizing, setIsResizing] = useState(false);
  const [showCoverArtModal, setShowCoverArtModal] = useState(false);
  const [throttledWidth, setThrottledWidth] = useState(
    Number(config.lookAndFeel.sidebar.width.replace('px', ''))
  );
  const [mainNavRef, { height: mainNavHeight }] = useMeasure<HTMLDivElement>();
  const [sidebarBodyRef, { height: sidebarBodyHeight }] = useMeasure<HTMLDivElement>();

  const getSidebarWidth = useCallback((num: number) => {
    if (num < 165) {
      return 165;
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
        const finalWidth = `${getSidebarWidth(e?.clientX)}px`;
        dispatch(setSidebar({ width: finalWidth }));
        settings.set('sidebar.width', finalWidth);
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
          {expand && config.lookAndFeel.sidebar.coverArt && (
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
                  settings.set('sidebar.coverArt', false);
                }}
              >
                <Icon icon="down" />
              </StyledButton>
            </SidebarCoverArtContainer>
          )}

          <Sidenav.Body
            style={{
              height: expand
                ? `calc(100% - ${config.lookAndFeel.sidebar.coverArt ? width : 0}px)`
                : '100%',
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
                    $show={config.lookAndFeel.sidebar.selected.includes('dashboard')}
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
                    $show={config.lookAndFeel.sidebar.selected.includes('nowplaying')}
                  >
                    {t('Now Playing')}
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
                    $show={config.lookAndFeel.sidebar.selected.includes('playlists')}
                  >
                    {t('Playlists')}
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
                    $show={config.lookAndFeel.sidebar.selected.includes('favorites')}
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
                      $show={config.lookAndFeel.sidebar.selected.includes('songs')}
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
                    $show={config.lookAndFeel.sidebar.selected.includes('albums')}
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
                    $show={config.lookAndFeel.sidebar.selected.includes('artists')}
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
                    $show={config.lookAndFeel.sidebar.selected.includes('genres')}
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
                        $show={config.lookAndFeel.sidebar.selected.includes('folders')}
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
                    $show={config.lookAndFeel.sidebar.selected.includes('config')}
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
                    $show={config.lookAndFeel.sidebar.selected.includes('collapse')}
                  >
                    {expand ? t('Collapse') : t('Expand')}
                  </SidebarNavItem>
                </div>
              </Nav>
              {expand &&
                !disableSidebar &&
                config.lookAndFeel.sidebar.selected.includes('playlistList') && (
                  <div
                    style={{
                      height: `${
                        sidebarBodyHeight - mainNavHeight < 100
                          ? 100
                          : sidebarBodyHeight - mainNavHeight
                      }px`,
                      overflow: 'hidden',
                      overflowY: 'auto',
                    }}
                  >
                    <>
                      <PlaylistDivider />
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
