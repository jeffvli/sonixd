import React from 'react';
import { ContextMenuWindow, StyledContextMenuButton } from './styled';

export const ContextMenuButton = ({ children, ...rest }: any) => {
  return (
    <StyledContextMenuButton {...rest} appearance="subtle" size="xs" block>
      {children}
    </StyledContextMenuButton>
  );
};

export const NowPlayingContextMenu = ({
  yPos,
  xPos,
  width,
  numOfButtons,
  numOfDividers,
  hasTitle,
  children,
}: any) => {
  return (
    <ContextMenuWindow
      yPos={yPos}
      xPos={xPos}
      width={width}
      numOfButtons={numOfButtons}
      numOfDividers={numOfDividers}
      hasTitle={hasTitle}
    >
      {children}
    </ContextMenuWindow>
  );
};
