import { Icon, Slider } from 'rsuite';
import styled from 'styled-components';

export const PlayerContainer = styled.div`
  background: ${(props) => props.theme.primary.playerBar};
  height: 100%;
  border-top: 1px solid #48545c;
`;

export const PlayerColumn = styled.div<{
  left?: boolean;
  center?: boolean;
  right?: boolean;
  height: string;
}>`
  height: ${(props) => props.height};
  display: flex;
  align-items: center;
  justify-content: ${(props) =>
    props.left
      ? 'flex-start'
      : props.center
      ? 'center'
      : props.right
      ? 'flex-end'
      : 'center'};
`;

export const PlayerControlIcon = styled(Icon)`
  color: ${(props) =>
    props.active === 'true'
      ? props.theme.primary.main
      : props.theme.primary.playerBarButtons};
  padding-left: 10px;
  padding-right: 10px;
  &:hover {
    color: ${(props) =>
      props.active === 'true'
        ? props.theme.primary.main
        : props.theme.primary.playerBarButtonsHover};
  }
  cursor: pointer;
`;

export const LinkButton = styled.a<{ subtitle?: string }>`
  display: block;
  white-space: nowrap;
  padding: 0px;
  text-overflow: ellipsis;
  overflow: hidden;
  color: ${(props) =>
    props.subtitle === 'true'
      ? props.theme.secondary.playerBarText
      : props.theme.primary.playerBarText};

  &:hover {
    text-decoration: underline;
    color: ${(props) =>
      props.subtitle === 'true'
        ? props.theme.secondary.playerBarText
        : props.theme.primary.playerBarText};
    cursor: pointer;
  }

  &:active {
    color: ${(props) =>
      props.subtitle === 'true'
        ? props.theme.secondary.playerBarText
        : props.theme.primary.playerBarText};
  }
`;

export const CustomSlider = styled(Slider)`
  .rs-slider-progress-bar {
    background-color: ${(props) => props.theme.primary.sliderBackground};
  }

  .rs-slider-progress-bar::hover {
    background-color: #ff0 !important;
  }

  .rs-slider-handle::before {
    border: ${(props) => `1px solid ${props.theme.primary.main} !important`};
  }
`;

export const DurationSpan = styled.span`
  color: ${(props) => props.theme.primary.playerBarText};
`;

export const VolumeIcon = styled(Icon)`
  color: ${(props) => props.theme.primary.playerBarText};
`;

export const MiniViewContainer = styled.div<{ display: string }>`
  user-select: none;
  pointer-events: ${(props) => (props.display === 'true' ? 'all' : 'none')};
  position: absolute;
  z-index: 7;
  bottom: 100px;
  right: 25px;
  padding: 8px;
  width: 400px;
  height: 450px;
  background: ${(props) => props.theme.primary.background};
  border: 1px #000 solid;
  filter: drop-shadow(0px 2px 5px #000);
  overflow: hidden auto;
  opacity: ${(props) => (props.display === 'true' ? 0.9 : 0)};
  border-radius: 10px;
  color: ${(props) => `${props.theme.primary.text} !important`};
  animation-name: ${(props) =>
    props.display === 'true' ? 'fadeInOpacity' : 'fadeOutOpacity'};
  animation-iteration-count: 1;
  animation-timing-function: ease-in-out;
  animation-duration: 0.5s;

  @keyframes fadeInOpacity {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 0.9;
    }
  }

  @keyframes fadeOutOpacity {
    0% {
      opacity: 0.9;
    }
    100% {
      opacity: 0;
    }
  }
`;
