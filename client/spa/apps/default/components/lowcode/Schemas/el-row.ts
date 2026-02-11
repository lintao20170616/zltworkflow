export default [
  {
    type: 'el-row',
    name: '行',
    category: 'layout',
    canNest: true,
    properties: [
      {
        key: 'gutter',
        label: '间距',
        type: 'number',
        defaultValue: 0,
        placeholder: '0',
        group: '布局',
      },
      {
        key: 'justify',
        label: '对齐方式',
        type: 'select',
        defaultValue: 'start',
        options: [
          { label: '左对齐', value: 'start' },
          { label: '居中对齐', value: 'center' },
          { label: '右对齐', value: 'end' },
        ],
        group: '样式',
      },
      {
        key: 'align',
        label: '对齐方式',
        type: 'select',
        defaultValue: 'start',
        options: [
          { label: '左对齐', value: 'start' },
          { label: '居中对齐', value: 'center' },
          { label: '右对齐', value: 'end' },
        ],
        group: '样式',
      },
    ],
  },
];
