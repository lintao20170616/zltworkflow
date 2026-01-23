/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export default component;
}

/**
 * 给 TypeScript 提供全局类型声明（.d.ts 不会生成 JS，只影响类型检查/智能提示）。
里面的 /// <reference types="vite/client" />：让 TS 认识 Vite 注入的类型（比如 import.meta.env 等）。
declare module '*.vue' { ... }：让 TS 能把 .vue 文件当成一个可导入的组件模块，否则在 router/index.ts 里 import('../views/xxx.vue') 可能会报“找不到模块/类型声明”。
 */
