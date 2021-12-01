import styled from 'styled-components';
import { Button, Table } from 'rsuite';

export const RsuiteLinkButton = styled(Button)<{
  subtitle?: string;
  active?: boolean;
}>`
  background: transparent;
  max-width: 100%;
  padding: 0px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  color: ${(props) =>
    props.playing === 'true'
      ? props.theme.colors.primary
      : props.subtitle === 'true'
      ? props.theme.colors.layout.page.colorSecondary
      : props.theme.colors.layout.page.color};

  &:hover,
  &:active,
  &:focus {
    background: transparent !important;
    text-decoration: underline;
    color: ${(props) =>
      props.playing === 'true'
        ? props.theme.colors.primary
        : props.subtitle === 'true'
        ? props.theme.colors.layout.page.colorSecondary
        : props.theme.colors.layout.page.color} !important;
    cursor: pointer;
  }
`;

export const TableCellWrapper = styled.div<{
  playing?: string;
  height?: number;
  dragover?: string;
  dragfield?: string;
}>`
  color: ${(props) => (props.playing === 'true' ? props.theme.colors.primary : undefined)};
  line-height: ${(props) => (props.height ? `${props.height}px` : undefined)};
  cursor: ${(props) =>
    props.dragover === 'true' ? 'grabbing' : props.dragfield === 'true' ? 'grab' : 'default'};
`;

export const CombinedTitleTextWrapper = styled.span<{ playing: string }>`
  color: ${(props) => (props.playing === 'true' ? props.theme.colors.primary : undefined)};

  &:focus-visible {
    outline: none;
    text-decoration: underline;
  }
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
    color: ${(props) => `${props.theme.colors.primary} !important`};
  }
`;
