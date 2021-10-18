import styled from 'styled-components';
import { Panel } from 'rsuite';

export const ConfigPanel = styled(Panel)`
  color: ${(props) => props.theme.primary.text};
  padding: 20px;
  min-width: 500px;
  max-width: 800px;
  margin: 15px auto 15px auto;
  border-radius: 0px;

  .rs-panel-heading {
    font-size: ${(props) => props.theme.all.fonts.panelHeaderFontSize};
  }
`;

export const MockFooter = styled.div`
  width: 100%;
  height: 100%;
  background: ${(props) => props.theme.primary.playerBar};
  border-top: 1px solid #48545c;
`;

export const LoginPanel = styled(Panel)`
  color: ${(props) => props.theme.primary.text};
  padding: 20px;
  min-width: 300px;
  max-width: 300px;
  margin: 5px auto 5px auto;
`;
