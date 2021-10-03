import React from 'react';
import path from 'path';
import settings from 'electron-settings';
import styled from 'styled-components';
import Card from '../card/Card';
import { SectionTitleWrapper, SectionTitle } from '../shared/styled';
import { getImageCachePath } from '../../shared/utils';

const ScrollMenuContainer = styled.div`
  margin-bottom: 25px;
  overflow-x: auto;
  white-space: nowrap;

  ::-webkit-scrollbar {
    height: 10px;
  }
`;

const ScrollingMenu = ({ cardTitle, cardSubtitle, data, title, onClickTitle, type }: any) => {
  const cacheImages = Boolean(settings.getSync('cacheImages'));
  const cachePath = path.join(getImageCachePath(), '/');

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
              subtitle={
                cardSubtitle.unit
                  ? `${item[cardSubtitle.property]}${cardSubtitle.unit}`
                  : item[cardSubtitle.property]
              }
              coverArt={item.image}
              url={cardTitle.urlProperty ? `${cardTitle.prefix}/${item.id}` : undefined}
              subUrl={
                cardSubtitle.urlProperty ? `${cardSubtitle.prefix}/${item.artistId}` : undefined
              }
              playClick={{ type, id: item.id }}
              details={{ cacheType: type, ...item }}
              hasHoverButtons
              size={settings.getSync('gridCardSize')}
              lazyLoad
              cacheImages={cacheImages}
              cachePath={cachePath}
              style={{ margin: '0px 5px 0px 5px' }}
            />
          </span>
        ))}
      </ScrollMenuContainer>
    </>
  );
};

export default ScrollingMenu;
