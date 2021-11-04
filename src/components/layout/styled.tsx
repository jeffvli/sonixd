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

export const PageContent = styled(Content)<{ padding?: string; $zIndex?: number }>`
  position: relative;
  padding: ${(props) => (props.padding ? props.padding : '10px')};
  z-index: ${(props) => props.$zIndex};
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
  font-size: 4vw;

  @media screen and (min-width: 1280px) {
    font-size: 48px;
  }
`;

export const PageHeaderWrapper = styled.div<{
  hasImage: boolean;
  imageHeight: string;
  isDark?: boolean;
}>`
  display: ${(props) => (props.hasImage ? 'inline-block' : 'undefined')};
  width: ${(props) => (props.hasImage ? `calc(100% - ${props.imageHeight + 15}px)` : '100%')};
  margin-left: ${(props) => (props.hasImage ? '15px' : '0px')};
  vertical-align: top;
  color: ${(props) => (props.isDark ? '#D8D8D8' : props.theme.colors.layout.page.color)};
`;

export const PageHeaderSubtitleWrapper = styled.span`
  align-self: center;
  width: 70%;
  font-size: 14px;
`;

export const PageHeaderSubtitleDataLine = styled.div<{ $top?: boolean }>`
  margin-top: ${(props) => (props.$top ? '0px' : '7px')};
  white-space: nowrap;
  overflow: visible;

  ::-webkit-scrollbar {
    height: 0px;
  }

  scroll-behavior: smooth;
`;

export const FlatBackground = styled.div<{ $expanded: boolean; $color: string }>`
  background: ${(props) => props.$color};
  top: 32px;
  left: ${(props) => (props.$expanded ? '165px' : '56px')};
  height: 200px;
  position: absolute;
  width: ${(props) => (props.$expanded ? `calc(100% - 165px)` : 'calc(100% - 56px)')};
  user-select: none;
  pointer-events: none;
`;

export const BlurredBackgroundWrapper = styled.div<{ expanded: boolean; image: string }>`
  clip: rect(0, auto, auto, 0);
  -webkit-clip-path: inset(0 0);
  clip-path: inset(0 0);
  position: absolute;
  left: ${(props) => (props.expanded ? '165px' : '56px')};
  width: ${(props) => (props.expanded ? `calc(100% - 165px)` : 'calc(100% - 56px)')};
  top: 32px;
  z-index: 1;
  display: block;
  background: ${(props) => (props.image ? '#0b0908' : '#00395A')};
  filter: ${(props) => (props.image ? 'none' : 'brightness(0.3)')};
`;

export const BlurredBackground = styled.img<{ expanded: boolean; image: string }>`
  background-image: ${(props) => (props.image ? `url(${props.image})` : 'none')};
  background-position: center 30%;
  background-size: cover;
  filter: blur(10px) brightness(0.3);

  outline: none !important;
  border: none !important;
  margin: 0px !important;
  padding: 0px !important;
  width: 100%;
  height: 202px;
  z-index: -1;
  user-select: none;
  pointer-events: none;
  display: block;
`;

export const GradientBackground = styled.div<{ $expanded: boolean; $color: string }>`
  background: ${(props) => `linear-gradient(0deg, transparent 10%, ${props.$color} 100%)`};
  top: 32px;
  left: ${(props) => (props.$expanded ? '165px' : '56px')};
  height: calc(100% - 130px);
  position: absolute;
  width: ${(props) => (props.$expanded ? `calc(100% - 165px)` : 'calc(100% - 56px)')};
  z-index: 1;
  user-select: none;
  pointer-events: none;
`;
