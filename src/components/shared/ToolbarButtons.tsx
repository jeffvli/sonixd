import React from 'react';
import { Icon } from 'rsuite';
import CustomTooltip from './CustomTooltip';
import { StyledButton, StyledIconButton } from './styled';

export const PlayButton = ({ ...rest }) => {
  return (
    <CustomTooltip text="Play" placement="bottom">
      <StyledIconButton tabIndex={0} icon={<Icon icon="play" />} {...rest} />
    </CustomTooltip>
  );
};

export const PlayShuffleButton = ({ ...rest }) => {
  return (
    <CustomTooltip text="Shuffle and play" placement="bottom">
      <StyledIconButton tabIndex={0} icon={<Icon icon="random" />} {...rest} />
    </CustomTooltip>
  );
};

export const PlayAppendButton = ({ ...rest }) => {
  return (
    <CustomTooltip text="Add to queue (later)" placement="bottom">
      <StyledIconButton tabIndex={0} icon={<Icon icon="plus" />} {...rest} />
    </CustomTooltip>
  );
};

export const PlayAppendNextButton = ({ ...rest }) => {
  return (
    <CustomTooltip text="Add to queue (next)" placement="bottom">
      <StyledIconButton tabIndex={0} icon={<Icon icon="plus-circle" />} {...rest} />
    </CustomTooltip>
  );
};

export const PlayShuffleAppendButton = ({ ...rest }) => {
  return (
    <CustomTooltip text="Add shuffled to queue" placement="bottom" onClick={rest.onClick}>
      <StyledIconButton tabIndex={0} icon={<Icon icon="plus-square" {...rest} />} />
    </CustomTooltip>
  );
};

export const SaveButton = ({ text, ...rest }: any) => {
  return (
    <CustomTooltip text={text || 'Save'} placement="bottom">
      <StyledIconButton tabIndex={0} icon={<Icon icon="save" />} {...rest} />
    </CustomTooltip>
  );
};

export const EditButton = ({ ...rest }) => {
  return (
    <CustomTooltip text="Edit" placement="bottom">
      <StyledIconButton tabIndex={0} icon={<Icon icon="edit2" />} {...rest} />
    </CustomTooltip>
  );
};

export const UndoButton = ({ ...rest }) => {
  return (
    <CustomTooltip text="Reset" placement="bottom">
      <StyledIconButton tabIndex={0} icon={<Icon icon="undo" />} {...rest} />
    </CustomTooltip>
  );
};

export const DeleteButton = ({ ...rest }) => {
  return (
    <CustomTooltip text="Delete" placement="bottom">
      <StyledIconButton tabIndex={0} icon={<Icon icon="trash" />} {...rest} />
    </CustomTooltip>
  );
};

export const FavoriteButton = ({ isFavorite, ...rest }: any) => {
  return (
    <CustomTooltip text="Toggle favorite" placement="bottom">
      <StyledIconButton
        tabIndex={0}
        icon={<Icon icon={isFavorite ? 'heart' : 'heart-o'} />}
        {...rest}
      />
    </CustomTooltip>
  );
};

export const DownloadButton = ({ ...rest }) => {
  return (
    <CustomTooltip text="Toggle favorite" placement="bottom">
      <StyledIconButton tabIndex={0} icon={<Icon icon="download" />} {...rest} />
    </CustomTooltip>
  );
};

export const ShuffleButton = ({ ...rest }) => {
  return (
    <CustomTooltip text="Shuffle queue" placement="bottom">
      <StyledIconButton icon={<Icon icon="random" />} tabIndex={0} {...rest} />
    </CustomTooltip>
  );
};

export const ClearQueueButton = ({ ...rest }) => {
  return (
    <CustomTooltip text="Clear queue" placement="bottom">
      <StyledIconButton icon={<Icon icon="trash2" />} tabIndex={0} {...rest} />
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

export const AutoPlaylistButton = ({ ...rest }) => {
  return (
    <StyledButton tabIndex={0} {...rest}>
      <Icon icon="plus-square" style={{ marginRight: '10px' }} />
      Add random
    </StyledButton>
  );
};
