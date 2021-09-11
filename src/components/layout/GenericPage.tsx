import React from 'react';
import { Divider } from 'rsuite';
import { PageContainer, PageHeader, PageContent } from './styled';

const GenericPage = ({ header, children, hideDivider, ...rest }: any) => {
  return (
    <PageContainer id="page-container">
      <PageHeader
        id="page-header"
        padding={rest.padding}
        style={{ paddingBottom: hideDivider && !rest.padding ? '20px' : '0px' }}
      >
        {header}
      </PageHeader>
      {!hideDivider && <Divider />}
      <PageContent id="page-content" padding={rest.padding}>
        {children}
      </PageContent>
    </PageContainer>
  );
};

export default GenericPage;
