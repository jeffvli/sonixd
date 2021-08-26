import React from 'react';
import settings from 'electron-settings';
import path from 'path';
import fs from 'fs';
import { Icon } from 'rsuite';
import { useHistory } from 'react-router-dom';
import cacheImage from '../shared/cacheImage';
import { getAlbum, getPlaylist } from '../../api/api';
import { useAppDispatch } from '../../redux/hooks';
import { fixPlayer2Index, setPlayQueue } from '../../redux/playQueueSlice';

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
  HoverControlButton,
} from './styled';

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

  const handleClick = () => {
    history.push(url);
  };

  const handleSubClick = () => {
    history.push(subUrl);
  };

  const handlePlayClick = async () => {
    if (playClick.type === 'playlist') {
      const res = await getPlaylist(playClick.id);
      dispatch(setPlayQueue(res.entry));
      dispatch(fixPlayer2Index());
    }

    if (playClick.type === 'album') {
      const res = await getAlbum(playClick.id);
      dispatch(setPlayQueue(res.song));
      dispatch(fixPlayer2Index());
    }

    if (playClick.type === 'artist') {
      const res = await getAlbum(playClick.id);
      dispatch(setPlayQueue(res.song));
      dispatch(fixPlayer2Index());
    }
  };

  const isCached = () => {
    return fs.existsSync(
      path.join(
        path.dirname(settings.file()),
        'sonixdCache',
        `${settings.getSync('serverBase64')}`,
        rest.details.cacheType,
        `${rest.details.cacheType}_${rest.details.id}.jpg`
      )
    );
  };

  return (
    <StyledPanel
      tabIndex={0}
      bordered
      shaded
      cardsize={size}
      style={rest.style}
    >
      <Overlay cardsize={size}>
        {lazyLoad ? (
          <LazyCardImg
            src={
              isCached()
                ? path.join(
                    path.dirname(settings.file()),
                    'sonixdCache',
                    `${settings.getSync('serverBase64')}`,
                    rest.details.cacheType,
                    `${rest.details.cacheType}_${rest.details.id}.jpg`
                  )
                : rest.coverArt
            }
            alt="img"
            effect="opacity"
            onClick={handleClick}
            cardsize={size}
            afterLoad={() => {
              cacheImage(
                `${rest.details.cacheType}_${rest.details.id}.jpg`,
                rest.coverArt.replace(/size=\d+/, 'size=350'),
                rest.details.cacheType
              );
            }}
          />
        ) : (
          <CardImg
            src={rest.coverArt}
            alt="img"
            onClick={handleClick}
            cardsize={size}
          />
        )}

        {hasHoverButtons && (
          <HoverControlButton
            size="lg"
            circle
            icon={<Icon icon="play" />}
            onClick={handlePlayClick}
          />
        )}
      </Overlay>
      <InfoPanel cardsize={size}>
        <InfoSpan>
          <CardTitleButton
            appearance="link"
            size="sm"
            onClick={handleClick}
            cardsize={size}
          >
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
            <CardSubtitle cardsize={size}>{rest.subtitle}</CardSubtitle>
          )}
        </InfoSpan>
      </InfoPanel>
    </StyledPanel>
  );
};

export default Card;
