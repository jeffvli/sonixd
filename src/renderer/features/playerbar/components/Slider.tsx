import { useMemo, useState } from 'react';
import clsx from 'clsx';
import format from 'format-duration';
import ReactSlider, { ReactSliderProps } from 'react-slider';

import './Slider.scss';

interface SliderProps extends ReactSliderProps {
  hasToolTip?: boolean;
  toolTipType?: 'text' | 'time';
}

const MemoizedThumb = ({ props, state, toolTipType }: any) => {
  const { value } = state;
  const formattedValue = useMemo(() => {
    if (toolTipType === 'text') {
      return value;
    }

    return format(value * 1000);
  }, [toolTipType, value]);

  return <div {...props} data-tooltip={formattedValue} />;
};

// eslint-disable-next-line react/destructuring-assignment
const Track = (props: any, state: any) => {
  const { index } = state;

  return <div {...props} index={index} />;
};
const Thumb = (props: any, state: any, toolTipType: any) => (
  <MemoizedThumb
    key="slider"
    props={props}
    state={state}
    tabIndex={0}
    toolTipType={toolTipType}
  />
);

export const Slider = ({ toolTipType, hasToolTip, ...rest }: SliderProps) => {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <ReactSlider
      {...rest}
      className="player-slider"
      defaultValue={0}
      renderThumb={(props: any, state: any) => {
        return Thumb(props, state, toolTipType);
      }}
      renderTrack={Track}
      thumbClassName={clsx('slider-thumb', {
        dragging: isDragging && hasToolTip,
      })}
      trackClassName={clsx('slider-track', { seek: isDragging })}
      onAfterChange={(e: number, index: number) => {
        if (rest.onAfterChange) {
          rest.onAfterChange(e, index);
        }
        setIsDragging(false);
      }}
      onBeforeChange={(e: number, index: number) => {
        if (rest.onBeforeChange) {
          rest.onBeforeChange(e, index);
        }
        setIsDragging(true);
      }}
    />
  );
};

Slider.defaultProps = {
  hasToolTip: true,
  toolTipType: 'text',
};
