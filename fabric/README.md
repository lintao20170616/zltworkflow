# @ilucky/ilucky-fabric
eslint+prettier+stylelint + husky+Lint-staged for vue@2 and egg.js（excluding .ts）.

>针对Node.js 16.17.0+

0. 起步

    1. 🗑删除冲突的依赖（删除eslint、stylelint、prettier、以及他们仨的各种依赖库、config、plugin）

        `npm uninstall @ilucky/bin @lucky/bin @ilucky/ilucky-fabric @umijs/fabric stylelint-config-prettier stylelint-declaration-block-no-ignored-properties @typescript-eslint/eslint-plugin eslint-plugin-jest eslint-plugin-react eslint-plugin-react-hooks @vue/cli-plugin-eslint @vue/cli-plugin-unit-jest @vue/cli-service && npm uninstall eslint eslint-plugin-vue @html-eslint/parser @html-eslint/eslint-plugin eslint-plugin-html eslint-config-egg eslint-config-prettier  stylelint stylelint-config-standard stylelint-config-css-modules stylelint-scss stylelint-config-standard-less postcss-less stylelint-config-standard-scss postcss-scss postcss-html stylelint-config-html stylelint-config-standard-vue  prettier`
    2. 🔨安装依赖

        ```bash
        npm i --save-dev @ilucky/ilucky-fabric
        ```
1. [eslint](https://github.com/eslint/eslint)@8

    1. 🔧配置`项目根目录/.eslintrc.js`

        ```js
        module.exports = {
          extends: [require.resolve('@ilucky/ilucky-fabric/eslint')],
          root: true,
          // 其他自定义配置
        };
        ```
    2. 🔧（可选）按需配置`项目根目录/.eslintignore`，如：

        ```ignore
        **/app/public
        *.min.*
        ```
2. [stylelint](https://github.com/stylelint/stylelint)@15

    1. 🔧配置`项目根目录/.stylelintrc.js`

        ```js
        module.exports = {
          extends: [ require.resolve("@ilucky/ilucky-fabric/stylelint")],
          // 其他自定义配置
        };
        ```
    2. 🔧（可选）按需配置`项目根目录/.stylelintignore`，如：

        ```ignore
        **/app/public
        *.min.*
        ```
3. [prettier](https://github.com/prettier/prettier)@2

    1. 🔧配置`项目根目录/.prettierrc.js`

        ```js
        module.exports = Object.assign({}, require("@ilucky/ilucky-fabric").prettier, {
          // 其他自定义配置
        })
        ```
    2. 🔧（可选）按需配置`项目根目录/.prettierignore`，如：

        ```ignore
        **/app/public
        package-lock.json
        *.min.*
        ```
- 🔧新增package.json的`scripts`中

    ```json
    "eslint": "eslint --fix --cache --ext .js,.vue,.html .",
    "stylelint": "stylelint **/*.{css,less,scss,vue,html} *.{css,less,scss,vue,html} --fix --cache --quiet",
    "prettier": "prettier **/*.{js,jsx,vue,flow,ts,tsx,css,less,scss,html,json,yml,yaml} *.{js,jsx,vue,flow,ts,tsx,css,less,scss,html,json,yml,yaml} --write --cache --no-error-on-unmatched-pattern"
    ```
- 🔧新增`项目根目录/.gitignore`

    ```ignore
    # 保留之前的配置，新增：
    .eslintcache
    .stylelintcache
    ```
---

4. [husky](https://github.com/typicode/husky)@8

    1. 🗑删除package.json内配置：

        ```json
        # 删除以下全部：
        "husky": {
          "hooks": {
            "pre-commit": "npm run lint-staged",
            "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
          }
        }
        ```
    2. 🛠️安装和配置husky（需要`commitlint`、`lint-staged`）

        `npx husky-init@8 && npm i && npx husky@8 set .husky/pre-commit "npm run lint-staged" && npx husky@8 set .husky/commit-msg 'npx --no -- commitlint --edit "$1"'`
5. [lint-staged](https://github.com/lint-staged/lint-staged)@14

    1. 🔨安装依赖

        `npm i --save-dev lint-staged@14`
    2. 🔧配置package.json

        ```json
        "lint-staged": {
          "*.{js,vue,html}": "eslint --fix --cache --ext .js,.vue,.html",
          "*.{css,less,scss,vue,html}": "stylelint --fix --cache",
          "*.{js,jsx,vue,flow,ts,tsx,css,less,scss,html,json,yml,yaml}": "prettier --write --cache"
        },
        ```
    3. 🔧新增package.json的`scripts`中

        ```json
        "lint-staged": "lint-staged -p false"
        ```
6. [commitlint](https://github.com/conventional-changelog/commitlint)@17

    1. 🔨安装依赖

        `npm i --save-dev @commitlint/config-conventional@17 @commitlint/cli@17`
    2. 🔧配置`项目根目录/.commitlintrc.js`

        ```js
        module.exports = {extends: ['@commitlint/config-conventional']};
        ```
7. 其他（可选）

    1. [git cz](https://github.com/commitizen/cz-cli)

        1. 🔨全局安装依赖

            `npm i -g commitizen`
        2. 🔧配置package.json

            ```json
            "config": {
              "commitizen": {
                "path": "cz-conventional-changelog"
              }
            }
            ```

---
## 理念
1. 最简单的安装和配置
2. 支持添加自定义配置进行覆盖
3. 规则按照已在使用库的相关config推荐（egg@2、vue@2）

    选择最基本的规则配置，如：`eslint:recommended`、`plugin:vue/recommended`，暂不使用社区第三方的规则。

---
## 更新日志
[点击查看](./changelog.md)
