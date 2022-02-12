import styled from 'styled-components';
import { Button, Table } from 'rsuite';

export const TableLinkButton = styled(Button)<{
  subtitle?: string;
  active?: boolean;
  font?: string;
}>`
  font-size: ${(props) => props.font};
  background: transparent;
  max-width: 100%;
  padding: 0px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  color: ${(props) =>
    props.subtitle === 'true'
      ? props.theme.colors.layout.page.colorSecondary
      : props.theme.colors.layout.page.color};

  &:hover,
  &:active,
  &:focus {
    color: ${(props) =>
      props.subtitle === 'true'
        ? props.theme.colors.layout.page.colorSecondary
        : props.theme.colors.layout.page.color} !important;
    background: transparent !important;
    text-decoration: underline;
    cursor: pointer;
  }
`;

export const TableCellWrapper = styled.div<{
  height?: number;
}>`
  margin-right: 5px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  line-height: ${(props) => (props.height ? `${props.height}px` : undefined)};
`;

export const CombinedTitleContainer = styled.div<{ height: number }>`
  .row-main {
    height: ${(props) => props.height}px;
    display: flex;
    align-items: center;

    .col-cover {
      padding-right: 5px;
      width: ${(props) => props.height}px;
    }

    .col-text {
      width: 100%;
      overflow: hidden;
      padding-left: 10px;
      padding-right: 20px;

      .row-sub-text {
        height: ${(props) => props.height / 2}px;
        overflow: hidden;
        position: relative;

        .span {
          position: absolute;
          top: 0;
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
          width: 100%;
        }
      }

      .row-sub-secondarytext {
        height: ${(props) => props.height / 2}px;
        font-size: smaller;
        overflow: hidden;
        position: relative;
        width: 100%;
      }
    }
  }
`;

export const CombinedTitleTextWrapper = styled.span`
  position: absolute;
  bottom: 0;
  width: 100%;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
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
