import React from 'react';
import { Icon } from 'rsuite';
import { useHistory } from 'react-router-dom';
import cacheImage from '../shared/cacheImage';
import { getAlbum, getPlaylist, getAllArtistSongs } from '../../api/api';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { appendPlayQueue, fixPlayer2Index, setPlayQueue } from '../../redux/playQueueSlice';
import { isCached } from '../../shared/utils';

import {
  StyledPanel,
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
  const playQueue = useAppSelector((state) => state.playQueue);

  const handleClick = () => {
    history.push(url);
  };

  const handleSubClick = () => {
    history.push(subUrl);
  };

  const handlePlayClick = async () => {
    if (playClick.type === 'playlist') {
      const res = await getPlaylist(playClick.id);
      dispatch(setPlayQueue({ entries: res.song }));
      notifyToast('info', `Playing ${res.song.length} song(s)`);
    }

    if (playClick.type === 'album') {
      const res = await getAlbum(playClick.id);
      dispatch(setPlayQueue({ entries: res.song }));
      notifyToast('info', `Playing ${res.song.length} song(s)`);
    }

    if (playClick.type === 'artist') {
      const songs = await getAllArtistSongs(playClick.id);
      dispatch(setPlayQueue({ entries: songs }));
      notifyToast('info', `Playing ${songs.length} song(s)`);
    }

    dispatch(setStatus('PLAYING'));
    dispatch(fixPlayer2Index());
  };

  const handlePlayAppend = async (type: 'next' | 'later') => {
    if (playClick.type === 'playlist') {
      const res = await getPlaylist(playClick.id);
      dispatch(appendPlayQueue({ entries: res.song, type }));
      notifyToast('info', `Added ${res.song.length} song(s)`);
    }

    if (playClick.type === 'album') {
      const res = await getAlbum(playClick.id);
      dispatch(appendPlayQueue({ entries: res.song, type }));
      notifyToast('info', `Added ${res.song.length} song(s)`);
    }

    if (playClick.type === 'artist') {
      const songs = await getAllArtistSongs(playClick.id);
      dispatch(appendPlayQueue({ entries: songs, type }));
      notifyToast('info', `Added ${songs.length} song(s)`);
    }

    if (playQueue.entry.length < 1 || playQueue.currentPlayer === 1) {
      dispatch(setStatus('PLAYING'));
      dispatch(fixPlayer2Index());
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
      <StyledPanel bordered shaded cardsize={size} style={rest.style}>
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
              <AppendOverlayButton
                onClick={() => handlePlayAppend('later')}
                size={size <= 160 ? 'xs' : 'sm'}
                icon={<Icon icon="plus" />}
              />
              <AppendNextOverlayButton
                onClick={() => handlePlayAppend('next')}
                size={size <= 160 ? 'xs' : 'sm'}
                icon={<Icon icon="plus-circle" />}
              />
              {playClick.type !== 'playlist' && (
                <FavoriteOverlayButton
                  onClick={() => handleFavorite(rest.details)}
                  size={size <= 160 ? 'xs' : 'sm'}
                  icon={<Icon icon={rest.details.starred ? 'heart' : 'heart-o'} />}
                />
              )}
              {!rest.isModal && (
                <ModalViewOverlayButton
                  size={size <= 160 ? 'xs' : 'sm'}
                  icon={<Icon icon="external-link" />}
                  onClick={handleOpenModal}
                />
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
      </StyledPanel>
    </>
  );
};

export default Card;
