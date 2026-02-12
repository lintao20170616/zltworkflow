import elForm from './Schemas/el-form';
import elFormItem from './Schemas/el-form-item';
import elInput from './Schemas/el-input';
import elInputNumber from './Schemas/el-input-number';
import elSelect from './Schemas/el-select';
import elButton from './Schemas/el-button';
import elRow from './Schemas/el-row';

export interface PropertySchema {
  key: string;
  label: string;
  type: 'input' | 'textarea' | 'number' | 'select' | 'switch' | 'color' | 'json' | 'content' | 'style';
  defaultValue?: any;
  options?: Array<{ label: string; value: any }>;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  description?: string;
  group?: string;
}

export interface ComponentSchema {
  type: string;
  name: string;
  category: string;
  properties: PropertySchema[];
  canNest?: boolean;
}

export const componentSchemas: ComponentSchema[] = [
  ...(elForm as ComponentSchema[]),
  ...(elFormItem as ComponentSchema[]),
  ...(elInput as ComponentSchema[]),
  ...(elInputNumber as ComponentSchema[]),
  ...(elSelect as ComponentSchema[]),
  ...(elButton as ComponentSchema[]),
  ...(elRow as ComponentSchema[]),
];

export function getComponentSchema(type: string): ComponentSchema | undefined {
  return componentSchemas.find((schema) => schema.type === type);
}

export function getPropertySchemas(type: string): PropertySchema[] {
  const schema = getComponentSchema(type);
  return schema ? schema.properties : [];
}

export function canComponentNest(type: string): boolean {
  const schema = getComponentSchema(type);
  return schema?.canNest === true;
}

export function getChildComponentName(parentType: string, propKey: string): string {
  const childComponentMap: Record<string, Record<string, string>> = {
    'el-select': {
      options: 'el-option',
    },
  };

  return childComponentMap[parentType]?.[propKey] || '';
}
