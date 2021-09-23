// Referenced from: https://codesandbox.io/s/jjkz5y130w?file=/index.js:700-703
import React, { useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import Card from '../card/Card';
import 'react-virtualized/styles.css';

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
          alignItems: 'center',
          justifyContent: 'center',
          // This allows immediate pointer events after scrolling to override the default delay
          // https://github.com/bvaughn/react-window/issues/128#issuecomment-460166682
          pointerEvents: 'auto',
        }}
      >
        <Card
          title={data.data[i][data.cardTitle.property]}
          subtitle={`${data.data[i][data.cardSubtitle.property]}${data.cardSubtitle.unit}`}
          coverArt={data.data[i].image}
          size={`${data.size}px`}
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
        justifyContent: 'center',
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
  height,
  itemCount,
  width,
  cacheType,
}: any) {
  const gapSize = 5;
  const cardHeight = size + 75; // 225
  const cardWidth = size + 25; // 175
  // How many cards can we show per row, given the current width?
  const columnCount = Math.floor((width - gapSize) / (cardWidth + gapSize));
  const rowCount = Math.ceil(itemCount / columnCount);

  const itemData = useMemo(
    () => ({
      data,
      cardTitle,
      cardSubtitle,
      playClick,
      size,
      columnCount,
      itemCount,
      cacheType,
      cardWidth,
      cardHeight,
      gapSize,
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
    ]
  );

  return (
    <List
      className="List"
      height={height}
      itemCount={rowCount}
      itemSize={cardHeight + gapSize}
      width={width}
      itemData={itemData}
    >
      {GridCard}
    </List>
  );
}

const GridViewType = ({ data, cardTitle, cardSubtitle, playClick, size, cacheType }: any) => {
  return (
    <AutoSizer>
      {({ height, width }: any) => (
        <ListWrapper
          height={height}
          itemCount={data.length}
          width={width}
          data={data}
          cardTitle={cardTitle}
          cardSubtitle={cardSubtitle}
          playClick={playClick}
          size={size}
          cacheType={cacheType}
        />
      )}
    </AutoSizer>
  );
};

export default GridViewType;
