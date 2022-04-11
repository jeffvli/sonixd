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
  user-select: none;
  height: ${(props) => props.height};
  display: flex;
  align-items: center;
  justify-content: ${(props) =>
    props.left ? 'flex-start' : props.center ? 'center' : props.right ? 'flex-end' : 'center'};
`;

export const PlayerControlIcon = styled(Icon)`
  cursor: pointer;
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

  &:focus-visible {
    outline: none;
    filter: brightness(0.7);
  }

  opacity: ${(props) => props.disabled && '0.5'};
  cursor: ${(props) => props.disabled && 'default'};
  pointer-events: ${(props) => props.disabled && 'none'};
`;

export const CoverArtContainer = styled.div<{ expand: boolean }>`
  height: 65px;
  width: 65px;
  .rs-btn {
    display: none;
  }

  &:hover {
    .rs-btn {
      display: ${(props) => (props.expand ? 'block' : 'none')};
      position: absolute;
      top: 0;
      left: 0;
      border-radius: 0px !important;
    }
  }
`;

export const LinkButton = styled.a<{ playing?: string; subtitle?: string }>`
  border-radius: 0px;
  background: transparent;
  max-width: 100%;
  padding: 0px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  color: ${(props) =>
    props.playing === 'true'
      ? props.theme.colors.primary
      : props.subtitle === 'true'
      ? props.theme.colors.layout.playerBar.colorSecondary
      : props.theme.colors.layout.playerBar.color} !important;

  &:hover {
    text-decoration: underline;
  }

  &:hover,
  &:active,
  &:focus {
    background: transparent !important;
    color: ${(props) => props.theme.colors.layout.playerBar.color};
    cursor: pointer;
  }

  &:focus-visible {
    text-decoration: underline;
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

  &:focus-visible {
    outline: none;
    .rs-slider-progress-bar {
      background-color: ${(props) => props.theme.colors.primary};
    }
  }
`;

export const DurationSpan = styled.span`
  color: ${(props) => props.theme.colors.layout.playerBar.color};
`;

export const VolumeIcon = styled(Icon)`
  color: ${(props) => props.theme.colors.layout.playerBar.color};
  cursor: pointer;
  margin-right: 15px;
  padding: 0;
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
  background: ${(props) => props.theme.colors.layout.miniPlayer.background};
  border: 1px #000 solid;
  filter: drop-shadow(0px 1px 2px #121316);
  overflow: hidden auto;
  opacity: ${(props) => (props.display === 'true' ? props.theme.other.miniPlayer.opacity : 0)};
  color: ${(props) => `${props.theme.colors.layout.page.color} !important`};
  z-index: 500;
`;

export const InfoViewPanel = styled.div<{ height?: string }>`
  background: rgba(150, 150, 150, 0.03);
  border-radius: 15px;
  padding: 20px;
  margin: 0 0 5px 0;
  height: ${(props) => props.height};
`;

export const SongTitle = styled.div`
  text-align: center;
  font-size: 20px;
  user-select: none;
`;

export const ArtistTitle = styled.h1`
  font-size: 28px;
  user-select: none;
`;

export const InfoGridContainer = styled.div`
  display: grid;
  margin-bottom: 5px;
  grid-auto-columns: 1fr;
  grid-template-columns: 1fr;
  grid-template-rows: 0.5fr 1fr;
  gap: 5px 0px;
  grid-template-areas:
    'Player'
    'Artist-Info';

  @media screen and (min-width: 800px) {
    grid-template-columns: 1fr 4fr;
    grid-template-rows: 1fr 1fr;
    grid-auto-columns: 1fr;
    gap: 0px 5px;
    grid-auto-flow: row;
    grid-template-areas:
      'Player Artist-Info'
      'Player Artist-Info';
  }
`;

export const InfoPlayerContainer = styled.div`
  grid-area: Player;
`;

export const ArtistInfoContainer = styled.div`
  grid-area: Artist-Info;
`;
