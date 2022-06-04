import { ReactNode } from 'react';
import { ActionIcon, ActionIconProps } from '@mantine/core';
import clsx from 'clsx';
import { Tooltip } from '../tooltip/Tooltip';
import styles from './IconButton.module.scss';

interface IconButtonProps extends ActionIconProps<'button'> {
  active?: boolean;
  icon: ReactNode;
  tooltip?: { label: string };
}

export const IconButton = ({
  active,
  tooltip,
  icon,
  ...rest
}: IconButtonProps) => {
  if (tooltip) {
    return (
      <Tooltip {...tooltip}>
        <ActionIcon
          classNames={{
            transparent: clsx(styles.button, { [styles.active]: active }),
          }}
          {...rest}
        >
          {icon}
        </ActionIcon>
      </Tooltip>
    );
  }

  return <ActionIcon {...rest}>{icon}</ActionIcon>;
};

IconButton.defaultProps = {
  active: false,
  tooltip: undefined,
};
