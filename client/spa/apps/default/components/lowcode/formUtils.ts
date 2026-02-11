import type { ComponentConfig } from '@app/store/lowcode';

const FORM_CONTROL_TYPES = new Set([
  'el-input',
  'el-input-number',
  'el-select',
  'el-switch',
  'el-checkbox',
  'el-checkbox-group',
  'el-radio',
  'el-radio-group',
  'el-date-picker',
  'el-time-picker',
  'el-cascader',
  'el-slider',
  'el-rate',
]);

function hasFormControlDescendant(components: ComponentConfig[] | undefined): boolean {
  if (!Array.isArray(components)) return false;
  for (const comp of components) {
    if (FORM_CONTROL_TYPES.has(comp.type)) return true;
    if (comp.children && hasFormControlDescendant(comp.children)) return true;
  }
  return false;
}

function collectFormFields(components: ComponentConfig[] | undefined): string[] {
  if (!Array.isArray(components)) return [];
  const fields: string[] = [];
  for (const comp of components) {
    if (comp.type === 'el-form-item' && comp.props?.prop && hasFormControlDescendant(comp.children)) {
      const prop = String(comp.props.prop).trim();
      if (prop && !fields.includes(prop)) fields.push(prop);
    }
    if (comp.children) {
      fields.push(...collectFormFields(comp.children));
    }
  }
  return fields;
}

export function buildFormModel(components: ComponentConfig[] | undefined): Record<string, any> {
  const fields = collectFormFields(components);
  const model: Record<string, any> = {};
  for (const field of fields) {
    model[field] = undefined;
  }
  return model;
}

export function isFormControl(type: string): boolean {
  return FORM_CONTROL_TYPES.has(type);
}
