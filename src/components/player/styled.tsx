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
    props.left ? 'flex-start' : props.center ? 'center' : props.right ? 'flex-end' : 'center'};
`;

export const PlayerControlIcon = styled(Icon)`
  font-size: medium;
  color: ${(props) =>
    props.active === 'true' ? props.theme.primary.main : props.theme.primary.playerBarButtons};
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

export const CustomSlider = styled(Slider)<{ isDragging?: boolean }>`
  &:hover {
    .rs-slider-handle::before {
      display: block;
    }
    .rs-slider-progress-bar {
      background-color: ${(props) => props.theme.primary.main};
    }
  }
  .rs-slider-progress-bar {
    background-color: ${(props) =>
      props.$isDragging ? props.theme.primary.main : props.theme.primary.sliderBackground};
  }

  .rs-slider-handle::before {
    display: none;
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
  bottom: 100px;
  right: 25px;
  padding: 8px;
  width: 400px;
  height: 450px;
  background: ${(props) => props.theme.primary.background};
  border: 1px #000 solid;
  filter: drop-shadow(0px 1px 2px #121316);
  overflow: hidden auto;
  opacity: ${(props) => (props.display === 'true' ? 0.95 : 0)};
  color: ${(props) => `${props.theme.primary.text} !important`};
  z-index: 500;
`;
