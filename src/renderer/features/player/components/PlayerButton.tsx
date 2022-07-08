import { ReactNode } from 'react';
import {
  TooltipProps,
  UnstyledButton,
  UnstyledButtonProps,
} from '@mantine/core';
import { motion } from 'framer-motion';
import styled, { css } from 'styled-components';
import { Tooltip } from 'renderer/components';

interface PlayerButtonProps extends UnstyledButtonProps<'button'> {
  icon: ReactNode;
  tooltip?: Omit<TooltipProps, 'children'>;
  variant: 'main' | 'secondary';
}

const WrapperMainVariant = css`
  border-radius: 50%;
  background: var(--playerbar-btn-color);
  width: 30px;
  height: 30px;
  margin: 0 0.5rem;

  &:hover {
    background: var(--playerbar-btn-color-hover);
  }
`;

type MotionWrapperProps = { variant: PlayerButtonProps['variant'] };

const MotionWrapper = styled(motion.div)<MotionWrapperProps>`
  display: flex;
  align-items: center;
  justify-content: center;

  ${({ variant }) => variant === 'main' && WrapperMainVariant};
`;

const ButtonMainVariant = css`
  svg {
    fill: black;
    stroke: black;
    display: flex;
  }

  &:hover {
  }
`;

const ButtonSecondaryVariant = css`
  svg {
    fill: var(--playerbar-btn-color);
    stroke: var(--playerbar-btn-color);
    display: flex;
  }

  &:hover {
    svg {
      fill: var(--playerbar-btn-color-hover);
      stroke: var(--playerbar-btn-color-hover);
    }
  }
`;

type StyledPlayerButtonProps = Omit<PlayerButtonProps, 'icon'>;

const StyledPlayerButton = styled(UnstyledButton)<StyledPlayerButtonProps>`
  width: 100%;
  display: flex;
  align-items: center;
  overflow: visible;
  all: unset;
  cursor: default;
  padding: 0.5rem;

  button {
    display: flex;
  }

  &:focus-visible {
    outline: 1px var(--primary-color) solid;
    svg {
      fill: var(--playerbar-btn-color-hover);
      stroke: var(--playerbar-btn-color-hover);
    }
  }

  &:disabled {
    opacity: 0.5;
  }

  ${({ variant }) =>
    variant === 'main' ? ButtonMainVariant : ButtonSecondaryVariant}
`;

export const PlayerButton = ({
  tooltip,
  variant,
  icon,
  ...rest
}: PlayerButtonProps) => {
  if (tooltip) {
    return (
      <Tooltip {...tooltip}>
        <MotionWrapper variant={variant}>
          <StyledPlayerButton variant={variant} {...rest}>
            {icon}
          </StyledPlayerButton>
        </MotionWrapper>
      </Tooltip>
    );
  }

  return (
    <MotionWrapper variant={variant}>
      <StyledPlayerButton variant={variant} {...rest}>
        {icon}
      </StyledPlayerButton>
    </MotionWrapper>
  );
};

PlayerButton.defaultProps = {
  tooltip: undefined,
};
