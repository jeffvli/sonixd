import React from 'react';
import { Whisper } from 'rsuite';
import { StyledPopover } from './styled';
import ColumnSort from './ColumnSort';

const ColumnSortPopover = ({ children, ...rest }: any) => {
  return (
    <Whisper
      trigger="click"
      enterable
      placement="bottomEnd"
      preventOverflow
      speaker={
        <StyledPopover width="275px" placement="bottomEnd">
          <ColumnSort {...rest} />
        </StyledPopover>
      }
    >
      {children}
    </Whisper>
  );
};

export default ColumnSortPopover;
