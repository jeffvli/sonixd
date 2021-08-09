import React from 'react';
import { Tooltip, Whisper } from 'rsuite';

export const tooltip = (text: string) => <Tooltip>{text}</Tooltip>;

const CustomTooltip = ({ children, text, delay }: any) => {
  return (
    <Whisper
      placement="top"
      trigger="hover"
      delay={delay || 300}
      speaker={tooltip(text)}
    >
      {children}
    </Whisper>
  );
};

export default CustomTooltip;
