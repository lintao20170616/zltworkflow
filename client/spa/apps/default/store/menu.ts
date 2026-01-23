import { defineStore } from 'pinia';
import service from '../service';

export interface MenuTreeItem {
  id: number;
  systemId?: number;
  parentId?: number | null;
  title: string;
  name?: string;
  path?: string;
  icon?: string | null;
  component?: string | null;
  status?: number;
  sort?: number;
  children?: MenuTreeItem[];
}

export interface SystemMenuTreeItem {
  id: number;
  code: string;
  name: string;
  title: string;
  children: MenuTreeItem[];
}

interface MenuState {
  systemList: SystemMenuTreeItem[];
}

export const useMenuStore = defineStore('menu', {
  state: (): MenuState => ({
    systemList: [],
  }),

  getters: {
    systems: (state) => state.systemList,
  },

  actions: {
    async fetchSystemMenuTree() {
      try {
        const data = await service.system.getSystemMenuTree();
        this.systemList = data;
        return data;
      } catch (error) {
        console.error('[MenuStore] fetchSystemMenuTree error:', error);
        this.systemList = [];
        return [];
      }
    },

    setSystemList(systems: SystemMenuTreeItem[]) {
      this.systemList = systems;
    },

    clearMenuData() {
      this.systemList = [];
    },
  },
});
