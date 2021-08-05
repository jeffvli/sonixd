import React from 'react';
import { Loader as RsLoader } from 'rsuite';
import '../../styles/Loader.global.css';

const Loader = ({ text }: any) => {
  return (
    <div className="loader__main">
      <RsLoader size="md" vertical content={text} />
    </div>
  );
};

export default Loader;
