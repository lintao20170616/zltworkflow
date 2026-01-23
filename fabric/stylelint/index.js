// .stylelintrc.js
module.exports = {
  extends: ['stylelint-config-standard', 'stylelint-config-css-modules'],
  // 忽略不存在的规则（stylelint 15.x/16.x 中已移除的规则）
  ignoreRules: [
    'at-rule-descriptor-no-unknown',
    'at-rule-descriptor-value-no-unknown',
    'at-rule-no-deprecated',
    'at-rule-prelude-no-invalid',
    'declaration-property-value-keyword-no-deprecated',
    'media-type-no-deprecated',
    'nesting-selector-no-missing-scoping-root',
    'no-invalid-position-declaration',
    'property-no-deprecated',
    'syntax-string-no-invalid',
    'block-no-redundant-nested-style-rules',
    'color-function-alias-notation',
    'container-name-pattern',
    'layer-name-pattern',
    'lightness-notation',
  ],
  overrides: [
    {
      files: ['**/*.css'],
      rules: {
        // 禁用 stylelint 15.x/16.x 中已移除的规则
        'at-rule-descriptor-no-unknown': null,
        'at-rule-descriptor-value-no-unknown': null,
        'at-rule-no-deprecated': null,
        'at-rule-prelude-no-invalid': null,
        'declaration-property-value-keyword-no-deprecated': null,
        'media-type-no-deprecated': null,
        'nesting-selector-no-missing-scoping-root': null,
        'no-invalid-position-declaration': null,
        'property-no-deprecated': null,
        'syntax-string-no-invalid': null,
        'block-no-redundant-nested-style-rules': null,
        'color-function-alias-notation': null,
        'container-name-pattern': null,
        'layer-name-pattern': null,
        'lightness-notation': null,
      },
    },
    {
      files: ['**/*.less'],
      extends: ['stylelint-config-standard', 'stylelint-config-css-modules'],
      customSyntax: 'postcss-less',
      rules: {
        // 开启函数
        'function-no-unknown': [true, { ignoreFunctions: ['tint', 'fade', 'svg-gradient', 'image-width', 'image-height', 'image-size', 'darken', 'lighten'] }],
      },
    },
    {
      files: ['**/*.scss'],
      extends: ['stylelint-config-standard-scss', 'stylelint-config-css-modules'],
      customSyntax: 'postcss-scss',
      rules: {
        'scss/no-global-function-names': [true, { severity: 'warning' }],

        // 开启函数
        'function-no-unknown': [true, { ignoreFunctions: ['mix', 'alpha', 'str-slice', 'inspect', 'lighten'] }],

        // 命名
        'scss/dollar-variable-pattern': null,
        'scss/at-function-pattern': null,
        'scss/at-mixin-pattern': null,
        'scss/load-no-partial-leading-underscore': null,

        // prettier
        'scss/operator-no-unspaced': null,
        'scss/double-slash-comment-whitespace-inside': null,
        'scss/double-slash-comment-empty-line-before': null,
      },
    },
    {
      files: ['**/*.html'],
      extends: 'stylelint-config-html',
      rules: {
        // 禁用 stylelint 15.x/16.x 中已移除的规则
        'at-rule-descriptor-no-unknown': null,
        'at-rule-descriptor-value-no-unknown': null,
        'at-rule-no-deprecated': null,
        'at-rule-prelude-no-invalid': null,
        'declaration-property-value-keyword-no-deprecated': null,
        'media-type-no-deprecated': null,
        'nesting-selector-no-missing-scoping-root': null,
        'no-invalid-position-declaration': null,
        'property-no-deprecated': null,
        'syntax-string-no-invalid': null,
        'block-no-redundant-nested-style-rules': null,
        'color-function-alias-notation': null,
        'container-name-pattern': null,
        'layer-name-pattern': null,
        'lightness-notation': null,
      },
    },
    // 必须放在html下面
    {
      files: ['**/*.vue'],
      extends: ['stylelint-config-recommended-vue'],
      customSyntax: 'postcss-html',
      rules: {
        // 禁用 stylelint 15.x/16.x 中已移除的规则
        'at-rule-descriptor-no-unknown': null,
        'at-rule-descriptor-value-no-unknown': null,
        'at-rule-no-deprecated': null,
        'at-rule-prelude-no-invalid': null,
        'declaration-property-value-keyword-no-deprecated': null,
        'media-type-no-deprecated': null,
        'nesting-selector-no-missing-scoping-root': null,
        'no-invalid-position-declaration': null,
        'property-no-deprecated': null,
        'syntax-string-no-invalid': null,
        'block-no-redundant-nested-style-rules': null,
        'color-function-alias-notation': null,
        'container-name-pattern': null,
        'layer-name-pattern': null,
        'lightness-notation': null,
      },
    },
  ],
  rules: {
    // 书写习惯（会与less冲突）
    'alpha-value-notation': null, // 颜色透明度
    'color-function-notation': null, // 颜色函数
    'declaration-block-no-redundant-longhand-properties': null, // 缩写

    // 开启函数
    'function-no-unknown': [true, { ignoreFunctions: ['constant', 'alpha'] }],

    // 小数点位数
    'number-max-precision': null,

    // 空
    'block-no-empty': [true, { severity: 'warning' }],
    'no-empty-source': null,

    // 重复
    'no-duplicate-selectors': [true, { severity: 'warning' }],

    // 优先级顺序
    'no-descending-specificity': null,

    // font-family属性
    'font-family-no-missing-generic-family-keyword': null,

    // 命名
    'selector-class-pattern': null,
    'selector-id-pattern': null,
    'keyframes-name-pattern': null,

    // 解析有问题，只好关闭
    'media-query-no-invalid': null,
    'media-feature-name-no-unknown': null,

    // 不处理浏览器前缀
    'selector-no-vendor-prefix': null,
    'property-no-vendor-prefix': null,
    'at-rule-no-vendor-prefix': null,
    'media-feature-name-no-vendor-prefix': null,
    'value-no-vendor-prefix': null,

    // prettier
    'declaration-block-single-line-max-declarations': null,
    'rule-empty-line-before': null,
    'declaration-empty-line-before': null,
    'custom-property-empty-line-before': null,
    'comment-empty-line-before': null,

    // 禁用 stylelint 15.x/16.x 中已移除的废弃规则
    'at-rule-descriptor-no-unknown': null,
    'at-rule-descriptor-value-no-unknown': null,
    'at-rule-no-deprecated': null,
    'at-rule-prelude-no-invalid': null,
    'declaration-property-value-keyword-no-deprecated': null,
    'media-type-no-deprecated': null,
    'nesting-selector-no-missing-scoping-root': null,
    'no-invalid-position-declaration': null,
    'property-no-deprecated': null,
    'syntax-string-no-invalid': null,
    'block-no-redundant-nested-style-rules': null,
    'color-function-alias-notation': null,
    'container-name-pattern': null,
    'layer-name-pattern': null,
    'lightness-notation': null,
  },
};
