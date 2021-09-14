import styled from 'styled-components';
import { Button, Table } from 'rsuite';

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
      ? props.theme.primary.main
      : props.subtitle === 'true'
      ? props.theme.secondary.text
      : props.theme.primary.text};

  &:hover {
    text-decoration: underline;
    color: ${(props) => props.theme.primary.text};
    cursor: pointer;
  }
`;

export const TableCellWrapper = styled.div<{
  rowselected: string;
  playing?: string;
  height?: number;
  dragover?: string;
  dragselect?: string;
  dragfield?: string;
}>`
  background: ${(props) =>
    props.rowselected === 'true' ? props.theme.primary.rowSelected : undefined};
  color: ${(props) =>
    props.playing === 'true' ? props.theme.primary.main : undefined};
  line-height: ${(props) => (props.height ? `${props.height}px` : undefined)};
  box-shadow: ${(props) =>
    props.dragover === 'true'
      ? `inset 0px 5px 0px -3px ${props.theme.primary.main}`
      : undefined};
  cursor: ${(props) =>
    props.dragover === 'true'
      ? 'grabbing'
      : props.dragfield === 'true'
      ? 'grab'
      : props.dragselect === 'true'
      ? 'crosshair'
      : 'pointer'};
`;

export const CombinedTitleTextWrapper = styled.span<{ playing: string }>`
  color: ${(props) =>
    props.playing === 'true' ? props.theme.primary.main : undefined};
`;

export const StyledTableHeaderCell = styled(Table.HeaderCell)`
  .rs-table-column-resize-spanner::before {
    border-color: transparent #000 transparent transparent !important;
  }

  .rs-table-column-resize-spanner::after {
    border-color: transparent transparent transparent #000 !important;
  }

  .rs-table-cell-content:hover .rs-table-column-resize-spanner:hover {
    background-color: #000 !important;
  }

  .rs-table-cell-header-icon-sort-desc::after,
  .rs-table-cell-header-icon-sort-asc::after {
    color: ${(props) => `${props.theme.primary.main} !important`};
  }
`;
