import { Panel, Button, IconButton } from 'rsuite';
import styled from 'styled-components';
import { LazyLoadImage } from 'react-lazy-load-image-component';

interface Card {
  cardsize: number;
}

/* const getcardsize = (props: any) => {
  return props.cardsize === 'xs'
    ? props.theme.primary.cardXs
    : props.cardsize === 'sm'
    ? props.theme.primary.cardSm
    : props.cardsize === 'md'
    ? props.theme.primary.cardMd
    : props.cardsize === 'lg'
    ? props.theme.primary.cardLg
    : props.theme.primary.cardSm;
}; */

export const StyledPanel = styled(Panel)<Card>`
  text-align: center;
  width: ${(props) => `${Number(props.cardsize) + 2}px`};
  height: ${(props) => `${Number(props.cardsize) + 55}px`};
  border-radius: 0px !important;
  &:hover {
    border: 1px solid ${(props) => props.theme.primary.main};
    img {
      filter: brightness(70%);
      -webkit-filter: brightness(70%);
    }
  }

  &:hover .rs-btn {
    display: block;
  }
`;

export const InfoPanel = styled(Panel)<Card>`
  width: ${(props) => `${props.cardsize}px`};
`;

export const InfoSpan = styled.div`
  color: ${(props) => props.theme.secondary.text};
`;

export const CardButton = styled(Button)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const CardTitleButton = styled(CardButton)`
  padding-top: 5px;
  padding-bottom: 2px;
  color: ${(props) => props.theme.primary.text};
  width: ${(props) => `${props.cardsize}px`};
`;

export const CardSubtitleButton = styled(CardButton)`
  padding-bottom: 5px;
  color: ${(props) => props.theme.secondary.text};
  width: ${(props) => `${props.cardsize}px`};
`;

export const CardSubtitle = styled.div<Card>`
  padding-bottom: 5px;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: ${(props) => `${props.cardsize}px`};
`;

export const CardImg = styled.img<Card>`
  height: ${(props) => `${props.cardsize}px`};
  width: ${(props) => `${props.cardsize}px`};
`;

export const LazyCardImg = styled(LazyLoadImage)<Card>`
  height: ${(props) => `${props.cardsize}px`};
  width: ${(props) => `${props.cardsize}px`};
`;

export const Overlay = styled.div<Card>`
  background-color: #1a1d24;
  position: relative;
  height: ${(props) => `${props.cardsize}px`};
  width: ${(props) => `${props.cardsize}px`};
  &:hover {
    cursor: pointer;
  }

  .corner-triangle {
    position: absolute;
    background-color: ${(props) => props.theme.primary.main};
    box-shadow: 0 0 10px 8px rgba(0, 0, 0, 0.8);
    height: 80px;
    left: -50px;
    top: -50px;
    width: 80px;

    transform: rotate(-45deg);
    -webkit-transform: rotate(-45deg);
  }
`;

const OverlayButton = styled(IconButton)`
  display: none;
  position: absolute !important;
  opacity: 0.8;
  width: 0px;
  height: 0px;
  transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
  background: #000;

  &:hover {
    opacity: 1;
    background: ${(props) => props.theme.primary.main};
  }
`;

export const PlayOverlayButton = styled(OverlayButton)`
  top: 50%;
  left: 50%;
`;

export const AppendOverlayButton = styled(OverlayButton)`
  top: 90%;
  left: 90%;
`;

export const AppendNextOverlayButton = styled(OverlayButton)`
  top: 90%;
  left: 70%;
`;

export const FavoriteOverlayButton = styled(OverlayButton)`
  top: 90%;
  left: 50%;
`;

export const ModalViewOverlayButton = styled(OverlayButton)`
  top: 10%;
  left: 90%;
`;
