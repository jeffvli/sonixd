import { useMemo, useState } from 'react';

import format from 'format-duration';
import ReactSlider, { ReactSliderProps } from 'react-slider';
import styled from 'styled-components';

interface SliderProps extends ReactSliderProps {
  toolTipType?: 'text' | 'time';
  hasToolTip?: boolean;
}

const StyledSlider = styled<any>(ReactSlider)`
  width: 100%;
  height: 25px;
  outline: none;

  .thumb {
    opacity: 1;
    top: 37%;

    &:after {
      content: attr(data-tooltip);
      top: -25px;
      left: -18px;
      color: #000;
      background: #fff;
      border-radius: 4px;
      padding: 2px 6px;
      white-space: nowrap;
      position: absolute;
      display: ${(props) =>
        props.isDragging && props.hasToolTip ? 'block' : 'none'};
    }

    &:focus-visible {
      outline: none;
      height: 13px;
      width: 13px;
      border: 1px #000 solid;
      border-radius: 100%;
      text-align: center;
      background-color: #ffffff;
      transform: translate(-12px, -4px);
    }
  }

  .track-0 {
    background: ${(props) => props.isDragging && '#3a81ed'};
  }

  .track {
    top: 37%;
  }

  &:hover {
    .track-0 {
      background: ${(props) => (props.index === 1 ? '#2f3136' : '#3a81ed')};
    }
  }
`;

const StyledTrack = styled.div<any>`
  top: 0;
  bottom: 0;
  height: 5px;
  background: ${(props) => (props.index === 1 ? '#1a1b1e' : '#36393f')};
`;

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

  return <StyledTrack {...props} index={index} />;
};
const Thumb = (props: any, state: any, toolTipType: any) => (
  <MemoizedThumb
    key="slider"
    tabIndex={0}
    props={props}
    state={state}
    toolTipType={toolTipType}
  />
);

const Slider = ({ toolTipType, hasToolTip, ...rest }: SliderProps) => {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <StyledSlider
      {...rest}
      defaultValue={0}
      renderTrack={Track}
      renderThumb={(props: any, state: any) => {
        return Thumb(props, state, toolTipType);
      }}
      isDragging={isDragging}
      hasToolTip={hasToolTip}
      onBeforeChange={(e: number, index: number) => {
        if (rest.onBeforeChange) {
          rest.onBeforeChange(e, index);
        }
        setIsDragging(true);
      }}
      onAfterChange={(e: number, index: number) => {
        if (rest.onAfterChange) {
          rest.onAfterChange(e, index);
        }
        setIsDragging(false);
      }}
    />
  );
};

Slider.defaultProps = {
  toolTipType: 'text',
  hasToolTip: true,
};

export default Slider;
