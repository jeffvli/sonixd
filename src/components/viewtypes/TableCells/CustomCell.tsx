import React from 'react';
import { TableCellWrapper } from '../styled';

const CustomCell = ({
  rowData,
  rowIndex,
  column,
  rowHeight,
  handleRowClick,
  handleRowDoubleClick,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
  nowPlaying,
  sortColumn,
  history,
  children,
  ...rest
}: any) => {
  return (
    <TableCellWrapper
      height={rowHeight}
      onClick={(e: any) => {
        if (!column.dataKey?.match(/starred|userRating|genre|columnResizable|columnDefaultSort/)) {
          handleRowClick(e, {
            ...rowData,
            rowIndex,
          });
        }
      }}
      onDoubleClick={() => {
        if (!column.dataKey?.match(/starred|userRating|genre|columnResizable|columnDefaultSort/)) {
          handleRowDoubleClick({
            ...rowData,
            rowIndex,
          });
        }
      }}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseUp={onMouseUp}
      {...rest}
    >
      {!children ? <span>&#8203;</span> : children}
    </TableCellWrapper>
  );
};

export default CustomCell;
