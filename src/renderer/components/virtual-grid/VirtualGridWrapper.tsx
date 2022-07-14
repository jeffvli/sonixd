import { Ref, useMemo } from 'react';
import { FixedSizeList, FixedSizeListProps } from 'react-window';
import { CardRow } from 'renderer/types';
import { GridCard } from './GridCard';

export const VirtualGridWrapper = ({
  refInstance,
  cardRows,
  itemGap,
  itemWidth,
  itemHeight,
  itemCount,
  columnCount,
  rowCount,
  ...rest
}: Omit<FixedSizeListProps, 'ref' | 'itemSize' | 'children'> & {
  cardRows: CardRow[];
  columnCount: number;
  itemGap: number;
  itemHeight: number;
  itemWidth: number;
  refInstance: Ref<any>;
  rowCount: number;
}) => {
  const itemData = useMemo(
    () => ({
      cardRows,
      columnCount,
      itemCount,
      itemData: rest.itemData,
      itemGap,
      itemHeight,
      itemWidth,
    }),
    [
      cardRows,
      columnCount,
      itemCount,
      rest.itemData,
      itemGap,
      itemHeight,
      itemWidth,
    ]
  );

  return (
    <FixedSizeList
      {...rest}
      ref={refInstance}
      initialScrollOffset={0}
      itemCount={rowCount}
      itemData={itemData}
      itemSize={itemHeight + itemGap}
      overscanCount={10}
    >
      {GridCard}
    </FixedSizeList>
  );
};
