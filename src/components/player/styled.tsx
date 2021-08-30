import { Icon, Slider } from 'rsuite';
import styled from 'styled-components';

export const PlayerContainer = styled.div`
  background: ${(props) => props.theme.playerBar};
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
  color: #b3b3b3;
  padding-left: 5px;
  padding-right: 5px;
  &:hover {
    color: #ffffff;
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
      ? props.theme.subtitleText
      : props.theme.titleText};

  &:hover {
    text-decoration: underline;
    color: ${(props) =>
      props.subtitle === 'true'
        ? props.theme.subtitleText
        : props.theme.titleText};
    cursor: pointer;
  }
`;

export const CustomSlider = styled(Slider)`
  .rs-slider-progress-bar {
    background-color: ${(props) => props.theme.subtitleText};
  }

  &:hover + .rs-slider-progress-bar {
    background-color: #ff0 !important;
  }
`;
