// Referenced from: https://codesandbox.io/s/jjkz5y130w?file=/index.js:700-703
import React, { useEffect, useMemo, useState } from 'react';
import settings from 'electron-settings';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import Card from '../card/Card';
import 'react-virtualized/styles.css';
import { useAppSelector } from '../../redux/hooks';
import Paginator from '../shared/Paginator';
import CenterLoader from '../loader/CenterLoader';

const GridCard = ({ data, index, style }: any) => {
  const { cardHeight, cardWidth, columnCount, gapSize, itemCount } = data;
  const startIndex = index * columnCount;
  const stopIndex = Math.min(itemCount - 1, startIndex + columnCount - 1);
  const cards = [];

  for (let i = startIndex; i <= stopIndex; i += 1) {
    cards.push(
      <div
        key={`card-${i}`}
        style={{
          flex: `0 0 ${cardWidth}px`,
          height: cardHeight,
          margin: `0 ${gapSize / 2}px`,
          display: 'flex',
          // This allows immediate pointer events after scrolling to override the default delay
          // https://github.com/bvaughn/react-window/issues/128#issuecomment-460166682
          pointerEvents: 'auto',
        }}
      >
        <Card
          title={data.data[i][data.cardTitle.property]}
          subtitle={
            data.data[i][data.cardSubtitle.property] &&
            `${data.data[i][data.cardSubtitle.property]}${data.cardSubtitle.unit}`
          }
          coverArt={data.data[i].image}
          size={data.size}
          url={
            data.cardTitle.urlProperty
              ? `${data.cardTitle.prefix}/${data.data[i][data.cardTitle.urlProperty]}`
              : undefined
          }
          subUrl={
            data.cardSubtitle.urlProperty
              ? `${data.cardSubtitle.prefix}/${data.data[i][data.cardSubtitle.urlProperty]}`
              : undefined
          }
          lazyLoad
          hasHoverButtons
          playClick={{
            ...data.playClick,
            id: data.data[i][data.playClick.idProperty],
          }}
          details={{ cacheType: data.cacheType, ...data.data[i] }}
          cacheImages={data.cacheImages}
          cachePath={data.cachePath}
          handleFavorite={data.handleFavorite}
          musicFolderId={data.musicFolderId}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        ...style,
        display: 'flex',
        alignItems: 'center',
        justifyContent: data.alignment,
      }}
    >
      {cards}
    </div>
  );
};

function ListWrapper({
  data,
  cardTitle,
  cardSubtitle,
  playClick,
  size,
  gapSize,
  alignment,
  height,
  itemCount,
  width,
  cacheType,
  cacheImages,
  cachePath,
  handleFavorite,
  musicFolderId,
  initialScrollOffset,
  onScroll,
  gridRef,
}: any) {
  const cardHeight = size + 55;
  const cardWidth = size;
  // How many cards can we show per row, given the current width?
  const columnCount = Math.floor((width - gapSize + 3) / (cardWidth + gapSize + 2));
  const rowCount = Math.ceil(itemCount / columnCount);

  const itemData = useMemo(
    () => ({
      data,
      cardTitle,
      cardSubtitle,
      playClick,
      size,
      alignment,
      columnCount,
      itemCount,
      cacheType,
      cardWidth,
      cardHeight,
      gapSize,
      cacheImages,
      cachePath,
      handleFavorite,
      musicFolderId,
    }),
    [
      cardHeight,
      cardWidth,
      cacheType,
      cardSubtitle,
      cardTitle,
      columnCount,
      data,
      itemCount,
      playClick,
      size,
      gapSize,
      alignment,
      cacheImages,
      cachePath,
      handleFavorite,
      musicFolderId,
    ]
  );

  return (
    <>
      <List
        ref={gridRef}
        className="List"
        height={height}
        itemCount={rowCount}
        itemSize={cardHeight + gapSize}
        width={width}
        itemData={itemData}
        initialScrollOffset={initialScrollOffset || 0}
        onScroll={({ scrollOffset }) => {
          onScroll(scrollOffset);
        }}
        overscanCount={4}
      >
        {GridCard}
      </List>
    </>
  );
}

const GridViewType = ({
  data,
  cardTitle,
  cardSubtitle,
  playClick,
  size,
  cacheType,
  handleFavorite,
  initialScrollOffset,
  onScroll,
  paginationProps,
  loading,
  gridRef,
}: any) => {
  const cacheImages = Boolean(settings.getSync('cacheImages'));
  const misc = useAppSelector((state) => state.misc);
  const config = useAppSelector((state) => state.config);
  const folder = useAppSelector((state) => state.folder);
  const [musicFolder, setMusicFolder] = useState(undefined);

  useEffect(() => {
    if (folder.applied.artists) {
      setMusicFolder(folder.musicFolder);
    }
  }, [folder]);

  return (
    <>
      <AutoSizer>
        {({ height, width }: any) => (
          <>
            {data?.length && !loading ? (
              <ListWrapper
                height={
                  height - (paginationProps && paginationProps?.recordsPerPage !== 0 ? 45 : 0)
                }
                itemCount={data?.length}
                width={width}
                data={data}
                cardTitle={cardTitle}
                cardSubtitle={cardSubtitle}
                playClick={playClick}
                size={size}
                gapSize={config.lookAndFeel.gridView.gapSize}
                alignment={config.lookAndFeel.gridView.alignment}
                cacheType={cacheType}
                cacheImages={cacheImages}
                cachePath={misc.imageCachePath}
                handleFavorite={handleFavorite}
                musicFolderId={musicFolder}
                initialScrollOffset={initialScrollOffset}
                onScroll={onScroll || (() => {})}
                paginationProps={paginationProps}
                gridRef={gridRef}
              />
            ) : loading ? (
              <CenterLoader absolute />
            ) : (
              <></>
            )}

            {paginationProps && paginationProps?.recordsPerPage !== 0 && (
              <div style={{ height: data?.length ? '45px' : height, width, position: 'relative' }}>
                <Paginator {...paginationProps} bottom="true" />
              </div>
            )}
          </>
        )}
      </AutoSizer>
    </>
  );
};

export default GridViewType;
