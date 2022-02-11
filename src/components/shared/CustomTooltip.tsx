import React from 'react';
import { Tooltip, Whisper } from 'rsuite';
import styled from 'styled-components';
import { useAppSelector } from '../../redux/hooks';

const StyledTooltip = styled(Tooltip)`
  .rs-tooltip-inner {
    background-color: ${(props) => props.theme.colors.tooltip.background};
    color: ${(props) => props.theme.colors.tooltip.color};
    border-radius: ${(props) => props.theme.other.tooltip.borderRadius};
    border: ${(props) => props.theme.other.tooltip.border};
  }
`;

const CustomTooltip = ({ children, text, delay, placement, disabled, ...rest }: any) => {
  const config = useAppSelector((state) => state.config);
  return (
    <Whisper
      trigger={disabled ? 'none' : 'hover'}
      delay={delay || 500}
      speaker={
        <StyledTooltip style={{ fontFamily: config.lookAndFeel.font }}>{text}</StyledTooltip>
      }
      placement={placement || 'top'}
      {...rest}
    >
      {children}
    </Whisper>
  );
};

export default CustomTooltip;
