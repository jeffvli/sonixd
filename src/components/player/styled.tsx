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
