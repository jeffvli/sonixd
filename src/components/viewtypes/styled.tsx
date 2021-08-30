import styled from 'styled-components';
import { Button } from 'rsuite';

export const RsuiteLinkButton = styled(Button)<{ subtitle?: string }>`
  max-width: 100%;
  padding: 0px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  color: ${(props) =>
    props.subtitle === 'true'
      ? props.theme.subtitleText
      : props.theme.titleText};

  &:hover {
    text-decoration: underline;
    color: ${(props) =>
      props.subtitle === 'true'
        ? props.theme.subtitleText
        : props.theme.titleText};
    cursor: pointer;
  }

  &:active {
    color: ${(props) =>
      props.subtitle === 'true'
        ? props.theme.subtitleText
        : props.theme.titleText};
  }
`;
