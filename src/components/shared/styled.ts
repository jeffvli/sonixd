import {
  Button,
  InputGroup,
  InputNumber,
  Input,
  Checkbox,
  IconButton,
  Radio,
  Nav,
  Icon,
  Rate,
  Slider,
  InputPicker,
  Popover,
} from 'rsuite';
import styled from 'styled-components';

export const HeaderButton = styled(Button)`
  margin-left: 5px;
  margin-right: 5px;
`;

export const StyledButton = styled(Button)<{ width: number }>`
  background: ${(props) =>
    props.appearance === 'primary' ? `${props.theme.primary.main} !important` : undefined};

  width: ${(props) => `${props.width}px`};
`;

export const StyledInputGroup = styled(InputGroup)`
  input {
    background-color: ${(props) => props.theme.primary.inputBackground};
    color: ${(props) => `${props.theme.primary.text} !important`};
  }
`;

export const StyledInputNumber = styled(InputNumber)<{ width: number }>`
  input {
    background-color: ${(props) => props.theme.primary.inputBackground};
  }
  width: ${(props) => `${props.width}px`};
`;

export const StyledInput = styled(Input)<{ width: number }>`
  input {
    background-color: ${(props) => props.theme.primary.inputBackground};
  }
  width: ${(props) => `${props.width}px`};
`;

export const StyledCheckbox = styled(Checkbox)`
  div {
    label {
      span {
        &:before {
          border: ${(props) => `1px solid ${props.theme.primary.main}`};
        }
        span {
          &:before {
            background-color: ${(props) =>
              props.defaultChecked ? `${props.theme.primary.main} !important` : undefined};
          }
          &:after {
            border: transparent !important;
          }
        }
      }
    }
  }
`;

export const StyledRadio = styled(Radio)`
  div {
    label {
      span {
        span {
          &:before {
            background-color: transparent !important;
          }
          &:after {
            background: ${(props) => `${props.theme.primary.main} !important`};
          }
        }
      }
    }
  }
`;

export const StyledIconButton = styled(IconButton)`
  &:hover {
    background: ${(props) =>
      props.appearance === 'subtle' ? 'transparent !important' : undefined};
    color: ${(props) => (props.appearance === 'subtle' ? props.theme.primary.main : undefined)};
  }
  &:focus {
    background: ${(props) =>
      props.appearance === 'subtle' ? 'transparent !important' : undefined};
    color: ${(props) => (props.appearance === 'subtle' ? props.theme.primary.main : undefined)};
  }
  background-color: ${(props) =>
    props.appearance === 'primary' ? props.theme.primary.main : undefined};
  width: ${(props) => `${props.width}px`};
`;

export const StyledNavItem = styled(Nav.Item)`
  a {
    color: ${(props) => (props.active ? `${props.theme.primary.main} !important;` : undefined)};

    &:hover {
      color: ${(props) => `${props.theme.primary.main} !important;`};
    }
  }
`;

export const StyledIconToggle = styled(Icon)<{ active: string }>`
  cursor: pointer;
  color: ${(props) =>
    props.active === 'true' ? props.theme.primary.main : props.theme.primary.text};
`;

export const StyledRate = styled(Rate)`
  color: ${(props) => props.theme.primary.main};
`;

export const StyledSlider = styled(Slider)`
  div {
    div {
      border: '2px solid #000 !important';
    }
  }
`;

export const StyledInputPicker = styled(InputPicker)<{ width?: number }>`
  .rs-picker-toggle-value {
    color: ${(props) => `${props.theme.primary.text} !important`};
  }

  .rs-btn-default {
    background: ${(props) => `${props.theme.primary.inputBackground} !important`};
  }

  width: ${(props) => `${props.width}px`};
`;

export const StyledIcon = styled(Icon)`
  color: ${(props) => `${props.theme.primary.main} !important`};
`;

export const ContextMenuWindow = styled.div<{
  yPos: number;
  xPos: number;
  numOfButtons: number;
  numOfDividers: number;
  width: number;
  hasTitle: boolean;
}>`
  position: absolute;
  top: ${(props) => `${props.yPos}px`};
  left: ${(props) => `${props.xPos}px`};
  height: ${(props) =>
    `${props.numOfButtons * 30 + props.numOfDividers * 1.5 + (props.hasTitle ? 16 : 0)}px`};
  width: ${(props) => `${props.width}px`};
  margin: 0px;
  white-space: normal;
  overflow: hidden;
  overflow-x: hidden;
  font-size: smaller;
  background: ${(props) => props.theme.primary.sideBar};
  border: 1px #3c4043 solid;
  z-index: 2000;
`;

export const StyledContextMenuButton = styled(Button)`
  text-align: left;
  margin: 0px !important;
  border-radius: 0px !important;
`;

export const ContextMenuDivider = styled.hr`
  margin: 0px;
`;

export const ContextMenuTitle = styled.div`
  color: ${(props) => props.theme.primary.text};
  margin: 5px 0 5px 5px;
  user-select: none;
`;

export const StyledPopover = styled(Popover)`
  position: absolute;
  z-index: 2;
`;

export const SectionTitleWrapper = styled.div`
  margin-left: 10px;
  margin-bottom: 10px;
`;

export const SectionTitle = styled.a`
  font-size: 20px;
  color: ${(props) => props.theme.primary.text};

  &:hover {
    cursor: ${(props) => (props.onClick ? 'pointer' : 'default')};
    text-decoration: none;
    color: ${(props) => (!props.onClick ? props.theme.primary.text : undefined)};
  }

  &:active,
  &:focus {
    text-decoration: none;
    color: ${(props) => (!props.onClick ? props.theme.primary.text : undefined)};
  }
`;

export const StyledLink = styled.a`
  color: ${(props) => props.theme.primary.text};
  cursor: pointer;
`;
