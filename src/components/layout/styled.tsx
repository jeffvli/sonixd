import React from 'react';
import styled from 'styled-components';
import { Container, Footer } from 'rsuite';

// Layout.tsx
export const RootContainer = styled(Container)`
  height: 100vh;
  padding-bottom: 10px;
`;

interface ContainerProps {
  id: string;
  expanded: boolean;
  children: any;
}

const StyledContainer = ({
  id,
  expanded,
  children,
  ...props
}: ContainerProps) => <Container {...props}>{children}</Container>;

export const MainContainer = styled(StyledContainer)`
  padding-left: ${(props) => (props.expanded ? '193px' : '56px')};
  height: calc(100% - 32px);
  margin-top: 32px;
  overflow-y: auto;
`;

export const RootFooter = styled(Footer)`
  height: 80px;
`;

// Titlebar.tsx
export const TitleHeader = styled.header`
  display: block;
  position: fixed;
  height: 32px;
  width: ${(props) =>
    props.className?.includes('maximized') ? '100%' : 'calc(100% - 2px)'};
  background: #20252c;
  padding: 4px;
  color: #fff;
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
  grid-column: ${(props) =>
    props.minButton ? 1 : props.maxButton || props.restoreButton ? 2 : 3};

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  &:active {
    background: rgba(255, 255, 255, 0.2);
  }
`;
