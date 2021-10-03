import React from 'react';
import styled from 'styled-components';
import Card from '../card/Card';

const ScrollMenuContainer = styled.div`
  margin-bottom: 25px;
  overflow-x: auto;
  white-space: nowrap;

  ::-webkit-scrollbar {
    height: 10px;
  }
`;

const TitleWrapper = styled.div`
  margin-left: 10px;
  margin-bottom: 10px;
`;

const Title = styled.a`
  font-size: 20px;
  color: white;

  &:hover {
    cursor: pointer;
    text-decoration: none;
  }
`;

const ScrollingMenu = ({ cardTitle, cardSubtitle, data, title, onClickTitle }: any) => {
  return (
    <>
      <TitleWrapper>
        <Title onClick={onClickTitle}>{title}</Title>
      </TitleWrapper>

      <ScrollMenuContainer>
        {data.map((item: any) => (
          <span key={item.id} style={{ display: 'inline-block' }}>
            <Card
              itemId={item.id}
              title={item[cardTitle.property] || item.title}
              subtitle={item[cardSubtitle.property]}
              coverArt={item.image}
              url={`library/${cardTitle.prefix}/${item.id}`}
              subUrl={`library/${cardSubtitle.prefix}/${item.artistId}`}
              playClick={{ type: 'album', id: item.id }}
              hasHoverButtons
              size={200}
              details={{ cacheType: 'album', ...item }}
              lazyLoad
              style={{ margin: '0px 5px 0px 5px' }}
            />
          </span>
        ))}
      </ScrollMenuContainer>
    </>
  );
};

export default ScrollingMenu;
