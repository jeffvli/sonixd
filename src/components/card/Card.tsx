import React from 'react';
import { Panel, Button, IconButton, Icon } from 'rsuite';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';

const StyledPanel = styled(Panel)`
  text-align: center;
  width: 175px;
  height: 225px;
  margin: 10px;
  &:hover {
    transform: scale(1.05);
  }
`;

const InfoPanel = styled(Panel)`
  width: 175px;
`;

const InfoSpan = styled.div``;

const CardButton = styled(Button)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 10px 0px 10px;
  width: 175px;
`;

const CardTitleButton = styled(CardButton)`
  color: ${(props) => props.theme.titleText};
`;

const CardSubtitleButton = styled(CardButton)`
  color: ${(props) => props.theme.subtitleText};
`;

const CardImg = styled.img`
  max-height: 175px;
`;

const Overlay = styled.div`
  position: relative;
  &:hover {
    background-color: #000;
    opacity: 0.7;
    cursor: pointer;
    display: block;
  }

  &:hover .rs-btn {
    display: block;
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

const Card = ({ onClick, url, subUrl, hasHoverButtons, ...rest }: any) => {
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
        <CardImg src={rest.coverArt} alt="img" />
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
          <CardSubtitleButton
            appearance="link"
            size="xs"
            onClick={handleSubClick}
          >
            {rest.subtitle}
          </CardSubtitleButton>
        </InfoSpan>
      </InfoPanel>
    </StyledPanel>
  );
};

export default Card;
