import React from 'react';
import styled from 'styled-components';
import Card from '../card/Card';
import { SectionTitleWrapper, SectionTitle } from '../shared/styled';

const ScrollMenuContainer = styled.div`
  margin-bottom: 25px;
  overflow-x: auto;
  white-space: nowrap;

  ::-webkit-scrollbar {
    height: 10px;
  }
`;

const ScrollingMenu = ({ cardTitle, cardSubtitle, data, title, onClickTitle, type }: any) => {
  return (
    <>
      <SectionTitleWrapper>
        <SectionTitle onClick={onClickTitle}>{title}</SectionTitle>
      </SectionTitleWrapper>

      <ScrollMenuContainer>
        {data.map((item: any) => (
          <span key={item.id} style={{ display: 'inline-block' }}>
            <Card
              itemId={item.id}
              title={item[cardTitle.property] || item.title}
              subtitle={`${item[cardSubtitle.property]}${cardSubtitle.unit}`}
              coverArt={item.image}
              url={cardTitle.urlProperty ? `library/${cardTitle.prefix}/${item.id}` : undefined}
              subUrl={
                cardSubtitle.urlProperty
                  ? `library/${cardSubtitle.prefix}/${item.artistId}`
                  : undefined
              }
              playClick={{ type, id: item.id }}
              details={{ cacheType: type, ...item }}
              hasHoverButtons
              size={200}
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
