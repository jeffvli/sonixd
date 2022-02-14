import React from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton, Icon } from 'rsuite';
import { useAppDispatch } from '../../redux/hooks';
import { clearSelected } from '../../redux/multiSelectSlice';
import CustomTooltip from '../shared/CustomTooltip';

const CustomIconButton = ({ tooltipText, icon, handleClick, ...rest }: any) => {
  return (
    <>
      {tooltipText ? (
        <CustomTooltip text={tooltipText}>
          <IconButton
            aria-label={tooltipText}
            size="xs"
            {...rest}
            icon={<Icon icon={icon} {...rest} />}
            onClick={handleClick}
          />
        </CustomTooltip>
      ) : (
        <IconButton size="xs" icon={<Icon icon={icon} {...rest} />} />
      )}
    </>
  );
};

export const MoveUpButton = ({ handleClick }: any) => {
  const { t } = useTranslation();
  return <CustomIconButton handleClick={handleClick} tooltipText={t('Move up')} icon="arrow-up2" />;
};

export const MoveDownButton = ({ handleClick }: any) => {
  const { t } = useTranslation();
  return (
    <CustomIconButton handleClick={handleClick} tooltipText={t('Move down')} icon="arrow-down2" />
  );
};

export const MoveManualButton = ({ handleClick }: any) => {
  const { t } = useTranslation();
  return (
    <CustomIconButton handleClick={handleClick} tooltipText={t('Move to index')} icon="arrows-v" />
  );
};

export const DeselectAllButton = ({ handleClick }: any) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  return (
    <CustomIconButton
      handleClick={handleClick}
      tooltipText={t('Deselect All')}
      icon="close"
      onClick={() => dispatch(clearSelected())}
      color="red"
    />
  );
};
