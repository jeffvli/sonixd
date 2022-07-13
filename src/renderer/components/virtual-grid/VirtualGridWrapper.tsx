import { Ref, useMemo } from 'react';
import { FixedSizeList, FixedSizeListProps } from 'react-window';
import { GridCard } from './GridCard';

export const VirtualGridWrapper = ({
  refInstance,
  itemGap,
  itemWidth,
  ...rest
}: Omit<FixedSizeListProps, 'ref' | 'itemSize' | 'children'> & {
  itemGap: number;
  itemHeight: number;
  itemWidth: number;
  refInstance: Ref<any>;
}) => {
  const itemHeight = itemWidth + 55;

  const columnCount = Math.floor(
    (Number(rest.width) - itemGap + 3) / (itemWidth + itemGap + 2)
  );

  const rowCount = Math.ceil(rest.itemCount / columnCount);

  const itemData = useMemo(
    () => ({
      columnCount,
      itemCount: rest.itemCount,
      itemData: rest.itemData,
      itemGap,
      itemHeight,
      itemWidth,
    }),
    [columnCount, itemGap, itemHeight, itemWidth, rest.itemCount, rest.itemData]
  );

  return (
    <FixedSizeList
      {...rest}
      ref={refInstance}
      initialScrollOffset={0}
      itemCount={rowCount}
      itemData={itemData}
      itemSize={itemHeight + itemGap}
    >
      {GridCard}
    </FixedSizeList>
  );
};
