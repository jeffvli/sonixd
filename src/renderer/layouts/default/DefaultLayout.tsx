import { useCallback, useEffect, useMemo, useState } from 'react';
import throttle from 'lodash/throttle';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import { Playerbar } from 'renderer/features/player';
import { Titlebar } from 'renderer/features/titlebar';
import { WindowControls } from 'renderer/features/window-controls';
import { constrainSidebarWidth } from './utils/constrainSidebarWidth';

const LayoutContainer = styled.div`
  display: grid;
  grid-template-areas:
    'main'
    'playerbar';
  grid-template-rows: auto 90px;
  grid-template-columns: 1fr;
  gap: 0px 0px;
  height: 100%;
`;

const MainContainer = styled.div`
  display: grid;
  grid-area: main;
  grid-template-areas:
    'sidebar content'
    'sidebar content'
    'sidebar content';
  grid-template-rows: 1fr 1fr;
  grid-template-columns: 0.2fr auto;
  gap: 0px 0px;
`;

const PlayerbarContainer = styled.div`
  grid-area: playerbar;
  background: var(--playerbar-bg);
  border-top: var(--playerbar-border-top);
`;

const SidebarContainer = styled.div`
  position: relative;
  display: flex;
  grid-area: sidebar;
  background: var(--sidebar-bg);
`;

const ContentContainer = styled.div`
  grid-area: content;
  max-height: calc(100vh - 90px - 35px); // Playerbar and Titlebar heights
  overflow-y: auto;
  background: var(--content-bg);
`;

const PageContentContainer = styled.div`
  padding: 0 1rem 1rem;
`;

const TitlebarContainer = styled.div`
  width: 100%;
  height: 55px;
  padding: 0 1rem;
  display: flex;
  align-content: center;
`;

const ResizeHandle = styled.span<{ $isResizing: boolean }>`
  position: absolute;
  right: 0;
  width: 3px;
  height: 100%;
  border-right: 1px var(--sidebar-handle-bg) solid;
  opacity: ${(props) => (props.$isResizing ? 1 : 0)};

  &:hover {
    cursor: col-resize;
    opacity: 1;
  }
`;

export const DefaultLayout = () => {
  const [isResizing, setIsResizing] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(150);

  const handleResizeStart = (e: any) => {
    e.preventDefault();
    setIsResizing(true);
    document.body.style.cursor = 'col-resize';
  };

  const handleResizeEnd = useCallback((e: MouseEvent) => {
    e.preventDefault();
    setIsResizing(false);
    document.body.style.cursor = 'default';
  }, []);

  const handleResizeMove = useMemo(() => {
    const throttled = throttle(
      (e: MouseEvent) => setSidebarWidth(constrainSidebarWidth(e.clientX)),
      25
    );
    return (e: MouseEvent) => throttled(e);
  }, []);

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

  return (
    <>
      <LayoutContainer>
        <MainContainer
          style={{ gridTemplateColumns: `${sidebarWidth}px auto` }}
        >
          <SidebarContainer>
            <ResizeHandle
              $isResizing={isResizing}
              role="none"
              onMouseDown={handleResizeStart}
            />
          </SidebarContainer>
          <ContentContainer>
            <TitlebarContainer>
              <Titlebar />
            </TitlebarContainer>
            <PageContentContainer>
              <Outlet />
            </PageContentContainer>
          </ContentContainer>
        </MainContainer>
        <PlayerbarContainer>
          <Playerbar />
        </PlayerbarContainer>
      </LayoutContainer>
      <WindowControls />
    </>
  );
};
