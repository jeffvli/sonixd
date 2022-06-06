import { ChangeEvent, useState } from 'react';
import {
  Group,
  NumberInput,
  Popover,
  Radio,
  RadioGroup,
  Select,
  Stack,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import {
  Adjustments,
  ArrowsShuffle,
  Playlist,
  Repeat,
  RepeatOnce,
  Volume2,
  Volume3,
} from 'tabler-icons-react';
import { IconButton } from 'renderer/components';
import { useAppDispatch, useAppSelector } from 'renderer/hooks';
import {
  selectPlayerConfig,
  setCrossfadeDuration,
  setType,
  toggleMute,
  toggleRepeat,
  toggleShuffle,
} from 'renderer/store/playerSlice';
import { PlayerRepeat } from 'types';
import styles from './RightControls.module.scss';
import { Slider } from './Slider';

const CROSSFADE_TYPES = [
  { label: 'Equal Power', value: 'equalPower' },
  { label: 'Linear', value: 'linear' },
  { label: 'Dipped', value: 'dipped' },
  { label: 'Constant Power', value: 'constantPower' },
  { label: 'Constant Power (Slow fade)', value: 'constantPowerSlowFade' },
  { label: 'Constant Power (Slow cut)', value: 'constantPowerSlowCut' },
];

interface RightControlsProps {
  controls: any;
}

export const RightControls = ({ controls }: RightControlsProps) => {
  const { t } = useTranslation();
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
  const [openConfig, setOpenConfig] = useState(false);

  return (
    <div className={styles.container}>
      <div className={styles.box} />
      <div className={styles.box}>
        <Group position="right" spacing="xs">
          <Popover
            withArrow
            opened={openConfig}
            position="top"
            target={
              <IconButton
                icon={<Adjustments size={17} />}
                tooltip={{ label: `${t('player.config')}` }}
                variant="transparent"
                onClick={() => setOpenConfig(!openConfig)}
              />
            }
            onClose={() => setOpenConfig(false)}
          >
            <Stack>
              <RadioGroup
                label={`${t('player.config.playbackType')}`}
                orientation="vertical"
                size="sm"
                spacing="md"
                value={type}
                onChange={(e: 'gapless' | 'crossfade') => dispatch(setType(e))}
              >
                <Radio label={`${t('player.gapless')}`} value="gapless" />
                <Radio label={`${t('player.crossfade')}`} value="crossfade" />
              </RadioGroup>
              <Select
                data={CROSSFADE_TYPES}
                defaultValue={crossfadeType}
                disabled={type !== 'crossfade'}
                label={`${t('player.config.crossfadeType')}`}
              />
              <NumberInput
                defaultValue={crossfadeDuration}
                disabled={type !== 'crossfade'}
                label={`${t('player.config.crossfadeDuration')}`}
                max={12}
                min={1}
                onBlur={(e: ChangeEvent<HTMLInputElement>) =>
                  dispatch(setCrossfadeDuration(Number(e.currentTarget.value)))
                }
              />
            </Stack>
          </Popover>
          <IconButton
            active={repeat !== PlayerRepeat.None}
            icon={
              repeat === PlayerRepeat.One ? (
                <RepeatOnce size={17} />
              ) : (
                <Repeat size={17} />
              )
            }
            tooltip={{ label: `${t('player.repeat')}` }}
            variant="transparent"
            onClick={() => dispatch(toggleRepeat())}
          />
          <IconButton
            active={shuffle}
            icon={<ArrowsShuffle size={17} />}
            tooltip={{ label: `${t('player.shuffle')}` }}
            variant="transparent"
            onClick={() => dispatch(toggleShuffle())}
          />
          <IconButton
            icon={<Playlist size={17} />}
            tooltip={{ label: `${t('player.queue')}` }}
            variant="transparent"
          />
        </Group>
      </div>
      <div className={styles.box}>
        <IconButton
          icon={muted ? <Volume3 size={17} /> : <Volume2 size={17} />}
          tooltip={{
            label: muted ? `${t('player.muted')}` : String(localVolume),
          }}
          variant="transparent"
          onClick={() => dispatch(toggleMute())}
        />
        <div className={styles.volume}>
          <Slider
            max={100}
            min={0}
            toolTipType="text"
            value={localVolume}
            onAfterChange={(e) => {
              setLocalVolume(e);
              controls.handleVolumeSlider(e);
            }}
          />
        </div>
      </div>
    </div>
  );
};
