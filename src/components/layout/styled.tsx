import React from 'react';
import styled from 'styled-components';
import { Container, Content, Footer, Header, Nav, Sidebar } from 'rsuite';

// Layout.tsx
export const RootContainer = styled(Container)<{ font: string }>`
  background: ${(props) => props.theme.colors.layout.page.background};
  height: 100vh;
  color: ${(props) => props.theme.colors.layout.page.color};
  font-size: ${(props) => `${props.theme.fonts.size.page} !important`};
  font-family: ${(props) => `${props.font?.split(/Light|Medium/)[0]}`};
  font-weight: ${(props) =>
    props.font?.match('Light') ? 300 : props.font?.match('Medium') ? 500 : 400};
`;

interface ContainerProps {
  id: string;
  expanded: boolean;
  children: any;
}

const StyledContainer = ({ id, expanded, children, ...props }: ContainerProps) => (
  <Container {...props}>{children}</Container>
);

export const MainContainer = styled(StyledContainer)`
  padding-left: ${(props) => (props.expanded ? '165px' : '56px')};
  height: calc(100% - 32px);
  margin-top: 32px;
  overflow-y: auto;
`;

export const RootFooter = styled(Footer)`
  height: 98px;
`;

// Titlebar.tsx
// Subtract 2px from width if you add window border
export const TitleHeader = styled.header<{ font: string }>`
  z-index: 1;
  display: block;
  position: fixed;
  height: 32px;
  width: ${(props) => (props.className?.includes('maximized') ? '100%' : 'calc(100%)')};
  background: ${(props) => props.theme.colors.layout.titleBar.background};
  padding: 4px;
  color: ${(props) => props.theme.colors.layout.titleBar.color};
  font-family: ${(props) => `${props.font?.split(/Light|Medium/)[0]}`};
  font-weight: ${(props) =>
    props.font?.match('Light') ? 300 : props.font?.match('Medium') ? 500 : 400};
`;

export const DragRegion = styled.div`
  width: 100%;
  height: 100%;
  -webkit-app-region: drag;

  > #window-title {
    margin-left: 12px;
  }
`;

export const WindowControl = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 46px);
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;

  -webkit-app-region: no-drag;
`;

export const MacControl = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 30px);
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;

  -webkit-app-region: no-drag;
`;

export const MacControlButton = styled.div<{
  minButton?: boolean;
  maxButton?: boolean;
  restoreButton?: boolean;
}>`
  user-select: none;
  grid-row: 1 / span 1;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  grid-column: ${(props) => (props.minButton ? 2 : props.maxButton || props.restoreButton ? 3 : 1)};
`;

export const WindowControlButton = styled.div<{
  minButton?: boolean;
  maxButton?: boolean;
  restoreButton?: boolean;
}>`
  user-select: none;
  grid-row: 1 / span 1;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  grid-column: ${(props) => (props.minButton ? 1 : props.maxButton || props.restoreButton ? 2 : 3)};

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  &:active {
    background: rgba(255, 255, 255, 0.2);
  }
`;

// GenericPage.tsx
export const PageContainer = styled(Container)<{ $backgroundSrc?: string }>`
  height: 100%;
  overflow-x: hidden;

  ${(props) =>
    props.$backgroundSrc &&
    `
    &:before {
      content: '';
      position: fixed;
      left: 0;
      right: 0;

      display: block;
      background-image: ${props.$backgroundSrc ? `url(${props.$backgroundSrc})` : undefined};
      transition: background-image 1s ease-in-out;

      width: 100%;
      height: calc(100% - 130px);
      background-position: center;
      background-repeat: no-repeat;
      background-size: cover;
      opacity: 0.3;

      filter: blur(50px) brightness(0.8);
  }
  `}
`;

export const PageHeader = styled(Header)<{ padding?: string }>`
  padding: ${(props) => (props.padding ? props.padding : '10px 20px 0px 20px')};
  z-index: 1;
`;

export const PageContent = styled(Content)<{ padding?: string }>`
  position: relative;
  padding: ${(props) => (props.padding ? props.padding : '10px')};
`;

// Sidebar.tsx
// Add 1 to top if you add window border
export const FixedSidebar = styled(Sidebar)<{ font: string }>`
  background: ${(props) => props.theme.colors.layout.sideBar.background} !important;
  position: fixed;
  top: 32px;
  z-index: 1;
  height: calc(100% - 130px);
  font-family: ${(props) => `${props.font?.split(/Light|Medium/)[0]}`};
  font-weight: ${(props) =>
    props.font?.match('Light') ? 300 : props.font?.match('Medium') ? 500 : 400};
  overflow-y: auto;
  overflow-x: hidden;

  ::-webkit-scrollbar {
    display: none;
  }
`;

export const SidebarNavItem = styled(Nav.Item)`
  a {
    color: ${(props) => props.theme.colors.layout.sideBar.button.color} !important;

    &:hover {
      color: ${(props) => props.theme.colors.layout.sideBar.button.colorHover} !important;
    }

    &:focus-visible {
      color: ${(props) => props.theme.colors.primary} !important;
    }
  }
`;

export const CoverArtWrapper = styled.div<{ $link?: boolean }>`
  display: inline-block;
  filter: ${(props) => props.theme.other.coverArtFilter};
  cursor: ${(props) => (props.$link ? 'pointer' : 'default')};

  &:focus-visible {
    outline: 2px ${(props) => props.theme.colors.primary} solid;
  }
`;

export const PageHeaderTitle = styled.h1`
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  font-size: ${(props) => props.theme.fonts.size.pageTitle};
`;
