import React from 'react';
import { Icon } from 'rsuite';
import CustomTooltip from './CustomTooltip';
import { StyledButton, StyledIconButton } from './styled';

export const PlayButton = ({ ...rest }) => {
  return (
    <CustomTooltip text="Play">
      <StyledIconButton tabIndex={0} icon={<Icon icon="play" />} {...rest} />
    </CustomTooltip>
  );
};

export const PlayShuffleButton = ({ ...rest }) => {
  return (
    <CustomTooltip text="Shuffle and play">
      <StyledIconButton tabIndex={0} icon={<Icon icon="random" />} {...rest} />
    </CustomTooltip>
  );
};

export const PlayAppendButton = ({ ...rest }) => {
  return (
    <CustomTooltip text="Add to queue (later)">
      <StyledIconButton tabIndex={0} icon={<Icon icon="plus" />} {...rest} />
    </CustomTooltip>
  );
};

export const PlayAppendNextButton = ({ ...rest }) => {
  return (
    <CustomTooltip text="Add to queue (next)">
      <StyledIconButton tabIndex={0} icon={<Icon icon="plus-circle" />} {...rest} />
    </CustomTooltip>
  );
};

export const PlayShuffleAppendButton = ({ ...rest }) => {
  return (
    <CustomTooltip text="Add shuffled to queue" onClick={rest.onClick}>
      <StyledIconButton tabIndex={0} icon={<Icon icon="plus-square" {...rest} />} />
    </CustomTooltip>
  );
};

export const SaveButton = ({ text, ...rest }: any) => {
  return (
    <CustomTooltip text={text || 'Save'}>
      <StyledIconButton tabIndex={0} icon={<Icon icon="save" />} {...rest} />
    </CustomTooltip>
  );
};

export const EditButton = ({ ...rest }) => {
  return (
    <CustomTooltip text="Edit">
      <StyledIconButton tabIndex={0} icon={<Icon icon="edit2" />} {...rest} />
    </CustomTooltip>
  );
};

export const UndoButton = ({ ...rest }) => {
  return (
    <CustomTooltip text="Reset">
      <StyledIconButton tabIndex={0} icon={<Icon icon="undo" />} {...rest} />
    </CustomTooltip>
  );
};

export const DeleteButton = ({ ...rest }) => {
  return (
    <CustomTooltip text="Delete">
      <StyledIconButton tabIndex={0} icon={<Icon icon="trash" />} {...rest} />
    </CustomTooltip>
  );
};

export const FavoriteButton = ({ isFavorite, ...rest }: any) => {
  return (
    <CustomTooltip text="Toggle favorite">
      <StyledIconButton
        tabIndex={0}
        icon={<Icon icon={isFavorite ? 'heart' : 'heart-o'} />}
        {...rest}
      />
    </CustomTooltip>
  );
};

export const DownloadButton = ({ downloadSize, ...rest }: any) => {
  return (
    <CustomTooltip text={downloadSize ? `Download (${downloadSize})` : 'Download'}>
      <StyledIconButton tabIndex={0} icon={<Icon icon="download" />} {...rest} />
    </CustomTooltip>
  );
};

export const ShuffleButton = ({ ...rest }) => {
  return (
    <CustomTooltip text="Shuffle queue">
      <StyledButton tabIndex={0} {...rest}>
        <Icon icon="random" />
      </StyledButton>
    </CustomTooltip>
  );
};

export const ClearQueueButton = ({ ...rest }) => {
  return (
    <CustomTooltip text="Clear queue">
      <StyledButton tabIndex={0} {...rest}>
        <Icon icon="trash2" />
      </StyledButton>
    </CustomTooltip>
  );
};

export const AddPlaylistButton = ({ ...rest }) => {
  return (
    <StyledButton tabIndex={0} {...rest}>
      <Icon icon="plus-square" style={{ marginRight: '10px' }} />
      Add playlist
    </StyledButton>
  );
};

export const RefreshButton = ({ ...rest }) => {
  return (
    <StyledButton tabIndex={0} {...rest}>
      <Icon icon="refresh" style={{ marginRight: '10px' }} />
      Refresh
    </StyledButton>
  );
};

export const AutoPlaylistButton = ({ noText, ...rest }: any) => {
  return (
    <CustomTooltip text="Auto playlist">
      <StyledButton tabIndex={0} {...rest}>
        <Icon icon="plus-square" style={{ marginRight: noText ? '0px' : '10px' }} />
        {!noText && 'Auto playlist'}
      </StyledButton>
    </CustomTooltip>
  );
};

export const MoveUpButton = ({ ...rest }) => {
  return (
    <CustomTooltip text="Move selected up">
      <StyledIconButton icon={<Icon icon="angle-up" />} tabIndex={0} {...rest} />
    </CustomTooltip>
  );
};

export const MoveDownButton = ({ ...rest }) => {
  return (
    <CustomTooltip text="Move selected down">
      <StyledIconButton icon={<Icon icon="angle-down" />} tabIndex={0} {...rest} />
    </CustomTooltip>
  );
};

export const MoveTopButton = ({ ...rest }) => {
  return (
    <CustomTooltip text="Move selected to top">
      <StyledIconButton icon={<Icon icon="arrow-up2" />} tabIndex={0} {...rest} />
    </CustomTooltip>
  );
};

export const MoveBottomButton = ({ ...rest }) => {
  return (
    <CustomTooltip text="Move selected to bottom">
      <StyledIconButton icon={<Icon icon="arrow-down2" />} tabIndex={0} {...rest} />
    </CustomTooltip>
  );
};

export const RemoveSelectedButton = ({ ...rest }) => {
  return (
    <CustomTooltip text="Remove selected">
      <StyledIconButton icon={<Icon icon="close" />} tabIndex={0} {...rest} />
    </CustomTooltip>
  );
};
