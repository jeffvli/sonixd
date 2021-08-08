import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { ScrollMenu, VisibilityContext } from 'react-horizontal-scrolling-menu';
import { Panel, Button, Icon } from 'rsuite';
import styled from 'styled-components';
import placeholderImg from '../../img/placeholder.jpg';

const ScrollMenuContainer = styled.div`
  margin-bottom: 25px;
`;

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

const InfoSpan = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 10px 0px 10px;
`;

const CardImg = styled.img`
  max-height: 150px;
`;

const Overlay = styled.div`
  &:hover {
    background-color: #000;
    opacity: 0.5;
  }
`;

const Title = styled.h1`
  margin-left: 20px;
  font-size: 20px !important;
`;

const LeftArrow = () => {
  const { isFirstItemVisible, scrollPrev } = useContext(VisibilityContext);

  return (
    <Button
      appearance="link"
      disabled={isFirstItemVisible}
      onClick={() => scrollPrev()}
    >
      <Icon icon="arrow-left" />
    </Button>
  );
};

const RightArrow = () => {
  const { isLastItemVisible, scrollNext } = useContext(VisibilityContext);

  return (
    <Button
      appearance="link"
      disabled={isLastItemVisible}
      onClick={() => scrollNext()}
    >
      <Icon icon="arrow-right" />
    </Button>
  );
};

const Card = ({ onClick, url, ...rest }: any) => {
  const history = useHistory();

  const handleClick = () => {
    console.log('click');
    history.push(url);
  };

  return (
    <StyledPanel className="card" tabIndex={0} bordered shaded>
      <Overlay onClick={handleClick}>
        <CardImg
          src={rest.coverArt}
          alt="img"
          onError={(e: any) => {
            e.target.src = placeholderImg; // some replacement image
          }}
        />
      </Overlay>
      <InfoPanel>
        <InfoSpan>{rest.title}</InfoSpan>
        <InfoSpan>{rest.year}</InfoSpan>
      </InfoPanel>
    </StyledPanel>
  );
};

const ScrollingMenu = ({ routePrefix, data, title }: any) => {
  return (
    <ScrollMenuContainer>
      <div>
        <Title>{title}</Title>
      </div>
      <ScrollMenu LeftArrow={LeftArrow} RightArrow={RightArrow}>
        {data.map((item: any) => (
          <Card
            itemId={item.id}
            title={item.name || item.title}
            year={item.year}
            key={item.id}
            coverArt={item.image}
            url={`${routePrefix}/${item.id}`}
          />
        ))}
      </ScrollMenu>
    </ScrollMenuContainer>
  );
};

export default ScrollingMenu;
