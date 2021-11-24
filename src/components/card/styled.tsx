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

export const CardPanel = styled(Panel)<Card>`
  border-radius: 0px;
  text-align: center;
  width: ${(props) => `${Number(props.cardsize) + 2}px`};
  height: ${(props) => `${Number(props.cardsize) + 55}px`};
  border: ${(props) => props.theme.other.card.border};

  /* Hover effects inspired from https://codepen.io/SabAsan/pen/bGNrmzq */
  /* &:after {
    pointer-events: none;
    display: block;
    content: '';
    z-index: -1;
    width: 100%;
    height: 120%;
    background: linear-gradient(
      226deg,
      rgba(255, 255, 255, 0.4) 0%,
      rgba(255, 255, 255, 0.4) 35%,
      rgba(255, 255, 255, 0.2) 42%,
      rgba(255, 255, 255, 0) 60%
    );
    transform: translatey(-170%);
    will-change: transform;
    transition: transform 0.65s cubic-bezier(0.18, 0.9, 0.58, 1);
  }

  &:hover:after {
    transform: translatey(-100%);
  } */

  img {
    border-top: ${(props) => props.theme.other.card.image.borderTop};
    border-right: ${(props) => props.theme.other.card.image.borderRight};
    border-bottom: ${(props) => props.theme.other.card.image.borderBottom};
    border-left: ${(props) => props.theme.other.card.image.borderLeft};
    border-radius: ${(props) => props.theme.other.card.image.borderRadius};
  }

  &:hover {
    border-color: ${(props) => props.theme.colors.primary} !important;
    transform: ${(props) => props.theme.other.card.hover.transform};
    filter: ${(props) => props.theme.other.card.hover.filter};
    transition: ${(props) => props.theme.other.card.hover.transition};
    img {
      filter: brightness(90%);
      -webkit-filter: brightness(90%);
    }

    .rs-panel {
      border-color: ${(props) => props.theme.colors.primary} !important;
    }
  }

  &:hover .rs-btn {
    display: block;
  }

  &:focus-visible {
    outline: 2px ${(props) => props.theme.colors.primary} solid;
  }
`;

export const InfoPanel = styled(Panel)<Card>`
  border-radius: 0px;
  width: ${(props) => `${props.cardsize}px`};
  border-radius: ${(props) => props.theme.other.card.info.borderRadius} !important;
  border-top: ${(props) => props.theme.other.card.info.borderTop} !important;
  border-right: ${(props) => props.theme.other.card.info.borderRight} !important;
  border-bottom: ${(props) => props.theme.other.card.info.borderBottom} !important;
  border-left: ${(props) => props.theme.other.card.info.borderLeft} !important;
`;

export const InfoSpan = styled.div`
  color: ${(props) => props.theme.colors.layout.page.colorSecondary};
`;

export const CardButton = styled(Button)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const CardTitleButton = styled(CardButton)`
  padding-top: 5px;
  padding-bottom: 2px;
  color: ${(props) => props.theme.colors.layout.page.color};
  width: ${(props) => `${props.cardsize}px`};

  &:hover,
  &:focus {
    text-decoration: none;
    color: ${(props) =>
      !props.onClick ? props.theme.colors.layout.page.color : props.theme.colors.primary};
  }

  &:focus-visible {
  }
`;

export const CardSubtitleButton = styled(CardButton)`
  padding-bottom: 5px;
  color: ${(props) => props.theme.colors.layout.page.colorSecondary};
  width: ${(props) => `${props.cardsize}px`};

  &:hover,
  &:focus {
    text-decoration: none;
    color: ${(props) =>
      !props.onClick ? props.theme.colors.layout.page.color : props.theme.colors.primary};
  }
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
`;

export const Overlay = styled.div<Card>`
  position: relative;
  height: ${(props) => `${props.cardsize}px`};
  width: ${(props) => `${props.cardsize}px`};

  &:hover {
    cursor: pointer;
  }

  .corner-triangle {
    position: absolute;
    background-color: ${(props) => props.theme.colors.primary};
    box-shadow: 0 0 10px 8px rgba(0, 0, 0, 0.8);
    height: 80px;
    left: -50px;
    top: -50px;
    width: 80px;
    pointer-events: none;

    transform: rotate(-45deg);
    -webkit-transform: rotate(-45deg);
  }
`;

const OverlayButton = styled(IconButton)`
  display: none;
  position: absolute !important;
  opacity: ${(props) => props.theme.colors.card.overlayButton.opacity};
  width: 0px;
  height: 0px;
  transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
  background: ${(props) => props.theme.colors.card.overlayButton.background};
  color: ${(props) => props.theme.colors.card.overlayButton.color};

  &:hover {
    opacity: 1;
    background: ${(props) => props.theme.colors.card.overlayButton.backgroundHover};
    color: ${(props) => props.theme.colors.card.overlayButton.colorHover};
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

export const CardImgWrapper = styled.div<{ size: number }>`
  clip-path: inset(0 0);
  height: ${(props) => props.size}px;
`;
