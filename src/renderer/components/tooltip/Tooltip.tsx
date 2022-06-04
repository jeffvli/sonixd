import { Tooltip as MantineTooltip, TooltipProps } from '@mantine/core';
import styles from './Tooltip.module.scss';

export const Tooltip = ({ children, ...rest }: TooltipProps) => {
  return (
    <MantineTooltip
      classNames={{ arrow: styles.arrow, body: styles.body }}
      radius="xs"
      {...rest}
    >
      {children}
    </MantineTooltip>
  );
};
