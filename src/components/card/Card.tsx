import React from 'react';
import { Panel, Button, IconButton, Icon } from 'rsuite';
import styled from 'styled-components';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { useHistory } from 'react-router-dom';
import { getAlbum, getPlaylist } from '../../api/api';
import { useAppDispatch } from '../../redux/hooks';
import { clearPlayQueue, setPlayQueue } from '../../redux/playQueueSlice';

const StyledPanel = styled(Panel)`
  text-align: center;
  width: 152px;
  height: 205px;
  margin: 10px;
  &:hover {
    border: 1px solid ${(props) => props.theme.main};
  }
`;

const InfoPanel = styled(Panel)`
  width: 150px;
`;

const InfoSpan = styled.div``;

const CardButton = styled(Button)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 10px 0px 10px;
  width: 150px;
`;

const CardTitleButton = styled(CardButton)`
  color: ${(props) => props.theme.titleText};
`;

const CardSubtitleButton = styled(CardButton)`
  color: ${(props) => props.theme.subtitleText};
`;

const CardSubtitle = styled.div`
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 10px 0px 10px;
  width: 150px;
  color: ${(props) => props.theme.subtitleText};
`;

const CardImg = styled.img`
  height: 150px;
  width: 150px;
`;

const LazyCardImg = styled(LazyLoadImage)`
  height: 150px;
  height: 150px;
`;

const Overlay = styled.div`
  background-color: #1a1d24;
  position: relative;
  height: 150px;
  width: 150px;
  &:hover {
    background-color: #000;
    opacity: 0.5;
    cursor: pointer;
    display: block;
  }

  &:hover .rs-btn {
    display: block;
  }

  .lazy-load-image-background.opacity {
    opacity: 0;
  }

  .lazy-load-image-background.opacity.lazy-load-image-loaded {
    opacity: 1;
    transition: opacity 0.3s;
  }
`;

const HoverControlButton = styled(IconButton)`
  display: none;
  opacity: 0.9;
  border: 1px solid #fff;
  position: absolute !important;
  width: 0px;
  height: 0px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
  background: #20252c;

  &:hover {
    opacity: 1;
    background: ${(props) => props.theme.main};
  }
`;

const Card = ({
  onClick,
  url,
  subUrl,
  hasHoverButtons,
  lazyLoad,
  playClick,
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
      dispatch(clearPlayQueue());
      dispatch(setPlayQueue(res.entry));
    }

    if (playClick.type === 'album') {
      const res = await getAlbum(playClick.id);
      dispatch(clearPlayQueue());
      dispatch(setPlayQueue(res.song));
    }

    if (playClick.type === 'artist') {
      const res = await getAlbum(playClick.id);
      dispatch(clearPlayQueue());
      dispatch(setPlayQueue(res.song));
    }
  };

  return (
    <StyledPanel tabIndex={0} bordered shaded>
      <Overlay>
        {lazyLoad ? (
          <LazyCardImg
            src={rest.coverArt}
            alt="img"
            effect="opacity"
            onClick={handleClick}
          />
        ) : (
          <CardImg src={rest.coverArt} alt="img" onClick={handleClick} />
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
      <InfoPanel>
        <InfoSpan>
          <CardTitleButton appearance="link" size="xs" onClick={handleClick}>
            {rest.title}
          </CardTitleButton>
        </InfoSpan>
        <InfoSpan>
          {subUrl ? (
            <CardSubtitleButton
              appearance="link"
              size="xs"
              onClick={handleSubClick}
            >
              {rest.subtitle}
            </CardSubtitleButton>
          ) : (
            <CardSubtitle>{rest.subtitle}</CardSubtitle>
          )}
        </InfoSpan>
      </InfoPanel>
    </StyledPanel>
  );
};

export default Card;
