import React from 'react';
import { Icon } from 'rsuite';
import CustomTooltip from './CustomTooltip';
import { StyledButton } from './styled';

export const PlayButton = ({ text, ...rest }: any) => {
  return (
    <CustomTooltip text={text || 'Play'}>
      <StyledButton {...rest} tabIndex={0}>
        <Icon icon="play" />
      </StyledButton>
    </CustomTooltip>
  );
};

export const PlayAppendButton = ({ text, ...rest }: any) => {
  return (
    <CustomTooltip text={text || 'Add to queue (later)'}>
      <StyledButton {...rest} tabIndex={0}>
        <Icon icon="plus" />
      </StyledButton>
    </CustomTooltip>
  );
};

export const PlayAppendNextButton = ({ text, ...rest }: any) => {
  return (
    <CustomTooltip text={text || 'Add to queue (next)'}>
      <StyledButton {...rest} tabIndex={0}>
        <Icon icon="plus-circle" />
      </StyledButton>
    </CustomTooltip>
  );
};

export const PlayShuffleAppendButton = ({ ...rest }) => {
  return (
    <CustomTooltip text="Add shuffled to queue" onClick={rest.onClick}>
      <StyledButton {...rest} tabIndex={0}>
        <Icon icon="plus-square" />
      </StyledButton>
    </CustomTooltip>
  );
};

export const SaveButton = ({ text, ...rest }: any) => {
  return (
    <CustomTooltip text={text || 'Save'}>
      <StyledButton {...rest} tabIndex={0}>
        <Icon icon="save" />
      </StyledButton>
    </CustomTooltip>
  );
};

export const EditButton = ({ ...rest }) => {
  return (
    <CustomTooltip text="Edit">
      <StyledButton {...rest} tabIndex={0}>
        <Icon icon="edit2" />
      </StyledButton>
    </CustomTooltip>
  );
};

export const UndoButton = ({ ...rest }) => {
  return (
    <CustomTooltip text="Reset">
      <StyledButton {...rest} tabIndex={0}>
        <Icon icon="undo" />
      </StyledButton>
    </CustomTooltip>
  );
};

export const DeleteButton = ({ ...rest }) => {
  return (
    <CustomTooltip text="Delete">
      <StyledButton {...rest} tabIndex={0}>
        <Icon icon="trash" />
      </StyledButton>
    </CustomTooltip>
  );
};

export const FavoriteButton = ({ isFavorite, ...rest }: any) => {
  return (
    <CustomTooltip text="Toggle favorite">
      <StyledButton tabIndex={0} {...rest}>
        <Icon icon={isFavorite ? 'heart' : 'heart-o'} />
      </StyledButton>
    </CustomTooltip>
  );
};

export const DownloadButton = ({ downloadSize, ...rest }: any) => {
  return (
    <CustomTooltip text={downloadSize ? `Download (${downloadSize})` : 'Download'}>
      <StyledButton {...rest} tabIndex={0}>
        <Icon icon="download" />
      </StyledButton>
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

export const FilterButton = ({ ...rest }) => {
  return (
    <StyledButton tabIndex={0} {...rest}>
      <Icon icon="filter" style={{ marginRight: '10px' }} />
      Filter
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
      <StyledButton {...rest} tabIndex={0}>
        <Icon icon="angle-up" />
      </StyledButton>
    </CustomTooltip>
  );
};

export const MoveDownButton = ({ ...rest }) => {
  return (
    <CustomTooltip text="Move selected down">
      <StyledButton {...rest} tabIndex={0}>
        <Icon icon="angle-down" />
      </StyledButton>
    </CustomTooltip>
  );
};

export const MoveTopButton = ({ ...rest }) => {
  return (
    <CustomTooltip text="Move selected to top">
      <StyledButton {...rest} tabIndex={0}>
        <Icon icon="arrow-up2" />
      </StyledButton>
    </CustomTooltip>
  );
};

export const MoveBottomButton = ({ ...rest }) => {
  return (
    <CustomTooltip text="Move selected to bottom">
      <StyledButton {...rest} tabIndex={0}>
        <Icon icon="arrow-down2" />
      </StyledButton>
    </CustomTooltip>
  );
};

export const RemoveSelectedButton = ({ ...rest }) => {
  return (
    <CustomTooltip text="Remove selected">
      <StyledButton {...rest} tabIndex={0}>
        <Icon icon="close" />
      </StyledButton>
    </CustomTooltip>
  );
};
