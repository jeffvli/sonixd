import styled from 'styled-components';
import { Button } from 'rsuite';

export const RsuiteLinkButton = styled(Button)<{
  subtitle?: string;
  active?: boolean;
}>`
  max-width: 100%;
  padding: 0px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  color: ${(props) =>
    props.playing === 'true'
      ? props.theme.main
      : props.subtitle === 'true'
      ? props.theme.subtitleText
      : props.theme.titleText};

  &:hover {
    text-decoration: underline;
    color: ${(props) => props.theme.titleText};
    cursor: pointer;
  }
`;

export const TableCellWrapper = styled.div<{
  rowselected: string;
  playing?: string;
  height?: number;
}>`
  background: ${(props) =>
    props.rowselected === 'true' ? props.theme.rowSelected : undefined};
  color: ${(props) =>
    props.playing === 'true' ? props.theme.main : undefined};
  line-height: ${(props) => (props.height ? `${props.height}px` : undefined)};
`;
