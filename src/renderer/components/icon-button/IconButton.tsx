import { ReactNode } from 'react';

import { ActionIcon, ActionIconProps, Tooltip } from '@mantine/core';

interface IconButtonProps extends ActionIconProps<'button'> {
  tooltip?: { label: string };
  icon: ReactNode;
  active?: boolean;
}

const IconButton = ({ active, tooltip, icon, ...rest }: IconButtonProps) => {
  if (tooltip) {
    return (
      <Tooltip {...tooltip}>
        <ActionIcon
          sx={(theme) => ({
            color: active ? theme.colors.primary[5] : theme.colors.white,
          })}
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
  tooltip: undefined,
  active: false,
};

export default IconButton;
