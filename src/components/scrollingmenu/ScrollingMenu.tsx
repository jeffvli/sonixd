import React, { useRef } from 'react';
import settings from 'electron-settings';
import styled from 'styled-components';
import { ButtonGroup, ButtonToolbar, FlexboxGrid, Icon } from 'rsuite';
import Card from '../card/Card';
import { SectionTitleWrapper, SectionTitle, StyledIconButton } from '../shared/styled';
import { useAppSelector } from '../../redux/hooks';

const ScrollMenuContainer = styled.div`
  margin-bottom: 25px;
  overflow-x: auto;
  white-space: nowrap;

  ::-webkit-scrollbar {
    height: 10px;
  }

  scroll-behavior: smooth;
`;

const ScrollingMenu = ({
  cardTitle,
  cardSubtitle,
  data,
  title,
  onClickTitle,
  type,
  handleFavorite,
}: any) => {
  const cacheImages = Boolean(settings.getSync('cacheImages'));
  const misc = useAppSelector((state) => state.misc);
  const config = useAppSelector((state) => state.config);
  const scrollContainerRef = useRef<any>();

  return (
    <>
      <SectionTitleWrapper>
        <FlexboxGrid justify="space-between">
          <FlexboxGrid.Item>
            <SectionTitle
              tabIndex={0}
              onClick={onClickTitle}
              onKeyDown={(e: any) => {
                console.log(e);
                if (e.key === ' ' || e.key === 'Enter') {
                  onClickTitle();
                }
              }}
            >
              {title}
            </SectionTitle>
          </FlexboxGrid.Item>
          <FlexboxGrid.Item>
            <ButtonToolbar>
              <ButtonGroup>
                <StyledIconButton
                  icon={<Icon icon="arrow-left" />}
                  onClick={() => {
                    scrollContainerRef.current.scrollLeft -=
                      config.lookAndFeel.gridView.cardSize * 5;
                  }}
                />
                <StyledIconButton
                  icon={<Icon icon="arrow-right" />}
                  onClick={() => {
                    scrollContainerRef.current.scrollLeft +=
                      config.lookAndFeel.gridView.cardSize * 5;
                  }}
                />
              </ButtonGroup>
            </ButtonToolbar>
          </FlexboxGrid.Item>
        </FlexboxGrid>
      </SectionTitleWrapper>

      <ScrollMenuContainer ref={scrollContainerRef}>
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
                cardSubtitle.urlProperty
                  ? `${cardSubtitle.prefix}/${item[cardSubtitle.urlProperty]}`
                  : undefined
              }
              playClick={{ type, id: item.id }}
              details={{ cacheType: type, ...item }}
              hasHoverButtons
              size={config.lookAndFeel.gridView.cardSize}
              lazyLoad
              cacheImages={cacheImages}
              cachePath={misc.imageCachePath}
              style={{ margin: '0px 5px 0px 5px' }}
              handleFavorite={handleFavorite}
            />
          </span>
        ))}
      </ScrollMenuContainer>
    </>
  );
};

export default ScrollingMenu;
