import { ChangeEvent, useMemo, useState } from 'react';
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
import { Adjustments, Playlist, Volume2, Volume3 } from 'tabler-icons-react';
import { IconButton } from 'renderer/components';
import { usePlayerStore } from 'renderer/store';
import { PlaybackStyle } from 'types';
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
  const settings = usePlayerStore((state) => state.settings);
  const setSettings = usePlayerStore((state) => state.setSettings);
  const [openConfig, setOpenConfig] = useState(false);

  const volume = useMemo(() => {
    return Math.sqrt(settings.volume) * 100;
  }, [settings.volume]);

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
                value={settings.style}
                onChange={(e: PlaybackStyle) => setSettings({ style: e })}
              >
                <Radio label={`${t('player.gapless')}`} value="gapless" />
                <Radio label={`${t('player.crossfade')}`} value="crossfade" />
              </RadioGroup>
              <Select
                data={CROSSFADE_TYPES}
                defaultValue={settings.crossfadeStyle}
                disabled={settings.style !== PlaybackStyle.Crossfade}
                label={`${t('player.config.crossfadeType')}`}
              />
              <NumberInput
                defaultValue={settings.crossfadeDuration}
                disabled={settings.style !== PlaybackStyle.Crossfade}
                label={`${t('player.config.crossfadeDuration')}`}
                max={12}
                min={1}
                onBlur={(e: ChangeEvent<HTMLInputElement>) =>
                  setSettings({ crossfadeDuration: Number(e.target.value) })
                }
              />
            </Stack>
          </Popover>
          {/* <IconButton
            active={settings.repeat !== PlayerRepeat.None}
            icon={
              settings.repeat === PlayerRepeat.One ? (
                <RepeatOnce size={17} />
              ) : (
                <Repeat size={17} />
              )
            }
            tooltip={{ label: `${t('player.repeat')}` }}
            variant="transparent"
            onClick={() => setSettings}
          />
          <IconButton
            active={settings.shuffle}
            icon={<ArrowsShuffle size={17} />}
            tooltip={{ label: `${t('player.shuffle')}` }}
            variant="transparent"
            onClick={() => dispatch(toggleShuffle())}
          /> */}
          <IconButton
            icon={<Playlist size={17} />}
            tooltip={{ label: `${t('player.queue')}` }}
            variant="transparent"
          />
        </Group>
      </div>
      <div className={styles.box}>
        <IconButton
          icon={settings.muted ? <Volume3 size={17} /> : <Volume2 size={17} />}
          tooltip={{
            label: settings.muted ? `${t('player.muted')}` : String(volume),
          }}
          variant="transparent"
          onClick={() => setSettings({ muted: !settings.muted })}
        />
        <div className={styles.volume}>
          <Slider
            max={100}
            min={0}
            toolTipType="text"
            value={volume}
            onAfterChange={(e) => {
              controls.handleVolumeSlider(e);
            }}
          />
        </div>
      </div>
    </div>
  );
};
