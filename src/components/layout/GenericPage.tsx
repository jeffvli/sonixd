import React from 'react';
import { Container, Header, Content, Divider } from 'rsuite';
import styled from 'styled-components';
import '../../styles/GenericPage.global.css';

const GenericPage = ({ header, children, hideDivider }: any) => {
  return (
    <Container id="page" className="container__page" style={{ height: '100%' }}>
      <Header className="page__header">{header}</Header>
      {!hideDivider && <Divider />}
      <Content className="page__content">{children}</Content>
    </Container>
  );
};

export default GenericPage;
