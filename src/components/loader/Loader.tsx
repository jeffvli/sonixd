import React from 'react';
import { Loader as RsLoader } from 'rsuite';
import styled from 'styled-components';

const LoaderContainer = styled.div`
  text-align: center;
  margin-top: 75px;
`;

const Loader = ({ text }: any) => {
  return (
    <LoaderContainer>
      <RsLoader size="md" vertical content={text} speed="slow" />
    </LoaderContainer>
  );
};

export default Loader;
