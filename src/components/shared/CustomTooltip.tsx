import React from 'react';
import { Tooltip, Whisper } from 'rsuite';

export const tooltip = (text: string) => <Tooltip>{text}</Tooltip>;

const CustomTooltip = ({ children, text, delay, ...rest }: any) => {
  return (
    <Whisper
      trigger="hover"
      delay={delay || 300}
      speaker={tooltip(text)}
      placement={rest.placement || 'top'}
      {...rest}
    >
      {children}
    </Whisper>
  );
};

export default CustomTooltip;
