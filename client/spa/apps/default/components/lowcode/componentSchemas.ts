export interface PropertySchema {
  key: string;
  label: string;
  type: 'input' | 'textarea' | 'number' | 'select' | 'switch' | 'color' | 'json' | 'text' | 'style';
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
}

export const componentSchemas: ComponentSchema[] = [
  {
    type: 'el-button',
    name: '按钮',
    category: 'basic',
    properties: [
      {
        key: 'text',
        label: '按钮文案',
        type: 'text',
        defaultValue: '按钮',
        placeholder: '请输入按钮文案',
        group: '内容',
      },
      {
        key: 'type',
        label: '类型',
        type: 'select',
        defaultValue: 'primary',
        options: [
          { label: '主要按钮', value: 'primary' },
          { label: '成功按钮', value: 'success' },
          { label: '信息按钮', value: 'info' },
          { label: '警告按钮', value: 'warning' },
          { label: '危险按钮', value: 'danger' },
          { label: '文本按钮', value: 'text' },
        ],
        group: '样式',
      },
      {
        key: 'size',
        label: '尺寸',
        type: 'select',
        defaultValue: 'default',
        options: [
          { label: '大', value: 'large' },
          { label: '默认', value: 'default' },
          { label: '小', value: 'small' },
        ],
        group: '样式',
      },
      {
        key: 'plain',
        label: '朴素按钮',
        type: 'switch',
        defaultValue: false,
        group: '样式',
      },
      {
        key: 'round',
        label: '圆角按钮',
        type: 'switch',
        defaultValue: false,
        group: '样式',
      },
      {
        key: 'circle',
        label: '圆形按钮',
        type: 'switch',
        defaultValue: false,
        group: '样式',
      },
      {
        key: 'disabled',
        label: '禁用',
        type: 'switch',
        defaultValue: false,
        group: '状态',
      },
      {
        key: 'loading',
        label: '加载中',
        type: 'switch',
        defaultValue: false,
        group: '状态',
      },
      {
        key: 'style',
        label: '自定义样式',
        type: 'style',
        defaultValue: {},
        placeholder: '{"color": "#409eff", "fontSize": "14px"}',
        description: 'CSS样式对象，如：{"color": "#409eff", "fontSize": "14px"}',
        group: '样式',
      },
    ],
  },
  {
    type: 'el-input',
    name: '输入框',
    category: 'form',
    properties: [
      {
        key: 'type',
        label: '类型',
        type: 'select',
        defaultValue: 'text',
        options: [
          { label: '文本', value: 'text' },
          { label: '密码', value: 'password' },
          { label: '数字', value: 'number' },
          { label: '邮箱', value: 'email' },
          { label: 'URL', value: 'url' },
        ],
      },
      {
        key: 'placeholder',
        label: '占位符',
        type: 'input',
        defaultValue: '请输入内容',
        placeholder: '请输入占位符文本',
      },
      {
        key: 'disabled',
        label: '禁用',
        type: 'switch',
        defaultValue: false,
      },
      {
        key: 'clearable',
        label: '可清空',
        type: 'switch',
        defaultValue: false,
      },
      {
        key: 'showPassword',
        label: '显示密码',
        type: 'switch',
        defaultValue: false,
      },
      {
        key: 'maxlength',
        label: '最大长度',
        type: 'number',
        defaultValue: undefined,
        min: 0,
        placeholder: '不限制',
      },
      {
        key: 'showWordLimit',
        label: '显示字数统计',
        type: 'switch',
        defaultValue: false,
      },
    ],
  },
  {
    type: 'el-select',
    name: '选择器',
    category: 'form',
    properties: [
      {
        key: 'placeholder',
        label: '占位符',
        type: 'input',
        defaultValue: '请选择',
        placeholder: '请输入占位符文本',
      },
      {
        key: 'disabled',
        label: '禁用',
        type: 'switch',
        defaultValue: false,
      },
      {
        key: 'clearable',
        label: '可清空',
        type: 'switch',
        defaultValue: false,
      },
      {
        key: 'multiple',
        label: '多选',
        type: 'switch',
        defaultValue: false,
      },
      {
        key: 'filterable',
        label: '可搜索',
        type: 'switch',
        defaultValue: false,
      },
    ],
  },
  {
    type: 'el-date-picker',
    name: '日期选择',
    category: 'form',
    properties: [
      {
        key: 'type',
        label: '类型',
        type: 'select',
        defaultValue: 'date',
        options: [
          { label: '日期', value: 'date' },
          { label: '日期时间', value: 'datetime' },
          { label: '日期范围', value: 'daterange' },
          { label: '月份', value: 'month' },
          { label: '年份', value: 'year' },
        ],
      },
      {
        key: 'placeholder',
        label: '占位符',
        type: 'input',
        defaultValue: '选择日期',
        placeholder: '请输入占位符文本',
      },
      {
        key: 'disabled',
        label: '禁用',
        type: 'switch',
        defaultValue: false,
      },
      {
        key: 'clearable',
        label: '可清空',
        type: 'switch',
        defaultValue: true,
      },
      {
        key: 'format',
        label: '显示格式',
        type: 'input',
        defaultValue: 'YYYY-MM-DD',
        placeholder: 'YYYY-MM-DD',
      },
    ],
  },
  {
    type: 'el-checkbox',
    name: '复选框',
    category: 'form',
    properties: [
      {
        key: 'label',
        label: '标签',
        type: 'input',
        defaultValue: '选项',
        placeholder: '请输入标签文本',
      },
      {
        key: 'disabled',
        label: '禁用',
        type: 'switch',
        defaultValue: false,
      },
      {
        key: 'checked',
        label: '默认选中',
        type: 'switch',
        defaultValue: false,
      },
    ],
  },
  {
    type: 'el-radio',
    name: '单选框',
    category: 'form',
    properties: [
      {
        key: 'label',
        label: '标签',
        type: 'input',
        defaultValue: '选项',
        placeholder: '请输入标签文本',
      },
      {
        key: 'disabled',
        label: '禁用',
        type: 'switch',
        defaultValue: false,
      },
    ],
  },
  {
    type: 'el-switch',
    name: '开关',
    category: 'form',
    properties: [
      {
        key: 'activeText',
        label: '开启时文字',
        type: 'input',
        defaultValue: '开启',
        placeholder: '请输入开启时文字',
      },
      {
        key: 'inactiveText',
        label: '关闭时文字',
        type: 'input',
        defaultValue: '关闭',
        placeholder: '请输入关闭时文字',
      },
      {
        key: 'disabled',
        label: '禁用',
        type: 'switch',
        defaultValue: false,
      },
      {
        key: 'activeValue',
        label: '开启时的值',
        type: 'input',
        defaultValue: true,
      },
      {
        key: 'inactiveValue',
        label: '关闭时的值',
        type: 'input',
        defaultValue: false,
      },
    ],
  },
  {
    type: 'el-table',
    name: '表格',
    category: 'display',
    properties: [
      {
        key: 'data',
        label: '数据',
        type: 'json',
        defaultValue: [],
        placeholder: '[]',
        description: '表格数据数组',
      },
      {
        key: 'border',
        label: '边框',
        type: 'switch',
        defaultValue: true,
      },
      {
        key: 'stripe',
        label: '斑马纹',
        type: 'switch',
        defaultValue: false,
      },
      {
        key: 'size',
        label: '尺寸',
        type: 'select',
        defaultValue: 'default',
        options: [
          { label: '大', value: 'large' },
          { label: '默认', value: 'default' },
          { label: '小', value: 'small' },
        ],
      },
      {
        key: 'height',
        label: '高度',
        type: 'number',
        defaultValue: undefined,
        min: 0,
        placeholder: '不限制',
      },
      {
        key: 'maxHeight',
        label: '最大高度',
        type: 'number',
        defaultValue: undefined,
        min: 0,
        placeholder: '不限制',
      },
    ],
  },
  {
    type: 'el-card',
    name: '卡片',
    category: 'display',
    properties: [
      {
        key: 'header',
        label: '标题',
        type: 'input',
        defaultValue: '',
        placeholder: '请输入卡片标题',
      },
      {
        key: 'shadow',
        label: '阴影',
        type: 'select',
        defaultValue: 'always',
        options: [
          { label: '总是显示', value: 'always' },
          { label: '悬停显示', value: 'hover' },
          { label: '不显示', value: 'never' },
        ],
      },
      {
        key: 'bodyStyle',
        label: '内容区样式',
        type: 'json',
        defaultValue: {},
        placeholder: '{}',
        description: 'CSS样式对象',
      },
    ],
  },
  {
    type: 'el-row',
    name: '栅格行',
    category: 'layout',
    properties: [
      {
        key: 'gutter',
        label: '栅格间隔',
        type: 'number',
        defaultValue: 0,
        min: 0,
        step: 4,
      },
      {
        key: 'justify',
        label: '水平排列方式',
        type: 'select',
        defaultValue: 'start',
        options: [
          { label: '左对齐', value: 'start' },
          { label: '居中', value: 'center' },
          { label: '右对齐', value: 'end' },
          { label: '两端对齐', value: 'space-around' },
          { label: '间隔相等', value: 'space-between' },
        ],
      },
      {
        key: 'align',
        label: '垂直排列方式',
        type: 'select',
        defaultValue: 'top',
        options: [
          { label: '顶部对齐', value: 'top' },
          { label: '居中', value: 'middle' },
          { label: '底部对齐', value: 'bottom' },
        ],
      },
    ],
  },
  {
    type: 'el-col',
    name: '栅格列',
    category: 'layout',
    properties: [
      {
        key: 'span',
        label: '栅格占据的列数',
        type: 'number',
        defaultValue: 24,
        min: 0,
        max: 24,
      },
      {
        key: 'offset',
        label: '栅格左侧的间隔格数',
        type: 'number',
        defaultValue: 0,
        min: 0,
        max: 24,
      },
      {
        key: 'push',
        label: '栅格向右移动格数',
        type: 'number',
        defaultValue: 0,
        min: 0,
        max: 24,
      },
      {
        key: 'pull',
        label: '栅格向左移动格数',
        type: 'number',
        defaultValue: 0,
        min: 0,
        max: 24,
      },
    ],
  },
  {
    type: 'el-container',
    name: '容器',
    category: 'layout',
    properties: [
      {
        key: 'direction',
        label: '子元素的排列方向',
        type: 'select',
        defaultValue: 'horizontal',
        options: [
          { label: '水平', value: 'horizontal' },
          { label: '垂直', value: 'vertical' },
        ],
      },
    ],
  },
];

export function getComponentSchema(type: string): ComponentSchema | undefined {
  return componentSchemas.find((schema) => schema.type === type);
}

export function getPropertySchemas(type: string): PropertySchema[] {
  const schema = getComponentSchema(type);
  return schema ? schema.properties : [];
}
