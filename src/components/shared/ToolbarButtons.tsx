import React from 'react';
import { IconButton, Icon } from 'rsuite';
import CustomTooltip from './CustomTooltip';

export const PlayButton = ({ ...rest }) => {
  return (
    <CustomTooltip text="Set as queue" delay={1000}>
      <IconButton tabindex="0" icon={<Icon icon="play" />} {...rest} />
    </CustomTooltip>
  );
};

export const PlayShuffleButton = ({ ...rest }) => {
  return (
    <CustomTooltip text="Shuffle and set as queue" delay={1000}>
      <IconButton tabindex="0" icon={<Icon icon="random" />} {...rest} />
    </CustomTooltip>
  );
};

export const PlayAppendButton = ({ ...rest }) => {
  return (
    <CustomTooltip text="Append to queue" delay={1000}>
      <IconButton tabindex="0" icon={<Icon icon="plus-square-o" />} {...rest} />
    </CustomTooltip>
  );
};

export const PlayShuffleAppendButton = ({ ...rest }) => {
  return (
    <CustomTooltip text="Shuffle and append to queue" delay={1000}>
      <IconButton tabindex="0" icon={<Icon icon="plus-square" />} {...rest} />
    </CustomTooltip>
  );
};

export const EditButton = ({ ...rest }) => {
  return (
    <CustomTooltip text="Edit" delay={1000}>
      <IconButton tabindex="0" icon={<Icon icon="edit2" />} {...rest} />
    </CustomTooltip>
  );
};

export const DeleteButton = ({ ...rest }) => {
  return (
    <CustomTooltip text="Delete" delay={1000}>
      <IconButton tabindex="0" icon={<Icon icon="trash" />} {...rest} />
    </CustomTooltip>
  );
};
