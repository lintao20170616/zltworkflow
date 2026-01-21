// .eslintrc.js
// 支持：egg.js框架的.js文件
module.exports = {
  overrides: [
    {
      files: ['app/**', 'config/**', 'app.js', 'agent.js', 'test/**'],
      extends: ['eslint-config-egg'],
      rules: {
        // 即将被eslint去除的规则
        semi: 0,
        'arrow-parens': 0,
        'array-bracket-spacing': 0,
        'comma-dangle': 0,
        'spaced-comment': 0,
        'space-in-parens': 0,
        indent: 0,
        'no-trailing-spaces': 0,
      },
    },
  ],
};
