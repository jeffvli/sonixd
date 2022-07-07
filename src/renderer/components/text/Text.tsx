import { ReactNode } from 'react';
import {
  Text as MantineText,
  TextProps as MantineTextProps,
} from '@mantine/core';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { textEllipsis } from 'renderer/styles/mixins';

interface TextProps extends MantineTextProps<'div'> {
  children: ReactNode;
  link?: boolean;
  noSelect?: boolean;
  overflow?: 'hidden' | 'visible';
  secondary?: boolean;
  to?: string;
  weight?: number;
}

interface LinkTextProps extends MantineTextProps<'Link'> {
  children: ReactNode;
  link?: boolean;
  overflow?: 'hidden' | 'visible';
  secondary?: boolean;
  to: string;
  weight?: number;
}

const BaseText = styled(MantineText)<any>`
  cursor: ${(props) => (props.link ? 'cursor' : 'default')};
  font-family: 'Gotham';
  color: ${(props) =>
    props.$secondary
      ? 'var(--playerbar-text-secondary-color)'
      : 'var(--playerbar-text-primary-color)'};
  user-select: ${(props) => (props.$noSelect ? 'none' : 'auto')};
  ${(props) => props.overflow === 'hidden' && textEllipsis}
`;

const StyledText = styled(BaseText)<TextProps>``;

const StyledLinkText = styled(BaseText)<LinkTextProps>``;

export const Text = ({
  children,
  link,
  secondary,
  overflow,
  to,
  noSelect,
  ...rest
}: TextProps) => {
  if (link) {
    return (
      <StyledLinkText<typeof Link>
        $noSelect={noSelect}
        $secondary={secondary}
        component={Link}
        link="true"
        overflow={overflow}
        to={to || ''}
        {...rest}
      >
        {children}
      </StyledLinkText>
    );
  }

  return (
    <StyledText
      $noSelect={noSelect}
      $secondary={secondary}
      overflow={overflow}
      {...rest}
    >
      {children}
    </StyledText>
  );
};

Text.defaultProps = {
  link: false,
  noSelect: false,
  overflow: 'visible',
  secondary: false,
  to: '',
  weight: 500,
};
