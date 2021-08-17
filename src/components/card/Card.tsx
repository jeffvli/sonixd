import React from 'react';
import { Icon } from 'rsuite';
import { useHistory } from 'react-router-dom';
import { getAlbum, getPlaylist } from '../../api/api';
import { useAppDispatch } from '../../redux/hooks';
import { setPlayQueue } from '../../redux/playQueueSlice';
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
    }

    if (playClick.type === 'album') {
      const res = await getAlbum(playClick.id);
      dispatch(setPlayQueue(res.song));
    }

    if (playClick.type === 'artist') {
      const res = await getAlbum(playClick.id);
      dispatch(setPlayQueue(res.song));
    }
  };

  return (
    <StyledPanel tabIndex={0} bordered shaded cardSize={size}>
      <Overlay cardSize={size}>
        {lazyLoad ? (
          <LazyCardImg
            src={rest.coverArt}
            alt="img"
            effect="opacity"
            onClick={handleClick}
            cardSize={size}
          />
        ) : (
          <CardImg
            src={rest.coverArt}
            alt="img"
            onClick={handleClick}
            cardSize={size}
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
      <InfoPanel cardSize={size}>
        <InfoSpan>
          <CardTitleButton
            appearance="link"
            size="sm"
            onClick={handleClick}
            cardSize={size}
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
              cardSize={size}
            >
              {rest.subtitle}
            </CardSubtitleButton>
          ) : (
            <CardSubtitle cardSize={size}>{rest.subtitle}</CardSubtitle>
          )}
        </InfoSpan>
      </InfoPanel>
    </StyledPanel>
  );
};

export default Card;
