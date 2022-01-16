import React from 'react';
import { Loader } from 'rsuite';

const CenterLoader = () => {
  return (
    <div style={{ height: '100%' }}>
      <Loader style={{ top: '50%', left: '50%', position: 'absolute' }} />
    </div>
  );
};

export default CenterLoader;
