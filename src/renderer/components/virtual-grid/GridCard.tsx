import { Card, Image } from '@mantine/core';
import { motion } from 'framer-motion';
import styled from 'styled-components';

const CardWrapper = styled(motion.div)<{
  itemGap: number;
  itemHeight: number;
  itemWidth: number;
}>`
  display: flex;
  flex: ${({ itemWidth }) => `0 0 ${itemWidth}px`};
  width: 100%;
  height: ${({ itemHeight }) => itemHeight}px;
  margin: ${({ itemGap }) => `0 ${itemGap / 2}px`};
  pointer-events: auto; // https://github.com/bvaughn/react-window/issues/128#issuecomment-460166682
`;

export const GridCard = ({ data, index, style }: any) => {
  const { itemHeight, itemWidth, columnCount, itemGap, itemCount, itemData } =
    data;

  const startIndex = index * columnCount;
  const stopIndex = Math.min(itemCount - 1, startIndex + columnCount - 1);
  const cards = [];

  for (let i = startIndex; i <= stopIndex; i += 1) {
    // if (itemData[i].type === ServerType.Jellyfin) {
    //   const image = getJellyfinImageUrl()
    // }
    cards.push(
      <CardWrapper
        key={`card-${i}`}
        itemGap={itemGap}
        itemHeight={itemHeight}
        itemWidth={itemWidth}
        whileHover={{ rotateX: 15, scale: 1.05 }}
      >
        <Card style={{ height: '100%', width: '100%' }}>
          <Card.Section>
            <Image src={itemData && itemData[i]?.image} />
          </Card.Section>
        </Card>
      </CardWrapper>
    );
  }

  return (
    <div
      style={{
        ...style,
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'start',
      }}
    >
      {cards}
    </div>
  );
};
