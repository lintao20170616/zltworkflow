export function getDefaultProps(type: string): Record<string, any> {
  const map: Record<string, Record<string, any>> = {
    'el-button': { type: 'primary', size: 'default', nativeType: 'button' },
    'el-text': { type: '', size: 'default' },
    'el-link': { type: 'default', href: '#', underline: true },
    'el-divider': { direction: 'horizontal', contentPosition: 'center' },
    'el-space': { size: 'default', direction: 'horizontal' },
    'el-image': { src: 'https://via.placeholder.com/300x200', fit: 'fill' },
    'el-avatar': { size: 'default', shape: 'circle' },
    'el-badge': { value: '1', max: 99, type: 'danger' },
    'el-alert': { type: 'info', closable: true, showIcon: true },
    'el-form': { labelWidth: '100px', labelPosition: 'right' },
    'el-form-item': { label: '表单项', prop: '' },
    'el-input': { placeholder: '请输入内容' },
    'el-input-number': { placeholder: '请输入数字', step: 1 },
    'el-select': {
      placeholder: '请选择',
      options: [
        { label: '选项1', value: 'option1' },
        { label: '选项2', value: 'option2' },
        { label: '选项3', value: 'option3' },
      ],
    },
    'el-date-picker': { type: 'date', placeholder: '选择日期' },
    'el-checkbox': { label: '选项' },
    'el-radio': { label: '选项' },
    'el-switch': { activeText: '开启', inactiveText: '关闭' },
    'el-slider': { min: 0, max: 100, step: 1 },
    'el-rate': { max: 5 },
    'el-table': {
      data: [
        { name: '张三', age: 20, address: '北京市' },
        { name: '李四', age: 25, address: '上海市' },
      ],
      columns: [
        { prop: 'name', label: '姓名', width: '120' },
        { prop: 'age', label: '年龄', width: '80' },
        { prop: 'address', label: '地址', minWidth: '150' },
      ],
      border: true,
    },
    'el-card': { shadow: 'hover' },
    'el-list': {
      data: [
        { id: 1, content: '列表项1' },
        { id: 2, content: '列表项2' },
      ],
      border: true,
    },
    'el-tag': { type: '', size: 'default', effect: 'light' },
    'el-row': { gutter: 0 },
    'el-col': { span: 12 },
    'el-container': {},
  };
  return map[type] || {};
}

export function getDefaultText(type: string): string | undefined {
  const map: Record<string, string> = {
    'el-button': '按钮',
    'el-text': '文本',
    'el-tag': '标签',
    'el-link': '链接',
    'el-alert': '这是一条警告提示',
    'el-avatar': 'A',
  };
  return type === 'el-divider' ? undefined : map[type];
}

export function getDefaultStyle(type: string): Record<string, string> {
  const map: Record<string, Record<string, string>> = {
    'el-button': { display: 'inline-block' },
    'el-text': { display: 'inline-block' },
    'el-link': { display: 'inline-block' },
    'el-divider': { width: '100%', display: 'block' },
    'el-space': { width: '100%' },
    'el-image': { width: '300px', height: '200px', display: 'inline-block' },
    'el-avatar': { display: 'inline-block' },
    'el-badge': { display: 'inline-block' },
    'el-alert': { width: '100%' },
    'el-form': { width: '100%' },
    'el-form-item': { width: '100%' },
    'el-input': { width: '200px', display: 'inline-block' },
    'el-input-number': { width: '200px', display: 'inline-block' },
    'el-select': { width: '200px', display: 'inline-block' },
    'el-date-picker': { width: '200px', display: 'inline-block' },
    'el-checkbox': { display: 'inline-block' },
    'el-radio': { display: 'inline-block' },
    'el-switch': { display: 'inline-block' },
    'el-slider': { width: '300px', display: 'inline-block' },
    'el-rate': { display: 'inline-block' },
    'el-table': { width: '100%' },
    'el-card': { width: '100%' },
    'el-list': { width: '100%' },
    'el-tag': { display: 'inline-block' },
    'el-row': { width: '100%' },
    'el-col': { width: '100%' },
    'el-container': { width: '100%', minHeight: '200px' },
  };
  return map[type] || { display: 'inline-block' };
}
