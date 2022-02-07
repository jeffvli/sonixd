import React from 'react';
import { Loader } from 'rsuite';

const CenterLoader = ({ absolute }: any) => {
  return (
    <div style={{ height: '100%' }}>
      <Loader style={{ top: '50%', left: '50%', position: absolute ? 'absolute' : 'relative' }} />
    </div>
  );
};

export default CenterLoader;
