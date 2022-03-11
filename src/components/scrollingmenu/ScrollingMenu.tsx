import React, { useRef } from 'react';
import settings from 'electron-settings';
import styled from 'styled-components';
import { ButtonGroup, ButtonToolbar, FlexboxGrid, Icon } from 'rsuite';
import Card from '../card/Card';
import { SectionTitleWrapper, SectionTitle, StyledButton } from '../shared/styled';
import { useAppSelector } from '../../redux/hooks';
import { smoothScroll } from '../../shared/utils';
import { Item } from '../../types';

const ScrollMenuContainer = styled.div<{ $noScrollbar?: boolean; maxWidth: string }>`
  overflow-x: auto;
  white-space: nowrap;

  max-width: ${(props) => props.maxWidth};

  ::-webkit-scrollbar {
    height: ${(props) => (props.$noScrollbar ? '0px' : '10px')};
  }
`;

const ScrollingMenu = ({
  cardTitle,
  cardSubtitle,
  data,
  title,
  subtitle,
  onClickTitle,
  type,
  handleFavorite,
  noScrollbar,
  cardSize,
  maxWidth,
  noButtons,
}: any) => {
  const cacheImages = Boolean(settings.getSync('cacheImages'));
  const misc = useAppSelector((state) => state.misc);
  const config = useAppSelector((state) => state.config);
  const scrollContainerRef = useRef<any>();

  return (
    <>
      <SectionTitleWrapper maxWidth={maxWidth}>
        <FlexboxGrid justify="space-between" style={{ alignItems: 'flex-end' }}>
          <FlexboxGrid.Item>
            <SectionTitle
              tabIndex={0}
              onClick={onClickTitle}
              onKeyDown={(e: any) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  onClickTitle();
                }
              }}
            >
              {title}
            </SectionTitle>
            {subtitle}
          </FlexboxGrid.Item>
          <FlexboxGrid.Item>
            {data.length > 0 && !noButtons && (
              <ButtonToolbar>
                <ButtonGroup>
                  <StyledButton
                    aria-label="scroll left"
                    size="sm"
                    appearance="subtle"
                    onClick={() => {
                      smoothScroll(
                        400,
                        scrollContainerRef.current,
                        scrollContainerRef.current.scrollLeft -
                          (cardSize || config.lookAndFeel.gridView.cardSize) * 5,
                        'scrollLeft'
                      );
                    }}
                  >
                    <Icon icon="arrow-left" />
                  </StyledButton>
                  <StyledButton
                    aria-label="scroll right"
                    size="sm"
                    appearance="subtle"
                    onClick={() => {
                      smoothScroll(
                        400,
                        scrollContainerRef.current,
                        scrollContainerRef.current.scrollLeft +
                          (cardSize || config.lookAndFeel.gridView.cardSize) * 5,
                        'scrollLeft'
                      );
                    }}
                  >
                    <Icon icon="arrow-right" />
                  </StyledButton>
                </ButtonGroup>
              </ButtonToolbar>
            )}
          </FlexboxGrid.Item>
        </FlexboxGrid>
      </SectionTitleWrapper>

      <ScrollMenuContainer ref={scrollContainerRef} $noScrollbar={noScrollbar} maxWidth={maxWidth}>
        {data.map((item: any) => (
          <span key={item.id} style={{ display: 'inline-block' }}>
            <Card
              itemId={item.id}
              title={item[cardTitle.property] || item.title}
              subtitle={
                typeof cardSubtitle === 'string'
                  ? cardSubtitle
                  : cardSubtitle.unit
                  ? `${item[cardSubtitle.property]}${cardSubtitle.unit}`
                  : item[cardSubtitle.property]
              }
              coverArt={item.image}
              url={
                cardTitle.urlProperty
                  ? `${cardTitle.prefix}/${type === Item.Music ? item.albumId : item.id}`
                  : undefined
              }
              subUrl={
                cardSubtitle.urlProperty
                  ? `${cardSubtitle.prefix}/${item[cardSubtitle.urlProperty]}`
                  : undefined
              }
              playClick={type === Item.Music ? item : { type, id: item.id }}
              details={{ cacheType: type, ...item }}
              hasHoverButtons
              size={cardSize || config.lookAndFeel.gridView.cardSize}
              lazyLoad
              cacheImages={cacheImages}
              cachePath={misc.imageCachePath}
              style={{ margin: '5px' }}
              handleFavorite={handleFavorite}
            />
          </span>
        ))}
      </ScrollMenuContainer>
    </>
  );
};

export default ScrollingMenu;
