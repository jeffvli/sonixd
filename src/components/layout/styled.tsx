import React from 'react';
import styled from 'styled-components';
import { Container, Content, Divider, Footer, Header, Nav, Sidebar } from 'rsuite';

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

export const MainContainer = styled(StyledContainer)<{ $titleBar: string; sidebarwidth: string }>`
  padding-left: ${(props) => (props.expanded ? props.sidebarwidth : '56px')};
  height: calc(100% - 32px);
  margin-top: ${(props) => (props.$titleBar === 'native' ? '0px' : '32px')};
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
  grid-template-columns: repeat(3, 20px);
  position: absolute;
  top: 0;
  left: 4px;
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

  img {
    width: 18px;
    height: 18px;
  }
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
export const FixedSidebar = styled(Sidebar)<{ font: string; $titleBar: string }>`
  background: ${(props) => props.theme.colors.layout.sideBar.background} !important;
  position: fixed;
  top: ${(props) => (props.$titleBar === 'native' ? '0px' : '32px')};
  z-index: 1;
  height: ${(props) =>
    props.$titleBar === 'native' ? 'calc(100% - 98px);' : 'calc(100% - 130px);'};
  font-family: ${(props) => `${props.font?.split(/Light|Medium/)[0]}`};
  font-weight: ${(props) =>
    props.font?.match('Light') ? 300 : props.font?.match('Medium') ? 500 : 400};
  overflow-y: auto;
  overflow-x: hidden;
  user-select: none;

  ::-webkit-scrollbar {
    display: none;
  }

  .rs-sidenav-body {
    ::-webkit-scrollbar {
      display: none;
    }
  }
`;

export const SidebarNavItem = styled(Nav.Item)<{ $show: boolean }>`
  padding-right: 5px;
  user-select: none;
  display: ${(props) => (props.$show ? 'block' : 'none')};

  a {
    color: ${(props) => props.theme.colors.layout.sideBar.button.color} !important;

    &:hover {
      color: ${(props) => props.theme.colors.layout.sideBar.button.colorHover} !important;
    }

    &:focus-visible {
      color: ${(props) => props.theme.colors.layout.sideBar.button.colorHover} !important;
    }
  }
`;

export const CoverArtWrapper = styled.div<{ $link?: boolean; size: number; card?: boolean }>`
  display: inline-block;
  filter: ${(props) => props.theme.other.coverArtFilter};
  cursor: ${(props) => (props.$link ? 'pointer' : undefined)};
  text-align: center;
  height: ${(props) => props.size}px;
  width: ${(props) => props.size}px;
  overflow: hidden;
  border-radius: ${(props) => props.theme.other.coverArtBorderRadius};
  background: transparent;
  vertical-align: middle;
  overflow: ${(props) => (props.card ? 'visible' : 'hidden')};

  &:focus-visible {
    outline: 2px ${(props) => props.theme.colors.primary} solid;
  }

  img {
    vertical-align: unset !important;
  }
