import React from 'react';
import { Tooltip, Whisper } from 'rsuite';
import styled from 'styled-components';

const StyledTooltip = styled(Tooltip)`
  border: 1px #3c3f43 solid;
  .rs-tooltip-inner {
    background-color: ${(props) => props.theme.primary.background};
    color: ${(props) => props.theme.primary.text};
  }
`;

export const tooltip = (text: string) => <StyledTooltip>{text}</StyledTooltip>;

const CustomTooltip = ({ children, text, delay, placement, ...rest }: any) => {
  return (
    <Whisper
      trigger="hover"
      delay={delay || 500}
      speaker={tooltip(text)}
      placement={placement || 'top'}
      {...rest}
    >
      {children}
    </Whisper>
  );
};

export default CustomTooltip;
