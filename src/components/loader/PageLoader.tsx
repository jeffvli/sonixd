import React from 'react';
import { Loader as RsLoader } from 'rsuite';
import styled from 'styled-components';

const LoaderContainer = styled.div`
  text-align: center;
  margin-top: 75px;

  div {
    div {
      span {
        &:after {
          border-color: ${(props) => `${props.theme.primary.main} transparent transparent`};
        }
        &:before {
          border: ${(props) => `3px solid ${props.theme.primary.spinnerBackground}`};
        }
      }
    }
  }
`;

const PageLoader = ({ text }: any) => {
  return (
    <LoaderContainer>
      <RsLoader size="md" vertical content={text} speed="slow" />
    </LoaderContainer>
  );
};

export default PageLoader;
