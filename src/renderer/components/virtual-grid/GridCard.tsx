import { BackgroundImage, Card, Skeleton } from '@mantine/core';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { CardRow } from 'renderer/types';
import { Text } from '../text/Text';

const CardWrapper = styled(motion.div)<{
  itemGap: number;
  itemHeight: number;
  itemWidth: number;
}>`
  display: flex;
  flex: ${({ itemWidth }) => `0 0 ${itemWidth}px`};
  width: ${({ itemWidth }) => `${itemWidth}px`};
  height: ${({ itemHeight }) => `${itemHeight}px`};
  margin: ${({ itemGap }) => `0 ${itemGap / 2}px`};
  border-radius: 5px;
  filter: drop-shadow(0 4px 4px #000);
  user-select: none;
  pointer-events: auto; // https://github.com/bvaughn/react-window/issues/128#issuecomment-460166682

  &:focus-visible {
    outline: 1px solid #fff;
  }
`;

const StyledCard = styled(Card)`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 0;
  border-radius: 5px;
`;

const DetailSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const Row = styled.div`
  height: 25px;
  padding: 0 0.2rem;
`;

export const GridCard = ({ data, index, style }: any) => {
  const {
    itemHeight,
    itemWidth,
    columnCount,
    itemGap,
    itemCount,
    cardRows,
    itemData,
  } = data;

  const startIndex = index * columnCount;
  const stopIndex = Math.min(itemCount - 1, startIndex + columnCount - 1);
  const cards = [];

  for (let i = startIndex; i <= stopIndex; i += 1) {
    cards.push(
      <CardWrapper
        key={`card-${i}`}
        itemGap={itemGap}
        itemHeight={itemHeight}
        itemWidth={itemWidth}
        tabIndex={0}
        whileHover={{ scale: 1.05 }}
      >
        <Skeleton visible={false}>
          <StyledCard>
            <BackgroundImage
              src={itemData && itemData[i]?.image}
              style={{ height: `${itemWidth}px` }}
            />
            <DetailSection>
              {cardRows.map((row: CardRow) => (
                <Row key={`row-${row.prop}`}>
                  <Text overflow="hidden">
                    {itemData[i] && itemData[i][row.prop]}
                  </Text>
                </Row>
              ))}
            </DetailSection>
          </StyledCard>
        </Skeleton>
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
