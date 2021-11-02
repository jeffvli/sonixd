import React from 'react';
import { Icon } from 'rsuite';
import { useHistory } from 'react-router-dom';
import cacheImage from '../shared/cacheImage';
import { getAlbum, getPlaylist, getAllArtistSongs } from '../../api/api';
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
} from './styled';
import { setStatus } from '../../redux/playerSlice';
import { addModalPage } from '../../redux/miscSlice';
import { notifyToast } from '../shared/toast';
import CustomTooltip from '../shared/CustomTooltip';

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
  ...rest
}: any) => {
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
      const res = await getPlaylist(playClick.id);
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

    if (playClick.type === 'album') {
      const res = await getAlbum(playClick.id);
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
      const res = await getAllArtistSongs(playClick.id);
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
      const res = await getPlaylist(playClick.id);
      const songs = filterPlayQueue(config.playback.filters, res.song);

      if (songs.entries.length > 0) {
        dispatch(appendPlayQueue({ entries: songs.entries, type }));
        dispatch(fixPlayer2Index());
      }

      notifyToast('info', getPlayedSongsNotification({ ...songs.count, type: 'add' }));
    }

    if (playClick.type === 'album') {
      const res = await getAlbum(playClick.id);
      const songs = filterPlayQueue(config.playback.filters, res.song);

      if (songs.entries.length > 0) {
        dispatch(appendPlayQueue({ entries: songs.entries, type }));
        dispatch(fixPlayer2Index());
      }

      notifyToast('info', getPlayedSongsNotification({ ...songs.count, type: 'add' }));
    }

    if (playClick.type === 'artist') {
      const res = await getAllArtistSongs(playClick.id);
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
          {lazyLoad ? (
            <LazyCardImg
              src={
                isCached(`${cachePath}${rest.details.cacheType}_${rest.details.id}.jpg`)
                  ? `${cachePath}${rest.details.cacheType}_${rest.details.id}.jpg`
                  : rest.coverArt
              }
              alt="img"
              effect="opacity"
              onClick={handleClick}
              cardsize={size}
              visibleByDefault={cacheImages}
              afterLoad={() => {
                if (cacheImages) {
                  cacheImage(
                    `${rest.details.cacheType}_${rest.details.id}.jpg`,
                    rest.coverArt.replace(/size=\d+/, 'size=500')
                  );
                }
              }}
            />
          ) : (
            <CardImg src={rest.coverArt} alt="img" onClick={handleClick} cardsize={size} />
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

              <CustomTooltip text="Add to queue (later)">
                <AppendOverlayButton
                  onClick={() => handlePlayAppend('later')}
                  size={size <= 160 ? 'xs' : 'sm'}
                  icon={<Icon icon="plus" />}
                />
              </CustomTooltip>

              <CustomTooltip text="Add to queue (next)">
                <AppendNextOverlayButton
                  onClick={() => handlePlayAppend('next')}
                  size={size <= 160 ? 'xs' : 'sm'}
                  icon={<Icon icon="plus-circle" />}
                />
              </CustomTooltip>

              {playClick.type !== 'playlist' && (
                <CustomTooltip text="Toggle favorite">
                  <FavoriteOverlayButton
                    onClick={() => handleFavorite(rest.details)}
                    size={size <= 160 ? 'xs' : 'sm'}
                    icon={<Icon icon={rest.details.starred ? 'heart' : 'heart-o'} />}
                  />
                </CustomTooltip>
              )}
              {!rest.isModal && (
                <CustomTooltip text="View in modal">
                  <ModalViewOverlayButton
                    size={size <= 160 ? 'xs' : 'sm'}
                    icon={<Icon icon="external-link" />}
                    onClick={handleOpenModal}
                  />
                </CustomTooltip>
              )}
            </>
          )}
        </Overlay>
        <InfoPanel cardsize={size}>
          <InfoSpan>
            <CustomTooltip text={rest.title}>
              <CardTitleButton appearance="link" size="sm" onClick={handleClick} cardsize={size}>
                {rest.title}
              </CardTitleButton>
            </CustomTooltip>
          </InfoSpan>
          <InfoSpan>
            {subUrl ? (
              <CustomTooltip text={rest.subtitle}>
                <CardSubtitleButton
                  appearance="link"
                  size="xs"
                  onClick={handleSubClick}
                  cardsize={size}
                >
                  {rest.subtitle}
                </CardSubtitleButton>
              </CustomTooltip>
            ) : (
              <CardSubtitle cardsize={size}>
                {rest.subtitle !== 'undefined' ? rest.subtitle : <span>&#8203;</span>}
              </CardSubtitle>
            )}
          </InfoSpan>
        </InfoPanel>
      </CardPanel>
    </>
  );
};

export default Card;
