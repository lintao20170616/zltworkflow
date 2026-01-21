// .eslintrc.js
module.exports = {
  overrides: [
    // 支持：.html文件的HTML元素标签
    {
      plugins: ['@html-eslint'],
      files: ['*.html'],
      parser: '@html-eslint/parser',
      // If you are using ESLint version v8 or earlier, you can configure it as follows.
      extends: ['plugin:@html-eslint/recommended-legacy'],
      rules: {
        // prettier
        '@html-eslint/no-extra-spacing-attrs': 0,
        '@html-eslint/element-newline': 0,
        '@html-eslint/attrs-newline': 0,
        '@html-eslint/indent': 0,
        '@html-eslint/quotes': 0,
        '@html-eslint/require-closing-tags': [0, { selfClosing: 'always' }],
      },
    },
    // 支持：.html文件的js代码
    {
      plugins: ['html'],
      files: ['*.html'],
    },
  ],
};
