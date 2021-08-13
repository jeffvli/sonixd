import { Panel, Button, IconButton } from 'rsuite';
import styled from 'styled-components';
import { LazyLoadImage } from 'react-lazy-load-image-component';

interface Card {
  cardSize: number;
}

/* const getCardSize = (props: any) => {
  return props.cardSize === 'xs'
    ? props.theme.cardXs
    : props.cardSize === 'sm'
    ? props.theme.cardSm
    : props.cardSize === 'md'
    ? props.theme.cardMd
    : props.cardSize === 'lg'
    ? props.theme.cardLg
    : props.theme.cardSm;
}; */

export const StyledPanel = styled(Panel)<Card>`
  text-align: center;
  width: ${(props) => props.cardSize + 2};
  height: ${(props) => props.cardSize + 55};
  margin: 10px;
  &:hover {
    border: 1px solid ${(props) => props.theme.main};
  }
`;

export const InfoPanel = styled(Panel)<Card>`
  width: ${(props) => props.cardSize};
`;

export const InfoSpan = styled.div`
  color: ${(props) => props.theme.subtitleText};
`;

export const CardButton = styled(Button)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const CardTitleButton = styled(CardButton)`
  padding-top: 5px;
  padding-bottom: 2px;
  color: ${(props) => props.theme.titleText};
  width: ${(props) => props.cardSize};
`;

export const CardSubtitleButton = styled(CardButton)`
  padding-bottom: 5px;
  width: ${(props) => props.cardSize};
`;

export const CardSubtitle = styled.div<Card>`
  padding-bottom: 5px;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: ${(props) => props.cardSize};
`;

export const CardImg = styled.img<Card>`
  height: ${(props) => props.cardSize};
  width: ${(props) => props.cardSize};
`;

export const LazyCardImg = styled(LazyLoadImage)<Card>`
  height: ${(props) => props.cardSize};
  width: ${(props) => props.cardSize};
`;

export const Overlay = styled.div<Card>`
  background-color: #1a1d24;
  position: relative;
  height: ${(props) => props.cardSize};
  width: ${(props) => props.cardSize};
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

export const HoverControlButton = styled(IconButton)`
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
