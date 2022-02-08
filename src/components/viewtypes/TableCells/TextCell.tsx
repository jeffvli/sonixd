import React from 'react';
import { TableCellWrapper } from '../styled';

const TextCell = ({
  rowData,
  rowIndex,
  column,
  rowHeight,
  handleRowClick,
  handleRowDoubleClick,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
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
      {rowData[column.dataKey] ? rowData[column.dataKey] : <span>&#8203;</span>}
    </TableCellWrapper>
  );
};

export default TextCell;
