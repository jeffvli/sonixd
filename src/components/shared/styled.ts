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
  Panel,
  TagPicker,
  Tag,
} from 'rsuite';
import styled from 'styled-components';

export const HeaderButton = styled(Button)`
  margin-left: 5px;
  margin-right: 5px;
`;

export const StyledButton = styled(Button)<{ width: number }>`
  border-radius: ${(props) => props.theme.other.button.borderRadius} !important;
  background: ${(props) =>
    props.appearance === 'primary'
      ? `${props.theme.colors.primary}`
      : props.appearance === 'subtle' || props.appearance === 'link'
      ? undefined
      : `${props.theme.colors.button.default.background}`} !important;
  color: ${(props) =>
    props.appearance === 'primary'
      ? `${props.theme.colors.button.primary.color}`
      : props.appearance === 'subtle'
      ? `${props.theme.colors.button.subtle.color}`
      : props.appearance === 'link'
      ? `${props.theme.colors.button.link.color}`
      : `${props.theme.colors.button.default.color}`} !important;

  filter: ${(props) => (props.disabled || props.loading ? 'brightness(0.7)' : 'none')};
  transition: 0.5s;
  width: ${(props) => `${props.width}px`};

  &:active,
  &:focus,
  &:hover {
    text-decoration: none;
    color: ${(props) =>
      props.appearance === 'primary'
        ? `${props.theme.colors.button.primary.colorHover}`
        : props.appearance === 'subtle'
        ? `${props.theme.colors.button.subtle.colorHover}`
        : props.appearance === 'link'
        ? `${props.theme.colors.button.link.colorHover}`
        : `${props.theme.colors.button.default.colorHover}`} !important;

    background: ${(props) =>
      props.appearance === 'primary'
        ? `${props.theme.colors.button.primary.backgroundHover}`
        : props.appearance === 'subtle'
        ? `${props.theme.colors.button.subtle.backgroundHover}`
        : props.appearance === 'link'
        ? undefined
        : `${props.theme.colors.button.default.backgroundHover}`} !important;
  }
`;

export const StyledInputGroup = styled(InputGroup)`
  border-radius: ${(props) => props.theme.other.input.borderRadius};
`;

export const StyledInputGroupButton = styled(InputGroup.Button)`
  background: ${(props) =>
    props.appearance === 'primary'
      ? `${props.theme.colors.primary}`
      : props.appearance === 'subtle' || props.appearance === 'link'
      ? undefined
      : `${props.theme.colors.button.default.background}`} !important;
  color: ${(props) =>
    props.appearance === 'primary'
      ? `${props.theme.colors.button.primary.color}`
      : props.appearance === 'subtle'
      ? `${props.theme.colors.button.subtle.color}`
      : props.appearance === 'link'
      ? 'none'
      : `${props.theme.colors.button.default.color}`} !important;

  &:active,
  &:focus,
  &:hover {
    background: ${(props) =>
      props.appearance === 'primary'
        ? `${props.theme.colors.button.primary.backgroundHover}`
        : props.appearance === 'subtle' || props.appearance === 'link'
        ? `none !important`
        : `${props.theme.colors.button.default.backgroundHover} !important`};
  }

  &:hover {
    color: ${(props) =>
      props.appearance === 'primary'
        ? `${props.theme.colors.button.primary.colorHover}`
        : props.appearance !== 'subtle'
        ? `${props.theme.colors.button.default.colorHover}`
        : `${props.theme.colors.button.subtle.colorHover} !important`};
  }
  border-radius: ${(props) => props.theme.other.input.borderRadius};
  border-bottom-right-radius: ${(props) => props.theme.other.input.borderRadius} !important;
  border-top-right-radius: ${(props) => props.theme.other.input.borderRadius} !important;
`;

export const StyledInputNumber = styled(InputNumber)<{ width: number }>`
  border: 1px #3c3f43 solid !important;
  border-radius: ${(props) => props.theme.other.input.borderRadius} !important;

  input {
    background-color: ${(props) => props.theme.colors.input.background};
  }

  .rs-input {
    border-radius: ${(props) => props.theme.other.input.borderRadius} !important;
  }

  &:hover,
  &:active,
  &:focus {
    border-color: ${(props) => props.theme.colors.primary} !important;
  }

  width: ${(props) => `${props.width}px`};
`;

export const StyledInput = styled(Input)<{ width: number }>`
  border: 1px #3c3f43 solid !important;
  border-radius: ${(props) => props.theme.other.input.borderRadius} !important;

  color: ${(props) => props.theme.colors.input.color} !important;
  background: ${(props) => props.theme.colors.input.background} !important;
  width: ${(props) => `${props.width}px`};
  border-radius: ${(props) => props.theme.other.input.borderRadius};
`;

