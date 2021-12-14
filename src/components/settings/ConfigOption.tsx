import React from 'react';
import { FlexboxGrid } from 'rsuite';
import { ConfigOptionDescription, ConfigOptionName, ConfigOptionSection } from './styled';

const ConfigOption = ({ name, description, option }: any) => {
  return (
    <ConfigOptionSection>
      <FlexboxGrid justify="space-between" style={{ alignItems: 'center' }}>
        <FlexboxGrid.Item style={{ maxWidth: '50%' }}>
          <ConfigOptionName>{name}</ConfigOptionName>
          <ConfigOptionDescription>{description}</ConfigOptionDescription>
        </FlexboxGrid.Item>
        <FlexboxGrid.Item>{option}</FlexboxGrid.Item>
      </FlexboxGrid>
    </ConfigOptionSection>
  );
};

export default ConfigOption;
