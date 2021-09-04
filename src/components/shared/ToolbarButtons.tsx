import React from 'react';
import { IconButton, Icon } from 'rsuite';
import CustomTooltip from './CustomTooltip';

export const PlayButton = ({ ...rest }) => {
  return (
    <CustomTooltip text="Play" placement="bottom">
      <IconButton tabIndex={0} icon={<Icon icon="play" />} {...rest} />
    </CustomTooltip>
  );
};

export const PlayShuffleButton = ({ ...rest }) => {
  return (
    <CustomTooltip text="Shuffle and play" placement="bottom">
      <IconButton tabIndex={0} icon={<Icon icon="random" />} {...rest} />
    </CustomTooltip>
  );
};

export const PlayAppendButton = ({ ...rest }) => {
  return (
    <CustomTooltip text="Add to queue" placement="bottom">
      <IconButton tabIndex={0} icon={<Icon icon="plus" />} {...rest} />
    </CustomTooltip>
  );
};

export const PlayShuffleAppendButton = ({ ...rest }) => {
  return (
    <CustomTooltip
      text="Add shuffled to queue"
      placement="bottom"
      onClick={rest.onClick}
    >
      <IconButton tabIndex={0} icon={<Icon icon="plus-square" {...rest} />} />
    </CustomTooltip>
  );
};

export const SaveButton = ({ ...rest }) => {
  return (
    <CustomTooltip text="Save" placement="bottom">
      <IconButton tabIndex={0} icon={<Icon icon="save" />} {...rest} />
    </CustomTooltip>
  );
};

export const EditButton = ({ ...rest }) => {
  return (
    <CustomTooltip text="Edit" placement="bottom">
      <IconButton tabIndex={0} icon={<Icon icon="edit2" />} {...rest} />
    </CustomTooltip>
  );
};

export const DeleteButton = ({ ...rest }) => {
  return (
    <CustomTooltip text="Delete" placement="bottom">
      <IconButton tabIndex={0} icon={<Icon icon="trash" />} {...rest} />
    </CustomTooltip>
  );
};

export const FavoriteButton = ({ isFavorite, ...rest }: any) => {
  return (
    <CustomTooltip text="Toggle favorite" placement="bottom">
      <IconButton
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
      <IconButton tabIndex={0} icon={<Icon icon="download" />} {...rest} />
    </CustomTooltip>
  );
};
