import React from 'react';
import { Divider } from 'rsuite';
import { PageContainer, PageHeader, PageContent } from './styled';

const GenericPage = ({ header, children, hideDivider }: any) => {
  return (
    <PageContainer id="page-container">
      <PageHeader id="page-header">{header}</PageHeader>
      {!hideDivider && <Divider />}
      <PageContent id="page-content">{children}</PageContent>
    </PageContainer>
  );
};

export default GenericPage;
