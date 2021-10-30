import { Icon, Slider } from 'rsuite';
import styled from 'styled-components';

export const PlayerContainer = styled.div`
  background: ${(props) => props.theme.colors.layout.playerBar.background};
  height: 100%;
  border-top: ${(props) => props.theme.other.playerBar.borderTop};
  border-right: ${(props) => props.theme.other.playerBar.borderRight};
  border-bottom: ${(props) => props.theme.other.playerBar.borderBottom};
  border-left: ${(props) => props.theme.other.playerBar.borderLeft};
  filter: ${(props) => props.theme.other.playerBar.filter};
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
    props.active === 'true'
      ? props.theme.colors.primary
      : props.theme.colors.layout.playerBar.button.color};
  padding-left: 10px;
  padding-right: 10px;
  &:hover {
    color: ${(props) =>
      props.active === 'true'
        ? props.theme.colors.primary
        : props.theme.colors.layout.playerBar.button.colorHover};
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
      ? props.theme.colors.layout.playerBar.colorSecondary
      : props.theme.colors.layout.playerBar.color};

  &:hover {
    text-decoration: underline;
    color: ${(props) =>
      props.subtitle === 'true'
        ? props.theme.colors.layout.playerBar.colorSecondary
        : props.theme.colors.layout.playerBar.color};
    cursor: pointer;
  }

  &:active {
    color: ${(props) =>
      props.subtitle === 'true'
        ? props.theme.colors.layout.playerBar.colorSecondary
        : props.theme.colors.layout.playerBar.color};
  }
`;

export const CustomSlider = styled(Slider)<{ isDragging?: boolean }>`
  &:hover {
    .rs-slider-handle::before {
      display: block;
    }
    .rs-slider-progress-bar {
      background-color: ${(props) => props.theme.colors.primary};
    }
  }

  .rs-slider-bar {
    background-color: ${(props) => props.theme.colors.slider.background};
  }

  .rs-slider-progress-bar {
    background-color: ${(props) =>
      props.$isDragging ? props.theme.colors.primary : props.theme.colors.slider.progressBar};
  }

  .rs-slider-handle::before {
    display: none;
    border: ${(props) => `1px solid ${props.theme.colors.primary} !important`};
  }
`;

export const DurationSpan = styled.span`
  color: ${(props) => props.theme.colors.layout.playerBar.color};
`;

export const VolumeIcon = styled(Icon)`
  color: ${(props) => props.theme.colors.layout.playerBar.color};
`;

export const MiniViewContainer = styled.div<{ display: string }>`
  user-select: none;
  pointer-events: ${(props) => (props.display === 'true' ? 'all' : 'none')};
  position: absolute;
  bottom: 100px;
  right: 25px;
  padding: 8px;
  width: 400px;
  height: ${(props) => props.theme.other.miniPlayer.height};
  background: ${(props) => props.theme.colors.layout.page.background};
  border: 1px #000 solid;
  filter: drop-shadow(0px 1px 2px #121316);
  overflow: hidden auto;
  opacity: ${(props) => (props.display === 'true' ? props.theme.other.miniPlayer.opacity : 0)};
  color: ${(props) => `${props.theme.colors.layout.page.color} !important`};
  z-index: 500;
`;
