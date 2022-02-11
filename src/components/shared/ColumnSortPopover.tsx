import React from 'react';
import { Whisper } from 'rsuite';
import ColumnSort from './ColumnSort';
import Popup from './Popup';

const ColumnSortPopover = ({ children, ...rest }: any) => {
  return (
    <Whisper
      trigger="click"
      enterable
      placement="bottomEnd"
      preventOverflow
      speaker={
        <Popup width="275px" placement="bottomEnd">
          <ColumnSort {...rest} />
        </Popup>
      }
    >
      {children}
    </Whisper>
  );
};

export default ColumnSortPopover;
