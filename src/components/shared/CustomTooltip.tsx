import React from 'react';
import { Tooltip, Whisper } from 'rsuite';
import styled from 'styled-components';

const StyledTooltip = styled(Tooltip)`
  .rs-tooltip-inner {
    background-color: #000000;
    color: #ffffff;
  }
`;

export const tooltip = (text: string) => <StyledTooltip>{text}</StyledTooltip>;

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
