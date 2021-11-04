import React from 'react';
import { Tag } from 'rsuite';
import CustomTooltip from './CustomTooltip';

const TagLink = ({ tooltip, children, ...rest }: any) => {
  return (
    <CustomTooltip text={tooltip}>
      <Tag {...rest}>{children}</Tag>
    </CustomTooltip>
  );
};

export default TagLink;
