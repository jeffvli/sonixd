import i18next from 'i18next';
import React from 'react';
import { Icon } from 'rsuite';
import CustomTooltip from './CustomTooltip';
import { StyledButton } from './styled';

export const PlayButton = ({ text, ...rest }: any) => {
  return (
    <CustomTooltip text={text || i18next.t('Play')}>
      <StyledButton {...rest} tabIndex={0}>
        <Icon icon="play" />
      </StyledButton>
    </CustomTooltip>
  );
};

export const PlayAppendButton = ({ text, ...rest }: any) => {
  return (
    <CustomTooltip text={text || i18next.t('Add to queue (later)')}>
      <StyledButton {...rest} tabIndex={0}>
        <Icon icon="plus" />
      </StyledButton>
    </CustomTooltip>
  );
};

export const PlayAppendNextButton = ({ text, ...rest }: any) => {
  return (
    <CustomTooltip text={text || i18next.t('Add to queue (next)')}>
      <StyledButton {...rest} tabIndex={0}>
        <Icon icon="plus-circle" />
      </StyledButton>
    </CustomTooltip>
  );
};

export const PlayShuffleAppendButton = ({ ...rest }) => {
  return (
    <CustomTooltip text={i18next.t('Add shuffled to queue')} onClick={rest.onClick}>
      <StyledButton {...rest} tabIndex={0}>
        <Icon icon="plus-square" />
      </StyledButton>
    </CustomTooltip>
  );
};

export const SaveButton = ({ text, ...rest }: any) => {
  return (
    <CustomTooltip text={text || i18next.t('Save')}>
      <StyledButton {...rest} tabIndex={0}>
        <Icon icon="save" />
      </StyledButton>
    </CustomTooltip>
  );
};

export const EditButton = ({ ...rest }) => {
  return (
    <CustomTooltip text={i18next.t('Edit')}>
      <StyledButton {...rest} tabIndex={0}>
        <Icon icon="edit2" />
      </StyledButton>
    </CustomTooltip>
  );
};

export const UndoButton = ({ ...rest }) => {
  return (
    <CustomTooltip text={i18next.t('Reset')}>
      <StyledButton {...rest} tabIndex={0}>
        <Icon icon="undo" />
      </StyledButton>
    </CustomTooltip>
  );
};

export const DeleteButton = ({ ...rest }) => {
  return (
    <CustomTooltip text={i18next.t('Delete')}>
      <StyledButton {...rest} tabIndex={0}>
        <Icon icon="trash" />
      </StyledButton>
    </CustomTooltip>
  );
};

export const FavoriteButton = ({ isFavorite, ...rest }: any) => {
  return (
    <CustomTooltip text={i18next.t('Toggle favorite')}>
      <StyledButton tabIndex={0} {...rest}>
        <Icon icon={isFavorite ? 'heart' : 'heart-o'} />
      </StyledButton>
    </CustomTooltip>
  );
};

export const DownloadButton = ({ downloadSize, ...rest }: any) => {
  return (
    <CustomTooltip
      text={
        downloadSize
          ? i18next.t('Download ({{downloadSize}})', { downloadSize })
          : i18next.t('Download')
      }
    >
      <StyledButton {...rest} tabIndex={0}>
        <Icon icon="download" />
      </StyledButton>
    </CustomTooltip>
  );
};

export const ShuffleButton = ({ ...rest }) => {
  return (
    <CustomTooltip text={i18next.t('Shuffle queue')}>
      <StyledButton tabIndex={0} {...rest}>
        <Icon icon="random" />
      </StyledButton>
    </CustomTooltip>
  );
};

export const ClearQueueButton = ({ ...rest }) => {
  return (
    <CustomTooltip text={i18next.t('Clear queue')}>
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
      {i18next.t('Add playlist')}
    </StyledButton>
  );
};

export const RefreshButton = ({ ...rest }) => {
  return (
    <StyledButton tabIndex={0} {...rest}>
      <Icon icon="refresh" style={{ marginRight: '10px' }} />
      {i18next.t('Refresh')}
    </StyledButton>
  );
};

export const FilterButton = ({ ...rest }) => {
  return (
    <StyledButton tabIndex={0} {...rest}>
      <Icon icon="filter" style={{ marginRight: '10px' }} />
      {i18next.t('Filter')}
    </StyledButton>
  );
};

export const AutoPlaylistButton = ({ noText, ...rest }: any) => {
  return (
    <CustomTooltip text={i18next.t('Auto playlist')}>
      <StyledButton tabIndex={0} {...rest}>
        <Icon icon="plus-square" style={{ marginRight: noText ? '0px' : '10px' }} />
        {!noText && i18next.t('Auto playlist')}
      </StyledButton>
    </CustomTooltip>
  );
};

export const MoveUpButton = ({ ...rest }) => {
  return (
    <CustomTooltip text={i18next.t('Move selected up')}>
      <StyledButton {...rest} tabIndex={0}>
        <Icon icon="angle-up" />
      </StyledButton>
    </CustomTooltip>
  );
};

export const MoveDownButton = ({ ...rest }) => {
  return (
    <CustomTooltip text={i18next.t('Move selected down')}>
      <StyledButton {...rest} tabIndex={0}>
        <Icon icon="angle-down" />
      </StyledButton>
    </CustomTooltip>
  );
};

export const MoveTopButton = ({ ...rest }) => {
  return (
    <CustomTooltip text={i18next.t('Move selected to top')}>
      <StyledButton {...rest} tabIndex={0}>
        <Icon icon="arrow-up2" />
      </StyledButton>
    </CustomTooltip>
  );
};

export const MoveBottomButton = ({ ...rest }) => {
  return (
    <CustomTooltip text={i18next.t('Move selected to bottom')}>
      <StyledButton {...rest} tabIndex={0}>
        <Icon icon="arrow-down2" />
      </StyledButton>
    </CustomTooltip>
  );
};

export const RemoveSelectedButton = ({ ...rest }) => {
  return (
    <CustomTooltip text={i18next.t('Remove selected')}>
      <StyledButton {...rest} tabIndex={0}>
        <Icon icon="close" />
      </StyledButton>
    </CustomTooltip>
  );
};
