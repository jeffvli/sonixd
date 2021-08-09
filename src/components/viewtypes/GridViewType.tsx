import React from 'react';
import { FlexboxGrid, Col } from 'rsuite';
import Card from '../card/Card';

const GridViewType = ({
  data,
  cardTitle,
  cardSubtitle,
  playClick,
  ...rest
}: any) => {
  return (
    <FlexboxGrid justify="center">
      {data.map((item: any) => (
        <FlexboxGrid.Item componentClass={Col} key={item.id}>
          <Card
            title={item[cardTitle.property]}
            subtitle={`${item[cardSubtitle.property]} tracks`}
            coverArt={item.image}
            url={
              cardTitle.urlProperty
                ? `${cardTitle.prefix}/${item[cardTitle.urlProperty]}`
                : undefined
            }
            subUrl={
              cardSubtitle.urlProperty
                ? `${cardSubtitle.prefix}/${item[cardSubtitle.urlProperty]}`
                : undefined
            }
            lazyLoad
            hasHoverButtons
            playClick={{ ...playClick, id: item[playClick.idProperty] }}
            {...rest}
          />
        </FlexboxGrid.Item>
      ))}
    </FlexboxGrid>
  );
};

export default GridViewType;
