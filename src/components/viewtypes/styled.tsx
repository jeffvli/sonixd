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
    props.playing
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
  selected: boolean;
  playing?: boolean;
  height?: number;
}>`
  background: ${(props) =>
    props.selected ? props.theme.rowSelected : undefined};
  color: ${(props) => (props.playing ? props.theme.main : undefined)};
  line-height: ${(props) => (props.height ? `${props.height}px` : undefined)};
`;
