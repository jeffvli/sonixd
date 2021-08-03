import React from 'react';
import { Loader as RsLoader } from 'rsuite';
import '../../styles/Loader.global.css';

const Loader = () => {
  return (
    <div className="loader__main">
      <RsLoader size="md" />
    </div>
  );
};

export default Loader;
