import { forwardRef, Ref, useState } from 'react';
import debounce from 'lodash/debounce';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeListProps } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { VirtualGridWrapper } from './VirtualGridWrapper';

interface VirtualGridProps
  extends Omit<
    FixedSizeListProps,
    'children' | 'itemSize' | 'height' | 'width'
  > {
  itemGap?: number;
  itemHeight?: number;
  itemWidth?: number;
  minimumBatchSize?: number;
  query: (props: any) => Promise<any>;
  queryParams?: Record<string, any>;
}

export const VirtualInfiniteGrid = forwardRef(
  (
    {
      itemCount,
      itemGap,
      itemWidth,
      itemHeight,
      minimumBatchSize,
      query,
      queryParams,
    }: VirtualGridProps,
    ref: Ref<InfiniteLoader>
  ) => {
    const [itemData, setItemData] = useState<any[]>([]);

    const isItemLoaded = (index: number, columnCount: number) => {
      const itemIndex = index * columnCount;

      return (
        itemIndex < itemData.length * columnCount &&
        itemData[itemIndex] !== undefined
      );
    };

    const loadMoreItems = async (
      startIndex: number,
      stopIndex: number,
      limit: number,
      columnCount: number
    ) => {
      const currentPage = Math.ceil(startIndex / minimumBatchSize!);

      const t = await query({
        limit,
        page: currentPage,
        ...queryParams,
      });

      // Need to multiply by columnCount due to the grid layout
      const start = startIndex * columnCount;
      const end = (stopIndex + 1) * columnCount;

      return new Promise<void>((resolve) => {
        const newData: any[] = [...itemData];

        let itemIndex = 0;
        for (let rowIndex = start; rowIndex < end; rowIndex += 1) {
          newData[rowIndex] = t?.data[itemIndex];
          itemIndex += 1;
        }

        setItemData(newData);
        resolve();
      });
    };

    const debouncedLoadMoreItems = debounce(loadMoreItems, 300);

    return (
      <AutoSizer>
        {({ height, width }) => {
          const columnCount = Math.floor(
            (Number(width) - itemGap! + 3) / (itemWidth! + itemGap! + 2)
          );

          const pageItemLimit = columnCount * minimumBatchSize!;

          return (
            <InfiniteLoader
              ref={ref}
              isItemLoaded={(index) => isItemLoaded(index, columnCount)}
              itemCount={itemCount || 0}
              loadMoreItems={(startIndex, stopIndex) =>
                debouncedLoadMoreItems(
                  startIndex,
                  stopIndex,
                  pageItemLimit,
                  columnCount
                )
              }
              minimumBatchSize={minimumBatchSize}
              threshold={10}
            >
              {({ onItemsRendered, ref: infiniteLoaderRef }) => (
                <VirtualGridWrapper
                  height={height}
                  itemCount={itemCount || 0}
                  itemData={itemData}
                  itemGap={itemGap!}
                  itemHeight={itemHeight!}
                  itemWidth={itemWidth!}
                  refInstance={infiniteLoaderRef}
                  width={width}
                  onItemsRendered={onItemsRendered}
                />
              )}
            </InfiniteLoader>
          );
        }}
      </AutoSizer>
    );
  }
);

VirtualInfiniteGrid.defaultProps = {
  itemGap: 10,
  itemHeight: 200,
  itemWidth: 150,
  minimumBatchSize: 20,
  queryParams: {},
};
