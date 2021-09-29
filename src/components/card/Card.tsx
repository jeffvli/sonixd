import React, { useState } from 'react';
import path from 'path';
import settings from 'electron-settings';
import { Icon } from 'rsuite';
import { useHistory } from 'react-router-dom';
import { useQueryClient } from 'react-query';
import cacheImage from '../shared/cacheImage';
import { getAlbum, getPlaylist, star, unstar } from '../../api/api';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { appendPlayQueue, fixPlayer2Index, setPlayQueue } from '../../redux/playQueueSlice';
import { isCached, getImageCachePath } from '../../shared/utils';

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
} from './styled';
import { setStatus } from '../../redux/playerSlice';
import { addModalPage } from '../../redux/miscSlice';

const Card = ({
  onClick,
  url,
  subUrl,
  hasHoverButtons,
  lazyLoad,
  playClick,
  size,
  ...rest
}: any) => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const playQueue = useAppSelector((state) => state.playQueue);
  const queryClient = useQueryClient();
  const [cacheImages] = useState(Boolean(settings.getSync('cacheImages')));
  const [cachePath] = useState(path.join(getImageCachePath(), '/'));

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
      dispatch(setStatus('PLAYING'));
      dispatch(fixPlayer2Index());
    }

    if (playClick.type === 'album' || playClick.type === 'artist') {
      const res = await getAlbum(playClick.id);
      dispatch(setPlayQueue({ entries: res.song }));
      dispatch(setStatus('PLAYING'));
      dispatch(fixPlayer2Index());
    }
  };

  const handlePlayAppend = async () => {
    if (playClick.type === 'playlist') {
      const res = await getPlaylist(playClick.id);
      dispatch(appendPlayQueue({ entries: res.song }));
    }

    if (playClick.type === 'album' || playClick.type === 'artist') {
      const res = await getAlbum(playClick.id);
      dispatch(appendPlayQueue({ entries: res.song }));
    }

    if (playQueue.entry.length < 1) {
      dispatch(setStatus('PLAYING'));
    }
  };

  const handleFavorite = async () => {
    if (!rest.details.starred) {
      await star(rest.details.id, 'album');
    } else {
      await unstar(rest.details.id, 'album');
    }

    await queryClient.refetchQueries(['artist'], {
      active: true,
    });
    await queryClient.refetchQueries(['album'], {
      active: true,
    });
    await queryClient.refetchQueries(['starred'], {
      active: true,
    });
    await queryClient.refetchQueries(['playlist'], {
      active: true,
    });
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
              <PlayOverlayButton
                size="lg"
                circle
                icon={<Icon icon="play" />}
                onClick={handlePlayClick}
              />
              <AppendOverlayButton
                onClick={handlePlayAppend}
                size="xs"
                icon={<Icon icon="plus" />}
              />
              {playClick.type !== 'playlist' && (
                <FavoriteOverlayButton
                  onClick={handleFavorite}
                  size="xs"
                  icon={<Icon icon={rest.details.starred ? 'heart' : 'heart-o'} />}
                />
              )}
              {!rest.isModal && (
                <ModalViewOverlayButton
                  size="xs"
                  icon={<Icon icon="external-link" />}
                  onClick={handleOpenModal}
                />
              )}
            </>
          )}
        </Overlay>
        <InfoPanel cardsize={size}>
          <InfoSpan>
            <CardTitleButton appearance="link" size="sm" onClick={handleClick} cardsize={size}>
              {rest.title}
            </CardTitleButton>
          </InfoSpan>
          <InfoSpan>
            {subUrl ? (
              <CardSubtitleButton
                appearance="link"
                size="xs"
                onClick={handleSubClick}
                cardsize={size}
              >
                {rest.subtitle}
              </CardSubtitleButton>
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