`;

export const PageHeaderTitle = styled.h1`
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  font-size: 4vw;

  @media screen and (min-width: 1000px) {
    font-size: 40px;
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
  user-select: none;
`;

export const PageHeaderSubtitleWrapper = styled.span`
  align-self: center;
  width: 80%;
  font-size: 14px;
`;

export const PageHeaderSubtitleDataLine = styled.div<{
  $top?: boolean;
  $overflow?: boolean;
  $wrap?: boolean;
}>`
  margin-top: ${(props) => (props.$top ? '0px' : '7px')};
  white-space: ${(props) => (props.$wrap ? 'normal' : 'nowrap')};
  overflow: ${(props) => (props.$overflow ? 'visible' : 'auto')};

  ::-webkit-scrollbar {
    height: 4px;
  }

  scroll-behavior: smooth;
`;

export const FlatBackground = styled.div<{
  $expanded: boolean;
  $color: string;
  $titleBar: string;
  sidebarwidth: string;
}>`
  background: ${(props) => props.$color};
  top: ${(props) => (props.$titleBar === 'native' ? '0px' : '32px')};
  left: ${(props) => (props.$expanded ? props.sidebarwidth : '56px')};
  height: 200px;
  position: absolute;
  width: ${(props) =>
    props.$expanded ? `calc(100% - ${props.sidebarwidth})` : 'calc(100% - 56px)'};
  user-select: none;
  pointer-events: none;
`;

export const BlurredBackgroundWrapper = styled.div<{
  expanded: boolean;
  hasImage: boolean;
  $titleBar: string;
  sidebarwidth: string;
}>`
  clip: rect(0, auto, auto, 0);
  -webkit-clip-path: inset(0 0);
  clip-path: inset(0 0);
  position: absolute;
  left: ${(props) => (props.expanded ? props.sidebarwidth : '56px')};
  width: ${(props) =>
    props.expanded ? `calc(100% - ${props.sidebarwidth})` : 'calc(100% - 56px)'};
  top: ${(props) => (props.$titleBar === 'native' ? '0px' : '32px')};
  z-index: 1;
  background: ${(props) => (props.hasImage ? '#0b0908' : '#00395A')};
  filter: ${(props) => (props.hasImage ? 'none' : 'brightness(0.3)')};
`;

export const BlurredBackground = styled.img<{ expanded: boolean }>`
  background-position: center 30%;
  background-size: cover;
  filter: ${(props) =>
    props.theme.type === 'dark' ? `blur(10px) brightness(0.3)` : `blur(10px) brightness(0.6)`};

  outline: none !important;
  border: none !important;
  margin: 0px !important;
  padding: 0px !important;
  width: 100%;
  height: 212px;
  z-index: -1;
  user-select: none;
  pointer-events: none;
  display: block;
`;

export const GradientBackground = styled.div<{
  $expanded: boolean;
  $color: string;
  $titleBar: string;
  sidebarwidth: string;
}>`
  background: ${(props) =>
    `linear-gradient(0deg, transparent 10%, ${props.$color.replace(
      ',1)',
      `${props.theme.type === 'dark' ? ',0.2' : ',0.5'})`
    )} 100%)`};
  top: ${(props) => (props.$titleBar === 'native' ? '0px' : '32px')};
  left: ${(props) => (props.$expanded ? props.sidebarwidth : '56px')};
  height: calc(100% - 130px);
  position: absolute;
  width: ${(props) =>
    props.$expanded ? `calc(100% - ${props.sidebarwidth})` : 'calc(100% - 56px)'};
  z-index: 1;
  user-select: none;
  pointer-events: none;
`;

export const CustomImageGridWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 92px);
  grid-template-rows: repeat(2, 92px);
  grid-column-gap: 0px;
  grid-row-gap: 0px;
`;

export const CustomImageGrid = styled.div<{ $gridArea: string }>`
  grid-area: ${(props) => props.$gridArea};
`;

export const SidebarDragContainer = styled.div<{ $resizing: boolean }>`
  position: absolute;
  right: 0;
  width: 3px;
  height: 100%;
  z-index: 1;

  background-color: ${(props) => props.$resizing && '#323232'};

  &:hover {
    cursor: w-resize !important;
  }
`;

export const SidebarCoverArtContainer = styled.div<{ height: string }>`
  position: absolute;
  bottom: 0;
  height: ${(props) => props.height};
  width: 100%;
  z-index: 100;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(50, 50, 50, 0.2);

  img {
    max-height: ${(props) => props.height};
    max-width: 100%;
    height: auto;
    cursor: pointer;
  }

  .rs-btn {
    display: none;
  }

  &:hover {
    .rs-btn {
      display: block;
      position: absolute;
      bottom: 0;
      left: 0;
      z-index: 99;
      border-radius: 0px !important;
    }
  }
`;

export const PlaylistDivider = styled(Divider)`
  margin: 10px 0 !important;
`;
