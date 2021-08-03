import React from 'react';
import { Container, Header, Content, Divider } from 'rsuite';
import '../../styles/GenericPage.global.css';

const GenericPage = ({ header, children }: any) => {
  return (
    <Container id="page" className="container__page">
      <Header className="page__header">{header}</Header>
      <Divider />
      <Content className="page__content">{children}</Content>
    </Container>
  );
};

export default GenericPage;
