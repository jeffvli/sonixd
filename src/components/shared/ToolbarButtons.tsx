import React from 'react';
import { Icon } from 'rsuite';
import i18n from '../../i18n/i18n';
import CustomTooltip from './CustomTooltip';
import { StyledButton } from './styled';

export const PlayButton = ({ text, ...rest }: any) => {
  return (
    <CustomTooltip text={text || i18n.t('Play')}>
      <StyledButton aria-label={text || i18n.t('Play')} {...rest} tabIndex={0}>
        <Icon icon="play" />
      </StyledButton>
    </CustomTooltip>
  );
};

export const PlayAppendButton = ({ text, ...rest }: any) => {
  return (
    <CustomTooltip text={text || i18n.t('Add to queue (later)')}>
      <StyledButton aria-label={text || i18n.t('Add to queue (later)')} {...rest} tabIndex={0}>
        <Icon icon="plus" />
      </StyledButton>
    </CustomTooltip>
  );
};

export const PlayAppendNextButton = ({ text, ...rest }: any) => {
  return (
    <CustomTooltip text={text || i18n.t('Add to queue (next)')}>
      <StyledButton aria-label={text || i18n.t('Add to queue (next)')} {...rest} tabIndex={0}>
        <Icon icon="plus-circle" />
      </StyledButton>
    </CustomTooltip>
  );
};

export const PlayShuffleAppendButton = ({ ...rest }) => {
  return (
    <CustomTooltip text={i18n.t('Add shuffled to queue')} onClick={rest.onClick}>
      <StyledButton aria-label={i18n.t('Add shuffled to queue')} {...rest} tabIndex={0}>
        <Icon icon="plus-square" />
      </StyledButton>
    </CustomTooltip>
  );
};

export const SaveButton = ({ text, ...rest }: any) => {
  return (
    <CustomTooltip text={text || i18n.t('Save')}>
      <StyledButton aria-label={text || i18n.t('Save')} {...rest} tabIndex={0}>
        <Icon icon="save" />
      </StyledButton>
    </CustomTooltip>
  );
};

export const EditButton = ({ ...rest }) => {
  return (
    <CustomTooltip text={i18n.t('Edit')}>
      <StyledButton aria-label={i18n.t('Edit')} {...rest} tabIndex={0}>
        <Icon icon="edit2" />
      </StyledButton>
    </CustomTooltip>
  );
};

export const UndoButton = ({ ...rest }) => {
  return (
    <CustomTooltip text={i18n.t('Reset')}>
      <StyledButton aria-label={i18n.t('Reset')} {...rest} tabIndex={0}>
        <Icon icon="undo" />
      </StyledButton>
    </CustomTooltip>
  );
};

export const DeleteButton = ({ ...rest }) => {
  return (
    <CustomTooltip text={i18n.t('Delete')}>
      <StyledButton aria-label={i18n.t('Delete')} {...rest} tabIndex={0}>
        <Icon icon="trash" />
      </StyledButton>
    </CustomTooltip>
  );
};

export const FavoriteButton = ({ isFavorite, ...rest }: any) => {
  return (
    <CustomTooltip text={i18n.t('Toggle favorite')}>
      <StyledButton
        aria-label={isFavorite ? i18n.t('Remove from favorites') : i18n.t('Add to favorites')}
        tabIndex={0}
        {...rest}
      >
        <Icon icon={isFavorite ? 'heart' : 'heart-o'} />
      </StyledButton>
    </CustomTooltip>
  );
};

export const DownloadButton = ({ downloadSize, ...rest }: any) => {
  return (
    <CustomTooltip
      text={
        downloadSize ? i18n.t('Download ({{downloadSize}})', { downloadSize }) : i18n.t('Download')
      }
    >
      <StyledButton
        aria-label={
          downloadSize
            ? i18n.t('Download ({{downloadSize}})', { downloadSize })
            : i18n.t('Download')
        }
        {...rest}
        tabIndex={0}
      >
        <Icon icon="download" />
      </StyledButton>
    </CustomTooltip>
  );
};

export const ShuffleButton = ({ ...rest }) => {
  return (
    <CustomTooltip text={i18n.t('Shuffle queue')}>
      <StyledButton aria-label={i18n.t('Shuffle queue')} tabIndex={0} {...rest}>
        <Icon icon="random" />
      </StyledButton>
    </CustomTooltip>
  );
};

export const ClearQueueButton = ({ ...rest }) => {
  return (
    <CustomTooltip text={i18n.t('Clear queue')}>
      <StyledButton aria-label={i18n.t('Clear queue')} tabIndex={0} {...rest}>
        <Icon icon="trash2" />
      </StyledButton>
    </CustomTooltip>
  );
};

export const AddPlaylistButton = ({ ...rest }) => {
  return (
    <StyledButton tabIndex={0} {...rest}>
      <Icon icon="plus-square" style={{ marginRight: '10px' }} />
      {i18n.t('Add playlist')}
    </StyledButton>
  );
};

export const RefreshButton = ({ ...rest }) => {
  return (
    <StyledButton tabIndex={0} {...rest}>
      <Icon icon="refresh" style={{ marginRight: '10px' }} />
      {i18n.t('Refresh')}
    </StyledButton>
  );
};

export const FilterButton = ({ ...rest }) => {
  return (
    <StyledButton tabIndex={0} {...rest}>
      <Icon icon="filter" style={{ marginRight: '10px' }} />
      {i18n.t('Filter')}
    </StyledButton>
  );
};

export const AutoPlaylistButton = ({ noText, ...rest }: any) => {
  return (
    <CustomTooltip text={i18n.t('Play Random')}>
      <StyledButton aria-label={i18n.t('Play Random')} tabIndex={0} {...rest}>
        <Icon icon="plus-square" style={{ marginRight: noText ? '0px' : '10px' }} />
        {!noText && i18n.t('Play Random')}
      </StyledButton>
    </CustomTooltip>
  );
};

export const MoveUpButton = ({ ...rest }) => {
  return (
    <CustomTooltip text={i18n.t('Move selected up')}>
      <StyledButton aria-label={i18n.t('Move selected up')} {...rest} tabIndex={0}>
        <Icon icon="angle-up" />
      </StyledButton>
    </CustomTooltip>
  );
};

export const MoveDownButton = ({ ...rest }) => {
  return (
    <CustomTooltip text={i18n.t('Move selected down')}>
      <StyledButton aria-label={i18n.t('Move selected down')} {...rest} tabIndex={0}>
        <Icon icon="angle-down" />
      </StyledButton>
    </CustomTooltip>
  );
};

export const MoveTopButton = ({ ...rest }) => {
  return (
    <CustomTooltip text={i18n.t('Move selected to top')}>
      <StyledButton aria-label={i18n.t('Move selected to top')} {...rest} tabIndex={0}>
        <Icon icon="arrow-up2" />
      </StyledButton>
    </CustomTooltip>
  );
};

export const MoveBottomButton = ({ ...rest }) => {
  return (
    <CustomTooltip text={i18n.t('Move selected to bottom')}>
      <StyledButton aria-label={i18n.t('Move selected to bottom')} {...rest} tabIndex={0}>
        <Icon icon="arrow-down2" />
      </StyledButton>
    </CustomTooltip>
  );
};

export const RemoveSelectedButton = ({ ...rest }) => {
  return (
    <CustomTooltip text={i18n.t('Remove selected')}>
      <StyledButton aria-label={i18n.t('Remove selected')} {...rest} tabIndex={0}>
        <Icon icon="close" />
      </StyledButton>
    </CustomTooltip>
  );
};