export const StyledCheckbox = styled(Checkbox)`
  div {
    label {
      span {
        &:before {
          border: ${(props) => `1px solid ${props.theme.colors.primary}`};
        }
        span {
          &:before {
            background-color: ${(props) =>
              props.defaultChecked ? `${props.theme.colors.primary} !important` : undefined};
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
            background: ${(props) => `${props.theme.colors.primary} !important`};
          }
        }
      }
    }
  }
`;

export const StyledIconButton = styled(IconButton)`
  border-radius: ${(props) => props.theme.other.button.borderRadius} !important;
  background: ${(props) =>
    props.appearance === 'primary'
      ? `${props.theme.colors.primary}`
      : props.appearance === 'subtle' || props.appearance === 'link'
      ? undefined
      : `${props.theme.colors.button.default.background}`};
  color: ${(props) =>
    props.appearance === 'primary'
      ? `${props.theme.colors.button.primary.color}`
      : props.appearance === 'subtle'
      ? `${props.theme.colors.button.subtle.color}`
      : props.appearance === 'link'
      ? undefined
      : `${props.theme.colors.button.default.color}`};

  filter: ${(props) => (props.disabled || props.loading ? 'brightness(0.7)' : 'none')};
  transition: 0.5s;
  width: ${(props) => `${props.width}px`};

  &:active,
  &:focus,
  &:hover {
    color: ${(props) =>
      props.appearance === 'primary'
        ? `${props.theme.colors.button.primary.colorHover}`
        : props.appearance !== 'subtle'
        ? `${props.theme.colors.button.default.colorHover}`
        : `${props.theme.colors.button.subtle.colorHover}`};

    background: ${(props) =>
      props.appearance === 'primary'
        ? `${props.theme.colors.button.primary.backgroundHover}`
        : props.appearance === 'subtle'
        ? `${props.theme.colors.button.subtle.backgroundHover}`
        : props.appearance === 'link'
        ? undefined
        : `${props.theme.colors.button.default.backgroundHover}`};
  }
`;

export const StyledNavItem = styled(Nav.Item)`
  a {
    color: ${(props) =>
      props.active
        ? `${props.theme.colors.primary} !important`
        : `${props.theme.colors.nav.color} !important`};
  }
`;

export const StyledIconToggle = styled(Icon)<{ active: string }>`
  cursor: pointer;
  color: ${(props) =>
    props.active === 'true' ? props.theme.colors.primary : props.theme.colors.layout.page.color};
`;

export const StyledRate = styled(Rate)`
  color: ${(props) => props.theme.colors.primary};
`;

export const StyledSlider = styled(Slider)`
  div {
    div {
      border: '2px solid #000 !important';
    }
  }
`;

export const StyledInputPickerContainer = styled.div`
  .rs-picker-menu {
    background: ${(props) => props.theme.colors.input.background};
    border-radius: ${(props) => props.theme.other.input.borderRadius};
  }

  .rs-picker-select-menu-item-active {
    background: ${(props) => props.theme.colors.input.backgroundActive};

    &:hover {
      background: ${(props) => props.theme.colors.input.backgroundActive};
    }
  }

  .rs-picker-select-menu-item-focus {
    color: ${(props) => props.theme.colors.input.color};
    background: ${(props) => props.theme.colors.input.backgroundHover};
  }

  .rs-picker-select-menu-item,
  .rs-picker-select-menu-group-title {
    color: ${(props) => props.theme.colors.input.color};

    &:hover {
      color: ${(props) => props.theme.colors.input.color};
      &:hover {
        background: ${(props) => props.theme.colors.input.backgroundHover};
      }
    }
  }

  .rs-picker-select-menu-group-title {
    color: ${(props) => props.theme.colors.input.color};

    &:hover {
      color: ${(props) => props.theme.colors.input.color};
    }
  }

  .rs-check-item {
    background: ${(props) => props.theme.colors.input.background} !important;
    border-radius: ${(props) => props.theme.other.input.borderRadius};

    &:hover {
      color: ${(props) => props.theme.colors.input.color};
      background-color: ${(props) => props.theme.colors.input.backgroundHover} !important;
    }
  }

  .rs-check-item-focus {
    color: ${(props) => props.theme.colors.input.color};
    background: ${(props) => props.theme.colors.input.backgroundActive} !important;
  }

  .rs-checkbox-checked {
    .rs-checkbox-checker {
      span {
        &:before {
          border: ${(props) => `1px solid ${props.theme.colors.primary}`};
        }
        span {
          &:before {
            background-color: ${(props) => `${props.theme.colors.primary} !important`};
          }
          &:after {
            border: transparent !important;
          }
        }
      }
    }
  }
`;

