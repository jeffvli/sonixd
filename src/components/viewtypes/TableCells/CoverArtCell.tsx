import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { isCached } from '../../../shared/utils';
import { CoverArtWrapper } from '../../layout/styled';
import { TableCellWrapper } from '../styled';

const CoverArtCell = ({
  rowData,
  rowIndex,
  column,
  misc,
  rowHeight,
  cacheImages,
  handleRowClick,
  handleRowDoubleClick,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
}: any) => {
  return (
    <TableCellWrapper
      height={rowHeight}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseUp={onMouseUp}
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
    >
      <CoverArtWrapper size={rowHeight - 10}>
        <LazyLoadImage
          src={
            isCached(
              `${misc.imageCachePath}${cacheImages.cacheType}_${
                rowData[cacheImages.cacheIdProperty]
              }.jpg`
            )
              ? `${misc.imageCachePath}${cacheImages.cacheType}_${
                  rowData[cacheImages.cacheIdProperty]
                }.jpg`
              : rowData.image
          }
          alt="track-img"
          effect="opacity"
          width={rowHeight - 10}
          height={rowHeight - 10}
          visibleByDefault
        />
      </CoverArtWrapper>
    </TableCellWrapper>
  );
};

export default CoverArtCell;
