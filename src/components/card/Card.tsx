import React from 'react';
import { Icon } from 'rsuite';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import cacheImage from '../shared/cacheImage';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  appendPlayQueue,
  clearPlayQueue,
  fixPlayer2Index,
  setPlayQueue,
} from '../../redux/playQueueSlice';
import { filterPlayQueue, getPlayedSongsNotification, isCached } from '../../shared/utils';

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
import { setStatus } from '../../redux/playerSlice';
import { addModalPage } from '../../redux/miscSlice';
import { notifyToast } from '../shared/toast';
import CustomTooltip from '../shared/CustomTooltip';
import { apiController } from '../../api/controller';
import { CoverArtWrapper, CustomImageGrid, CustomImageGridWrapper } from '../layout/styled';

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
  const config = useAppSelector((state) => state.config);

  const handleClick = () => {
    history.push(url);
  };

  const handleSubClick = () => {
    history.push(subUrl);
  };

  const handlePlayClick = async () => {
    if (playClick.type === 'playlist') {
      const res = await apiController({
        serverType: config.serverType,
        endpoint: 'getPlaylist',
        args: { id: playClick.id },
      });

      const songs = filterPlayQueue(config.playback.filters, res.song);

      if (songs.entries.length > 0) {
        dispatch(setPlayQueue({ entries: songs.entries }));
        dispatch(setStatus('PLAYING'));
        dispatch(fixPlayer2Index());
      } else {
        dispatch(clearPlayQueue());
        dispatch(setStatus('PAUSED'));
      }

      notifyToast('info', getPlayedSongsNotification({ ...songs.count, type: 'play' }));
    }

    if (playClick.type === 'album' || playClick.type === 'music') {
      const res = await apiController({
        serverType: config.serverType,
        endpoint: 'getAlbum',
        args: { id: playClick.id },
      });

      const songs = filterPlayQueue(config.playback.filters, res.song);

      if (songs.entries.length > 0) {
        dispatch(setPlayQueue({ entries: songs.entries }));
        dispatch(setStatus('PLAYING'));
        dispatch(fixPlayer2Index());
      } else {
        dispatch(clearPlayQueue());
        dispatch(setStatus('PAUSED'));
      }

      notifyToast('info', getPlayedSongsNotification({ ...songs.count, type: 'play' }));
    }

    if (playClick.type === 'artist') {
      const res = await apiController({
        serverType: config.serverType,
        endpoint: 'getArtistSongs',
        args: { id: playClick.id, musicFolderId: rest.musicFolderId },
      });

      const songs = filterPlayQueue(config.playback.filters, res);

      if (songs.entries.length > 0) {
        dispatch(setPlayQueue({ entries: songs.entries }));
        dispatch(setStatus('PLAYING'));
        dispatch(fixPlayer2Index());
      } else {
        dispatch(clearPlayQueue());
        dispatch(setStatus('PAUSED'));
      }

      notifyToast('info', getPlayedSongsNotification({ ...songs.count, type: 'play' }));
    }
  };

  const handlePlayAppend = async (type: 'next' | 'later') => {
    if (playClick.type === 'playlist') {
      const res = await apiController({
        serverType: config.serverType,
        endpoint: 'getPlaylist',
        args: { id: playClick.id },
      });

      const songs = filterPlayQueue(config.playback.filters, res.song);

      if (songs.entries.length > 0) {
        dispatch(appendPlayQueue({ entries: songs.entries, type }));
        dispatch(fixPlayer2Index());
      }

      notifyToast('info', getPlayedSongsNotification({ ...songs.count, type: 'add' }));
    }

    if (playClick.type === 'album' || playClick.type === 'music') {
      const res = await apiController({
        serverType: config.serverType,
        endpoint: 'getAlbum',
        args: { id: playClick.id },
      });

      const songs = filterPlayQueue(config.playback.filters, res.song);

      if (songs.entries.length > 0) {
        dispatch(appendPlayQueue({ entries: songs.entries, type }));
        dispatch(fixPlayer2Index());
      }

      notifyToast('info', getPlayedSongsNotification({ ...songs.count, type: 'add' }));
    }

    if (playClick.type === 'artist') {
      const res = await apiController({
        serverType: config.serverType,
        endpoint: 'getArtistSongs',
        args: { id: playClick.id, musicFolderId: rest.musicFolderId },
      });

      const songs = filterPlayQueue(config.playback.filters, res);

      if (songs.entries.length > 0) {
        dispatch(appendPlayQueue({ entries: songs.entries, type }));
        dispatch(fixPlayer2Index());
      }

      notifyToast('info', getPlayedSongsNotification({ ...songs.count, type: 'add' }));
    }
  };

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
      <CardPanel cardsize={size} style={rest.style}>
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
                    visibleByDefault={notVisibleByDefault ? false : cacheImages}
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
                  onClick={handlePlayClick}
                />

                <CustomTooltip text={t('Add to queue (later)')} delay={1000}>
                  <AppendOverlayButton
                    onClick={() => handlePlayAppend('later')}
                    size={size <= 160 ? 'xs' : 'sm'}
                    icon={<Icon icon="plus" />}
                  />
                </CustomTooltip>

                <CustomTooltip text={t('Add to queue (next)')} delay={1000}>
                  <AppendNextOverlayButton
                    onClick={() => handlePlayAppend('next')}
                    size={size <= 160 ? 'xs' : 'sm'}
                    icon={<Icon icon="plus-circle" />}
                  />
                </CustomTooltip>

                {playClick.type !== 'playlist' && (
                  <CustomTooltip text={t('Toggle favorite')} delay={1000}>
                    <FavoriteOverlayButton
                      onClick={() => handleFavorite(rest.details)}
                      size={size <= 160 ? 'xs' : 'sm'}
                      icon={<Icon icon={rest.details.starred ? 'heart' : 'heart-o'} />}
                    />
                  </CustomTooltip>
                )}
                {!rest.isModal && !noModalButton && (
                  <CustomTooltip text={t('View in modal')} delay={1000}>
                    <ModalViewOverlayButton
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
