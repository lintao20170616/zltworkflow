import { createPinia } from 'pinia';

const pinia = createPinia();

export default pinia;

export { useUserStore } from './user';
export { useMenuStore } from './menu';
export { useLowcodeStore } from './lowcode';
