import React from 'react';
import { Tooltip, Whisper } from 'rsuite';
import styled from 'styled-components';

const StyledTooltip = styled(Tooltip)`
  .rs-tooltip-inner {
    background-color: ${(props) => props.theme.colors.tooltip.background};
    color: ${(props) => props.theme.colors.tooltip.color};
    border-radius: ${(props) => props.theme.other.tooltip.borderRadius};
    border: ${(props) => props.theme.other.tooltip.border};
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
