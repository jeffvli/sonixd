import React, { useContext } from 'react';
import { ScrollMenu, VisibilityContext } from 'react-horizontal-scrolling-menu';
import { Button, Icon } from 'rsuite';
import styled from 'styled-components';
import Card from '../card/Card';

const ScrollMenuContainer = styled.div`
  margin-bottom: 25px;
`;

const Title = styled.h1`
  margin-left: 20px;
  font-size: 20px !important;
`;

const LeftArrow = () => {
  const { isFirstItemVisible, scrollPrev } = useContext(VisibilityContext);

  return (
    <Button
      appearance="link"
      disabled={isFirstItemVisible}
      onClick={() => scrollPrev()}
    >
      <Icon icon="arrow-left" />
    </Button>
  );
};

const RightArrow = () => {
  const { isLastItemVisible, scrollNext } = useContext(VisibilityContext);

  return (
    <Button
      appearance="link"
      disabled={isLastItemVisible}
      onClick={() => scrollNext()}
    >
      <Icon icon="arrow-right" />
    </Button>
  );
};

const ScrollingMenu = ({
  cardTitle,
  cardSubtitle,
  data,
  title,
  cardSize,
}: any) => {
  return (
    <ScrollMenuContainer>
      <Title>{title}</Title>
      <ScrollMenu LeftArrow={LeftArrow} RightArrow={RightArrow}>
        {data.map((item: any) => (
          <Card
            itemId={item.id}
            title={item[cardTitle.property] || item.title}
            subtitle={item[cardSubtitle.property]}
            key={item.id}
            coverArt={item.image}
            url={`library/${cardTitle.prefix}/${item.id}`}
            subUrl={`library/${cardSubtitle.prefix}/${item.artistId}`}
            playClick={{ type: 'album', id: item.id }}
            hasHoverButtons
            size={cardSize}
            details={{ cacheType: 'album', ...item }}
            lazyLoad
            style={{ margin: '0px 5px 0px 5px' }}
          />
        ))}
      </ScrollMenu>
    </ScrollMenuContainer>
  );
};

export default ScrollingMenu;
