import { ChangeEvent, useState } from 'react';

import {
  Box,
  Container,
  createStyles,
  Group,
  NumberInput,
  Popover,
  Radio,
  RadioGroup,
  Select,
  Stack,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useThrottleFn } from 'react-use';
import {
  Adjustments,
  ArrowsShuffle,
  Playlist,
  Repeat,
  RepeatOnce,
  Volume2,
  Volume3,
} from 'tabler-icons-react';

import IconButton from 'renderer/components/icon-button/IconButton';
import Slider from 'renderer/components/slider/Slider';
import { useAppDispatch, useAppSelector } from 'renderer/hooks/redux';
import {
  selectPlayerConfig,
  setCrossfadeDuration,
  setType,
  setVolume as setGlobalVolume,
  toggleMute,
  toggleRepeat,
  toggleShuffle,
} from 'renderer/store/playerSlice';
import { PlayerRepeat } from 'types';

const CROSSFADE_TYPES = [
  { label: 'Equal Power', value: 'equalPower' },
  { label: 'Linear', value: 'linear' },
  { label: 'Dipped', value: 'dipped' },
  { label: 'Constant Power', value: 'constantPower' },
  { label: 'Constant Power (Slow fade)', value: 'constantPowerSlowFade' },
  { label: 'Constant Power (Slow cut)', value: 'constantPowerSlowCut' },
];

const useStyles = createStyles(() => ({
  wrapper: {
    height: '100%',
    width: '100%',
  },
  box: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: 'calc(100% / 3)',
  },
  volumeSlider: {
    maxWidth: '7em',
  },
}));

const RightControls = () => {
  const { t } = useTranslation();
  const { classes } = useStyles();
  const dispatch = useAppDispatch();
  const {
    muted,
    volume,
    shuffle,
    repeat,
    crossfadeType,
    crossfadeDuration,
    type,
  } = useAppSelector(selectPlayerConfig);
  const [localVolume, setLocalVolume] = useState(volume * 100);
  useThrottleFn((v) => dispatch(setGlobalVolume(v)), 200, [localVolume]);
  const [openConfig, setOpenConfig] = useState(false);

  return (
    <Container className={classes.wrapper}>
      <Box className={classes.box} />
      <Box className={classes.box}>
        <Group position="right" spacing="sm">
          <Popover
            opened={openConfig}
            onClose={() => setOpenConfig(false)}
            position="top"
            withArrow
            target={
              <IconButton
                variant="transparent"
                tooltip={{ label: `${t('player.config')}` }}
                icon={<Adjustments size={20} />}
                onClick={() => setOpenConfig(!openConfig)}
              />
            }
          >
            <Stack>
              <RadioGroup
                label={`${t('player.config.playbackType')}`}
                orientation="vertical"
                value={type}
                spacing="md"
                onChange={(e: 'gapless' | 'crossfade') => dispatch(setType(e))}
              >
                <Radio value="gapless" label={`${t('player.gapless')}`} />
                <Radio value="crossfade" label={`${t('player.crossfade')}`} />
              </RadioGroup>
              <Select
                defaultValue={crossfadeType}
                label={`${t('player.config.crossfadeType')}`}
                data={CROSSFADE_TYPES}
                disabled={type !== 'crossfade'}
              />
              <NumberInput
                defaultValue={crossfadeDuration}
                label={`${t('player.config.crossfadeDuration')}`}
                min={1}
                max={12}
                onBlur={(e: ChangeEvent<HTMLInputElement>) =>
                  dispatch(setCrossfadeDuration(Number(e.currentTarget.value)))
                }
                disabled={type !== 'crossfade'}
              />
            </Stack>
          </Popover>
          <IconButton
            active={repeat !== PlayerRepeat.None}
            variant="transparent"
            tooltip={{ label: `${t('player.repeat')}` }}
            icon={
              repeat === PlayerRepeat.One ? (
                <RepeatOnce size={20} />
              ) : (
                <Repeat size={20} />
              )
            }
            onClick={() => dispatch(toggleRepeat())}
          />
          <IconButton
            active={shuffle}
            variant="transparent"
            tooltip={{ label: `${t('player.shuffle')}` }}
            icon={<ArrowsShuffle size={20} />}
            onClick={() => dispatch(toggleShuffle())}
          />
          <IconButton
            variant="transparent"
            tooltip={{ label: `${t('player.queue')}` }}
            icon={<Playlist size={20} />}
          />
        </Group>
      </Box>
      <Box className={classes.box}>
        <IconButton
          variant="transparent"
          tooltip={{
            label: muted ? `${t('player.muted')}` : String(localVolume),
          }}
          icon={muted ? <Volume3 size={15} /> : <Volume2 size={15} />}
          onClick={() => dispatch(toggleMute())}
        />
        <Slider
          className={classes.volumeSlider}
          value={localVolume}
          min={0}
          max={100}
          onChange={(e: number) => setLocalVolume(e)}
          toolTipType="text"
        />
      </Box>
    </Container>
  );
};

export default RightControls;
