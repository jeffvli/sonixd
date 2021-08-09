import React from 'react';
import { Panel, Button } from 'rsuite';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import placeholderImg from '../../img/placeholder.jpg';

const StyledPanel = styled(Panel)`
  text-align: center;
  width: 150px;
  height: 200px;
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

const CardImg = styled.img`
  max-height: 150px;
`;

const Overlay = styled.div`
  &:hover {
    background-color: #000;
    opacity: 0.5;
    cursor: pointer;
  }
`;

const Card = ({ onClick, url, subUrl, ...rest }: any) => {
  const history = useHistory();

  const handleClick = () => {
    history.push(url);
  };

  const handleSubClick = () => {
    history.push(subUrl);
  };

  return (
    <StyledPanel className="card" tabIndex={0} bordered shaded>
      <Overlay onClick={handleClick}>
        <CardImg
          src={rest.coverArt}
          alt="img"
          onError={(e: any) => {
            e.target.src = placeholderImg;
          }}
        />
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
