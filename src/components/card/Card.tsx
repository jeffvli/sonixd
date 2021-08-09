import React from 'react';
import { Panel, Button, IconButton, Icon } from 'rsuite';
import styled from 'styled-components';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { useHistory } from 'react-router-dom';

const StyledPanel = styled(Panel)`
  text-align: center;
  width: 155px;
  height: 205px;
  margin: 10px;
  &:hover {
    transform: scale(1.05);
  }
`;

const InfoPanel = styled(Panel)`
  width: 155px;
`;

const InfoSpan = styled.div``;

const CardButton = styled(Button)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 10px 0px 10px;
  width: 155px;
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
  width: 155px;
  color: ${(props) => props.theme.subtitleText};
`;

const CardImg = styled.img`
  max-height: 155px;
`;

const LazyCardImg = styled(LazyLoadImage)`
  max-height: 155px;
`;

const Overlay = styled.div`
  position: relative;
  height: 155px;
  &:hover {
    background-color: #000;
    opacity: 0.7;
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
  opacity: 0.4;
  position: absolute !important;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);

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
  ...rest
}: any) => {
  const history = useHistory();

  const handleClick = () => {
    history.push(url);
  };

  const handleSubClick = () => {
    history.push(subUrl);
  };

  return (
    <StyledPanel tabIndex={0} bordered shaded>
      <Overlay onClick={handleClick}>
        {lazyLoad ? (
          <LazyCardImg src={rest.coverArt} alt="img" effect="opacity" />
        ) : (
          <CardImg src={rest.coverArt} alt="img" />
        )}

        {hasHoverButtons && (
          <HoverControlButton size="lg" circle icon={<Icon icon="play" />} />
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