export const StyledInputPicker = styled(InputPicker)<{ width?: number }>`
  border: 1px #3c3f43 solid !important;
  border-radius: ${(props) => props.theme.other.input.borderRadius} !important;

  &:hover,
  &:active,
  &:focus {
    border-color: ${(props) => props.theme.colors.primary} !important;
  }

  .rs-picker-toggle-value {
    color: ${(props) => `${props.theme.colors.layout.page.color} !important`};
  }

  .rs-picker-toggle {
    border-radius: ${(props) => props.theme.other.input.borderRadius};
  }

  .rs-btn-default {
    background: ${(props) => `${props.theme.colors.input.background} !important`};
  }

  width: ${(props) => `${props.width}px`};
  border-radius: ${(props) => props.theme.other.input.borderRadius};
`;

export const StyledIcon = styled(Icon)`
  color: ${(props) => `${props.theme.colors.primary} !important`};
`;

export const ContextMenuWindow = styled.div<{
  yPos: number;
  xPos: number;
  numOfButtons: number;
  numOfDividers: number;
  width: number;
  hasTitle: boolean;
}>`
  background: ${(props) => props.theme.colors.contextMenu.background};
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
  border: 1px #3c4043 solid;
  z-index: 2000;
`;

export const StyledContextMenuButton = styled(Button)`
  color: ${(props) =>
    props.disabled
      ? props.theme.colors.contextMenu.colorDisabled
      : props.theme.colors.contextMenu.color} !important;
  &:hover,
  &:active,
  &:focus {
    color: ${(props) => props.theme.colors.contextMenu.color};
    background: ${(props) => props.theme.colors.contextMenu.backgroundHover};
  }

  text-align: left;
  margin: 0px !important;
  border-radius: 0px !important;
`;

export const ContextMenuDivider = styled.hr`
  margin: 0px;
`;

export const ContextMenuTitle = styled.div`
  color: ${(props) => props.theme.colors.layout.page.color};
  margin: 5px 0 5px 5px;
  user-select: none;
`;

export const ContextMenuPopover = styled(Popover)`
  color: ${(props) => props.theme.colors.contextMenu.color} !important;
  background: ${(props) => props.theme.colors.contextMenu.background};
  position: absolute;
  z-index: 1000;
`;

export const StyledPopover = styled(Popover)`
  color: ${(props) => props.theme.colors.popover.color};
  background: ${(props) => props.theme.colors.popover.background};
  position: absolute;
  z-index: 1000;
`;

export const SectionTitleWrapper = styled.div`
  margin-left: 10px;
  margin-bottom: 10px;
`;

export const SectionTitle = styled.a`
  font-size: 20px;
  color: ${(props) => props.theme.colors.layout.page.color};
  cursor: ${(props) => (props.onClick ? 'pointer' : 'default')};

  &:hover {
    text-decoration: none;
    color: ${(props) =>
      !props.onClick ? props.theme.colors.layout.page.color : props.theme.colors.primary};
  }

  &:active,
  &:focus {
    text-decoration: none;
    color: ${(props) =>
      !props.onClick ? props.theme.colors.layout.page.color : props.theme.colors.primary};
  }
`;

export const StyledLink = styled.a`
  color: ${(props) => props.theme.colors.layout.page.color};
  cursor: pointer;
  &:hover {
    text-decoration: none;
    color: ${(props) => props.theme.colors.button.link.colorHover};
  }
`;

export const StyledPanel = styled(Panel)`
  color: ${(props) => props.theme.colors.layout.page.color};
  border-radius: ${(props) => props.theme.other.panel.borderRadius};
`;

export const StyledTagPicker = styled(TagPicker)`
  border: 1px #3c3f43 solid !important;
  border-radius: ${(props) => props.theme.other.input.borderRadius} !important;

  &:hover,
  &:active,
  &:focus {
    border-color: ${(props) => props.theme.colors.primary} !important;
  }

  .rs-picker-input {
    &:hover {
      border-color: ${(props) => props.theme.colors.primary};
    }
  }

  .rs-tag {
    color: ${(props) => props.theme.colors.tag.text};
    background: ${(props) => props.theme.colors.tag.background};
    border-radius: ${(props) => props.theme.other.tag.borderRadius};
  }
`;

export const StyledTag = styled(Tag)`
  color: ${(props) => props.theme.colors.tag.text} !important;
  background: ${(props) => props.theme.colors.tag.background};
  border-radius: ${(props) => props.theme.other.tag.borderRadius};
  cursor: pointer;
`;
