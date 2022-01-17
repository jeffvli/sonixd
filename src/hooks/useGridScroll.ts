import { useCallback } from 'react';

const useGridScroll = (ref: any) => {
  const gridScroll = useCallback(
    (position: number) => {
      setTimeout(() => {
        ref?.current?.scrollTo(position);
      });
    },
    [ref]
  );

  return { gridScroll };
};

export default useGridScroll;
