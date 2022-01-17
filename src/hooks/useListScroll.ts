import { useCallback } from 'react';

const useListScroll = (ref: any) => {
  const listScroll = useCallback(
    (position: number) => {
      setTimeout(() => {
        ref?.current?.table?.current?.scrollTop(position);
      });
    },
    [ref]
  );

  return { listScroll };
};

export default useListScroll;
