import React from 'react';
import { Icon } from 'rsuite';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import cacheImage from '../shared/cacheImage';
import { useAppDispatch } from '../../redux/hooks';
import { isCached } from '../../shared/utils';
import {
  CardPanel,
  InfoPanel,
  InfoSpan,
  CardTitleButton,
  CardSubtitleButton,
  CardSubtitle,
  CardImg,
  LazyCardImg,
  Overlay,
  PlayOverlayButton,
  FavoriteOverlayButton,
  AppendOverlayButton,
  ModalViewOverlayButton,
  AppendNextOverlayButton,
  CardImgWrapper,
  ImgPanel,
  CardTitleWrapper,
} from './styled';
import { addModalPage } from '../../redux/miscSlice';
import CustomTooltip from '../shared/CustomTooltip';
import { CoverArtWrapper, CustomImageGrid, CustomImageGridWrapper } from '../layout/styled';
import usePlayQueueHandler from '../../hooks/usePlayQueueHandler';
import { Item, Play } from '../../types';

const Card = ({
  onClick,
  url,
  subUrl,
  hasHoverButtons,
  lazyLoad,
  playClick,
  size,
  cacheImages,
  cachePath,
  handleFavorite,
  notVisibleByDefault,
  noInfoPanel,
  noModalButton,
  ...rest
}: any) => {
  const { t } = useTranslation();
  const history = useHistory();
  const dispatch = useAppDispatch();

  const handleClick = () => {
    if (url) {
      history.push(url);
    }
  };

  const handleSubClick = () => {
    history.push(subUrl);
  };

  const { handlePlayQueueAdd } = usePlayQueueHandler();

  const handleOpenModal = () => {
    dispatch(
      addModalPage({
        pageType: playClick.type,
        id: rest.details.id,
      })
    );
  };

  return (
    <>
      <CardPanel cardsize={size} style={rest.style} $noInfoPanel={noInfoPanel}>
        <Overlay cardsize={size}>
          <ImgPanel
            tabIndex={0}
            onKeyDown={(e: any) => {
              if (e.key === ' ' || e.key === 'Enter') {
                handleClick();
              }
            }}
          >
            {Array.isArray(rest.coverArt) ? (
              <CoverArtWrapper size={size}>
                <CustomImageGridWrapper>
                  <CustomImageGrid $gridArea="1 / 1 / 2 / 2">
                    <LazyLoadImage
                      src={rest.coverArt[0]}
                      alt="header-img"
                      height={size / 2}
                      width={size / 2}
                    />
                  </CustomImageGrid>
                  <CustomImageGrid $gridArea="1 / 2 / 2 / 3">
                    <LazyLoadImage
                      src={rest.coverArt[1]}
                      alt="header-img"
                      height={size / 2}
                      width={size / 2}
                    />
                  </CustomImageGrid>
                  <CustomImageGrid $gridArea="2 / 1 / 3 / 2">
                    <LazyLoadImage
                      src={rest.coverArt[2]}
                      alt="header-img"
                      height={size / 2}
                      width={size / 2}
                    />
                  </CustomImageGrid>
                  <CustomImageGrid $gridArea="2 / 2 / 3 / 3">
                    <LazyLoadImage
                      src={rest.coverArt[3]}
                      alt="header-img"
                      height={size / 2}
                      width={size / 2}
                    />
                  </CustomImageGrid>
                </CustomImageGridWrapper>
              </CoverArtWrapper>
            ) : rest.coverArt.match('placeholder') ? (
              <CardImgWrapper
                id="placeholder-wrapper"
                size={size}
                opacity={0.4}
                onClick={handleClick}
              >
                <Icon
                  icon={
                    playClick.type === 'album'
                      ? 'book2'
                      : playClick.type === 'artist'
                      ? 'user'
                      : playClick.type === 'playlist'
                      ? 'list-ul'
                      : 'music'
                  }
                  size="4x"
                />
              </CardImgWrapper>
            ) : (
              <CardImgWrapper size={size} onClick={handleClick}>
                {lazyLoad ? (
                  <LazyCardImg
                    src={
                      isCached(`${cachePath}${rest.details.cacheType}_${rest.details.id}.jpg`)
                        ? `${cachePath}${rest.details.cacheType}_${rest.details.id}.jpg`
                        : rest.coverArt
                    }
                    alt="img"
                    effect="opacity"
                    cardsize={size}
                    visibleByDefault={!notVisibleByDefault}
                    afterLoad={() => {
                      if (cacheImages) {
                        cacheImage(
                          `${rest.details.cacheType}_${rest.details.id}.jpg`,
                          rest.coverArt.replaceAll(/=150/gi, '=350')
                        );
                      }
                    }}
                  />
                ) : (
                  <CardImg src={rest.coverArt} alt="img" onClick={handleClick} cardsize={size} />
                )}
              </CardImgWrapper>
            )}

            {hasHoverButtons && (
              <>
                {rest.details.starred && <div className="corner-triangle" />}
                <PlayOverlayButton
                  size="lg"
                  circle
                  icon={<Icon icon="play" />}
                  onClick={() => {
                    if (playClick.type === Item.Music) {
                      return handlePlayQueueAdd({
                        byData: [playClick],
                        play: Play.Play,
                      });
                    }
                    return handlePlayQueueAdd({
                      byItemType: { item: playClick.type, id: playClick.id },
                      play: Play.Play,
                    });
                  }}
                />

                <CustomTooltip text={t('Add to queue (later)')} delay={1000}>
                  <AppendOverlayButton
                    aria-label={t('Add to queue (later)')}
                    onClick={() => {
                      if (playClick.type === Item.Music) {
                        return handlePlayQueueAdd({
                          byData: [playClick],
                          play: Play.Later,
                        });
                      }
                      return handlePlayQueueAdd({
                        byItemType: { item: playClick.type, id: playClick.id },
                        play: Play.Later,
                      });
                    }}
                    size={size <= 160 ? 'xs' : 'sm'}
                    icon={<Icon icon="plus" />}
                  />
                </CustomTooltip>

                <CustomTooltip text={t('Add to queue (next)')} delay={1000}>
                  <AppendNextOverlayButton
                    aria-label={t('Add to queue (next)')}
                    onClick={() => {
                      if (playClick.type === Item.Music) {
                        return handlePlayQueueAdd({
                          byData: [playClick],
                          play: Play.Next,
                        });
                      }
                      return handlePlayQueueAdd({
                        byItemType: { item: playClick.type, id: playClick.id },
                        play: Play.Next,
                      });
                    }}
                    size={size <= 160 ? 'xs' : 'sm'}
                    icon={<Icon icon="plus-circle" />}
                  />
                </CustomTooltip>

                {playClick.type !== 'playlist' && (
                  <CustomTooltip text={t('Toggle favorite')} delay={1000}>
                    <FavoriteOverlayButton
                      aria-label={
                        rest.details.starred ? t('Remove from favorites') : t('Add to favorites')
                      }
                      onClick={() => handleFavorite(rest.details)}
                      size={size <= 160 ? 'xs' : 'sm'}
                      icon={<Icon icon={rest.details.starred ? 'heart' : 'heart-o'} />}
                    />
                  </CustomTooltip>
                )}
                {!rest.isModal && !noModalButton && (
                  <CustomTooltip text={t('View in modal')} delay={1000}>
                    <ModalViewOverlayButton
                      aria-label={t('View in modal')}
                      size={size <= 160 ? 'xs' : 'sm'}
                      icon={<Icon icon="external-link" />}
                      onClick={handleOpenModal}
                    />
                  </CustomTooltip>
                )}
              </>
            )}
          </ImgPanel>
        </Overlay>

        {!noInfoPanel && (
          <InfoPanel cardsize={size}>
            <InfoSpan>
              <CardTitleWrapper>
                <CustomTooltip text={rest.title}>
                  <CardTitleButton
                    appearance="link"
                    tabIndex={-1}
                    size="sm"
                    onClick={handleClick}
                    cardsize={size}
                  >
                    {rest.title}
                  </CardTitleButton>
                </CustomTooltip>
              </CardTitleWrapper>
            </InfoSpan>
            <InfoSpan>
              {subUrl ? (
                <CardTitleWrapper>
                  <CustomTooltip text={rest.subtitle}>
                    <CardSubtitleButton
                      appearance="link"
                      tabIndex={-1}
                      size="xs"
                      onClick={handleSubClick}
                      cardsize={size}
                    >
                      {rest.subtitle}
                    </CardSubtitleButton>
                  </CustomTooltip>
                </CardTitleWrapper>
              ) : (
                <CardSubtitle cardsize={size}>
                  {rest.subtitle !== 'undefined' ? rest.subtitle : <span>&#8203;</span>}
                </CardSubtitle>
              )}
            </InfoSpan>
          </InfoPanel>
        )}
      </CardPanel>
    </>
  );
};

export default Card;
